import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, X, Check, Trash2, Edit2,
  MapPin, Bus, Clock, ArrowRight,
  CheckCircle2, AlertCircle, PauseCircle, Route,
  RotateCcw, ChevronDown, Filter, TrendingUp,
} from "lucide-react";

// ── DONNÉES ──
const INITIAL_LIGNES = [
  { id:1,  code:"L-101", nom:"Ankatso – Analakely",         depart:"Ankatso",        arrivee:"Analakely",      coop:"Ankatso",         statut:"active",    tarif:400,  distance:8.2,  duree:"35 min", vehicules:12, date:"12 jan. 2024", activite:"Il y a 2h"    },
  { id:2,  code:"L-102", nom:"Analakely – Ambohidratrimo",  depart:"Analakely",      arrivee:"Ambohidratrimo", coop:"Analakely",       statut:"active",    tarif:600,  distance:14.5, duree:"55 min", vehicules:8,  date:"03 fév. 2024", activite:"Il y a 15min" },
  { id:3,  code:"L-103", nom:"Ambohidratrimo – Tana-Est",   depart:"Ambohidratrimo", arrivee:"Tana-Est",       coop:"Ambohidratrimo",  statut:"active",    tarif:500,  distance:11.0, duree:"45 min", vehicules:6,  date:"21 mar. 2024", activite:"Il y a 1j"    },
  { id:4,  code:"L-104", nom:"Tana-Est – Ankatso",          depart:"Tana-Est",       arrivee:"Ankatso",        coop:"Tana-Est",        statut:"active",    tarif:450,  distance:9.7,  duree:"40 min", vehicules:10, date:"08 jan. 2024", activite:"Il y a 30min" },
  { id:5,  code:"L-105", nom:"Analakely – Tana-Est",        depart:"Analakely",      arrivee:"Tana-Est",       coop:"Analakely",       statut:"suspendue", tarif:550,  distance:13.3, duree:"50 min", vehicules:4,  date:"15 avr. 2024", activite:"Il y a 6j"    },
  { id:6,  code:"L-106", nom:"Ankatso – Ambohidratrimo",    depart:"Ankatso",        arrivee:"Ambohidratrimo", coop:"Ankatso",         statut:"active",    tarif:650,  distance:16.1, duree:"60 min", vehicules:7,  date:"02 mai 2024",  activite:"Il y a 4h"    },
  { id:7,  code:"L-107", nom:"Ambohidratrimo – Analakely",  depart:"Ambohidratrimo", arrivee:"Analakely",      coop:"Ambohidratrimo",  statut:"active",    tarif:600,  distance:14.5, duree:"55 min", vehicules:9,  date:"19 fév. 2024", activite:"Il y a 20min" },
  { id:8,  code:"L-108", nom:"Tana-Est – Analakely",        depart:"Tana-Est",       arrivee:"Analakely",      coop:"Tana-Est",        statut:"inactive",  tarif:550,  distance:13.3, duree:"50 min", vehicules:0,  date:"30 mar. 2024", activite:"Il y a 12j"   },
  { id:9,  code:"L-109", nom:"Ankatso – Tana-Est",          depart:"Ankatso",        arrivee:"Tana-Est",       coop:"Ankatso",         statut:"active",    tarif:700,  distance:18.4, duree:"70 min", vehicules:11, date:"05 jan. 2024", activite:"Il y a 1h"    },
  { id:10, code:"L-110", nom:"Analakely – Ankatso",         depart:"Analakely",      arrivee:"Ankatso",        coop:"Analakely",       statut:"active",    tarif:400,  distance:8.2,  duree:"35 min", vehicules:13, date:"11 juin 2024", activite:"Il y a 3h"    },
  { id:11, code:"L-111", nom:"Ambohidratrimo – Tana-Ville", depart:"Ambohidratrimo", arrivee:"Tana-Ville",     coop:"Ambohidratrimo",  statut:"active",    tarif:500,  distance:10.8, duree:"42 min", vehicules:5,  date:"22 avr. 2024", activite:"Il y a 2j"    },
  { id:12, code:"L-112", nom:"Tana-Est – Tana-Ville",       depart:"Tana-Est",       arrivee:"Tana-Ville",     coop:"Tana-Est",        statut:"suspendue", tarif:300,  distance:6.5,  duree:"28 min", vehicules:2,  date:"17 mar. 2024", activite:"Il y a 20j"   },
  { id:13, code:"L-113", nom:"Tana-Ville – Ankatso",        depart:"Tana-Ville",     arrivee:"Ankatso",        coop:"Ankatso",         statut:"active",    tarif:350,  distance:7.0,  duree:"30 min", vehicules:8,  date:"09 mai 2024",  activite:"Il y a 5h"    },
  { id:14, code:"L-114", nom:"Tana-Ville – Analakely",      depart:"Tana-Ville",     arrivee:"Analakely",      coop:"Analakely",       statut:"active",    tarif:300,  distance:6.0,  duree:"25 min", vehicules:15, date:"01 jan. 2024", activite:"Il y a 10min" },
  { id:15, code:"L-115", nom:"Tana-Ville – Ambohidratrimo", depart:"Tana-Ville",     arrivee:"Ambohidratrimo", coop:"Ambohidratrimo",  statut:"active",    tarif:500,  distance:10.8, duree:"42 min", vehicules:6,  date:"14 fév. 2024", activite:"Il y a 45min" },
  { id:16, code:"L-116", nom:"Tana-Est – Ambohidratrimo",   depart:"Tana-Est",       arrivee:"Ambohidratrimo", coop:"Tana-Est",        statut:"inactive",  tarif:620,  distance:15.2, duree:"58 min", vehicules:0,  date:"28 avr. 2024", activite:"Il y a 8j"    },
];

const COOPS = ["Toutes", "Ankatso", "Analakely", "Ambohidratrimo", "Tana-Est"];

const COOP_THEME = {
  Ankatso:        { accent:"#6d28d9", light:"#f5f3ff", mid:"#ede9fe", dark:"#4c1d95", gradient:"135deg, #7c3aed, #6d28d9" },
  Analakely:      { accent:"#c2410c", light:"#fff7ed", mid:"#fed7aa", dark:"#9a3412", gradient:"135deg, #ea580c, #c2410c" },
  Ambohidratrimo: { accent:"#1d4ed8", light:"#eff6ff", mid:"#bfdbfe", dark:"#1e3a8a", gradient:"135deg, #2563eb, #1d4ed8" },
  "Tana-Est":     { accent:"#047857", light:"#ecfdf5", mid:"#a7f3d0", dark:"#065f46", gradient:"135deg, #059669, #047857" },
};

