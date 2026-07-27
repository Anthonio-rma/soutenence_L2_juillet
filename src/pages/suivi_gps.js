import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';

// ═════════════════════════════════════════════════════════════════════════════
// CONFIGURATION BACKEND
// ═════════════════════════════════════════════════════════════════════════════
// Une seule source de vérité pour l'URL du backend. Utilise une variable
// d'environnement si elle existe (utile pour re-basculer en local plus tard
// sans toucher au code), sinon retombe sur l'URL Render de production.
//
// ⚠️ Render (plan gratuit) met le service en veille après inactivité.
// La première requête après une pause peut prendre 30-60s (cold start).
const API_BASE_URL =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  'https://soutenence-l2-juillet.onrender.com';

// ===================== ICONES BADGES RONDS A / B =====================
const blueIcon = new L.DivIcon({
  className: 'custom-pin-icon',
  html: `<div style="width:30px;height:30px;background:#0067c5;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);color:#fff;font-weight:700;font-size:14px;font-family:'Segoe UI',Arial,sans-serif;">A</div>`,
  iconSize: [30, 30], iconAnchor: [15, 15],
});

const redIcon = new L.DivIcon({
  className: 'custom-pin-icon',
  html: `<div style="width:30px;height:30px;background:#e81123;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);color:#fff;font-weight:700;font-size:14px;font-family:'Segoe UI',Arial,sans-serif;">B</div>`,
  iconSize: [30, 30], iconAnchor: [15, 15],
});

