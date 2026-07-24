const compression = require('compression');


const { error: envError } = require('dotenv').config();
if (envError) console.warn('[dotenv] Fichier .env non trouvé — variables système utilisées.');

const REQUIRED_ENV = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  console.error(`[ENV] Variables manquantes : ${missingEnv.join(', ')}`);
  process.exit(1);
}

const express   = require('express');
const http      = require('http');
const path      = require('path');
const fs        = require('fs');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const multer    = require('multer');
const { Server } = require('socket.io');

const userController = require('./controllers/userController');
const authRoutes     = require('./routes/authRoutes');
const userRoutes     = require('./routes/userRoutes');
const busController  = require('./controllers/busController');
const busRoutes      = require('./routes/busRoutes');
const positionRoutes = require('./routes/positionRoutes');
const alerteRoutes = require('./routes/alerteRoutes');
const cooperativeRoutes = require('./routes/cooperativeRoutes');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:8080', // Flutter web (flutter run -d chrome --web-port=8080)
].filter(Boolean);

console.log('[BOOT] ALLOWED_ORIGINS =', ALLOWED_ORIGINS);
console.log('[BOOT] NODE_ENV =', process.env.NODE_ENV, '| isProd =', isProd);

const corsOptions = {
  origin: (origin, cb) => {
    // ── DIAGNOSTIC TEMPORAIRE ──────────────────────────────────────────────
    console.log('[CORS DEBUG] reçu >>>' + origin + '<<< | typeof=' + typeof origin + ' | length=' + (origin ? origin.length : 'n/a'));
    // ────────────────────────────────────────────────────────────────────────

    if (!origin) return cb(null, true);

    // En développement uniquement : autorise tout localhost/127.0.0.1, quel que soit le port
    // (utile pour Flutter web qui change de port aléatoirement à chaque lancement).
    const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
    const isLocalhostDev = !isProd && localhostRegex.test(origin.trim());

    console.log('[CORS DEBUG] isLocalhostDev =', isLocalhostDev, '| inAllowedList =', ALLOWED_ORIGINS.includes(origin));

    if (isLocalhostDev || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS bloqué : ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
app.set('io', io);

// ─── Anti bus-fantôme ───────────────────────────────────────────────────────
// Map chauffeur_id -> Set de socket.id actuellement connectés pour ce chauffeur.
// (un Set, pas un seul id, au cas où un chauffeur ouvrirait 2 connexions —
//  ex: reconnexion réseau avant que l'ancien socket ne timeout)
const chauffeurSockets = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket.io] Connecté   : ${socket.id}`);

  // ── Traçage du chauffeur associé à ce socket ────────────────────────────
  // NOTE : cet event 'position_update' est écouté ici uniquement pour retenir
  // quel chauffeur_id correspond à quel socket.id — il ne fait AUCUN broadcast.
  // Si un autre listener 'position_update' existe déjà ailleurs (ex: dans
  // positionRoutes.js ou un contrôleur socket dédié) pour relayer la position
  // aux autres clients, il continue de fonctionner normalement en parallèle :
  // plusieurs listeners peuvent écouter le même event sans conflit.
  socket.on('position_update', (payload) => {
    if (!payload || !payload.chauffeur_id) return;

    socket.chauffeur_id = payload.chauffeur_id;

    if (!chauffeurSockets.has(payload.chauffeur_id)) {
      chauffeurSockets.set(payload.chauffeur_id, new Set());
    }
    chauffeurSockets.get(payload.chauffeur_id).add(socket.id);
  });

  // ── Le chauffeur peut aussi signaler explicitement sa fin de service ────
  // (ex: bouton "Terminer le service" dans l'app Flutter, si tu en as un)
  socket.on('chauffeur_offline', () => {
    if (socket.chauffeur_id) {
      handleChauffeurDisconnect(socket);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Déconnecté : ${socket.id}`);
    handleChauffeurDisconnect(socket);
  });
});

// ── Gère la déconnexion propre ou brutale d'un chauffeur ───────────────────
function handleChauffeurDisconnect(socket) {
  const chauffeurId = socket.chauffeur_id;
  if (!chauffeurId) return; // ce socket n'était pas identifié comme un chauffeur

  const sockets = chauffeurSockets.get(chauffeurId);
  if (sockets) {
    sockets.delete(socket.id);

    // Si le chauffeur a encore un autre socket actif (ex: reconnexion en cours
    // sur un nouvel onglet/nouvelle session), on ne le retire pas de la carte.
    if (sockets.size > 0) return;

    chauffeurSockets.delete(chauffeurId);
  }

  io.emit('chauffeur_statut', { chauffeur_id: chauffeurId, en_service: false });
  console.log(`[Socket.io] Chauffeur ${chauffeurId} marqué hors service (socket ${socket.id} déconnecté).`);
}

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());   // ✅ ajouté ici
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
if (!isProd) app.use(morgan('dev'));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext  = path.extname(file.originalname).toLowerCase();
      const name = `avatar-${req.params.id}-${Date.now()}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
             && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Format image non supporté (jpeg/png/webp).'));
  },
});

app.use('/uploads', express.static(uploadDir));

// ─── Routes API ───────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/users', userRoutes);  // ✅ modifié
app.use('/api/bus', busRoutes);
app.use('/api/lignes', busRoutes); // ✅ ajouté : alias pour que le frontend (SuiviGps) puisse appeler /api/lignes/:id/arrets
app.use('/api/positions', positionRoutes); // ✅ ajouté : envoi et lecture des positions GPS chauffeur
app.use('/api/alertes', alerteRoutes);
app.use('/api/cooperatives', cooperativeRoutes);

app.post('/api/users/:id/avatar', upload.single('avatar'), userController.uploadAvatar);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development', timestamp: new Date() })
);

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint non trouvé.' });
});

app.use((err, _req, res, _next) => {
  console.error(`[Error] ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    error: isProd ? 'Erreur interne du serveur.' : err.message,
  });
});

server.listen(PORT, () => {
  console.log(`\n✓ Serveur démarré sur le port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log('✓ Routes : /api/auth  /api/users  /api/bus  /api/lignes  /api/positions\n');
});

const shutdown = (signal) => {
  console.log(`\n[${signal}] Arrêt du serveur...`);
  server.close(() => {
    console.log('Serveur arrêté proprement.');
    process.exit(0);
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));