const STATUT_CONFIG = {
  active:    { label:"Active",    bg:"#f0fdf4", text:"#15803d", border:"#bbf7d0", dot:"#22c55e", icon:CheckCircle2 },
  inactive:  { label:"Inactive",  bg:"#f9fafb", text:"#4b5563", border:"#e5e7eb", dot:"#9ca3af", icon:PauseCircle  },
  suspendue: { label:"Suspendue", bg:"#fef2f2", text:"#b91c1c", border:"#fecaca", dot:"#ef4444", icon:AlertCircle  },
};

// ── STYLES GLOBAUX ──
const G = {
  font: "'Inter', 'DM Sans', 'Segoe UI', system-ui, sans-serif",
  radius: { sm:8, md:12, lg:16, xl:20, full:999 },
  shadow: {
    xs:  "0 1px 3px rgba(0,0,0,0.06)",
    sm:  "0 2px 8px rgba(0,0,0,0.07)",
    md:  "0 4px 16px rgba(0,0,0,0.09)",
    lg:  "0 8px 32px rgba(0,0,0,0.12)",
    xl:  "0 16px 48px rgba(0,0,0,0.15)",
  },
  color: {
    bg:      "#f7f8fc",
    surface: "#ffffff",
    border:  "#e8eaf0",
    borderHover: "#d1d5e0",
    text:    { primary:"#0f1117", secondary:"#4b5563", muted:"#9ca3af", faint:"#c4cdd6" },
  },
  transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
};