const stopIcon = new L.DivIcon({
  className: 'custom-pin-icon',
  html: `<div style="width:18px;height:18px;background:#fff;border:3px solid #0067c5;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;"><div style="width:6px;height:6px;background:#0067c5;border-radius:50%;"></div></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

const AccidentSVG    = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`;
const TravauxSVG     = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><path d="M14 6a6 6 0 0 1 6 6v3"/></svg>`;
const RouteCoupeeSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>`;

const ICONES_ALERTE = {
  accident:     { bg: '#e6a817', svg: AccidentSVG,    label: 'Accident' },
  travaux:      { bg: '#e07020', svg: TravauxSVG,     label: 'Travaux' },
  route_coupee: { bg: '#c62828', svg: RouteCoupeeSVG, label: 'Route coupée' },
};

const buildAlerteIcon = (bg, svgContent) => new L.DivIcon({
  className: 'custom-pin-icon',
  html: `<div style="width:30px;height:30px;background:${bg};border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.45);">${svgContent}</div>`,
  iconSize: [30, 30], iconAnchor: [15, 15],
});

const getAlerteIcon = (type) => {
  const conf = ICONES_ALERTE[type] || { bg: '#5e6266', svg: AccidentSVG };
  return buildAlerteIcon(conf.bg, conf.svg);
};

const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

const createBusIcon = (cap, numeroBus, nomComplet) => {
  const hasCap   = Number.isFinite(cap);
  const rotation = hasCap ? cap : 0;
  const prenom   = nomComplet ? String(nomComplet).trim().split(' ')[0] : '';
  const numeroLabel = (numeroBus !== undefined && numeroBus !== null && numeroBus !== '') ? `Bus ${numeroBus}` : 'Bus';
  const safeLabel   = escapeHtml(prenom ? `${numeroLabel} · ${prenom}` : numeroLabel);

  return new L.DivIcon({
    className: 'custom-pin-icon',
    html: `
      <div style="position:relative;width:120px;height:70px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;overflow:visible;">
        <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);background:#0067c5;color:#fff;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:700;line-height:1;white-space:nowrap;padding:4px 9px;border-radius:12px;box-shadow:0 2px 5px rgba(0,0,0,0.35);border:1.5px solid #fff;">
          ${safeLabel}
          <div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid #0067c5;"></div>
        </div>
        <div style="position:relative;width:46px;height:46px;display:flex;align-items:center;justify-content:center;margin-top:24px;">
          <div style="position:absolute;width:46px;height:46px;border-radius:50%;background:rgba(26,115,232,0.18);animation:liveBusPulse 1.8s ease-in-out infinite;"></div>
          ${hasCap ? `<div style="position:absolute;width:0;height:0;left:50%;top:50%;transform:translate(-50%,-50%) rotate(${rotation}deg) translateY(-22px);border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:9px solid #1a73e8;"></div>` : ''}
          <div style="position:relative;width:30px;height:30px;background:#1a73e8;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.35);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M4 16c0 .88.39 1.67 1 2.22V19a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 12H6V7h12v5z"/></svg>
          </div>
        </div>
      </div>
      <style>@keyframes liveBusPulse{0%{transform:scale(0.85);opacity:0.9}70%{transform:scale(1.35);opacity:0}100%{transform:scale(0.85);opacity:0}}</style>
    `,
    iconSize: [120, 70], iconAnchor: [60, 47],
  });
};

// ── ChangeView : ne recentre que quand le centre change vraiment ──────────────
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  const lastCenterRef = useRef(null);
  useEffect(() => {
    if (!center) return;
    const [lat, lng] = center;
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (lastCenterRef.current === key) return;
    lastCenterRef.current = key;
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// ── Icônes SVG inline ─────────────────────────────────────────────────────────
const IconBus = ({ color = '#5e6266', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="13" rx="2" /><path d="M4 11h16" /><path d="M8 17v2M16 17v2" />
    <circle cx="7.5" cy="14" r="0.5" fill={color} /><circle cx="16.5" cy="14" r="0.5" fill={color} />
  </svg>
);
const IconSwap = ({ color = '#5e6266', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4v16M7 20l-3-3M7 20l3-3" /><path d="M17 20V4M17 4l3 3M17 4l-3 3" />
  </svg>
);
const IconPlus = ({ color = '#0067c5', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconLiveBus = ({ color = '#fff', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="13" rx="2" /><path d="M4 11h16" /><path d="M8 17v2M16 17v2" />
    <circle cx="7.5" cy="14" r="0.5" fill={color} /><circle cx="16.5" cy="14" r="0.5" fill={color} />
  </svg>
);
const IconAlertTriangle = ({ color = '#fff', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

// ═════════════════════════════════════════════════════════════════════════════
const SuiviGPS = () => {
  const [routes,          setRoutes]          = useState([]);
  const [depart,          setDepart]          = useState('');
  const [destination,     setDestination]     = useState('');
  const [selectedRoute,   setSelectedRoute]   = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [arrets,          setArrets]          = useState([]);
  const [alertes,         setAlertes]         = useState([]);
  const [showAlertes,     setShowAlertes]     = useState(true);
  const [chauffeursLive,  setChauffeursLive]  = useState({});
  const [showBusLive,     setShowBusLive]     = useState(true);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  // ── État de connexion backend : utile pour informer l'utilisateur pendant
  //    le cold start de Render (plan gratuit → jusqu'à 30-60s au réveil). ──
  const [isBackendWaking, setIsBackendWaking] = useState(false);
  const [backendError,    setBackendError]    = useState(null);

  const socketRef   = useRef(null);
  const TANA_COORDS = [-18.8792, 47.5079];

  // ── API routes ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setIsBackendWaking(true);
    fetch(`${API_BASE_URL}/api/bus/routes`)
      .then(r => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`);
        return r.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setRoutes(list);
        setFilteredResults(list);
        setBackendError(null);
      })
      .catch(err => {
        console.error('Erreur API routes:', err);
        setBackendError('Impossible de charger les lignes de bus. Le serveur se réveille peut-être — réessayez dans quelques secondes.');
      })
      .finally(() => setIsBackendWaking(false));
  }, []);

  // ── Arrêts de la ligne sélectionnée ────────────────────────────────────────
  useEffect(() => {
    if (!selectedRoute) { setArrets([]); return; }
    fetch(`${API_BASE_URL}/api/lignes/${selectedRoute.id}/arrets`)
      .then(r => r.json())
      .then(data => setArrets(Array.isArray(data) ? data.filter(a => typeof a.lat === 'number' && typeof a.lng === 'number') : []))
      .catch(err => {
        console.error('Erreur API arrêts:', err);
        setArrets([]);
      });
  }, [selectedRoute]);

  // ── Alertes trafic ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/alertes`)
      .then(r => r.json())
      .then(data => setAlertes(Array.isArray(data) ? data.filter(a => typeof a.lat === 'number' && typeof a.lng === 'number') : []))
      .catch(err => console.error('Erreur API alertes:', err));
  }, []);

  // ── Positions live + Socket.io ──────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/positions/live`)
      .then(r => r.json())
      .then(json => {
        const list = Array.isArray(json) ? json : (json.data || []);
        const initial = {};
        list.forEach(p => {
          initial[p.chauffeur_id] = { chauffeur_id: p.chauffeur_id, ligne_id: p.ligne_id, latitude: Number(p.latitude), longitude: Number(p.longitude), vitesse: p.vitesse, cap: p.cap, nom_complet: p.nom_complet, numero_bus: p.numero_bus };
        });
        setChauffeursLive(initial);
      })
      .catch(err => console.error('Erreur API positions/live:', err));

    // Connexion Socket.io vers le backend Render (même URL, en websocket).
    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      console.warn('Socket.io connexion échouée (le backend se réveille peut-être) :', err.message);
    });

    socket.on('position_update', (payload) => {
      setChauffeursLive(prev => ({
        ...prev,
        [payload.chauffeur_id]: { ...(prev[payload.chauffeur_id] || {}), chauffeur_id: payload.chauffeur_id, ligne_id: payload.ligne_id, latitude: Number(payload.latitude), longitude: Number(payload.longitude), vitesse: payload.vitesse, cap: payload.cap, nom_complet: payload.nom_complet ?? prev[payload.chauffeur_id]?.nom_complet, numero_bus: payload.numero_bus ?? prev[payload.chauffeur_id]?.numero_bus },
      }));
    });

    socket.on('chauffeur_statut', (payload) => {
      if (!payload.en_service) {
        setChauffeursLive(prev => { const next = { ...prev }; delete next[payload.chauffeur_id]; return next; });
      }
    });

    return () => socket.disconnect();
  }, []);

  const parseWKT = (wkt) => {
    if (!wkt) return [];
    const match = wkt.match(/\(([^()]+)\)/);
    if (!match) return [];
    return match[1].split(',').map(pair => { const [x, y] = pair.trim().split(/\s+/).map(Number); return [y, x]; });
  };

  const filterRoutes = (dep, dest) => {
    const dl = dep.toLowerCase();
    const dl2 = dest.toLowerCase();
    setFilteredResults(routes.filter(r => `${r.name} ${r.description || ''}`.toLowerCase().includes(dl) && `${r.name} ${r.description || ''}`.toLowerCase().includes(dl2)));
    setSelectedRoute(null);
  };

  const handleSearch          = () => filterRoutes(depart, destination);
  const handleDepartChange    = (e) => { setDepart(e.target.value); filterRoutes(e.target.value, destination); };
  const handleDestinationChange = (e) => { setDestination(e.target.value); filterRoutes(depart, e.target.value); };
  const handleSwap            = () => { setDepart(destination); setDestination(depart); filterRoutes(destination, depart); };
  const handleSelectRoute     = (route) => { setSelectedRoute(route); setIsPanelExpanded(false); };

  const routeCoords    = selectedRoute ? parseWKT(selectedRoute.geom) : [];
  const chauffeursListe = Object.values(chauffeursLive);

  return (
    /*
     * ── FIX PRINCIPAL ────────────────────────────────────────────────────────
     * On utilise h-full au lieu de height: calc(100vh - 4rem).
     * Le parent MainLayout doit donner h-full au <main> pour que ce composant
     * occupe exactement tout l'espace disponible sans débordement ni rectangle gris.
     * Sur mobile, le padding-bottom du MainLayout gère la barre de navigation.
     * ─────────────────────────────────────────────────────────────────────────
     */
    <div className="relative flex flex-col md:flex-row w-full h-full overflow-hidden font-sans">

      {/* Bannière de statut backend (cold start / erreur) */}
      {(isBackendWaking || backendError) && (
        <div className="absolute top-0 left-0 right-0 z-[2000] flex justify-center pointer-events-none">
          <div className={`mt-3 px-4 py-2 rounded-full text-[0.8rem] font-medium shadow-md pointer-events-auto ${backendError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {backendError ? backendError : 'Connexion au serveur en cours (réveil possible, jusqu\'à 30-60s)…'}
          </div>
        </div>
      )}

      {/* ══════════════════════ CARTE (occupe tout l'espace restant) ══════════════════════ */}
      <main className="relative flex-1 order-1 md:order-2 h-full min-h-0">
        <MapContainer
          center={TANA_COORDS}
          zoom={13}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={selectedRoute ? routeCoords[0] : TANA_COORDS} zoom={14} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {selectedRoute && routeCoords.length > 0 && (
            <>
              <Polyline positions={routeCoords} color="#0067c5" weight={6} opacity={0.95} />
              <Marker position={routeCoords[0]} icon={blueIcon} />
              <Marker position={routeCoords[routeCoords.length - 1]} icon={redIcon} />
              {arrets.map(arret => (
                <Marker key={arret.id} position={[arret.lat, arret.lng]} icon={stopIcon}>
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>{arret.name}</Tooltip>
                </Marker>
              ))}
            </>
          )}

          {showAlertes && alertes.map(alerte => (
            <Marker key={`alerte-${alerte.id}`} position={[alerte.lat, alerte.lng]} icon={getAlerteIcon(alerte.type)}>
              <Tooltip direction="top" offset={[0, -12]} opacity={1}>
                <strong>{alerte.titre || (ICONES_ALERTE[alerte.type] || {}).label || 'Alerte'}</strong>
                {alerte.description && <div style={{ marginTop: 2 }}>{alerte.description}</div>}
              </Tooltip>
            </Marker>
          ))}

          {showBusLive && chauffeursListe.map(c => (
            <Marker
              key={c.chauffeur_id}
              position={[c.latitude, c.longitude]}
              icon={createBusIcon(c.cap, c.numero_bus, c.nom_complet)}
            />
          ))}
        </MapContainer>

        {/* Zoom controls — remontés sur mobile pour ne pas chevaucher le tiroir */}
        <div className="absolute bottom-40 md:bottom-6 right-4 z-[1000] bg-white rounded-md shadow-[0_1px_4px_rgba(0,0,0,0.3)] overflow-hidden">
          <button className="w-[34px] h-[34px] border-none bg-white text-lg font-semibold text-gray-900 cursor-pointer block">+</button>
          <button className="w-[34px] h-[34px] border-none border-t border-gray-200 bg-white text-lg font-semibold text-gray-900 cursor-pointer block">−</button>
        </div>

        {/* Boutons flottants mobile */}
        <button
          onClick={() => setShowBusLive(prev => !prev)}
          className={`md:hidden absolute top-4 left-4 z-[1000] flex items-center gap-2 rounded-full px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.25)] border transition-colors duration-150 ${showBusLive ? 'bg-[#1bb55c] border-[#1bb55c] text-white' : 'bg-white border-gray-200 text-gray-700'}`}
        >
          <IconLiveBus color={showBusLive ? '#fff' : '#1bb55c'} size={14} />
          <span className="text-[0.78rem] font-semibold">Bus en direct</span>
          <span className={`text-[0.72rem] font-bold rounded-full px-1.5 ${showBusLive ? 'bg-white text-[#1bb55c]' : 'bg-gray-100 text-gray-500'}`}>
            {chauffeursListe.length}
          </span>
        </button>

        <button
          onClick={() => setShowAlertes(prev => !prev)}
          className={`md:hidden absolute top-4 right-4 z-[1000] flex items-center gap-2 rounded-full px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.25)] border transition-colors duration-150 ${showAlertes ? 'bg-[#e6a817] border-[#e6a817] text-white' : 'bg-white border-gray-200 text-gray-700'}`}
        >
          <IconAlertTriangle color={showAlertes ? '#fff' : '#e6a817'} size={14} />
          <span className="text-[0.78rem] font-semibold">Alertes</span>
          <span className={`text-[0.72rem] font-bold rounded-full px-1.5 ${showAlertes ? 'bg-white text-[#e6a817]' : 'bg-gray-100 text-gray-500'}`}>
            {alertes.length}
          </span>
        </button>
      </main>

      {/* Overlay sombre quand le tiroir est ouvert sur mobile */}
      {isPanelExpanded && (
        <div
          onClick={() => setIsPanelExpanded(false)}
          className="md:hidden fixed inset-0 bg-black/20 z-[1400]"
        />
      )}

      {/* ══════════════════════ SIDEBAR / TIROIR ══════════════════════
          Desktop (md+) : colonne gauche fixe, hauteur 100%
          Mobile        : tiroir glissant depuis le bas
          ─────────────────────────────────────────────────────────── */}
      <aside
        className={`
          order-2 md:order-1
          /* ── Mobile : positionnement absolu en bas ── */
          absolute bottom-0 left-0 right-0
          /* ── Desktop : position normale dans le flux ── */
          md:relative md:bottom-auto md:left-auto md:right-auto
          w-full md:w-[350px] md:min-w-[350px]
          bg-white z-[1500] md:z-[1000]
          flex flex-col
          rounded-t-2xl md:rounded-none
          border-t md:border-t-0 md:border-r border-gray-200
          shadow-[0_-4px_16px_rgba(0,0,0,0.12)] md:shadow-[2px_0_8px_rgba(0,0,0,0.04)]
          /* ── Hauteur : 100% sur desktop, tiroir sur mobile ── */
          md:h-full
          transition-[height] duration-300 ease-in-out
          ${isPanelExpanded ? 'h-[70%]' : 'h-[148px]'}
        `}
      >
        {/* Poignée tiroir — mobile uniquement */}
        <button
          onClick={() => setIsPanelExpanded(prev => !prev)}
          className="md:hidden flex flex-col items-center justify-center pt-2 pb-1 shrink-0"
        >
          <span className="w-10 h-1.5 rounded-full bg-gray-300" />
        </button>

        <div className="flex flex-col flex-1 min-h-0 px-4 pt-1 md:pt-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-3.5 shrink-0">
            <h2 className="text-[1.15rem] font-semibold text-gray-900 m-0">Directions</h2>
            {!isPanelExpanded && selectedRoute && (
              <span className="md:hidden text-[0.78rem] text-[#0067c5] font-semibold truncate ml-2">
                Ligne {selectedRoute.ref}
              </span>
            )}
          </div>

          {/* Champs A / B */}
          <div className="border border-gray-200 rounded-lg px-2.5 py-1.5 mb-2.5 shrink-0">
            <div className="flex items-center gap-2.5 py-2">
              <span className="w-5 h-5 min-w-[20px] rounded-full text-white text-[11px] font-bold flex items-center justify-center bg-[#0067c5]">A</span>
              <input
                placeholder="Point de départ..."
                value={depart}
                onChange={handleDepartChange}
                onFocus={() => setIsPanelExpanded(true)}
                className="flex-1 border-none outline-none text-[0.9rem] text-gray-900 bg-transparent"
              />
            </div>
            <div className="flex items-center relative">
              <div className="flex-1 h-px bg-gray-200" />
              <button onClick={handleSwap} className="bg-white border border-gray-200 rounded-full w-[26px] h-[26px] min-w-[26px] flex items-center justify-center cursor-pointer ml-2">
                <IconSwap />
              </button>
            </div>
            <div className="flex items-center gap-2.5 py-2">
              <span className="w-5 h-5 min-w-[20px] rounded-full text-white text-[11px] font-bold flex items-center justify-center bg-[#e81123]">B</span>
              <input
                placeholder="Destination..."
                value={destination}
                onChange={handleDestinationChange}
                onFocus={() => setIsPanelExpanded(true)}
                className="flex-1 border-none outline-none text-[0.9rem] text-gray-900 bg-transparent"
              />
            </div>
          </div>

          {/* Contenu du panel — masqué sur mobile quand le tiroir est replié */}
          <div className={`flex-col flex-1 min-h-0 ${isPanelExpanded ? 'flex' : 'hidden'} md:flex`}>

            <div className="flex items-center justify-between px-1 py-2.5 shrink-0">
              <button
                onClick={() => setShowAlertes(prev => !prev)}
                className="bg-transparent border-none text-gray-900 text-[0.85rem] cursor-pointer flex items-center gap-1.5 p-0"
              >
                <span>Voire les Alertes</span>
                {alertes.length > 0 && (
                  <span className={`text-[0.7rem] font-bold rounded-full px-1.5 ${showAlertes ? 'bg-[#e6a817] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {alertes.length}
                  </span>
                )}
                <span className="text-[10px] ml-0.5 inline-block transition-transform duration-200" style={{ transform: showAlertes ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </button>
              <button onClick={handleSearch} className="bg-transparent border-none text-[#0067c5] text-[0.85rem] font-semibold cursor-pointer flex items-center gap-1 p-0">
                <IconPlus /> <span>Rechercher</span>
              </button>
            </div>

            <button
              onClick={() => setShowBusLive(prev => !prev)}
              className={`hidden md:flex items-center justify-between w-full rounded-lg px-3 py-2.5 mb-2.5 border transition-colors duration-150 shrink-0 ${showBusLive ? 'bg-[#1bb55c] border-[#1bb55c] text-white' : 'bg-white border-gray-200 text-gray-700'}`}
            >
              <span className="flex items-center gap-2 text-[0.85rem] font-semibold">
                <IconLiveBus color={showBusLive ? '#fff' : '#1bb55c'} />
                Bus en direct
              </span>
              <span className={`text-[0.75rem] font-bold rounded-full px-2 py-0.5 ${showBusLive ? 'bg-white text-[#1bb55c]' : 'bg-gray-100 text-gray-500'}`}>
                {chauffeursListe.length}
              </span>
            </button>

            <div className="h-2 bg-gray-100 -mx-4 mb-3 shrink-0" />

            {/* Liste des trajets — scrollable */}
            <div className="overflow-y-auto flex-1 pb-4 min-h-0">
              {filteredResults.map(route => (
                <div
                  key={route.id}
                  onClick={() => handleSelectRoute(route)}
                  className={`border rounded-lg p-3 mb-2.5 cursor-pointer transition-colors duration-150 ${
                    selectedRoute?.id === route.id ? 'bg-[#eaf3fc] border-[#0067c5]' : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconBus color={selectedRoute?.id === route.id ? '#0067c5' : '#5e6266'} />
                    <div className="text-[0.95rem] text-gray-900">
                      Ligne <span className="font-bold">{route.ref}</span>
                    </div>
                  </div>
                  <div className="text-[0.82rem] text-gray-500 mb-1.5 ml-6">{route.name}</div>
                  <div className="flex items-center justify-between ml-6">
                    <span className="text-[0.78rem] text-gray-500">{route.description || 'Trajet disponible'}</span>
                    <span className="text-[0.78rem] text-[#0067c5] font-semibold">Details</span>
                  </div>
                </div>
              ))}
              {filteredResults.length === 0 && (
                <div className="text-center text-gray-400 text-[0.85rem] py-6">Aucun trajet trouvé.</div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SuiviGPS;