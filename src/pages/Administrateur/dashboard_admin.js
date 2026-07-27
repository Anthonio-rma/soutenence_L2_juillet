import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bus, MapPin, Clock,
  Search, Bell, SlidersHorizontal, ChevronRight,
  AlertTriangle, CheckCircle, Play, Users, Route
} from 'lucide-react';

/* ─── Configuration de l'API ───
   En dev (Vite), tu peux créer un fichier .env à la racine avec :
     VITE_API_URL=http://localhost:5000
   En prod, laisse .env vide ou absent : ça retombera automatiquement
   sur ton backend déployé sur Render. */
const API_URL = import.meta.env.VITE_API_URL || 'https://soutenence-l2-juillet.onrender.com';

/* ─── Compteur animé ─── */
function AnimatedCounter({ target, suffix = '', prefix = '', duration = 1.6 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target === null || target === undefined) return;
    const start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (target - start) * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  if (target === null || target === undefined) return <span className="text-gray-300">—</span>;
  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

/* ─── Graphique à barres groupées animé (responsive) ─── */
function AnimatedBarChart() {
  const [hovered, setHovered] = useState(null);

  const data = [
    { heure: '06h', passagers: 18, vehicules: 12 },
    { heure: '07h', passagers: 52, vehicules: 31 },
    { heure: '08h', passagers: 87, vehicules: 45 },
    { heure: '09h', passagers: 64, vehicules: 38 },
    { heure: '12h', passagers: 75, vehicules: 42 },
    { heure: '15h', passagers: 48, vehicules: 28 },
    { heure: '18h', passagers: 93, vehicules: 47 },
    { heure: '21h', passagers: 31, vehicules: 19 },
  ];

  const maxVal = 100;
  const BAR_W = 7;
  const GAP = 2;
  const GROUP_W = BAR_W * 2 + GAP + 6;
  const totalW = data.length * GROUP_W;

  return (
    <div className="w-full h-full flex flex-col">
      <svg
        className="w-full flex-1 overflow-visible touch-pan-x"
        viewBox={`0 0 ${totalW} 100`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="barOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="1" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.5" />
          </linearGradient>
          <filter id="barGlow">
            <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {[0, 25, 50, 75, 100].map((pct) => (
          <line
            key={pct}
            x1="0" y1={100 - pct}
            x2={totalW} y2={100 - pct}
            stroke="#f3f4f6"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}

        {/* Rectangle transparent pour fermer le tooltip au tap en dehors des barres (mobile) */}
        <rect
          x="0" y="0" width={totalW} height="100"
          fill="transparent"
          onClick={() => setHovered(null)}
        />

        {data.map((d, i) => {
          const x = i * GROUP_W + 2;
          const hPass = (d.passagers / maxVal) * 96;
          const hVeh  = (d.vehicules  / maxVal) * 96;
          const isHov = hovered === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => {
                e.stopPropagation();
                setHovered((prev) => (prev === i ? null : i));
              }}
              style={{ cursor: 'pointer' }}
            >
              {isHov && (
                <rect
                  x={x - 1} y={2}
                  width={BAR_W * 2 + GAP + 2} height={96}
                  rx="2" fill="#f97316" fillOpacity="0.05"
                />
              )}

              <motion.rect
                x={x}
                y={100 - hPass}
                width={BAR_W}
                height={hPass}
                rx="2"
                fill="url(#barOrange)"
                filter={isHov ? 'url(#barGlow)' : undefined}
                initial={{ height: 0, y: 100 }}
                animate={{ height: hPass, y: 100 - hPass }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.07, ease: [0.34, 1.26, 0.64, 1] }}
              />

              <motion.rect
                x={x + BAR_W + GAP}
                y={100 - hVeh}
                width={BAR_W}
                height={hVeh}
                rx="2"
                fill="url(#barBlue)"
                filter={isHov ? 'url(#barGlow)' : undefined}
                initial={{ height: 0, y: 100 }}
                animate={{ height: hVeh, y: 100 - hVeh }}
                transition={{ duration: 0.7, delay: 0.4 + i * 0.07, ease: [0.34, 1.26, 0.64, 1] }}
              />

              {isHov && (
                <motion.g
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <rect
                    x={x - 1} y={100 - hPass - 14}
                    width={BAR_W * 2 + GAP + 2} height={12}
                    rx="2" fill="#1f2937"
                  />
                  <text
                    x={x + BAR_W + GAP / 2}
                    y={100 - hPass - 5}
                    textAnchor="middle"
                    fontSize="4.5"
                    fill="white"
                    fontWeight="700"
                  >
                    {d.passagers}k
                  </text>
                </motion.g>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-4 mt-2 pl-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-orange-500 inline-block" />
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Passagers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-blue-400 inline-block" />
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Véhicules</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Donut Chart animé ─── */
function AnimatedDonut({ segments }) {
  const R = 15.915;
  const circ = 2 * Math.PI * R;
  let offset = 0;

  return (
    <svg width="130" height="130" viewBox="0 0 36 36" className="transform -rotate-90">
      <circle cx="18" cy="18" r={R} fill="none" stroke="#f3f4f6" strokeWidth="3" />
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const gap = circ - dash;
        const currentOffset = offset;
        offset += dash;
        return (
          <motion.circle
            key={i}
            cx="18" cy="18" r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth="3.2"
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={circ}
            animate={{
              strokeDasharray: `${dash} ${gap}`,
              strokeDashoffset: -currentOffset
            }}
            transition={{ duration: 1.2, delay: 0.3 + i * 0.18, ease: [0.4, 0, 0.2, 1] }}
          />
        );
      })}
    </svg>
  );
}

/* ─── Mini spark bars animées ─── */
function SparkBars({ color = '#f97316', values = [3, 5, 4, 6, 8] }) {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-0.5 h-8 mb-1">
      {values.map((v, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color, opacity: 0.3 + (v / max) * 0.7 }}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: 0.4 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/* ─── Composant principal ─── */
export default function PageUtilisateur() {
  const [userName, setUserName] = useState('Utilisateur');
  const [vehiclesOnline, setVehiclesOnline] = useState(0); // ✅ vrai nombre de bus en ligne
  const [routesCount, setRoutesCount] = useState(null);
  const [stopsCount, setStopsCount] = useState(null);
  const [usersCount, setUsersCount] = useState(null);
  const [backendOffline, setBackendOffline] = useState(false); // ✅ indicateur de connexion au backend

  const MOCK = {
    routes: 12,
    stops: 238,
    users: 5240,
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        // Le backend retourne nom_complet (ex: "Jean Rakoto")
        // On prend uniquement le premier mot = prénom
        const fullName = parsed.nom_complet || parsed.nom || parsed.name || '';
        if (fullName) setUserName(fullName.trim().split(' ')[0]);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, stopsRes, usersRes, liveRes] = await Promise.all([
          fetch(`${API_URL}/api/bus/routes`),
          fetch(`${API_URL}/api/bus/stops`),
          fetch(`${API_URL}/api/users`),
          fetch(`${API_URL}/api/positions/live`),
        ]);

        if (routesRes.ok) {
          const routes = await routesRes.json();
          if (Array.isArray(routes)) setRoutesCount(routes.length);
        }

        if (stopsRes.ok) {
          const stops = await stopsRes.json();
          setStopsCount(Array.isArray(stops) ? stops.length : null);
        }

        if (usersRes.ok) {
          const users = await usersRes.json();
          setUsersCount(Array.isArray(users) ? users.length : null);
        }

        // ✅ Nombre de véhicules réellement en ligne (chauffeurs en_service=1 avec position)
        if (liveRes.ok) {
          const liveJson = await liveRes.json();
          const list = Array.isArray(liveJson) ? liveJson : (liveJson.data || []);
          setVehiclesOnline(list.length);
        }

        setBackendOffline(false);
      } catch {
        // Backend indisponible — on garde 0 pour vehiclesOnline (pas de mock intentionnel)
        setBackendOffline(true);
      }
    };

    fetchData();

    // ✅ Rafraîchissement automatique toutes les 20 secondes pour rester à jour
    // sans Socket.io (Flutter envoie une position toutes les 18 secondes).
    const interval = setInterval(async () => {
      try {
        const liveRes = await fetch(`${API_URL}/api/positions/live`);
        if (liveRes.ok) {
          const liveJson = await liveRes.json();
          const list = Array.isArray(liveJson) ? liveJson : (liveJson.data || []);
          setVehiclesOnline(list.length);
        }
        setBackendOffline(false);
      } catch {
        setBackendOffline(true);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const finalRoutes   = routesCount ?? MOCK.routes;
  const finalStops    = stopsCount  ?? MOCK.stops;
  const finalUsers    = usersCount  ?? MOCK.users;

  const donutSegments = [
    { color: '#f97316', pct: 45, label: 'Optimisés' },
    { color: '#3b82f6', pct: 25, label: 'Réguliers' },
    { color: '#e11d48', pct: 20, label: 'En Retard' },
    { color: '#a855f7', pct: 10, label: 'Ralentis' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 22 } }
  };

  const lignes = [
    { dot: 'bg-rose-500',   name: 'Ligne 119', type: 'Urbain',    tps: '38 min', freq: 'Forte (4.2k)',   statut: 'Saturé',  statBg: 'bg-amber-50 text-amber-600',    perf: 'Critique' },
    { dot: 'bg-blue-500',   name: 'Ligne 163', type: 'Suburbain', tps: '18 min', freq: 'Moyenne (2.1k)', statut: 'Fluide',  statBg: 'bg-blue-50 text-blue-600',      perf: 'Optimale' },
    { dot: 'bg-orange-500', name: 'Ligne 194', type: 'Urbain',    tps: '22 min', freq: 'Forte (3.8k)',   statut: 'Régulé', statBg: 'bg-emerald-50 text-emerald-600', perf: 'Stable'  },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-full min-h-screen p-4 sm:p-6 md:p-8 pb-24 flex flex-col gap-6 overflow-x-hidden bg-gray-50/50 justify-start items-stretch"
    >
      {/* ── 1. EN-TÊTE ── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Bienvenue, {userName}!
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {vehiclesOnline} taxis-be géo-localisés actifs sur vos coopératives suivies.
          </p>
          {/* ✅ Petit indicateur discret si le backend est injoignable */}
          {backendOffline && (
            <p className="text-[10px] text-rose-500 font-semibold mt-1">
              ⚠ Connexion au serveur impossible — données affichées peuvent être obsolètes.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une ligne, un arrêt, un véhicule..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs focus:outline-none focus:border-orange-500 shadow-sm shadow-gray-100/30 font-medium transition-all"
            />
          </div>
          <button className="p-2 bg-white border border-gray-100 text-gray-500 rounded-xl hover:bg-gray-50 shadow-sm transition-colors relative shrink-0">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
          </button>
        </div>
      </motion.div>

      {/* ── 2. KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">

        {/* Card 1 : Trajets disponibles */}
        <motion.div variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Trajets Disponibles</span>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+8%</span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-extrabold text-gray-800 tracking-tight">
              <AnimatedCounter target={finalRoutes} />
            </span>
            <div className="mb-1 flex items-end gap-0.5 h-8">
              <SparkBars color="#10b981" values={[4, 6, 5, 8, 10, 9, 12]} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Card 2 : Véhicules En Ligne ✅ branché sur /api/positions/live */}
        <motion.div variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Véhicules En Ligne</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              vehiclesOnline > 0
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-gray-400 bg-gray-100'
            }`}>
              {vehiclesOnline > 0 ? 'En service' : 'Aucun'}
            </span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-extrabold text-gray-800 tracking-tight">
              <AnimatedCounter target={vehiclesOnline} />
            </span>
            <SparkBars color="#f97316" values={[3, 5, 4, 6, 8, 7, 9]} />
          </div>
          <p className="text-[10px] text-gray-400 font-medium mt-2">
            {vehiclesOnline === 0
              ? 'Aucun chauffeur connecté actuellement'
              : `${vehiclesOnline} chauffeur${vehiclesOnline > 1 ? 's' : ''} en service`}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-200 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Card 3 : Temps moyen */}
        <motion.div variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tps Moyen Déplacement</span>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">-10%</span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-extrabold text-gray-800 tracking-tight">
              <AnimatedCounter target={finalStops ? Math.max(1, Math.round(finalStops / 10)) : 24} suffix="min" />
            </span>
            <div className="mb-1 opacity-30 text-orange-500">
              <Clock className="w-7 h-7 stroke-[2]" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Card 4 : Nombre d'utilisateurs */}
        <motion.div variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Utilisateurs</span>
            <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">+5%</span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-extrabold text-gray-800 tracking-tight">
              <AnimatedCounter target={finalUsers} />
            </span>
            <div className="mb-1 opacity-30 text-purple-500">
              <Users className="w-7 h-7 stroke-[2]" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-medium mt-2">
            Total inscrits sur la plateforme
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </div>

      {/* ── 3. GRAPHIQUES MILIEU ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

        {/* Graphique à barres */}
        <motion.div variants={itemVariants}
          className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Fréquentation et Flux de Mobilité</h3>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                Analyse des flux de mobilité et volume de passagers par heure (Milliers).
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <select className="px-2.5 py-1.5 bg-gray-50 border-0 rounded-lg text-[11px] font-semibold text-gray-600 focus:outline-none">
                <option>Flux Axe Analakely</option>
                <option>Flux Axe Ankatso</option>
              </select>
              <select className="px-2.5 py-1.5 bg-gray-50 border-0 rounded-lg text-[11px] font-semibold text-gray-600 focus:outline-none">
                <option>Aujourd'hui</option>
                <option>Ce mois</option>
              </select>
            </div>
          </div>

          <div className="h-40 sm:h-52 md:h-56 w-full relative mt-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
              {['100k', '75k', '50k', '25k', '0'].map((label, i) => (
                <div key={i} className="w-full flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[8px] sm:text-[9px] text-gray-300 font-bold w-5 sm:w-6 text-right shrink-0">{label}</span>
                  <div className="flex-1 border-t border-dashed border-gray-100" />
                </div>
              ))}
            </div>
            <div
              className="absolute inset-0 ml-6 sm:ml-8 overflow-x-auto overflow-y-hidden"
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}
            >
              <div className="h-full" style={{ minWidth: 'max(100%, 420px)' }}>
                <AnimatedBarChart />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Donut Performance */}
        <motion.div variants={itemVariants}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Performance Transports</h3>
            <button className="p-1 bg-gray-50 text-gray-400 hover:text-gray-600 rounded">
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <AnimatedDonut segments={donutSegments} />
            <div className="absolute text-center pointer-events-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Indice Ef.</span>
              <motion.span
                className="text-2xl font-black text-gray-800"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, type: 'spring', stiffness: 280 }}
              >
                88%
              </motion.span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-[10px] font-bold text-gray-500">
            {donutSegments.map((seg, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                {seg.label}: {seg.pct}%
              </motion.div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1.5">
              <span>Efficacité globale</span>
              <span className="text-gray-700">88 / 100</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, #f97316, #fb923c)' }}
                initial={{ width: 0 }}
                animate={{ width: '88%' }}
                transition={{ delay: 1.4, duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 4. SECTION INFÉRIEURE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

        {/* Table supervision */}
        <motion.div variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Supervision des Flux de Mobilité</h3>
            <div className="flex items-center gap-1.5">
              <button className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-lg border border-gray-100/50 hover:bg-gray-100 transition-colors">
                <SlidersHorizontal className="w-3 h-3" />Filtrer
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs font-medium min-w-[500px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-50">
                  <th className="pb-2 font-bold uppercase text-[10px] tracking-wider">Ligne / Flux Analysé</th>
                  <th className="pb-2 font-bold uppercase text-[10px] tracking-wider">Tps Moyen</th>
                  <th className="pb-2 font-bold uppercase text-[10px] tracking-wider">Fréquentation</th>
                  <th className="pb-2 font-bold uppercase text-[10px] tracking-wider">Statut Flux</th>
                  <th className="pb-2 font-bold uppercase text-[10px] tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {lignes.map((l, i) => (
                  <motion.tr
                    key={i}
                    className="text-gray-700 hover:bg-gray-50/60 transition-colors"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.12 }}
                  >
                    <td className="py-3 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                      <span className="font-semibold">{l.name}</span>
                      <span className="text-gray-400 text-[10px]">— {l.type}</span>
                    </td>
                    <td className="py-3 text-gray-400 font-semibold">{l.tps}</td>
                    <td className="py-3 text-gray-500 font-semibold">{l.freq}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${l.statBg}`}>{l.statut}</span>
                    </td>
                    <td className="py-3 text-gray-400 font-bold">{l.perf}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Contrôle de véhicule */}
        <motion.div variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div>
            <h3 className="text-sm font-bold text-gray-800">Contrôle de Véhicule</h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Ping manuel de balise GPS en 2 secondes.</p>

            <div className="relative mt-4">
              <input
                type="text"
                placeholder="Entrer le numéro matricule..."
                className="w-full pl-3 pr-8 py-2 bg-gray-50 border-0 rounded-xl text-xs focus:outline-none font-semibold text-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-orange-300 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-orange-500 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-1.5 pl-1">
              Récents:{' '}
              <span className="underline cursor-pointer hover:text-gray-600 font-semibold">0412-TB-Ankatso</span>
            </p>
          </div>

          <div className="flex gap-2 justify-center my-3">
            {[
              { icon: Bus,           bg: 'bg-orange-50  border-orange-100  text-orange-500  hover:bg-orange-100' },
              { icon: MapPin,        bg: 'bg-blue-50    border-blue-100    text-blue-500    hover:bg-blue-100' },
              { icon: AlertTriangle, bg: 'bg-rose-50    border-rose-100    text-rose-500    hover:bg-rose-100' },
              { icon: CheckCircle,   bg: 'bg-purple-50  border-purple-100  text-purple-500  hover:bg-purple-100' },
            ].map(({ icon: Icon, bg }, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${bg}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </motion.button>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/60 rounded-xl text-xs font-bold text-gray-600 transition-colors"
            >
              Ping Balise
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              className="flex-1 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 group active:scale-95"
            >
              <span>Suivre Live</span>
              <Play className="w-2.5 h-2.5 fill-white group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}