// ── MODAL SUPPRESSION ──
function ModalSupprimer({ ligne, onConfirm, onCancel, isSmallMobile }) {
  if (!ligne) return null;
  const th = COOP_THEME[ligne.coop] ?? COOP_THEME["Ankatso"];
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onCancel}
        style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(15,17,23,0.5)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
      >
        <motion.div
          initial={{ scale:0.92, opacity:0, y:24 }}
          animate={{ scale:1, opacity:1, y:0 }}
          exit={{ scale:0.92, opacity:0, y:24 }}
          transition={{ type:"spring", stiffness:380, damping:30 }}
          onClick={e => e.stopPropagation()}
          style={{
            background:"#fff", borderRadius:G.radius.xl, padding:"1.75rem",
            width:"min(92vw, 420px)", boxShadow:G.shadow.xl,
            fontFamily:G.font, display:"flex", flexDirection:"column", gap:20,
          }}
        >
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:G.radius.md, background:"#fef2f2", border:"1.5px solid #fecaca", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Trash2 size={18} color="#dc2626" />
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:G.color.text.primary, lineHeight:1.2 }}>Supprimer la ligne</div>
                <div style={{ fontSize:12, color:G.color.text.muted, marginTop:3 }}>Cette action est irréversible</div>
              </div>
            </div>
            <button onClick={onCancel} style={{ width:32, height:32, borderRadius:G.radius.sm, border:`1px solid ${G.color.border}`, background:"#f9fafb", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:G.color.text.muted, transition:G.transition }}>
              <X size={14} />
            </button>
          </div>

          {/* Ligne info */}
          <div style={{ background:th.light, border:`1.5px solid ${th.mid}`, borderRadius:G.radius.md, padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:G.radius.md, background:`linear-gradient(${th.gradient})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff", flexShrink:0, letterSpacing:"-0.5px" }}>
              {ligne.code.replace("L-","")}
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:G.color.text.primary }}>{ligne.code}</div>
              <div style={{ fontSize:12, color:G.color.text.secondary, marginTop:3, display:"flex", alignItems:"center", gap:6 }}>
                <span>{ligne.depart}</span>
                <ArrowRight size={10} style={{ color:G.color.text.faint }} />
                <span>{ligne.arrivee}</span>
              </div>
            </div>
          </div>

          <p style={{ fontSize:13, color:G.color.text.secondary, margin:0, lineHeight:1.7, background:"#fafafa", borderRadius:G.radius.sm, padding:"10px 12px", border:`1px solid ${G.color.border}` }}>
            La ligne <strong style={{ color:G.color.text.primary }}>{ligne.code}</strong> et toutes ses données associées seront définitivement supprimées de la plateforme TAXI-BE.
          </p>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onCancel} style={{ flex:1, padding:"11px", fontSize:13, fontWeight:600, borderRadius:G.radius.md, border:`1.5px solid ${G.color.border}`, background:"#fff", color:G.color.text.secondary, cursor:"pointer", fontFamily:"inherit", transition:G.transition }}>
              Annuler
            </button>
            <button onClick={onConfirm} style={{ flex:1, padding:"11px", fontSize:13, fontWeight:700, borderRadius:G.radius.md, border:"none", background:"linear-gradient(135deg, #ef4444, #dc2626)", color:"#fff", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(220,38,38,0.35)" }}>
              <Trash2 size={13} /> Supprimer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── MODAL MODIFIER ──
function ModalModifier({ ligne, onSave, onCancel, isMobile, isSmallMobile }) {
  const [form, setForm] = useState(ligne ? { ...ligne } : null);
  useEffect(() => { if (ligne) setForm({ ...ligne }); }, [ligne]);
  if (!ligne || !form) return null;
  const th = COOP_THEME[form.coop] ?? COOP_THEME["Ankatso"];

  const Field = ({ label, children, span }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:6, gridColumn: span ? `span ${span}` : undefined }}>
      <label style={{ fontSize:11, fontWeight:700, color:G.color.text.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</label>
      {children}
    </div>
  );

  const inputStyle = {
    padding:"9px 12px", fontSize:13, borderRadius:G.radius.sm,
    border:`1.5px solid ${G.color.border}`, background:"#fafafa",
    color:G.color.text.primary, outline:"none", fontFamily:"inherit",
    width:"100%", boxSizing:"border-box", transition:G.transition,
  };

  const handleFocus = e => { e.target.style.borderColor = th.accent; e.target.style.background = "#fff"; e.target.style.boxShadow = `0 0 0 3px ${th.light}`; };
  const handleBlur  = e => { e.target.style.borderColor = G.color.border; e.target.style.background = "#fafafa"; e.target.style.boxShadow = "none"; };

  const cols2 = isSmallMobile || isMobile ? "1fr" : "1fr 1fr";
  const cols3 = isSmallMobile || isMobile ? "1fr 1fr" : "1fr 1fr 1fr";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onCancel}
        style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(15,17,23,0.5)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
      >
        <motion.div
          initial={{ scale:0.92, opacity:0, y:24 }}
          animate={{ scale:1, opacity:1, y:0 }}
          exit={{ scale:0.92, opacity:0, y:24 }}
          transition={{ type:"spring", stiffness:380, damping:30 }}
          onClick={e => e.stopPropagation()}
          style={{
            background:"#fff", borderRadius:G.radius.xl, padding:"1.75rem",
            width:"min(94vw, 540px)", maxHeight:"92vh", overflowY:"auto",
            boxShadow:G.shadow.xl, fontFamily:G.font,
            display:"flex", flexDirection:"column", gap:18,
          }}
        >
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:G.radius.md, background:th.light, border:`1.5px solid ${th.mid}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Edit2 size={17} color={th.accent} />
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:G.color.text.primary, lineHeight:1.2 }}>Modifier la ligne</div>
                <div style={{ fontSize:12, color:th.accent, marginTop:3, fontWeight:600 }}>{form.code} · {form.coop}</div>
              </div>
            </div>
            <button onClick={onCancel} style={{ width:32, height:32, borderRadius:G.radius.sm, border:`1px solid ${G.color.border}`, background:"#f9fafb", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:G.color.text.muted }}>
              <X size={14} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ height:1, background:G.color.border, margin:"0 -0.25rem" }} />

          {/* Champs */}
          <div style={{ display:"grid", gridTemplateColumns:cols2, gap:12 }}>
            <Field label="Code">
              <input style={inputStyle} value={form.code} onFocus={handleFocus} onBlur={handleBlur} onChange={e=>setForm({...form,code:e.target.value})} />
            </Field>
            <Field label="Nom de la ligne">
              <input style={inputStyle} value={form.nom} onFocus={handleFocus} onBlur={handleBlur} onChange={e=>setForm({...form,nom:e.target.value})} />
            </Field>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:cols2, gap:12 }}>
            <Field label="Point de départ">
              <input style={inputStyle} value={form.depart} onFocus={handleFocus} onBlur={handleBlur} onChange={e=>setForm({...form,depart:e.target.value})} />
            </Field>
            <Field label="Point d'arrivée">
              <input style={inputStyle} value={form.arrivee} onFocus={handleFocus} onBlur={handleBlur} onChange={e=>setForm({...form,arrivee:e.target.value})} />
            </Field>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:cols3, gap:12 }}>
            <Field label="Tarif (Ar)">
              <input style={inputStyle} type="number" value={form.tarif} onFocus={handleFocus} onBlur={handleBlur} onChange={e=>setForm({...form,tarif:Number(e.target.value)})} />
            </Field>
            <Field label="Distance (km)">
              <input style={inputStyle} type="number" step="0.1" value={form.distance} onFocus={handleFocus} onBlur={handleBlur} onChange={e=>setForm({...form,distance:parseFloat(e.target.value)})} />
            </Field>
            <Field label="Durée">
              <input style={inputStyle} value={form.duree} onFocus={handleFocus} onBlur={handleBlur} onChange={e=>setForm({...form,duree:e.target.value})} />
            </Field>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:cols3, gap:12 }}>
            <Field label="Coopérative">
              <select style={{...inputStyle, cursor:"pointer"}} value={form.coop} onChange={e=>setForm({...form,coop:e.target.value})}>
                {["Ankatso","Analakely","Ambohidratrimo","Tana-Est"].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Statut">
              <select style={{...inputStyle, cursor:"pointer"}} value={form.statut} onChange={e=>setForm({...form,statut:e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspendue">Suspendue</option>
              </select>
            </Field>
            <Field label="Véhicules">
              <input style={inputStyle} type="number" value={form.vehicules} onFocus={handleFocus} onBlur={handleBlur} onChange={e=>setForm({...form,vehicules:Number(e.target.value)})} />
            </Field>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:10, paddingTop:4 }}>
            <button onClick={onCancel} style={{ flex:1, padding:"11px", fontSize:13, fontWeight:600, borderRadius:G.radius.md, border:`1.5px solid ${G.color.border}`, background:"#fff", color:G.color.text.secondary, cursor:"pointer", fontFamily:"inherit" }}>
              Annuler
            </button>
            <button onClick={()=>onSave(form)} style={{ flex:1, padding:"11px", fontSize:13, fontWeight:700, borderRadius:G.radius.md, border:"none", background:`linear-gradient(${th.gradient})`, color:"#fff", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:`0 4px 14px ${th.accent}40` }}>
              <Check size={13} /> Enregistrer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── CARTE LIGNE GRILLE (desktop/tablette) ──
function CarteLGrid({ ligne, onEdit, onDelete, onClick, isSelected, index }) {
  const th = COOP_THEME[ligne.coop] ?? COOP_THEME["Ankatso"];
  const sc = STATUT_CONFIG[ligne.statut] ?? STATUT_CONFIG["inactive"];
  const StatusIcon = sc.icon;
  const noVehicles = ligne.vehicules === 0;

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:20, scale:0.97 }}
      animate={{ opacity:1, y:0, scale:1 }}
      exit={{ opacity:0, scale:0.95 }}
      transition={{ type:"spring", stiffness:300, damping:28, delay:Math.min(index*0.04,0.28) }}
      whileHover={{ y:-3, boxShadow:G.shadow.md, transition:{ type:"spring", stiffness:400, damping:25 } }}
      onClick={onClick}
      style={{
        background:"#fff",
        border: isSelected ? `2px solid ${th.accent}` : `1.5px solid ${G.color.border}`,
        borderRadius:G.radius.lg,
        cursor:"pointer",
        position:"relative",
        overflow:"hidden",
        boxShadow: isSelected ? `0 0 0 4px ${th.light}, ${G.shadow.md}` : G.shadow.xs,
        transition:"border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Barre accent top */}
      <div style={{ height:3, background:`linear-gradient(90deg, ${th.accent}, ${th.dark})`, position:"absolute", top:0, left:0, right:0 }} />

      {/* Fond déco */}
      <div style={{ position:"absolute", top:-24, right:-24, width:80, height:80, borderRadius:"50%", background:th.light, opacity:0.6, pointerEvents:"none" }} />

      <div style={{ padding:"1rem 1rem 0.85rem", paddingTop:"1.1rem" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:G.radius.md, background:`linear-gradient(${th.gradient})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", letterSpacing:"-0.5px", flexShrink:0, boxShadow:`0 3px 10px ${th.accent}35` }}>
              {ligne.code.replace("L-","")}
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:G.color.text.primary, lineHeight:1.3 }}>{ligne.code}</div>
              <div style={{ fontSize:11, color:th.accent, marginTop:2, fontWeight:600, opacity:0.8 }}>{ligne.coop}</div>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
            <StatutBadge sc={sc} StatusIcon={StatusIcon} />
            <IconBtn icon={Edit2} hoverColor="#2563eb" hoverBg="#eff6ff" hoverBorder="#bfdbfe" onClick={e=>{ e.stopPropagation(); onEdit(ligne); }} title="Modifier" />
            <IconBtn icon={Trash2} hoverColor="#dc2626" hoverBg="#fef2f2" hoverBorder="#fecaca" onClick={e=>{ e.stopPropagation(); onDelete(ligne); }} title="Supprimer" />
          </div>
        </div>

        {/* Trajet */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10, padding:"8px 10px", background:G.color.bg, borderRadius:G.radius.sm, border:`1px solid ${G.color.border}` }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:th.accent, flexShrink:0 }} />
          <span style={{ fontSize:12, fontWeight:600, color:G.color.text.secondary, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ligne.depart}</span>
          <ArrowRight size={10} style={{ color:G.color.text.faint, flexShrink:0 }} />
          <span style={{ fontSize:12, fontWeight:600, color:G.color.text.secondary, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textAlign:"right" }}>{ligne.arrivee}</span>
          <div style={{ width:6, height:6, borderRadius:2, background:th.accent, opacity:0.35, flexShrink:0 }} />
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
          <MiniStatCard icon={Route} value={`${ligne.distance}`} unit="km" label="Distance" th={th} warn={false} />
          <MiniStatCard icon={Clock}  value={ligne.duree}         unit=""   label="Durée"    th={th} warn={false} />
          <MiniStatCard icon={Bus}    value={`${ligne.vehicules}`} unit=""  label="Véhicules" th={th} warn={noVehicles} />
        </div>

        {/* Footer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:9, borderTop:`1px solid ${G.color.border}` }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
            <span style={{ fontSize:16, fontWeight:800, color:th.accent, letterSpacing:"-0.5px" }}>{ligne.tarif.toLocaleString("fr-FR")}</span>
            <span style={{ fontSize:10, fontWeight:700, color:th.accent, opacity:0.6 }}>Ar</span>
          </div>
          <span style={{ fontSize:10, color:G.color.text.faint, fontWeight:500 }}>{ligne.activite}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── CARTE LIGNE MOBILE ──
function CarteLMobile({ ligne, onEdit, onDelete, onClick, isSelected, index }) {
  const th = COOP_THEME[ligne.coop] ?? COOP_THEME["Ankatso"];
  const sc = STATUT_CONFIG[ligne.statut] ?? STATUT_CONFIG["inactive"];
  const StatusIcon = sc.icon;
  const noVehicles = ligne.vehicules === 0;

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, x:-10, scale:0.97 }}
      transition={{ type:"spring", stiffness:340, damping:28, delay:Math.min(index*0.03,0.22) }}
      onClick={onClick}
      style={{
        background:"#fff",
        border: isSelected ? `2px solid ${th.accent}` : `1.5px solid ${G.color.border}`,
        borderRadius:G.radius.md,
        cursor:"pointer",
        position:"relative",
        overflow:"hidden",
        boxShadow: isSelected ? `0 0 0 3px ${th.light}, ${G.shadow.sm}` : G.shadow.xs,
        transition:"border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Barre accent gauche */}
      <div style={{ position:"absolute", top:0, left:0, width:3, bottom:0, background:`linear-gradient(180deg, ${th.accent}, ${th.dark})` }} />

      <div style={{ paddingLeft:14, paddingRight:12, paddingTop:11, paddingBottom:11 }}>
        {/* Ligne 1 */}
        <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:9 }}>
          <div style={{ width:38, height:38, borderRadius:G.radius.sm, flexShrink:0, background:`linear-gradient(${th.gradient})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#fff", letterSpacing:"-0.5px", boxShadow:`0 2px 8px ${th.accent}30` }}>
            {ligne.code.replace("L-","")}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:G.color.text.primary, display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"44%" }}>{ligne.depart}</span>
              <ArrowRight size={10} style={{ color:G.color.text.faint, flexShrink:0 }} />
              <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"44%" }}>{ligne.arrivee}</span>
            </div>
            <div style={{ fontSize:11, color:th.accent, marginTop:2, fontWeight:600, opacity:0.75 }}>{ligne.code} · {ligne.coop}</div>
          </div>
          <StatutBadge sc={sc} StatusIcon={StatusIcon} small />
        </div>

        {/* Ligne 2 */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, paddingTop:8, borderTop:`1px solid ${G.color.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
            <InlineStat icon={Route} value={`${ligne.distance}km`} warn={false} th={th} />
            <InlineStat icon={Clock}  value={ligne.duree}           warn={false} th={th} />
            <InlineStat icon={Bus}    value={`${ligne.vehicules}`}  warn={noVehicles} th={th} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:1 }}>
              <span style={{ fontSize:14, fontWeight:800, color:th.accent, letterSpacing:"-0.5px" }}>{ligne.tarif.toLocaleString("fr-FR")}</span>
              <span style={{ fontSize:9, fontWeight:700, color:th.accent, opacity:0.65 }}>Ar</span>
            </div>
            <TouchBtn icon={Edit2} color="#2563eb" bg="#eff6ff" border="#bfdbfe" onClick={e=>{ e.stopPropagation(); onEdit(ligne); }} title="Modifier" />
            <TouchBtn icon={Trash2} color="#dc2626" bg="#fef2f2" border="#fecaca" onClick={e=>{ e.stopPropagation(); onDelete(ligne); }} title="Supprimer" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── COMPOSANTS PARTAGÉS ──
function StatutBadge({ sc, StatusIcon, small }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap: small ? 3 : 4,
      fontSize: small ? 10 : 11, fontWeight:600,
      padding: small ? "3px 7px" : "3px 9px",
      borderRadius:G.radius.full, background:sc.bg, color:sc.text,
      border:`1px solid ${sc.border}`, flexShrink:0, whiteSpace:"nowrap",
    }}>
      <StatusIcon size={small ? 8 : 9} /> {sc.label}
    </span>
  );
}

function MiniStatCard({ icon:Icon, value, unit, label, th, warn }) {
  return (
    <div style={{
      textAlign:"center", padding:"8px 4px",
      background: warn ? "#fef2f2" : G.color.bg,
      borderRadius:G.radius.sm,
      border: warn ? "1px solid #fecaca" : `1px solid ${G.color.border}`,
    }}>
      <Icon size={12} style={{ color: warn ? "#dc2626" : G.color.text.faint, display:"block", margin:"0 auto 4px" }} />
      <div style={{ fontSize:12, fontWeight:700, color: warn ? "#dc2626" : G.color.text.primary, lineHeight:1 }}>
        {value}<span style={{ fontSize:9, fontWeight:600, marginLeft:1 }}>{unit}</span>
      </div>
      <div style={{ fontSize:10, color:G.color.text.muted, marginTop:2, fontWeight:500 }}>{label}</div>
    </div>
  );
}

function InlineStat({ icon:Icon, value, warn, th }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
      <div style={{ width:22, height:22, borderRadius:6, background: warn ? "#fef2f2" : "#f3f4f6", border: warn ? "1px solid #fecaca" : `1px solid ${G.color.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={11} style={{ color: warn ? "#dc2626" : G.color.text.muted }} />
      </div>
      <span style={{ fontSize:11, fontWeight:600, color: warn ? "#dc2626" : G.color.text.secondary, whiteSpace:"nowrap" }}>{value}</span>
    </div>
  );
}

function IconBtn({ icon:Icon, hoverColor, hoverBg, hoverBorder, onClick, title }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:28, height:28, borderRadius:G.radius.sm, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", border: hov ? `1px solid ${hoverBorder}` : `1px solid ${G.color.border}`, background: hov ? hoverBg : "#f8f9fc", color: hov ? hoverColor : G.color.text.faint, transition:G.transition, flexShrink:0 }}>
      <Icon size={11} />
    </button>
  );
}

