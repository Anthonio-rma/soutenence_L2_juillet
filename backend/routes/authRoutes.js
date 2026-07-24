const express      = require('express');
const router       = express.Router();
const db           = require('../config/db');
const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const BCRYPT_ROUNDS  = 12;
const JWT_SECRET     = process.env.JWT_SECRET;
const JWT_EXPIRES    = process.env.JWT_EXPIRES    || '2h';
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET + '_refresh';
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || '7d';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sanitizeUser = (user) => ({
  id:          user.id,
  nom_complet: user.nom_complet,
  email:       user.email,
  role:        user.role,
  // ✅ ajouté : remonter les infos chauffeur quand elles existent, pour que
  // le frontend/Flutter les reçoive directement après inscription/connexion.
  ...(user.role === 'chauffeur' && {
    numero_bus: user.numero_bus,
    ligne_id:   user.ligne_id,
  }),
});

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken  = jwt.sign(payload, JWT_SECRET,     { expiresIn: JWT_EXPIRES });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
  return { accessToken, refreshToken };
};

// ─── Middlewares ───────────────────────────────────────────────────────────────

const validateFields = (fields) => (req, res, next) => {
  for (const field of fields) {
    if (!req.body[field] || String(req.body[field]).trim() === '') {
      return res.status(400).json({ error: `Champ requis : ${field}` });
    }
  }
  next();
};

// ─── Inscription ───────────────────────────────────────────────────────────────

router.post(
  '/register',
  validateFields(['nom_complet', 'email', 'password']),
  async (req, res) => {
    try {
      const { nom_complet, email, password, role, numero_bus, ligne_id } = req.body;
      const finalRole = role || 'utilisateur';

      // ✅ ajouté : validation spécifique chauffeur, comme dans authController.js
      if (finalRole === 'chauffeur') {
        if (!numero_bus || !ligne_id) {
          return res.status(400).json({
            error: 'Le numéro de bus et la ligne sont obligatoires pour un chauffeur.'
          });
        }

        const [ligneExists] = await db.query(
          'SELECT id FROM bus_routes WHERE id = ?', [ligne_id]
        );
        if (ligneExists.length === 0) {
          return res.status(400).json({ error: 'Ligne sélectionnée invalide.' });
        }
      }

      // Vérification email en base
      const [rows] = await db.query(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [email.toLowerCase()]
      );
      if (rows.length > 0) {
        return res.status(409).json({ error: 'Email déjà utilisé.' });
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // ✅ ajouté : insertion avec numero_bus/ligne_id pour les chauffeurs,
      // insertion classique sinon — sans rien changer au comportement existant.
      let result;
      if (finalRole === 'chauffeur') {
        [result] = await db.query(
          `INSERT INTO users (nom_complet, email, password, role, numero_bus, ligne_id, en_service)
           VALUES (?, ?, ?, ?, ?, ?, 0)`,
          [nom_complet.trim(), email.toLowerCase(), hashedPassword, finalRole, numero_bus, ligne_id]
        );
      } else {
        [result] = await db.query(
          'INSERT INTO users (nom_complet, email, password, role) VALUES (?, ?, ?, ?)',
          [nom_complet.trim(), email.toLowerCase(), hashedPassword, finalRole]
        );
      }

      const newUser = {
        id: result.insertId,
        nom_complet,
        email: email.toLowerCase(),
        role: finalRole,
        ...(finalRole === 'chauffeur' && { numero_bus, ligne_id }),
      };
      const { accessToken, refreshToken } = generateTokens(newUser);

      return res.status(201).json({
        message: 'Inscription réussie.',
        user: sanitizeUser(newUser),
        accessToken,
        refreshToken,
      });
    } catch (err) {
      console.error('[register]', err);
      return res.status(500).json({ error: 'Erreur serveur interne.' });
    }
  }
);

// ─── Connexion classique ───────────────────────────────────────────────────────

router.post(
  '/login',
  validateFields(['email', 'password']),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [email.toLowerCase()]
      );
      const user = rows[0];

      // Vérification sécurisée (pas de fuite d'info sur l'existence du compte)
      const isValid = user && user.password
        ? await bcrypt.compare(password, user.password)
        : false;

      if (!isValid) {
        return res.status(401).json({ error: 'Identifiants invalides.' });
      }

      const { accessToken, refreshToken } = generateTokens(user);
      console.log('LOGIN USER:', sanitizeUser(user));
      return res.status(200).json({
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      });
    } catch (err) {
      console.error('[login]', err);
      return res.status(500).json({ error: 'Erreur serveur interne.' });
    }
  }
);

// ─── Authentification Google ───────────────────────────────────────────────────

router.post('/google', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token Google manquant.' });

  try {
    const ticket = await client.verifyIdToken({
      idToken:  token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email } = ticket.getPayload();

    let [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );
    let user = rows[0];

    if (!user) {
      const [result] = await db.query(
        'INSERT INTO users (nom_complet, email, role, password) VALUES (?, ?, ?, NULL)',
        [name, email.toLowerCase(), 'utilisateur']
      );
      user = { id: result.insertId, nom_complet: name, email: email.toLowerCase(), role: 'utilisateur' };
    }

    const { accessToken, refreshToken } = generateTokens(user);

    return res.status(200).json({
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('[google-auth]', err);
    return res.status(401).json({ error: 'Authentification Google échouée.' });
  }
});

// ─── Refresh token ─────────────────────────────────────────────────────────────

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token manquant.' });

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);

    const [rows] = await db.query(
      'SELECT id, nom_complet, email, role FROM users WHERE id = ? LIMIT 1',
      [payload.id]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable.' });

    const { accessToken, refreshToken: newRefresh } = generateTokens(user);

    return res.status(200).json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    return res.status(401).json({ error: 'Refresh token invalide ou expiré.' });
  }
});

// ─── Profil connecté (optionnel, protégé par JWT) ─────────────────────────────

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant.' });
  }

  try {
    const token   = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);

    const [rows] = await db.query(
      'SELECT id, nom_complet, email, role FROM users WHERE id = ? LIMIT 1',
      [payload.id]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
});

module.exports = router;