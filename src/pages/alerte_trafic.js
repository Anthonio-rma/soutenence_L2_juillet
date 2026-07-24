import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import { AlertTriangle, Construction, Ban, Radio, RefreshCw, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const TANA_CENTER = [-18.9100, 47.5250];

// ===================== ICONES DES ALERTES TRAFIC =====================

const AccidentSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`;
const TravauxSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><path d="M14 6a6 6 0 0 1 6 6v3"/></svg>`;
const RouteCoupeeSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>`;

const ICONES_ALERTE = {
  accident:     { bg: '#e6a817', svg: AccidentSVG,    label: 'Accident',      Icon: AlertTriangle },
  travaux:      { bg: '#e07020', svg: TravauxSVG,     label: 'Travaux',       Icon: Construction },
  route_coupee: { bg: '#c62828', svg: RouteCoupeeSVG, label: 'Route coupée',  Icon: Ban },
};


const buildAlerteIcon = (bg, svgContent, selected = false) => new L.DivIcon({
  className: 'custom-pin-icon',
  html: `
    <div style="
      width: ${selected ? 36 : 30}px; height: ${selected ? 36 : 30}px;
      background: ${bg};
      border: 3px solid #fff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.45)${selected ? ', 0 0 0 4px rgba(91,81,239,0.25)' : ''};
      transition: all 0.15s ease;
    ">${svgContent}</div>
  `,
  iconSize: [selected ? 36 : 30, selected ? 36 : 30],
  iconAnchor: [selected ? 18 : 15, selected ? 18 : 15],
});

const getAlerteIcon = (type, selected = false) => {
  const conf = ICONES_ALERTE[type] || { bg: '#5e6266', svg: AccidentSVG };
  return buildAlerteIcon(conf.bg, conf.svg, selected);
};

const filterLabels = {
  all: 'TOUS',
  accident: 'ACCIDENT',
  travaux: 'TRAVAUX',
  route_coupee: 'ROUTE COUPÉE',
};

// ===================== RECENTRAGE DE LA CARTE SUR L'ALERTE SELECTIONNEE =====================

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, zoom); }, [center, map, zoom]);
  return null;
};

// ===================== CONTROLES DE ZOOM CUSTOM (style DonnerGPS.jsx) =====================

const ZoomButtons = () => {
  const map = useMap();
  return (
    <div className="absolute bottom-6 right-4 z-[1000] bg-white rounded-md shadow-[0_1px_4px_rgba(0,0,0,0.3)] overflow-hidden">
      <button
        onClick={() => map.zoomIn()}
        className="w-[34px] h-[34px] border-none bg-white text-lg font-semibold text-gray-900 cursor-pointer block"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-[34px] h-[34px] border-none border-t border-gray-200 bg-white text-lg font-semibold text-gray-900 cursor-pointer block"
      >
        −
      </button>
    </div>
  );
};

export default function AlertesTrafic() {
  // ===================== ALERTES REELLES (base de données) =====================
  const [alertesList, setAlertesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [selectedAlerte, setSelectedAlerte] = useState(null);
  const fetchAlertes = () => {
    setLoading(true);
    setErreur(null);
    fetch('http://localhost:5000/api/alertes')
      .then(res => res.json())
      .then(data => {
        const valides = Array.isArray(data)
          ? data.filter(a => typeof a.lat === 'number' && typeof a.lng === 'number')
          : [];
        setAlertesList(valides);
        window.dispatchEvent(new CustomEvent('alertes-updated', { detail: valides.length }));
      })
      .catch(err => {
        console.error("Erreur API alertes:", err);
        setErreur("Impossible de charger les alertes.");
        setAlertesList([]);
        window.dispatchEvent(new CustomEvent('alertes-updated', { detail: 0 }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlertes(); }, []);

  const filteredAlertes = alertesList.filter(alerte => {
    const matchesFilter = filter === 'all' || alerte.type === filter;
    const query = searchQuery.toLowerCase();
    const titre = (alerte.titre || '').toLowerCase();
    const description = (alerte.description || '').toLowerCase();
    return matchesFilter && (titre.includes(query) || description.includes(query));
  });

  const handleSelectAlerte = (alerte) => {
    setSelectedAlerte(alerte);
  };

  return (
    <div className="flex-1 h-screen relative flex flex-col font-sans select-none overflow-hidden bg-[#f3f4f6]">

      
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-[10] flex justify-between items-start pointer-events-none">
        
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.92 }}
          onClick={fetchAlertes}
          className="bg-white rounded-2xl p-3 shadow-xl border border-gray-100 flex items-center justify-center w-11 h-11 pointer-events-auto"
          aria-label="Actualiser les alertes"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* 2. CARTE */}
      <div className="w-full h-full z-0 absolute inset-0">
        <MapContainer center={TANA_CENTER} zoom={13} zoomControl={false} className="w-full h-full">
          <ChangeView center={selectedAlerte ? [selectedAlerte.lat, selectedAlerte.lng] : null} zoom={15} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredAlertes.map((a) => (
            <Marker
              key={a.id}
              position={[a.lat, a.lng]}
              icon={getAlerteIcon(a.type, selectedAlerte?.id === a.id)}
              eventHandlers={{ click: () => handleSelectAlerte(a) }}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={1}>
                <strong>{a.titre || (ICONES_ALERTE[a.type] || {}).label || 'Alerte'}</strong>
                {a.description && <div style={{ marginTop: 2 }}>{a.description}</div>}
              </Tooltip>
            </Marker>
          ))}
          <ZoomButtons />
        </MapContainer>
      </div>

      {/* 3. PANNEAU INFÉRIEUR */}
      <div className="absolute bottom-20 md:bottom-4 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-white rounded-3xl p-4 shadow-2xl z-[10] flex flex-col gap-3 h-auto max-h-[42vh]">

        <div className="flex items-center justify-between ml-1">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Informations du jour
          </h3>
          {!loading && !erreur && (
            <span className="text-[10px] font-semibold text-gray-400">
              {alertesList.length} alerte{alertesList.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {/* Champ de recherche avec icône, pour une hiérarchie visuelle plus claire */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une alerte..."
            className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:border-[#5b51ef] transition-colors duration-150"
          />
        </div>

        {/* Amélioration de l'emplacement : Utilisation d'une grille pour un alignement parfait */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
          {Object.keys(filterLabels).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-2 rounded-xl text-[9px] font-bold uppercase transition-all duration-200 border ${
                filter === f
                  ? 'bg-[#5b51ef] text-white border-[#5b51ef] shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-2">
          {loading && (
            <div className="flex gap-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="min-w-[240px] h-[64px] bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {!loading && erreur && (
            <div className="text-[11px] text-red-500 py-4 px-1">{erreur}</div>
          )}

          {!loading && !erreur && filteredAlertes.length === 0 && (
            <div className="text-[11px] text-gray-400 py-4 px-1">Aucune alerte pour le moment.</div>
          )}

          <AnimatePresence>
            {!loading && !erreur && filteredAlertes.map((a) => {
              const conf = ICONES_ALERTE[a.type] || { bg: '#5e6266', label: a.type, Icon: AlertTriangle };
              const AlerteIcon = conf.Icon;
              const isSelected = selectedAlerte?.id === a.id;
              return (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileTap={{ scale: 0.97 }}
                  key={a.id}
                  onClick={() => handleSelectAlerte(a)}
                  className={`min-w-[240px] text-left bg-white p-3 rounded-2xl shadow-sm flex items-center gap-3 cursor-pointer transition-shadow duration-150 border ${
                    isSelected ? 'border-[#5b51ef] shadow-md' : 'border-gray-100'
                  }`}
                  style={{ borderLeft: `4px solid ${conf.bg}` }}
                >
                  <div
                    className="w-8 h-8 min-w-[32px] rounded-full flex items-center justify-center"
                    style={{ background: `${conf.bg}18`, color: conf.bg }}
                  >
                    <AlerteIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-bold text-gray-800 truncate">
                      {a.titre || conf.label}
                    </h5>
                    <p className="text-[10px] text-gray-500 truncate">
                      {a.description || conf.label}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}