function TouchBtn({ icon:Icon, color, bg, border, onClick, title }) {
  const [pressed, setPressed] = useState(false);
  return (
    <motion.button onClick={onClick} title={title} whileTap={{ scale:0.88 }}
      onMouseEnter={()=>setPressed(true)} onMouseLeave={()=>setPressed(false)}
      onTouchStart={()=>setPressed(true)} onTouchEnd={()=>setPressed(false)}
      style={{ width:32, height:32, borderRadius:G.radius.sm, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${pressed ? border : G.color.border}`, background: pressed ? bg : "#f8f9fc", color: pressed ? color : G.color.text.faint, transition:G.transition, flexShrink:0 }}>
      <Icon size={13} />
    </motion.button>
  );
}

// ── PAGE PRINCIPALE ──
export default function PageLignes() {
  const [lignes, setLignes]               = useState(INITIAL_LIGNES);
  const [loading, setLoading]             = useState(true);
  const [activeCoop, setActiveCoop]       = useState("Toutes");
  const [activeStatut, setActiveStatut]   = useState("tous");
  const [search, setSearch]               = useState("");
  const [selected, setSelected]           = useState(null);
  const [toDelete, setToDelete]           = useState(null);
  const [toEdit, setToEdit]               = useState(null);
  const [sortBy, setSortBy]               = useState("code");
  const [isMobile, setIsMobile]           = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  const API_URL = "http://localhost:5000/api/lignes";

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(API_URL, { signal:ctrl.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => {
        if (Array.isArray(d) && d.length) {
          const normalized = d.map(item => ({
            id:item.id,
            code:item.code||item.ref||"N/A",
            nom:item.nom||item.name||"Sans titre",
            ref:item.ref||item.code,
            name:item.name||item.nom,
            depart:item.depart||"Départ",
            arrivee:item.arrivee||"Arrivée",
            coop:item.coop||"Autre",
            statut:item.statut||"inactive",
            tarif:Number(item.tarif)||0,
            distance:Number(item.distance)||0,
            duree:item.duree||"N/A",
            vehicules:Number(item.vehicules)||0,
            date:item.date||new Date().toLocaleDateString('fr-FR'),
            activite:item.activite||"Jamais",
            ...item
          }));
          setLignes(normalized);
        } else {
          setLignes(INITIAL_LIGNES);
        }
        setLoading(false);
      })
      .catch(e => { if (e.name !== "AbortError") { setLignes(INITIAL_LIGNES); setLoading(false); } });
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 960);
      setIsSmallMobile(window.innerWidth <= 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDeleteConfirm = async () => {
    try { await fetch(`${API_URL}/${toDelete.id}`, { method:"DELETE" }); } catch {}
    setLignes(p => p.filter(l => l.id !== toDelete.id));
    if (selected?.id === toDelete.id) setSelected(null);
    setToDelete(null);
  };

  const handleEditSave = async (updated) => {
    try {
      await fetch(`${API_URL}/${updated.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(updated),
      });
    } catch {}
    setLignes(p => p.map(l => l.id === updated.id ? updated : l));
    if (selected?.id === updated.id) setSelected(updated);
    setToEdit(null);
  };

  const filtered = lignes.filter(l => {
    if (activeCoop !== "Toutes" && l.coop !== activeCoop) return false;
    if (activeStatut !== "tous" && l.statut !== activeStatut) return false;
    if (search) {
      const q = search.toLowerCase();
      return `${l.code} ${l.nom} ${l.depart} ${l.arrivee} ${l.coop}`.toLowerCase().includes(q);
    }
    return true;
  }).sort((a,b) => {
    if (sortBy === "tarif")     return (Number(b.tarif)||0) - (Number(a.tarif)||0);
    if (sortBy === "distance")  return (Number(b.distance)||0) - (Number(a.distance)||0);
    if (sortBy === "vehicules") return (Number(b.vehicules)||0) - (Number(a.vehicules)||0);
    return String(a.code||"").trim().localeCompare(String(b.code||"").trim(), 'fr');
  });

  const stats = {
    total:      lignes.length,
    actives:    lignes.filter(l => l.statut === "active").length,
    suspendues: lignes.filter(l => l.statut === "suspendue").length,
    vehicules:  lignes.reduce((s,l) => s + l.vehicules, 0),
    distMoy:    lignes.length ? (lignes.reduce((s,l) => s + l.distance, 0) / lignes.length).toFixed(1) : 0,
    tarifMoy:   lignes.length ? Math.round(lignes.reduce((s,l) => s + l.tarif, 0) / lignes.length) : 0,
  };

  const hasFilters = search || activeCoop !== "Toutes" || activeStatut !== "tous";
  const toggleSelected = useCallback((l) => { setSelected(prev => prev?.id === l.id ? null : l); }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:G.color.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:G.font }}>
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1.2, ease:"linear" }}
          style={{ width:48, height:48, borderRadius:G.radius.md, background:`linear-gradient(${COOP_THEME.Ankatso.gradient})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 8px 24px ${COOP_THEME.Ankatso.accent}40` }}>
          <Bus size={22} color="#fff" />
        </motion.div>
        <div style={{ fontSize:13, color:G.color.text.muted, fontWeight:500 }}>Chargement des lignes…</div>
      </motion.div>
    </div>
  );

  // ─ Stat cards config ─
  const statCards = [
    { label:"Total lignes",    value:stats.total,      sub:`toutes coopératives`,              icon:Route,        color:"#6d28d9", bg:"#f5f3ff", border:"#ddd6fe" },
    { label:"Lignes actives",  value:stats.actives,    sub:`sur ${stats.total} au total`,      icon:CheckCircle2, color:"#15803d", bg:"#f0fdf4", border:"#bbf7d0" },
    { label:"Suspendues",      value:stats.suspendues, sub:`nécessitent attention`,             icon:AlertCircle,  color:"#b91c1c", bg:"#fef2f2", border:"#fecaca" },
    { label:"Véhicules actifs",value:stats.vehicules,  sub:`moy. ${(stats.vehicules/(stats.total||1)).toFixed(1)}/ligne`, icon:Bus, color:"#1d4ed8", bg:"#eff6ff", border:"#bfdbfe" },
  ];

  return (
    <>
      {toDelete && <ModalSupprimer ligne={toDelete} onConfirm={handleDeleteConfirm} onCancel={()=>setToDelete(null)} isSmallMobile={isSmallMobile} />}
      {toEdit   && <ModalModifier  ligne={toEdit}   onSave={handleEditSave}         onCancel={()=>setToEdit(null)}   isMobile={isMobile} isSmallMobile={isSmallMobile} />}

      <div style={{ minHeight:"100vh", background:G.color.bg, fontFamily:G.font, display:"flex", flexDirection:"column" }}>

        {/* ══ BARRE DE CONTRÔLE ══ */}
        <div style={{ background:"#fff", borderBottom:`1px solid ${G.color.border}`, boxShadow:G.shadow.xs, flexShrink:0 }}>

          {/* Ligne 1 : Titre + Search + Sort */}
          <div style={{ padding: isSmallMobile ? "12px 14px 10px" : "0 20px", display:"flex", alignItems:"center", gap:12, flexWrap: isMobile ? "wrap" : "nowrap", minHeight: isMobile ? "auto" : 64, borderBottom:`1px solid ${G.color.border}` }}>

            {/* Titre */}
            <div style={{ flexShrink:0 }}>
              <div style={{ fontSize: isSmallMobile ? 15 : 17, fontWeight:800, color:G.color.text.primary, letterSpacing:"-0.4px", lineHeight:1.2 }}>Lignes de transport</div>
              <div style={{ fontSize:12, color:G.color.text.muted, marginTop:3, fontWeight:500 }}>
                {stats.total} lignes · {stats.actives} actives · {stats.vehicules} véhicules
              </div>
            </div>

            {/* Search */}
            <div style={{ flex:1, minWidth: isSmallMobile ? "100%" : 200, maxWidth:420, position:"relative", marginLeft: isSmallMobile ? 0 : 8, marginTop: isSmallMobile ? 6 : 0, order: isSmallMobile ? 3 : 0 }}>
              <Search size={14} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:G.color.text.faint }} />
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder={isSmallMobile ? "Chercher une ligne…" : "Rechercher une ligne, trajet, coopérative…"}
                style={{ width:"100%", paddingLeft:34, paddingRight:search?34:12, paddingTop:9, paddingBottom:9, fontSize:13, borderRadius:G.radius.sm, border:`1.5px solid ${G.color.border}`, background:G.color.bg, color:G.color.text.primary, outline:"none", fontFamily:"inherit", boxSizing:"border-box", transition:G.transition }}
                onFocus={e=>{ e.target.style.borderColor="#6d28d9"; e.target.style.background="#fff"; e.target.style.boxShadow="0 0 0 3px #f5f3ff"; }}
                onBlur={e=>{ e.target.style.borderColor=G.color.border; e.target.style.background=G.color.bg; e.target.style.boxShadow="none"; }}
              />
              {search && (
                <button onClick={()=>setSearch("")} style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:G.color.text.muted, display:"flex", padding:2 }}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort + Reset */}
            <div style={{ display:"flex", gap:8, alignItems:"center", marginLeft: isMobile ? 0 : "auto", flexShrink:0 }}>
              <div style={{ position:"relative" }}>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                  style={{ padding:"8px 28px 8px 10px", fontSize:12, fontWeight:600, borderRadius:G.radius.sm, border:`1.5px solid ${G.color.border}`, background:"#fff", color:G.color.text.secondary, cursor:"pointer", fontFamily:"inherit", outline:"none", appearance:"none" }}>
                  <option value="code">Code</option>
                  <option value="tarif">Tarif</option>
                  <option value="distance">Distance</option>
                  <option value="vehicules">Véhicules</option>
                </select>
                <ChevronDown size={12} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:G.color.text.faint, pointerEvents:"none" }} />
              </div>

              <AnimatePresence>
                {hasFilters && (
                  <motion.button initial={{ opacity:0, scale:0.88 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.88 }}
                    onClick={()=>{ setSearch(""); setActiveCoop("Toutes"); setActiveStatut("tous"); }}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 12px", fontSize:12, fontWeight:600, borderRadius:G.radius.sm, border:`1.5px solid ${G.color.border}`, background:"#fff", color:G.color.text.secondary, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                    <RotateCcw size={12} /> {!isSmallMobile && "Réinitialiser"}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Ligne 2 : Filtres */}
          <div style={{ padding: isSmallMobile ? "8px 14px" : "0 20px", display:"flex", alignItems:"center", gap: isSmallMobile ? 8 : 20, flexWrap: isSmallMobile ? "wrap" : "nowrap", minHeight: isSmallMobile ? "auto" : 48, overflowX: isSmallMobile ? "visible" : "auto" }}>

            {/* Coopératives */}
            <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0, flexWrap: isSmallMobile ? "wrap" : "nowrap" }}>
              <span style={{ fontSize:10, fontWeight:700, color:G.color.text.faint, textTransform:"uppercase", letterSpacing:"0.08em", marginRight:2, whiteSpace:"nowrap" }}>Coop.</span>
              {COOPS.map(coop => {
                const th = COOP_THEME[coop];
                const isActive = activeCoop === coop;
                const count = coop === "Toutes" ? lignes.length : lignes.filter(l=>l.coop===coop).length;
                return (
                  <button key={coop} onClick={()=>setActiveCoop(coop)}
                    style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:G.radius.full, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:600, whiteSpace:"nowrap", transition:G.transition,
                      border: isActive ? `1.5px solid ${th ? th.accent : "#6d28d9"}` : `1.5px solid ${G.color.border}`,
                      background: isActive ? (th ? th.light : "#f5f3ff") : "#fff",
                      color: isActive ? (th ? th.accent : "#6d28d9") : G.color.text.secondary,
                    }}>
                    {isActive && th && <div style={{ width:5, height:5, borderRadius:"50%", background:th.accent }} />}
                    {coop}
                    <span style={{ fontSize:10, fontWeight:700, background: isActive ? (th ? th.mid : "#ede9fe") : "#f3f4f6", color: isActive ? (th ? th.dark : "#5b21b6") : G.color.text.muted, borderRadius:G.radius.full, padding:"1px 6px" }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {!isSmallMobile && <div style={{ width:1, height:20, background:G.color.border, flexShrink:0 }} />}

            {/* Statuts */}
            <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0, flexWrap: isSmallMobile ? "wrap" : "nowrap" }}>
              <span style={{ fontSize:10, fontWeight:700, color:G.color.text.faint, textTransform:"uppercase", letterSpacing:"0.08em", marginRight:2, whiteSpace:"nowrap" }}>Statut</span>
              {[
                { key:"tous",      label:"Tous",       color:null },
                { key:"active",    label:"Actives",    color:"#15803d" },
                { key:"suspendue", label:"Suspendues", color:"#b91c1c" },
                { key:"inactive",  label:"Inactives",  color:"#4b5563" },
              ].map(({ key, label, color }) => {
                const isAct = activeStatut === key;
                return (
                  <button key={key} onClick={()=>setActiveStatut(key)}
                    style={{ padding:"4px 10px", fontSize:12, fontWeight:600, borderRadius:G.radius.full, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", transition:G.transition,
                      border: isAct ? `1.5px solid ${color || "#6d28d9"}` : `1.5px solid ${G.color.border}`,
                      background: isAct ? (color ? `${color}14` : "#f5f3ff") : "#fff",
                      color: isAct ? (color || "#6d28d9") : G.color.text.secondary,
                    }}>{label}</button>
                );
              })}
            </div>

            {!isSmallMobile && (
              <div style={{ marginLeft:"auto", flexShrink:0 }}>
                <span style={{ fontSize:12, color:G.color.text.muted, fontWeight:500 }}>
                  <strong style={{ color:G.color.text.primary, fontWeight:700 }}>{filtered.length}</strong> résultat{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {isSmallMobile && (
            <div style={{ padding:"0 14px 8px" }}>
              <span style={{ fontSize:11, color:G.color.text.muted, fontWeight:500 }}>
                <strong style={{ color:G.color.text.primary, fontWeight:700 }}>{filtered.length}</strong> résultat{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* ══ CONTENU ══ */}
        <div style={{ display:"flex", flex:1, overflow:"hidden", flexDirection: isMobile ? "column" : "row" }}>

          {/* ── Liste principale ── */}
          <div style={{ flex:1, overflowY:"auto", padding: isSmallMobile ? "12px" : "20px" }}>

            {/* Stat cards */}
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
              style={{ display:"grid", gridTemplateColumns: isSmallMobile ? "1fr 1fr" : isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isSmallMobile ? 8 : 12, marginBottom: isSmallMobile ? 12 : 20 }}>
              {statCards.map(({ label, value, sub, icon:Icon, color, bg, border }, i) => (
                <motion.div key={label}
                  initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: 0.06 + i * 0.06 }}
                  style={{ background:"#fff", border:`1.5px solid ${border}`, borderRadius:G.radius.lg, padding: isSmallMobile ? "12px" : "16px 18px", boxShadow:G.shadow.xs, position:"relative", overflow:"hidden" }}>
                  {/* Fond déco */}
                  <div style={{ position:"absolute", top:0, right:0, width:70, height:70, background:bg, borderRadius:"0 16px 0 70px", opacity:0.6 }} />
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom: isSmallMobile ? 8 : 12 }}>
                    <div style={{ width: isSmallMobile ? 32 : 38, height: isSmallMobile ? 32 : 38, borderRadius:G.radius.sm, background:bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon size={ isSmallMobile ? 15 : 18} style={{ color }} />
                    </div>
                  </div>
                  <div style={{ fontSize: isSmallMobile ? 24 : 30, fontWeight:800, color:G.color.text.primary, lineHeight:1, letterSpacing:"-1.5px" }}>{value}</div>
                  <div style={{ fontSize: isSmallMobile ? 11 : 12, color:G.color.text.secondary, marginTop:5, fontWeight:600 }}>{label}</div>
                  {!isSmallMobile && <div style={{ fontSize:11, color:G.color.text.muted, marginTop:2 }}>{sub}</div>}
                </motion.div>
              ))}
            </motion.div>

            {/* Grille / Liste */}
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                isSmallMobile ? (
                  <motion.div layout style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {filtered.map((l, i) => (
                      <CarteLMobile key={l.id} ligne={l} index={i} isSelected={selected?.id === l.id} onClick={()=>toggleSelected(l)} onEdit={setToEdit} onDelete={setToDelete} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div layout style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(230px,1fr))", gap:14 }}>
                    {filtered.map((l, i) => (
                      <CarteLGrid key={l.id} ligne={l} index={i} isSelected={selected?.id === l.id} onClick={()=>toggleSelected(l)} onEdit={setToEdit} onDelete={setToDelete} />
                    ))}
                  </motion.div>
                )
              ) : (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:"center", padding:"5rem 2rem" }}>
                  <div style={{ width:64, height:64, borderRadius:G.radius.lg, background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
                    <Route size={28} style={{ color:G.color.text.faint }} />
                  </div>
                  <div style={{ fontSize:16, fontWeight:700, color:G.color.text.primary, marginBottom:8 }}>Aucune ligne trouvée</div>
                  <div style={{ fontSize:13, color:G.color.text.muted }}>Modifiez vos critères de recherche</div>
                  {hasFilters && (
                    <button onClick={()=>{ setSearch(""); setActiveCoop("Toutes"); setActiveStatut("tous"); }}
                      style={{ marginTop:18, padding:"10px 20px", fontSize:13, fontWeight:600, borderRadius:G.radius.md, border:`1.5px solid ${G.color.border}`, background:"#fff", color:G.color.text.secondary, cursor:"pointer", fontFamily:"inherit" }}>
                      Réinitialiser les filtres
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ══ PANNEAU DÉTAIL ══ */}
          <AnimatePresence>
            {selected && (() => {
              const th = COOP_THEME[selected.coop] ?? COOP_THEME["Ankatso"];
              const sc = STATUT_CONFIG[selected.statut] ?? STATUT_CONFIG["inactive"];
              return (
                <motion.div
                  initial={{ width:0, opacity:0 }}
                  animate={{ width: isMobile ? "100%" : 300, opacity:1 }}
                  exit={{ width:0, opacity:0 }}
                  transition={{ type:"spring", stiffness:340, damping:30 }}
                  style={{ flexShrink:0, overflow:"hidden", background:"#fff", borderLeft: isMobile ? "none" : `1px solid ${G.color.border}`, borderTop: isMobile ? `1px solid ${G.color.border}` : "none", boxShadow: isMobile ? "none" : `-3px 0 12px rgba(0,0,0,0.04)` }}
                >
                  <div style={{ width:"100%", height:"100%", overflowY:"auto", padding: isSmallMobile ? "14px" : "20px 18px", display:"flex", flexDirection:"column", gap:18 }}>

                    {/* Header */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:13, fontWeight:700, color:G.color.text.primary }}>Détail de la ligne</span>
                      <button onClick={()=>setSelected(null)} style={{ width:30, height:30, borderRadius:G.radius.sm, border:`1px solid ${G.color.border}`, background:"#f9fafb", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:G.color.text.muted }}>
                        <X size={13} />
                      </button>
                    </div>

                    {/* Hero */}
                    <div style={{ background:`linear-gradient(${th.gradient})`, borderRadius:G.radius.md, padding:"18px", position:"relative", overflow:"hidden" }}>
                      <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, background:"rgba(255,255,255,0.1)", borderRadius:"50%" }} />
                      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                        <div style={{ width:50, height:50, borderRadius:G.radius.md, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff", letterSpacing:"-0.5px", flexShrink:0 }}>
                          {selected.code.replace("L-","")}
                        </div>
                        <div>
                          <div style={{ fontSize:18, fontWeight:800, color:"#fff", letterSpacing:"-0.5px" }}>{selected.code}</div>
                          <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:3, fontWeight:500 }}>{selected.coop}</div>
                        </div>
                      </div>
                      <StatutBadge sc={{ ...sc, bg:"rgba(255,255,255,0.2)", border:"rgba(255,255,255,0.3)", text:"#fff" }} StatusIcon={sc.icon} />
                    </div>

                    {/* Trajet */}
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:G.color.text.faint, marginBottom:8 }}>Trajet</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        {[["Départ", selected.depart], ["Arrivée", selected.arrivee]].map(([k,v], i) => (
                          <div key={k} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:G.color.bg, borderRadius:G.radius.sm, border:`1px solid ${G.color.border}` }}>
                            <div style={{ width:8, height:8, borderRadius: i === 0 ? "50%" : 2, background:th.accent, flexShrink:0 }} />
                            <span style={{ fontSize:10, color:G.color.text.muted, minWidth:42, fontWeight:600 }}>{k}</span>
                            <span style={{ fontSize:13, fontWeight:700, color:G.color.text.primary }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                      {[
                        { icon:Route, val:`${selected.distance}`, unit:"km", lbl:"Distance" },
                        { icon:Clock, val:selected.duree,          unit:"",  lbl:"Durée" },
                        { icon:Bus,   val:`${selected.vehicules}`, unit:"",  lbl:"Véhicules" },
                      ].map(({ icon:Icon, val, unit, lbl }) => (
                        <div key={lbl} style={{ textAlign:"center", padding:"10px 6px", background:th.light, border:`1.5px solid ${th.mid}`, borderRadius:G.radius.sm }}>
                          <Icon size={13} style={{ color:th.accent, display:"block", margin:"0 auto 5px" }} />
                          <div style={{ fontSize:13, fontWeight:800, color:th.accent, lineHeight:1 }}>{val}<span style={{ fontSize:9, fontWeight:600 }}>{unit}</span></div>
                          <div style={{ fontSize:10, color:th.dark, marginTop:3, opacity:0.7 }}>{lbl}</div>
                        </div>
                      ))}
                    </div>

                    {/* Infos */}
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:G.color.text.faint, marginBottom:8 }}>Informations</div>
                      {[
                        ["Tarif",    `${selected.tarif.toLocaleString("fr-FR")} Ar`],
                        ["Statut",   sc.label],
                        ["Créé le",  selected.date],
                        ["Activité", selected.activite],
                      ].map(([k,v]) => (
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${G.color.border}` }}>
                          <span style={{ fontSize:12, color:G.color.text.muted, fontWeight:500 }}>{k}</span>
                          <span style={{ fontSize:12, fontWeight:700, color: k==="Statut" ? sc.text : G.color.text.primary }}>{v}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:"auto" }}>
                      <button onClick={()=>setToEdit(selected)}
                        style={{ width:"100%", padding:"11px", fontSize:13, fontWeight:700, borderRadius:G.radius.md, border:`1.5px solid ${th.mid}`, background:th.light, color:th.accent, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:7, transition:G.transition }}>
                        <Edit2 size={13} /> Modifier la ligne
                      </button>
                      <button onClick={()=>setToDelete(selected)}
                        style={{ width:"100%", padding:"11px", fontSize:13, fontWeight:700, borderRadius:G.radius.md, border:"1.5px solid #fecaca", background:"#fef2f2", color:"#dc2626", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:7, transition:G.transition }}>
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}