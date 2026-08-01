import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Bus, Route, MapPin, AlertTriangle,
  CheckCircle, Clock, Wifi, Building2, RefreshCw, WifiOff
} from 'lucide-react';

/* ===================== CONFIG API ===================== */
// URL du backend déployé sur Render. Surchargeable via VITE_API_URL pour du dev local.
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  'https://soutenence-l2-juillet.onrender.com';

const ENDPOINTS = {
  routes: `${API_BASE_URL}/api/bus/routes`,
  stops: `${API_BASE_URL}/api/bus/stops`,
  live: `${API_BASE_URL}/api/positions/live`,
  cooperatives: `${API_BASE_URL}/api/cooperatives`,
  alertes: `${API_BASE_URL}/api/alertes`,
};

/* ─── Compteur animé ─── */
function AnimatedCounter({ target, suffix = '', duration = 1.4 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target === null || target === undefined) return;
    const startTime = performance.now();
    let frameId;
    const step = (now) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * ease));
      if (progress < 1) frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);
  if (target === null || target === undefined) return <span className="text-gray-300">—</span>;
  return <>{display.toLocaleString()}{suffix}</>;
}

/* ─── Couleur par type d'alerte ─── */
const alertColor = (type) => {
  if (type === 'accident')     return { bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-500',  label: 'Accident' };
  if (type === 'travaux')      return { bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500', label: 'Travaux' };
  if (type === 'route_coupee') return { bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500',    label: 'Route coupée' };
  return                              { bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-400',   label: type || 'Alerte' };
};

/* ─── Petite palette d'accents pour distinguer les coopératives visuellement ─── */
const coopAccents = [
  { bg: 'bg-blue-50',    icon: 'text-blue-500'    },
  { bg: 'bg-emerald-50', icon: 'text-emerald-500' },
  { bg: 'bg-purple-50',  icon: 'text-purple-500'  },
  { bg: 'bg-orange-50',  icon: 'text-orange-500'  },
  { bg: 'bg-rose-50',    icon: 'text-rose-500'    },
  { bg: 'bg-cyan-50',    icon: 'text-cyan-500'    },
];

/* ─── Utilitaire : lit une réponse fetch settled et renvoie [] / null en cas d'échec ─── */
async function readJsonSafe(settledResult) {
  if (settledResult.status !== 'fulfilled' || !settledResult.value.ok) return null;
  try {
    const data = await settledResult.value.json();
    return data;
  } catch {
    return null;
  }
}

/* ===================== COMPOSANT PRINCIPAL ===================== */

export default function Dashboard_o() {
  const [userName, setUserName]             = useState('Opérateur');
  const [lastRefresh, setLastRefresh]        = useState(new Date());
  const [vehiclesOnline, setVehiclesOnline]  = useState(null);
  const [totalRoutes, setTotalRoutes]        = useState(null);
  const [totalStops, setTotalStops]          = useState(null);
  const [cooperatives, setCooperatives]      = useState([]);
  const [alertesList, setAlertesList]        = useState([]);
  const [loading, setLoading]                = useState(true);
  const [serverDown, setServerDown]          = useState(false);

  const abortRef = useRef(null);

  /* ─── Utilisateur ─── */
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        const full = u.nom_complet || u.nom || '';
        if (full) setUserName(full.trim().split(' ')[0]);
      } catch {
        // profil illisible, on garde le nom par défaut
      }
    }
  }, []);

  /* ─── Fetch de toutes les données du dashboard ─── */
  const fetchAll = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      const results = await Promise.allSettled([
        fetch(ENDPOINTS.routes, { signal: controller.signal }),
        fetch(ENDPOINTS.stops, { signal: controller.signal }),
        fetch(ENDPOINTS.live, { signal: controller.signal }),
        fetch(ENDPOINTS.cooperatives, { signal: controller.signal }),
        fetch(ENDPOINTS.alertes, { signal: controller.signal }),
      ]);

      if (controller.signal.aborted) return;

      const [routesRes, stopsRes, liveRes, coopRes, alertesRes] = results;

      const routesData = await readJsonSafe(routesRes);
      setTotalRoutes(Array.isArray(routesData) ? routesData.length : null);

      const stopsData = await readJsonSafe(stopsRes);
      setTotalStops(Array.isArray(stopsData) ? stopsData.length : null);

      const liveData = await readJsonSafe(liveRes);
      if (liveData !== null) {
        const list = Array.isArray(liveData) ? liveData : (liveData.data || []);
        setVehiclesOnline(list.length);
      } else {
        setVehiclesOnline(null);
      }

      const coopData = await readJsonSafe(coopRes);
      setCooperatives(Array.isArray(coopData) ? coopData : (coopData?.data || []));

      const alertesData = await readJsonSafe(alertesRes);
      setAlertesList(Array.isArray(alertesData) ? alertesData : (alertesData?.data || []));

      // Le serveur est considéré down uniquement si TOUTES les requêtes ont échoué
      const allFailed = results.every((r) => r.status === 'rejected' || !r.value.ok);
      setServerDown(allFailed);
    } catch {
      setServerDown(true);
    }

    setLoading(false);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [fetchAll]);

  /* ─── Animation variants ─── */
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } }
  };

  /* ─── KPI cards ─── */
  const kpis = [
    {
      label: 'Véhicules en ligne',
      value: vehiclesOnline,
      icon: Wifi,
      color: vehiclesOnline > 0 ? 'text-emerald-500' : 'text-gray-400',
      bg: vehiclesOnline > 0 ? 'bg-emerald-50' : 'bg-gray-50',
      badge: vehiclesOnline > 0
        ? { text: 'En service', cls: 'text-emerald-600 bg-emerald-50' }
        : { text: 'Aucun', cls: 'text-gray-400 bg-gray-100' },
      sub: !vehiclesOnline
        ? 'Aucun chauffeur connecté'
        : `${vehiclesOnline} chauffeur${vehiclesOnline > 1 ? 's' : ''} actif${vehiclesOnline > 1 ? 's' : ''}`,
    },
    {
      label: 'Trajets disponibles',
      value: totalRoutes,
      icon: Route,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      badge: { text: 'Réseau', cls: 'text-blue-600 bg-blue-50' },
      sub: 'Lignes de bus actives',
    },
    {
      label: 'Arrêts couverts',
      value: totalStops,
      icon: MapPin,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      badge: { text: 'Réseau', cls: 'text-orange-600 bg-orange-50' },
      sub: 'Points de desserte',
    },
    {
      label: 'Coopératives',
      value: loading && cooperatives.length === 0 ? null : cooperatives.length,
      icon: Building2,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      badge: { text: 'Réseau', cls: 'text-purple-600 bg-purple-50' },
      sub: 'Partenaires du réseau TAXI-BE',
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full min-h-screen p-4 sm:p-6 md:p-8 pb-24 flex flex-col gap-6 bg-gray-50/50"
    >
      {/* ── EN-TÊTE ── */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Bonjour, {userName}
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            Tableau de bord opérateur — Réseau TAXI-BE Antananarivo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-medium">
            Mis à jour à {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            Actualiser
          </button>
        </div>
      </motion.div>

      {/* ── BANDEAU SERVEUR INJOIGNABLE ── */}
      {serverDown && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          Impossible de contacter le serveur. Le service peut mettre quelques secondes à démarrer, réessayez dans un instant.
          <button onClick={fetchAll} className="ml-auto underline underline-offset-2 shrink-0">
            Réessayer
          </button>
        </motion.div>
      )}

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              variants={item}
              className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${kpi.color}`} size={18} />
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${kpi.badge.cls}`}>
                  {kpi.badge.text}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
                <p className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  <AnimatedCounter target={kpi.value ?? 0} />
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-1.5">{kpi.sub}</p>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${kpi.bg.replace('50', '200')} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          );
        })}
      </div>

      {/* ── SECTION BASSE : Coopératives + Alertes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Coopératives du réseau ── */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
          style={{ maxHeight: 340 }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 shrink-0">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-500" />
              <h2 className="text-sm font-bold text-gray-800">Coopératives</h2>
            </div>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
              {cooperatives.length} au total
            </span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-gray-50/80">
            {loading && cooperatives.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <RefreshCw className="w-6 h-6 text-gray-300 animate-spin mb-2" />
                <p className="text-xs font-semibold text-gray-500">Chargement des coopératives…</p>
              </div>
            ) : cooperatives.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <Building2 className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-600">Aucune coopérative enregistrée</p>
                <p className="text-[11px] text-gray-400 mt-1">Les données proviennent de la table cooperatives.</p>
              </div>
            ) : (
              cooperatives.map((coop, i) => {
                const accent = coopAccents[i % coopAccents.length];
                const nom = coop.name || coop.nom || `Coopérative ${i + 1}`;
                const initiale = nom.replace('Coopérative', '').trim().charAt(0).toUpperCase() || 'C';
                return (
                  <motion.div
                    key={coop.id ?? i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent.bg}`}>
                      <span className={`text-[11px] font-extrabold ${accent.icon}`}>{initiale}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Bus className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <p className="text-xs font-semibold text-gray-800 truncate">{nom}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* ── Alertes trafic — hauteur fixe + scroll interne ── */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden"
          style={{ maxHeight: 340 }}
        >
          {/* En-tête fixe */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-gray-800">Alertes sur la route</h2>
            </div>
            {alertesList.length > 0 && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                {alertesList.length} alerte{alertesList.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Liste scrollable */}
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50/80">
            {loading && alertesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <RefreshCw className="w-6 h-6 text-gray-300 animate-spin mb-2" />
                <p className="text-xs font-semibold text-gray-500">Chargement des alertes…</p>
              </div>
            ) : alertesList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 px-5 text-center"
              >
                <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-sm font-semibold text-gray-600">Aucune alerte active</p>
                <p className="text-[11px] text-gray-400 mt-1">Toutes les routes sont dégagées.</p>
              </motion.div>
            ) : (
              alertesList.map((alerte, i) => {
                const c = alertColor(alerte.type);
                const heure = alerte.created_at
                  ? new Date(alerte.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  : null;
                return (
                  <motion.div
                    key={alerte.id || i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.09 }}
                    className={`flex items-start gap-3 px-5 py-3.5 ${c.bg} border-l-2 ${c.border} hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex-shrink-0 mt-1.5">
                      <span className={`w-2 h-2 rounded-full inline-block ${c.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-snug">
                        {alerte.titre || c.label}
                      </p>
                      {alerte.description && (
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                          {alerte.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded-md border border-gray-100">
                          {c.label}
                        </span>
                        {heure && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {heure}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}