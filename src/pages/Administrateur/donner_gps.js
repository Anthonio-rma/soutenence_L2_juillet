import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/* ─── Configuration de l'API ───
   En dev (Vite), tu peux créer un fichier .env à la racine avec :
     VITE_API_URL=http://localhost:5000
   En prod, laisse .env vide ou absent : ça retombera automatiquement
   sur ton backend déployé sur Render. */
const API_BASE = import.meta.env.VITE_API_URL || 'https://soutenence-l2-juillet.onrender.com';

// ===================== ICONES BADGES RONDS A / B =====================
const blueIcon = new L.DivIcon({
  className: 'custom-pin-icon',
  html: `
    <div style="
      width: 30px; height: 30px;
      background: #0067c5;
      border: 3px solid #fff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      color: #fff; font-weight: 700; font-size: 14px;
      font-family: 'Segoe UI', Arial, sans-serif;
    ">A</div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const redIcon = new L.DivIcon({
  className: 'custom-pin-icon',
  html: `
    <div style="
      width: 30px; height: 30px;
      background: #e81123;
      border: 3px solid #fff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      color: #fff; font-weight: 700; font-size: 14px;
      font-family: 'Segoe UI', Arial, sans-serif;
    ">B</div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// ===================== SVG ICONS FOR ALERT TYPES =====================
const AccidentSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`;
const TravauxSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><path d="M14 6a6 6 0 0 1 6 6v3"/></svg>`;
const RouteCoupeeSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>`;

const buildAlerteIcon = (bg, svgContent, selected = false) => new L.DivIcon({
  className: 'custom-pin-icon',
  html: `
    <div style="
      width: ${selected ? 36 : 30}px; height: ${selected ? 36 : 30}px;
      background: ${bg};
      border: 3px solid #fff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.45)${selected ? ', 0 0 0 4px rgba(0,103,197,0.18)' : ''};
      transition: all 0.15s ease;
    ">${svgContent}</div>
  `,
  iconSize: [selected ? 36 : 30, selected ? 36 : 30],
  iconAnchor: [selected ? 18 : 15, selected ? 18 : 15],
});

const ICONES_ALERTE = {
  accident:     { bg: '#e6a817', svg: AccidentSVG,    label: 'Accident' },
  travaux:      { bg: '#e07020', svg: TravauxSVG,     label: 'Travaux' },
  route_coupee: { bg: '#c62828', svg: RouteCoupeeSVG, label: 'Route coupée' },
};

const getAlerteIcon = (type, selected = false) => {
  const conf = ICONES_ALERTE[type] || { bg: '#5e6266', svg: AccidentSVG };
  return buildAlerteIcon(conf.bg, conf.svg, selected);
};

const ghostIcon = new L.DivIcon({
  className: 'custom-pin-icon',
  html: `
    <div style="
      width: 28px; height: 28px;
      background: rgba(0,103,197,0.85);
      border: 3px dashed #fff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, zoom); }, [center, map, zoom]);
  return null;
};

const MapClickHandler = ({ active, onMapClick }) => {
  useMapEvents({
    click(e) { if (active) onMapClick(e.latlng); },
  });
  return null;
};

// ===================== ICONES SVG INLINE =====================
const IconBus = ({ color = '#5e6266', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="13" rx="2" />
    <path d="M4 11h16" />
    <path d="M8 17v2M16 17v2" />
    <circle cx="7.5" cy="14" r="0.5" fill={color} />
    <circle cx="16.5" cy="14" r="0.5" fill={color} />
  </svg>
);
const IconPlus = ({ color = '#fff', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconTrash = ({ color = '#e81123', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);
const IconEdit = ({ color = '#0067c5', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const IconClose = ({ color = '#5e6266', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const IconPin = ({ color = '#fff', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconAccident = ({ color = '#fff', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" x2="12" y1="9" y2="13"/>
    <line x1="12" x2="12.01" y1="17" y2="17"/>
  </svg>
);
const IconTravaux = ({ color = '#fff', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/>
    <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/>
    <path d="M4 15v-3a6 6 0 0 1 6-6"/>
    <path d="M14 6a6 6 0 0 1 6 6v3"/>
  </svg>
);
const IconRouteCoupee = ({ color = '#fff', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/>
  </svg>
);

const TYPE_OPTIONS = [
  { value: 'accident',     label: 'Accident',      Icon: IconAccident,    bg: '#e6a817' },
  { value: 'travaux',      label: 'Travaux',        Icon: IconTravaux,     bg: '#e07020' },
  { value: 'route_coupee', label: 'Route coupée',   Icon: IconRouteCoupee, bg: '#c62828' },
];

const DonnerGPS = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [alertes, setAlertes] = useState([]);
  const [loadingAlertes, setLoadingAlertes] = useState(false);
  const [placementActif, setPlacementActif] = useState(false);
  const [pendingPoint, setPendingPoint] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formData, setFormData] = useState({
    id: null, type: 'accident', titre: '', description: '', lat: null, lng: null, ligne_id: null,
  });
  const [rattacherLigne, setRattacherLigne] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const TANA_COORDS = [-18.8792, 47.5079];

  useEffect(() => {
    fetch(`${API_BASE}/api/bus/routes`)
      .then(res => res.json())
      .then(data => setRoutes(Array.isArray(data) ? data : []))
      .catch(err => console.error("Erreur API routes:", err));
  }, []);

  const fetchAlertes = () => {
    setLoadingAlertes(true);
    fetch(`${API_BASE}/api/alertes`)
      .then(res => res.json())
      .then(data => {
        const valides = Array.isArray(data)
          ? data.filter(a => typeof a.lat === 'number' && typeof a.lng === 'number')
          : [];
        setAlertes(valides);
      })
      .catch(err => { console.error("Erreur API alertes:", err); setAlertes([]); })
      .finally(() => setLoadingAlertes(false));
  };

  useEffect(() => { fetchAlertes(); }, []);

  const parseWKT = (wkt) => {
    if (!wkt) return [];
    const match = wkt.match(/\(([^()]+)\)/);
    if (!match) return [];
    return match[1].split(',').map(pair => {
      const [x, y] = pair.trim().split(/\s+/).map(Number);
      return [y, x];
    });
  };

  const routeCoords = selectedRoute ? parseWKT(selectedRoute.geom) : [];

  const handleMapClick = (latlng) => {
    setPendingPoint(latlng);
    setFormMode('create');
    setFormData({ id: null, type: 'accident', titre: '', description: '', lat: latlng.lat, lng: latlng.lng, ligne_id: selectedRoute ? selectedRoute.id : null });
    setRattacherLigne(!!selectedRoute);
    setFormOpen(true);
    setPlacementActif(false);
  };

  const startPlacement = () => {
    setPlacementActif(true);
    setFormOpen(false);
    setPendingPoint(null);
    setDrawerOpen(false);
  };

  const cancelPlacement = () => { setPlacementActif(false); setPendingPoint(null); };

  const handleEditAlerte = (alerte) => {
    setFormMode('edit');
    setFormData({ id: alerte.id, type: alerte.type || 'accident', titre: alerte.titre || '', description: alerte.description || '', lat: alerte.lat, lng: alerte.lng, ligne_id: alerte.ligne_id || null });
    setRattacherLigne(!!alerte.ligne_id);
    setPendingPoint({ lat: alerte.lat, lng: alerte.lng });
    setFormOpen(true);
    setPlacementActif(false);
  };

  const closeForm = () => { setFormOpen(false); setPendingPoint(null); };

  const handleSaveAlerte = () => {
    if (!formData.titre.trim()) return;
    setSaving(true);
    const payload = { type: formData.type, titre: formData.titre.trim(), description: formData.description.trim(), lat: formData.lat, lng: formData.lng, ligne_id: rattacherLigne ? formData.ligne_id : null };
    const isEdit = formMode === 'edit' && formData.id;
    const url = isEdit ? `${API_BASE}/api/alertes/${formData.id}` : `${API_BASE}/api/alertes`;
    const method = isEdit ? 'PUT' : 'POST';
    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(res => res.json())
      .then(() => { fetchAlertes(); closeForm(); })
      .catch(err => console.error("Erreur enregistrement alerte:", err))
      .finally(() => setSaving(false));
  };

  const handleDeleteAlerte = (id) => {
    fetch(`${API_BASE}/api/alertes/${id}`, { method: 'DELETE' })
      .then(() => { setAlertes(prev => prev.filter(a => a.id !== id)); if (formData.id === id) closeForm(); })
      .catch(err => console.error("Erreur suppression alerte:", err));
  };

  return (
    <div className="flex h-full w-full font-sans overflow-hidden relative">
      <style>{`
        @keyframes alertPanelIn {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-alertPanelIn { animation: alertPanelIn 0.24s cubic-bezier(0.16,1,0.3,1); }
        .animate-backdropFadeIn { animation: backdropFadeIn 0.2s ease; }
      `}</style>

      {/* ===== SIDEBAR GAUCHE =====
          Desktop : colonne fixe h-full avec flex flex-col → la liste scrolle à l'intérieur
          Mobile  : tiroir en bas qui glisse vers le haut
      ===== */}
      <aside
        className={`
          fixed md:relative
          bottom-0 left-0 right-0
          md:bottom-auto md:left-auto md:right-auto
          w-full md:w-[350px] md:min-w-[350px]
          pt-2 md:pt-4 px-4
          border-t md:border-t-0 md:border-r border-gray-200
          bg-white z-[1000]
          flex flex-col
          rounded-t-2xl md:rounded-none
          shadow-[0_-6px_24px_rgba(0,0,0,0.14)] md:shadow-[2px_0_8px_rgba(0,0,0,0.04)]
          md:h-full
          max-h-[78vh] md:max-h-none
          transition-transform duration-300 ease-out
          ${drawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-64px)]'} md:translate-y-0
        `}
      >
        {/* Poignée tiroir mobile */}
        <button
          onClick={() => setDrawerOpen(v => !v)}
          className="md:hidden flex items-center justify-center py-1.5 -mt-0.5 mb-1 bg-transparent border-none cursor-pointer"
          aria-label="Basculer la liste des alertes"
        >
          <span className="w-10 h-1.5 rounded-full bg-gray-300" />
        </button>

        {/* Titre — cliquable sur mobile pour ouvrir/fermer */}
        <div
          className="flex items-center justify-between mb-3.5 cursor-pointer md:cursor-default shrink-0"
          onClick={() => setDrawerOpen(v => !v)}
        >
          <h2 className="text-[1.15rem] font-semibold text-gray-900 m-0">Gestion des alertes</h2>
          <span className="md:hidden flex items-center gap-1.5 text-[0.78rem] text-gray-400 font-semibold">
            {alertes.length} alerte{alertes.length === 1 ? '' : 's'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: drawerOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>

        {/* Sélecteur de ligne — fixe, ne scroll pas */}
        <div className="border border-gray-200 rounded-lg px-2.5 py-2 mb-2.5 shrink-0">
          <label className="text-[0.78rem] text-gray-500 font-semibold mb-1.5 block">
            Ligne concernée (optionnel)
          </label>
          <select
            value={selectedRoute?.id || ''}
            onChange={(e) => {
              const r = routes.find(rt => String(rt.id) === e.target.value);
              setSelectedRoute(r || null);
            }}
            className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-[0.85rem] text-gray-900 bg-white outline-none"
          >
            <option value="">Aucune — point libre sur la carte</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>Ligne {r.ref} — {r.name}</option>
            ))}
          </select>
          {selectedRoute && (
            <div className="text-[0.78rem] text-gray-500 mt-1.5">
              Le tracé s'affiche sur la carte pour vous guider.
            </div>
          )}
        </div>

        {/* Bouton placer/annuler — fixe */}
        <div className="shrink-0">
          {!placementActif ? (
            <button
              onClick={startPlacement}
              className="flex items-center justify-center gap-2 bg-[#0067c5] hover:bg-[#0056a8] text-white text-[0.85rem] font-semibold rounded-lg px-3 py-2.5 mb-3 cursor-pointer border-none transition-colors duration-150 w-full"
            >
              <IconPlus color="#fff" />
              <span>Placer une alerte sur la carte</span>
            </button>
          ) : (
            <button
              onClick={cancelPlacement}
              className="flex items-center justify-center gap-2 bg-[#fff4e5] text-[#ff8c00] text-[0.85rem] font-semibold rounded-lg px-3 py-2.5 mb-3 cursor-pointer border border-[#ff8c00] transition-colors duration-150 w-full"
            >
              <IconClose color="#ff8c00" size={14} />
              <span>Cliquez sur la carte... (annuler)</span>
            </button>
          )}
        </div>

        {/* Séparateur + compteur — fixe */}
        <div className="h-2 bg-gray-100 -mx-4 mb-3 shrink-0" />
        <div className="flex items-center justify-between mb-2 px-0.5 shrink-0">
          <span className="text-[0.78rem] text-gray-500 font-semibold">
            {loadingAlertes ? 'Chargement...' : `${alertes.length} alerte${alertes.length === 1 ? '' : 's'} active${alertes.length === 1 ? '' : 's'}`}
          </span>
        </div>

        {/* ── LISTE DES ALERTES — scrollable, occupe l'espace restant ── */}
        <div className="overflow-y-auto flex-1 min-h-0 pb-4">
          {alertes.map(alerte => {
            const conf = ICONES_ALERTE[alerte.type] || { bg: '#5e6266', svg: AccidentSVG, label: 'Alerte' };
            const TypeIcon = (TYPE_OPTIONS.find(t => t.value === alerte.type) || TYPE_OPTIONS[0]).Icon;
            const ligneAssociee = routes.find(r => r.id === alerte.ligne_id);
            return (
              <div
                key={alerte.id}
                className={`border rounded-lg p-3 mb-2.5 transition-colors duration-150 ${
                  formData.id === alerte.id && formOpen
                    ? 'bg-[#eaf3fc] border-[#0067c5]'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  <span
                    className="w-6 h-6 min-w-[24px] rounded-full flex items-center justify-center mt-0.5"
                    style={{ background: conf.bg }}
                  >
                    <TypeIcon color="#fff" size={12} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.92rem] text-gray-900 font-semibold leading-tight">
                      {alerte.titre || conf.label}
                    </div>
                    <div className="text-[0.78rem] text-gray-500 mt-0.5">
                      {(ICONES_ALERTE[alerte.type] || {}).label || alerte.type}
                      {ligneAssociee && ` · Ligne ${ligneAssociee.ref}`}
                    </div>
                  </div>
                </div>
                {alerte.description && (
                  <div className="text-[0.8rem] text-gray-600 mb-2 ml-8">{alerte.description}</div>
                )}
                <div className="flex items-center gap-3 ml-8">
                  <button
                    onClick={() => handleEditAlerte(alerte)}
                    className="flex items-center gap-1 text-[0.78rem] text-[#0067c5] font-semibold cursor-pointer bg-transparent border-none p-0"
                  >
                    <IconEdit /> Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteAlerte(alerte.id)}
                    className="flex items-center gap-1 text-[0.78rem] text-[#e81123] font-semibold cursor-pointer bg-transparent border-none p-0"
                  >
                    <IconTrash /> Supprimer
                  </button>
                </div>
              </div>
            );
          })}
          {!loadingAlertes && alertes.length === 0 && (
            <div className="text-center text-gray-400 text-[0.85rem] py-6">
              Aucune alerte pour le moment.
            </div>
          )}
        </div>
      </aside>

      {/* ===== CARTE ===== */}
      <main className="flex-1 relative w-full h-full">
        <MapContainer
          center={TANA_COORDS}
          zoom={13}
          zoomControl={false}
          style={{ height: '100%', width: '100%', cursor: placementActif ? 'crosshair' : '' }}
        >
          <ChangeView center={selectedRoute ? routeCoords[0] : TANA_COORDS} zoom={selectedRoute ? 14 : 13} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler active={placementActif} onMapClick={handleMapClick} />

          {selectedRoute && routeCoords.length > 0 && (
            <>
              <Polyline positions={routeCoords} color="#0067c5" weight={6} opacity={0.95} />
              <Marker position={routeCoords[0]} icon={blueIcon} />
              <Marker position={routeCoords[routeCoords.length - 1]} icon={redIcon} />
            </>
          )}

          {alertes.map(alerte => (
            <Marker
              key={`alerte-${alerte.id}`}
              position={[alerte.lat, alerte.lng]}
              icon={getAlerteIcon(alerte.type, formData.id === alerte.id && formOpen)}
              eventHandlers={{ click: () => handleEditAlerte(alerte) }}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={1}>
                <strong>{alerte.titre || 'Alerte'}</strong>
              </Tooltip>
            </Marker>
          ))}

          {pendingPoint && (
            <Marker position={[pendingPoint.lat, pendingPoint.lng]} icon={ghostIcon} />
          )}
        </MapContainer>

        {/* Zoom controls */}
        <div className="absolute bottom-6 right-4 z-[1000] bg-white rounded-md shadow-[0_1px_4px_rgba(0,0,0,0.3)] overflow-hidden">
          <button className="w-[34px] h-[34px] border-none bg-white text-lg font-semibold text-gray-900 cursor-pointer block">+</button>
          <button className="w-[34px] h-[34px] border-none border-t border-gray-200 bg-white text-lg font-semibold text-gray-900 cursor-pointer block">−</button>
        </div>

        {/* Bandeau placement */}
        {placementActif && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white border border-[#0067c5] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] px-4 py-2 flex items-center gap-2 max-w-[90vw]">
            <IconBus color="#0067c5" size={15} />
            <span className="text-[0.82rem] text-gray-900 font-medium whitespace-nowrap">
              Cliquez sur la carte à l'endroit de l'incident
            </span>
          </div>
        )}

        {/* Voile formulaire */}
        {formOpen && (
          <div className="fixed inset-0 bg-black/35 z-[1150] animate-backdropFadeIn" onClick={closeForm} />
        )}

        {/* Formulaire — identique à l'original */}
        {formOpen && (
          <div
            className="fixed md:absolute inset-x-0 bottom-0 md:inset-x-auto md:bottom-auto top-auto md:top-4 md:right-4
              z-[1200] bg-white rounded-t-2xl md:rounded-2xl border border-gray-100
              w-full md:w-[310px] max-h-[90vh] md:max-h-[calc(100vh-2rem)]
              flex flex-col overflow-hidden animate-alertPanelIn"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <div className="md:hidden flex items-center justify-center pt-2 pb-0.5 flex-shrink-0">
              <span className="w-10 h-1.5 rounded-full bg-gray-300" />
            </div>

            <div
              className="px-4 pt-4 pb-3 flex items-center justify-between flex-shrink-0"
              style={{
                borderBottom: '1px solid #f0f0f0',
                background: formData.type === 'accident'
                  ? 'linear-gradient(135deg, #fffbe6 0%, #fff 60%)'
                  : formData.type === 'travaux'
                  ? 'linear-gradient(135deg, #fff3e0 0%, #fff 60%)'
                  : 'linear-gradient(135deg, #ffebee 0%, #fff 60%)',
              }}
            >
              <div className="flex items-center gap-2.5">
                {(() => {
                  const conf = TYPE_OPTIONS.find(t => t.value === formData.type) || TYPE_OPTIONS[0];
                  return (
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: conf.bg }}>
                      <conf.Icon color="#fff" size={15} />
                    </div>
                  );
                })()}
                <h3 className="text-[0.92rem] font-semibold text-gray-900 m-0 leading-tight">
                  {formMode === 'edit' ? 'Modifier l\'alerte' : 'Nouvelle alerte'}
                </h3>
              </div>
              <button onClick={closeForm}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 border-none cursor-pointer transition-colors duration-150">
                <IconClose color="#6b7280" size={14} />
              </button>
            </div>

            <div className="px-4 py-3 overflow-y-auto flex-1">
              <label className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
                Type d'alerte
              </label>
              <div className="flex gap-2 mb-4">
                {TYPE_OPTIONS.map(opt => {
                  const isSelected = formData.type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setFormData(prev => ({ ...prev, type: opt.value }))}
                      title={opt.label}
                      className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 cursor-pointer transition-all duration-150"
                      style={{
                        borderColor: isSelected ? opt.bg : '#e5e7eb',
                        background: isSelected ? `${opt.bg}12` : '#fafafa',
                        boxShadow: isSelected ? `0 0 0 3px ${opt.bg}22` : 'none',
                      }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: opt.bg }}>
                        <opt.Icon color="#fff" size={13} />
                      </div>
                      <span className="text-[0.65rem] font-semibold leading-none" style={{ color: isSelected ? opt.bg : '#9ca3af' }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Titre</label>
              <input
                value={formData.titre}
                onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                placeholder="Ex : Route bloquée Ankorondrano"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[0.85rem] text-gray-900 outline-none mb-3 bg-gray-50 focus:bg-white focus:border-blue-400 transition-colors duration-150"
                style={{ boxSizing: 'border-box' }}
              />

              <label className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Détails pour les usagers (durée estimée, déviation...)"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[0.85rem] text-gray-900 outline-none mb-3 resize-none bg-gray-50 focus:bg-white focus:border-blue-400 transition-colors duration-150"
                style={{ boxSizing: 'border-box' }}
              />

              <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
                <div
                  onClick={() => setRattacherLigne(v => !v)}
                  className="w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200 flex-shrink-0"
                  style={{ background: rattacherLigne ? '#0067c5' : '#d1d5db' }}
                >
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                    style={{ transform: rattacherLigne ? 'translateX(17px)' : 'translateX(2px)' }} />
                </div>
                <span className="text-[0.82rem] text-gray-700 font-medium">Rattacher à une ligne</span>
              </label>

              {rattacherLigne && (
                <select
                  value={formData.ligne_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, ligne_id: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[0.85rem] text-gray-900 bg-gray-50 outline-none mb-3"
                  style={{ boxSizing: 'border-box' }}
                >
                  <option value="">Sélectionner une ligne...</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>Ligne {r.ref} — {r.name}</option>
                  ))}
                </select>
              )}

              {formData.lat && (
                <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 bg-gray-50 rounded-lg">
                  <IconPin color="#9ca3af" size={11} />
                  <span className="text-[0.7rem] text-gray-400 font-mono">
                    {formData.lat?.toFixed(5)}, {formData.lng?.toFixed(5)}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-1 pb-1 md:pb-0">
                <button
                  onClick={handleSaveAlerte}
                  disabled={saving || !formData.titre.trim()}
                  className="flex-1 rounded-xl py-2.5 text-[0.85rem] font-semibold border-none cursor-pointer transition-all duration-150"
                  style={{
                    background: saving || !formData.titre.trim() ? '#e5e7eb' : '#0067c5',
                    color: saving || !formData.titre.trim() ? '#9ca3af' : '#fff',
                    cursor: saving || !formData.titre.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Enregistrement...' : formMode === 'edit' ? 'Enregistrer' : 'Créer l\'alerte'}
                </button>
                {formMode === 'edit' && (
                  <button
                    onClick={() => handleDeleteAlerte(formData.id)}
                    className="rounded-xl py-2.5 px-3 text-[0.85rem] font-semibold border-2 border-[#fee2e2] text-[#e81123] bg-[#fff5f5] hover:bg-[#fee2e2] cursor-pointer transition-colors duration-150"
                  >
                    <IconTrash color="#e81123" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DonnerGPS;