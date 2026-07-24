import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bus, Wifi, WifiOff, MapPin, User, RefreshCw,
  Search, Filter, ChevronDown, MoreHorizontal,
  Navigation, Clock, AlertCircle, CheckCircle,
  ArrowUpRight, Activity, Fuel, Gauge
} from 'lucide-react';

/* ─── Compteur animé ─── */
function AnimatedCounter({ target, duration = 1.4 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1000 / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <>{display.toLocaleString()}</>;
}

/* ─── Badge statut ─── */
function StatusBadge({ status }) {
  const map = {
    en_ligne:  { label: 'En ligne',   cls: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500 animate-pulse' },
    hors_ligne:{ label: 'Hors ligne', cls: 'bg-gray-100 text-gray-400',      dot: 'bg-gray-300' },
    en_route:  { label: 'En route',   cls: 'bg-blue-50 text-blue-600',       dot: 'bg-blue-500 animate-pulse' },
    maintenance:{ label: 'Maintenance',cls: 'bg-amber-50 text-amber-600',    dot: 'bg-amber-500' },
  };
  const s = map[status] || map.hors_ligne;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/* ─── Données mock ─── */
const MOCK_VEHICULES = [
  { id: 1,  immat: 'TBE-001', ligne: '135', ligne_nom: 'Analakely → Mahamasina',  chauffeur: 'Rakoto Jean',     statut: 'en_route',   lat: -18.9148, lng: 47.5362, vitesse: 32, carburant: 78, km: 12450, derniere_maj: '20:41' },
  { id: 2,  immat: 'TBE-002', ligne: '87',  ligne_nom: 'Isotry → Ambohipo',        chauffeur: 'Andry Pierre',    statut: 'en_ligne',   lat: -18.8921, lng: 47.5210, vitesse: 0,  carburant: 45, km: 8320,  derniere_maj: '20:40' },
  { id: 3,  immat: 'TBE-003', ligne: '042', ligne_nom: '67ha → Anosizato',         chauffeur: 'Solofo Marc',     statut: 'en_route',   lat: -18.9034, lng: 47.5489, vitesse: 28, carburant: 62, km: 21780, derniere_maj: '20:41' },
  { id: 4,  immat: 'TBE-004', ligne: '112', ligne_nom: 'Andranoro → Analakely',    chauffeur: 'Haja Lova',       statut: 'hors_ligne', lat: null,     lng: null,    vitesse: 0,  carburant: 30, km: 5600,  derniere_maj: '19:15' },
  { id: 5,  immat: 'TBE-005', ligne: '114', ligne_nom: 'Ambatolampy → Analakely',  chauffeur: 'Fara Nirina',     statut: 'en_route',   lat: -18.8756, lng: 47.5601, vitesse: 41, carburant: 91, km: 34120, derniere_maj: '20:41' },
  { id: 6,  immat: 'TBE-006', ligne: '133', ligne_nom: 'Hopitaly → Centre',        chauffeur: 'Rado Tiana',      statut: 'maintenance',lat: null,     lng: null,    vitesse: 0,  carburant: 15, km: 67400, derniere_maj: '14:30' },
  { id: 7,  immat: 'TBE-007', ligne: '109', ligne_nom: '67ha → Anosizato',         chauffeur: 'Mamy Rivo',       statut: 'en_ligne',   lat: -18.9201, lng: 47.5123, vitesse: 0,  carburant: 55, km: 9870,  derniere_maj: '20:39' },
  { id: 8,  immat: 'TBE-008', ligne: '123', ligne_nom: 'Manga → Analakely',        chauffeur: 'Vola Tahina',     statut: 'hors_ligne', lat: null,     lng: null,    vitesse: 0,  carburant: 82, km: 15230, derniere_maj: '18:45' },
];

const FILTRES_STATUT = [
  { key: 'tous',        label: 'Tous' },
  { key: 'en_route',   label: 'En route' },
  { key: 'en_ligne',   label: 'En ligne' },
  { key: 'hors_ligne', label: 'Hors ligne' },
  { key: 'maintenance',label: 'Maintenance' },
];

const container = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } }
};
const rowVariant = {
  hidden: { opacity: 0, x: -8 },
  show:   { opacity: 1, x: 0,  transition: { type: 'spring', stiffness: 300, damping: 28 } }
};

export default function FlotteVehicules() {
  const [vehicules, setVehicules]     = useState(MOCK_VEHICULES);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [selected, setSelected]       = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  /* ── API (remplace les mock quand le backend répond) ── */
  const fetchVehicules = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/vehicules');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setVehicules(data);
      }
    } catch {}
    setLoading(false);
    setLastRefresh(new Date());
  };

  useEffect(() => {
    fetchVehicules();
    const interval = setInterval(fetchVehicules, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ── Filtres ── */
  const filtered = vehicules.filter(v => {
    const matchSearch = `${v.immat} ${v.chauffeur} ${v.ligne} ${v.ligne_nom}`
      .toLowerCase().includes(search.toLowerCase());
    const matchStatut = filtreStatut === 'tous' || v.statut === filtreStatut;
    return matchSearch && matchStatut;
  });

  /* ── KPIs ── */
  const total       = vehicules.length;
  const enRoute     = vehicules.filter(v => v.statut === 'en_route').length;
  const enLigne     = vehicules.filter(v => v.statut === 'en_ligne').length;
  const horsLigne   = vehicules.filter(v => v.statut === 'hors_ligne').length;
  const maintenance = vehicules.filter(v => v.statut === 'maintenance').length;
  const tauxActifs  = Math.round(((enRoute + enLigne) / total) * 100);

  const kpis = [
    {
      label: 'Flotte totale',
      value: total,
      icon: Bus,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      badge: { text: `${tauxActifs}% actifs`, cls: 'text-blue-600 bg-blue-50' },
      sub: 'Véhicules enregistrés',
    },
    {
      label: 'En circulation',
      value: enRoute + enLigne,
      icon: Navigation,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      badge: { text: 'En service', cls: 'text-emerald-600 bg-emerald-50' },
      sub: `${enRoute} en route · ${enLigne} à l'arrêt`,
    },
    {
      label: 'Hors ligne',
      value: horsLigne,
      icon: WifiOff,
      color: 'text-gray-400',
      bg: 'bg-gray-50',
      badge: { text: 'Déconnecté', cls: 'text-gray-400 bg-gray-100' },
      sub: 'GPS non détecté',
    },
    {
      label: 'En maintenance',
      value: maintenance,
      icon: AlertCircle,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      badge: { text: 'Atelier', cls: 'text-amber-600 bg-amber-50' },
      sub: 'Temporairement retirés',
    },
  ];

  /* ── Jauge carburant ── */
  const FuelBar = ({ pct }) => {
    const color = pct > 60 ? 'bg-emerald-400' : pct > 25 ? 'bg-amber-400' : 'bg-red-400';
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[10px] text-gray-400 font-medium w-7">{pct}%</span>
      </div>
    );
  };

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
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Flotte Véhicules</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            Suivi et gestion des taxis-be — Réseau TAXI-BE Antananarivo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-medium">
            Mis à jour à {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={fetchVehicules}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            Actualiser
          </button>
        </div>
      </motion.div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              variants={item}
              className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`${kpi.color}`} size={18} />
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${kpi.badge.cls}`}>
                  {kpi.badge.text}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
                <p className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  <AnimatedCounter target={kpi.value} />
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-1.5">{kpi.sub}</p>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${kpi.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          );
        })}
      </div>

      {/* ── BARRE RECHERCHE + FILTRES ── */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
          <Search className="w-4 h-4 text-gray-300 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un véhicule, un chauffeur, une ligne…"
            className="flex-1 text-[13px] text-gray-700 bg-transparent outline-none placeholder:text-gray-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 transition-colors text-xs">✕</button>
          )}
        </div>

        {/* Filtres statut */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl shadow-sm px-2 py-1.5 overflow-x-auto">
          {FILTRES_STATUT.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltreStatut(f.key)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                filtreStatut === f.key
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f.label}
              {f.key !== 'tous' && (
                <span className={`ml-1.5 text-[9px] font-black ${filtreStatut === f.key ? 'text-white/60' : 'text-gray-300'}`}>
                  {vehicules.filter(v => v.statut === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── TABLEAU + PANNEAU DÉTAIL ── */}
      <motion.div variants={item} className="flex gap-5 items-start">

        {/* ── LISTE VÉHICULES ── */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Header tableau */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-gray-800">Véhicules</h2>
            </div>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Colonnes header */}
          <div className="grid grid-cols-12 px-5 py-2.5 border-b border-gray-50 bg-gray-50/60">
            {['Véhicule', 'Chauffeur', 'Ligne', 'Statut', 'Vitesse', 'Carburant', 'Maj'].map((h, i) => (
              <div key={i}
                className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider ${
                  i === 0 ? 'col-span-2' :
                  i === 1 ? 'col-span-2' :
                  i === 2 ? 'col-span-3' :
                  i === 3 ? 'col-span-2' :
                  'col-span-1'
                }`}>
                {h}
              </div>
            ))}
          </div>

          {/* Lignes */}
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-14 text-center px-5">
                <Bus className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm font-semibold text-gray-400">Aucun véhicule trouvé</p>
                <p className="text-[11px] text-gray-300 mt-1">Essayez un autre filtre ou terme de recherche.</p>
              </motion.div>
            ) : (
              <div className="divide-y divide-gray-50/80 max-h-[480px] overflow-y-auto">
                {filtered.map((v, idx) => (
                  <motion.div
                    key={v.id}
                    variants={rowVariant}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => setSelected(selected?.id === v.id ? null : v)}
                    className={`grid grid-cols-12 px-5 py-3.5 items-center cursor-pointer transition-colors ${
                      selected?.id === v.id
                        ? 'bg-blue-50/60 border-l-2 border-l-blue-400'
                        : 'hover:bg-gray-50/60 border-l-2 border-l-transparent'
                    }`}
                  >
                    {/* Immat */}
                    <div className="col-span-2 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        v.statut === 'en_route' || v.statut === 'en_ligne' ? 'bg-blue-50' :
                        v.statut === 'maintenance' ? 'bg-amber-50' : 'bg-gray-50'
                      }`}>
                        <Bus className={`w-4 h-4 ${
                          v.statut === 'en_route' || v.statut === 'en_ligne' ? 'text-blue-500' :
                          v.statut === 'maintenance' ? 'text-amber-400' : 'text-gray-300'
                        }`} />
                      </div>
                      <span className="text-[12px] font-bold text-gray-800">{v.immat}</span>
                    </div>

                    {/* Chauffeur */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-[8px] font-black text-indigo-600">
                            {v.chauffeur.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-gray-700 truncate">{v.chauffeur.split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* Ligne */}
                    <div className="col-span-3 flex items-center gap-2 min-w-0">
                      <span className="shrink-0 text-[9px] font-black text-white bg-gray-700 px-1.5 py-0.5 rounded-md">
                        {v.ligne}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate">{v.ligne_nom}</span>
                    </div>

                    {/* Statut */}
                    <div className="col-span-2">
                      <StatusBadge status={v.statut} />
                    </div>

                    {/* Vitesse */}
                    <div className="col-span-1 flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-gray-300 shrink-0" />
                      <span className={`text-[11px] font-semibold ${v.vitesse > 0 ? 'text-gray-700' : 'text-gray-300'}`}>
                        {v.vitesse > 0 ? `${v.vitesse}` : '—'}
                        {v.vitesse > 0 && <span className="text-[9px] text-gray-400 font-normal"> km/h</span>}
                      </span>
                    </div>

                    {/* Carburant */}
                    <div className="col-span-1">
                      <FuelBar pct={v.carburant} />
                    </div>

                    {/* Maj */}
                    <div className="col-span-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-300 shrink-0" />
                      <span className="text-[10px] text-gray-400 font-medium">{v.derniere_maj}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ── PANNEAU DÉTAIL ── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 20, scale: 0.97 }}
              animate={{ opacity: 1, x: 0,  scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-72 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Header détail */}
              <div className="px-5 pt-5 pb-4 border-b border-gray-50 bg-blue-50/40">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selected.statut === 'en_route' || selected.statut === 'en_ligne' ? 'bg-blue-100' :
                    selected.statut === 'maintenance' ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    <Bus className={`w-5 h-5 ${
                      selected.statut === 'en_route' || selected.statut === 'en_ligne' ? 'text-blue-600' :
                      selected.statut === 'maintenance' ? 'text-amber-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-gray-300 hover:text-gray-600 text-xs w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white transition-all"
                  >✕</button>
                </div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">{selected.immat}</h3>
                <StatusBadge status={selected.statut} />
              </div>

              {/* Corps détail */}
              <div className="px-5 py-4 space-y-4">

                {/* Chauffeur */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-indigo-600">
                      {selected.chauffeur.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Chauffeur</p>
                    <p className="text-[13px] font-bold text-gray-800 leading-snug">{selected.chauffeur}</p>
                  </div>
                </div>

                {/* Ligne */}
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Ligne affectée</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white bg-gray-800 px-2 py-1 rounded-lg">{selected.ligne}</span>
                    <span className="text-[11px] text-gray-600 font-medium leading-tight">{selected.ligne_nom}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Vitesse', value: selected.vitesse > 0 ? `${selected.vitesse} km/h` : '—', icon: Gauge, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Kilométrage', value: `${selected.km.toLocaleString()} km`, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className={`${s.bg} rounded-xl p-3`}>
                        <Icon className={`${s.color} w-3.5 h-3.5 mb-1.5`} />
                        <p className="text-[10px] text-gray-400 font-semibold">{s.label}</p>
                        <p className="text-[13px] font-extrabold text-gray-800 mt-0.5">{s.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Carburant */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Carburant</p>
                    <span className={`text-[10px] font-extrabold ${
                      selected.carburant > 60 ? 'text-emerald-600' :
                      selected.carburant > 25 ? 'text-amber-500' : 'text-red-500'
                    }`}>{selected.carburant}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        selected.carburant > 60 ? 'bg-emerald-400' :
                        selected.carburant > 25 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${selected.carburant}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                    />
                  </div>
                  {selected.carburant <= 25 && (
                    <p className="text-[10px] text-red-400 font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Niveau critique — ravitaillement requis
                    </p>
                  )}
                </div>

                {/* GPS */}
                {selected.lat && (
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Position GPS</p>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="text-[10px] text-gray-500 font-mono">
                        {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Dernière maj */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Dernière mise à jour
                  </span>
                  <span className="text-[10px] font-bold text-gray-600">{selected.derniere_maj}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}