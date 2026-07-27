import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Edit2, Trash2, Check, X } from "lucide-react";

/* ─── Configuration de l'API ───
   En dev (Vite), tu peux créer un fichier .env à la racine avec :
     VITE_API_URL=http://localhost:5000
   En prod, laisse .env vide ou absent : ça retombera automatiquement
   sur ton backend déployé sur Render. */
const API_BASE = import.meta.env.VITE_API_URL || 'https://soutenence-l2-juillet.onrender.com';
const API_URL = `${API_BASE}/api/users`;

const INITIAL_USERS = [
  { id:1,  prenom:"Rakoto",      nom:"Andrianaivo",         email:"r.andrianaivo@taxibe.mg",         role:"administrateur", coop:"Ankatso",         statut:"actif",    date:"12 jan. 2024", activite:"Il y a 2h",   color:"#7c3aed", bg:"#f5f3ff" },
  { id:2,  prenom:"Hanta",       nom:"Rasoamahenina",       email:"h.rasoamahenina@taxibe.mg",       role:"opérateur",      coop:"Analakely",       statut:"actif",    date:"03 fév. 2024", activite:"Il y a 15min",color:"#ea580c", bg:"#fff7ed" },
  { id:3,  prenom:"Jean-Pierre", nom:"Rakotondrabe",        email:"jp.rakotondrabe@taxibe.mg",       role:"utilisateur",    coop:"Ambohidratrimo", statut:"actif",    date:"21 mar. 2024", activite:"Il y a 1j",   color:"#2563eb", bg:"#eff6ff" },
  { id:4,  prenom:"Miora",       nom:"Randriamampianina",   email:"m.randriamampianina@taxibe.mg",   role:"administrateur", coop:"Ankatso",         statut:"actif",    date:"08 jan. 2024", activite:"Il y a 30min",color:"#7c3aed", bg:"#f5f3ff" },
  { id:5,  prenom:"Toky",        nom:"Rafaralahy",          email:"t.rafaralahy@taxibe.mg",          role:"opérateur",      coop:"Tana-Est",        statut:"suspendu", date:"15 avr. 2024", activite:"Il y a 6j",   color:"#ea580c", bg:"#fff7ed" },
  { id:6,  prenom:"Voahirana",   nom:"Andrianasolo",        email:"v.andrianasolo@taxibe.mg",        role:"utilisateur",    coop:"Ambohidratrimo", statut:"actif",    date:"02 mai 2024",  activite:"Il y a 4h",   color:"#2563eb", bg:"#eff6ff" },
  { id:7,  prenom:"Fidy",        nom:"Rabemanantsoa",       email:"f.rabemanantsoa@taxibe.mg",       role:"opérateur",      coop:"Analakely",       statut:"actif",    date:"19 fév. 2024", activite:"Il y a 20min",color:"#ea580c", bg:"#fff7ed" },
  { id:8,  prenom:"Sahondra",    nom:"Rasolomahatratra",    email:"s.rasolomahatratra@taxibe.mg",    role:"utilisateur",    coop:"Ankatso",         statut:"inactif",  date:"30 mar. 2024", activite:"Il y a 12j",  color:"#2563eb", bg:"#eff6ff" },
  { id:9,  prenom:"Lova",        nom:"Randrianantenaina",   email:"l.randrianantenaina@taxibe.mg",   role:"administrateur", coop:"Tana-Est",        statut:"actif",    date:"05 jan. 2024", activite:"Il y a 1h",   color:"#7c3aed", bg:"#f5f3ff" },
  { id:10, prenom:"Njara",       nom:"Ramaroson",           email:"n.ramaroson@taxibe.mg",           role:"opérateur",      coop:"Ambohidratrimo", statut:"actif",    date:"11 juin 2024", activite:"Il y a 3h",   color:"#ea580c", bg:"#fff7ed" },
  { id:11, prenom:"Christian",   nom:"Razafimaharo",        email:"c.razafimaharo@taxibe.mg",        role:"utilisateur",    coop:"Analakely",       statut:"actif",    date:"22 avr. 2024", activite:"Il y a 2j",   color:"#2563eb", bg:"#eff6ff" },
  { id:12, prenom:"Noro",        nom:"Ralambohany",         email:"n.ralambohany@taxibe.mg",         role:"opérateur",      coop:"Ankatso",         statut:"suspendu", date:"17 mar. 2024", activite:"Il y a 20j",  color:"#ea580c", bg:"#fff7ed" },
  { id:13, prenom:"Patrick",     nom:"Andriamihaja",        email:"p.andriamihaja@taxibe.mg",        role:"utilisateur",    coop:"Tana-Est",        statut:"actif",    date:"09 mai 2024",  activite:"Il y a 5h",   color:"#2563eb", bg:"#eff6ff" },
  { id:14, prenom:"Tianasoa",    nom:"Rakotovao",           email:"t.rakotovao@taxibe.mg",           role:"administrateur", coop:"Analakely",       statut:"actif",    date:"01 jan. 2024", activite:"Il y a 10min",color:"#7c3aed", bg:"#f5f3ff" },
  { id:15, prenom:"Lalao",       nom:"Razanakolona",        email:"l.razanakolona@taxibe.mg",        role:"opérateur",      coop:"Tana-Est",        statut:"actif",    date:"14 fév. 2024", activite:"Il y a 45min",color:"#ea580c", bg:"#fff7ed" },
  { id:16, prenom:"Herizo",      nom:"Andriamanantena",     email:"h.andriamanantena@taxibe.mg",     role:"utilisateur",    coop:"Ambohidratrimo", statut:"inactif",  date:"28 avr. 2024", activite:"Il y a 8j",   color:"#2563eb", bg:"#eff6ff" },
];

const ROLE_META = {
  administrateur: { label:"Administrateur", color:"#7c3aed", bg:"#f5f3ff", icon:"🛡" },
  opérateur:      { label:"Opérateur",      color:"#ea580c", bg:"#fff7ed", icon:"⚙" },
  utilisateur:    { label:"Utilisateur",    color:"#2563eb", bg:"#eff6ff", icon:"👤" },
};

const STATUT_META = {
  actif:    { dot:"#10b981", label:"Actif" },
  inactif:  { dot:"#9ca3af", label:"Inactif" },
  suspendu: { dot:"#ef4444", label:"Suspendu" },
};

const FILTERS = [
  { key:"tous",          label:"Tous" },
  { key:"administrateur",label:"Administrateur" },
  { key:"opérateur",     label:"Opérateur" },
  { key:"utilisateur",   label:"Utilisateur" },
  { key:"suspendu",      label:"Suspendus" },
];

const ROLE_COLOR = {
  administrateur: { color:"#7c3aed", bg:"#f5f3ff" },
  opérateur:      { color:"#ea580c", bg:"#fff7ed" },
  utilisateur:    { color:"#2563eb", bg:"#eff6ff" },
};

function initials(p, n) {
  return ((p?.[0] ?? "") + (n?.[0] ?? "")).toUpperCase();
}

function normalizeRole(role) {
  const raw = String(role ?? "").trim().toLowerCase();
  if (raw === "admin" || raw === "administrateur") return "administrateur";
  if (raw === "operateur" || raw === "opérateur") return "opérateur";
  return "utilisateur";
}

function parseDateValue(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatFrenchDate(value) {
  const date = parseDateValue(value);
  if (!date) return null;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatRelativeActivity(value) {
  const date = parseDateValue(value);
  if (!date) return null;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  const hours = Math.round(diffMs / 3600000);
  const days = Math.round(diffMs / 86400000);

  if (minutes < 1) return 'Il y a quelques secondes';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours} h`;
  if (days < 7) return `Il y a ${days} j`;
  return `Il y a ${days} j`;
}

function normalizeUser(user) {
  const fullName = user.nom_complet || `${user.prenom ?? ""} ${user.nom ?? ""}`.trim();
  const [prenom, ...rest] = fullName.split(" ");
  const roleKey = normalizeRole(user.role);  // ✅ toujours recalculé

  const createdAt    = user.date ?? user.created_at ?? user.createdAt ?? user.date_inscription;
  const lastActivity = user.activite ?? user.last_login ?? user.updated_at ?? user.dernier_login;

  return {
    ...user,
    prenom:   user.prenom ?? prenom ?? "",
    nom:      user.nom    ?? rest.join(" ") ?? "",
    role:     roleKey,
    coop:     user.coop   ?? "Indéfini",
    statut:   user.statut ?? "actif",
    date:     user.date   ?? formatFrenchDate(createdAt) ?? "N/A",
    activite: user.activite ?? formatRelativeActivity(lastActivity) ?? "N/A",
    // ✅ toujours recalculé depuis le rôle, jamais gardé depuis les anciennes données
    color: ROLE_COLOR[roleKey]?.color ?? "#2563eb",
    bg:    ROLE_COLOR[roleKey]?.bg    ?? "#eff6ff",
  };
}

function Avatar({ prenom, nom, color, bg, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 600, fontFamily: "inherit",
      border: `1.5px solid ${color}22`,
    }}>
      {initials(prenom, nom)}
    </div>
  );
}

function RoleBadge({ role }) {
  const normalizedRole = normalizeRole(role);
  const m = ROLE_META[normalizedRole] ?? ROLE_META["utilisateur"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 99,
      background: m.bg, color: m.color,
      fontSize: 11, fontWeight: 600,
      border: `1px solid ${m.color}22`,
    }}>
      <span style={{ fontSize: 10 }}>{m.icon}</span>
      {m.label}
    </span>
  );
}

function StatutDot({ statut }) {
  const m = STATUT_META[statut] ?? STATUT_META["inactif"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:"#6b7280" }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:m.dot, display:"inline-block" }} />
      {m.label}
    </span>
  );
}

const card = {
  background: "#ffffff",
  border: "1px solid #f1f0f0",
  borderRadius: 16,
  padding: "1.1rem 1.25rem",
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0,  transition: { type:"spring", stiffness:280, damping:26 } },
};
const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  show:   { opacity: 1, x: 0,  transition: { type:"spring", stiffness:300, damping:28 } },
  exit:   { opacity: 0, x: 8,  transition: { duration: 0.15 } },
};



// ── MODAL SUPPRESSION ──
function ModalSupprimer({ user, onConfirm, onCancel }) {
  if (!user) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1,    opacity: 1, y: 0 }}
          exit={{    scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 18, padding: "1.75rem",
            width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column", gap: 16,
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Supprimer l'utilisateur</span>
            <button onClick={onCancel} style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex" }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fef2f2", borderRadius: 12, border: "1px solid #fecaca" }}>
            <Avatar prenom={user.prenom} nom={user.nom} color={user.color} bg={user.bg} size={40} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{user.prenom} {user.nom}</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>{user.email}</div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est <strong style={{ color:"#ef4444" }}>irréversible</strong>.
          </p>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={onCancel}
              style={{
                padding: "8px 18px", fontSize: 12, fontWeight: 600, borderRadius: 10,
                border: "1px solid #e5e7eb", background: "#fff", color: "#374151",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: "8px 18px", fontSize: 12, fontWeight: 600, borderRadius: 10,
                border: "none", background: "#ef4444", color: "#fff",
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Trash2 size={13} /> Supprimer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── MODAL MODIFIER ──
function ModalModifier({ user, onSave, onCancel }) {
  const [form, setForm] = useState(user ? { ...user } : null);

  useEffect(() => { if (user) setForm({ ...user }); }, [user]);

  if (!user || !form) return null;

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    // Mettre à jour couleur/bg selon le rôle
    if (field === "role") {
      updated.color = ROLE_COLOR[value]?.color ?? "#2563eb";
      updated.bg    = ROLE_COLOR[value]?.bg    ?? "#eff6ff";
    }
    setForm(updated);
  };

  const inputStyle = {
    width: "100%", padding: "8px 10px", fontSize: 12,
    borderRadius: 9, border: "1px solid #e5e7eb",
    background: "#fff", color: "#111", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 10, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 4, display: "block",
  };


  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1,    opacity: 1, y: 0 }}
          exit={{    scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 18, padding: "1.75rem",
            width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column", gap: 16,
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            maxHeight: "90vh", overflowY: "auto",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Modifier l'utilisateur</span>
            <button onClick={onCancel} style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex" }}>
              <X size={18} />
            </button>
          </div>

          {/* Aperçu avatar */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#fafaf9", borderRadius:12, border:"1px solid #f1f0f0" }}>
            <Avatar prenom={form.prenom} nom={form.nom} color={form.color} bg={form.bg} size={44} />
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"#111" }}>{form.prenom} {form.nom}</div>
              <RoleBadge role={form.role} />
            </div>
          </div>

          {/* Champs */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input style={inputStyle} value={form.prenom} onChange={e => handleChange("prenom", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Nom</label>
              <input style={inputStyle} value={form.nom} onChange={e => handleChange("nom", e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={form.email} onChange={e => handleChange("email", e.target.value)} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={labelStyle}>Rôle</label>
              <select style={inputStyle} value={form.role} onChange={e => handleChange("role", e.target.value)}>
                <option value="administrateur">Administrateur</option>
                <option value="opérateur">Opérateur</option>
                <option value="utilisateur">Utilisateur</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Statut</label>
              <select style={inputStyle} value={form.statut} onChange={e => handleChange("statut", e.target.value)}>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="suspendu">Suspendu</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Coopérative</label>
            <select style={inputStyle} value={form.coop} onChange={e => handleChange("coop", e.target.value)}>
              {["Ankatso","Analakely","Ambohidratrimo","Tana-Est"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", paddingTop:4 }}>
            <button
              onClick={onCancel}
              style={{
                padding:"8px 18px", fontSize:12, fontWeight:600, borderRadius:10,
                border:"1px solid #e5e7eb", background:"#fff", color:"#374151",
                cursor:"pointer", fontFamily:"inherit",
              }}
            >
              Annuler
            </button>
            <button
              onClick={() => onSave(form)}
              style={{
                padding:"8px 18px", fontSize:12, fontWeight:600, borderRadius:10,
                border:"none", background:"#111", color:"#fff",
                cursor:"pointer", fontFamily:"inherit",
                display:"flex", alignItems:"center", gap:6,
              }}
            >
              <Check size={13} /> Enregistrer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


export default function PageUtilisateurs() {
  const [users, setUsers]       = useState(INITIAL_USERS);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("tous");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage]         = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [toEdit, setToEdit]     = useState(null);
  const [backendOffline, setBackendOffline] = useState(false); // ✅ indicateur connexion backend
  const PER_PAGE = 8;

  useEffect(() => { setPage(1); }, [filter, search]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(API_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const normalized = Array.isArray(data) ? data.map(normalizeUser) : [];
        setUsers(normalized.length ? normalized : INITIAL_USERS);
        setLoading(false);
        setBackendOffline(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Erreur de connexion au backend :", err);
          setUsers(INITIAL_USERS);
          setLoading(false);
          setBackendOffline(true);
        }
      });

    return () => controller.abort();
  }, []);

  const filtered = users.filter(u => {
    if (filter === "suspendu") return u.statut === "suspendu";
    if (filter !== "tous" && u.role !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return `${u.prenom} ${u.nom} ${u.email} ${u.coop}`.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Supprimer
  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_URL}/${toDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Suppression échouée (${response.status})`);
      setUsers(prev => prev.filter(u => u.id !== toDelete.id));
      if (selected?.id === toDelete.id) setSelected(null);
      setBackendOffline(false);
    } catch (error) {
      console.error("Erreur suppression utilisateur :", error);
      setBackendOffline(true);
    } finally {
      setToDelete(null);
    }
  };

  const handleEditSave = async (updated) => {
    try {
        const body = {
            nom_complet: `${updated.prenom} ${updated.nom}`.trim(),
            email:  updated.email,
            role:   updated.role,
            statut: updated.statut,
            coop:   updated.coop,
        };
        const response = await fetch(`${API_URL}/${updated.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`Modification échouée (${response.status})`);

        // ✅ Recharger la liste depuis l'API pour avoir les vraies données
        const res = await fetch(`${API_URL}?t=${Date.now()}`);
        const data = await res.json();
        const normalized = Array.isArray(data) ? data.map(normalizeUser) : [];
        if (normalized.length) {
            setUsers(normalized);
            const updatedUser = normalized.find(u => u.id === updated.id);
            if (selected?.id === updated.id && updatedUser) setSelected(updatedUser);
        }
        setBackendOffline(false);

    } catch (error) {
        console.error("Erreur modification :", error);
        setBackendOffline(true);
    } finally {
        setToEdit(null);
    }
};
  const totalAdmins     = users.filter(u => u.role === "administrateur").length;
  const totalOperateurs = users.filter(u => u.role === "opérateur").length;
  const totalActifs     = users.filter(u => u.statut === "actif").length;

  if (loading) return <div style={{ padding: 20 }}>Chargement des utilisateurs...</div>;

  return (
    <>
      {/* Modals */}
      {toDelete && (
        <ModalSupprimer
          user={toDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
        />
      )}
      {toEdit && (
        <ModalModifier
          user={toEdit}
          onSave={handleEditSave}
          onCancel={() => setToEdit(null)}
        />
      )}

      {/*
        IMPORTANT : MainLayout.js possède déjà LE conteneur scrollable
        unique (overflowY:'auto', minHeight:0 autour de <Outlet/>).
        Cette page ne doit donc PAS avoir sa propre hauteur fixe / son
        propre overflowY, sinon on empile plusieurs niveaux de scroll
        imbriqués, ce qui casse le rendu sur mobile (hauteur qui
        s'effondre à 0 → tableau invisible). Ici la page reste en flux
        naturel : elle grandit avec son contenu, et c'est MainLayout qui
        scrolle.
      */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          width: "100%",
          padding: "1.5rem 1.5rem 2.5rem",
          display: "flex", flexDirection: "column", gap: "1.25rem",
          background: "#f9f9f8",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          boxSizing: "border-box",
        }}
      >
        {/* ── EN-TÊTE ── */}
        <motion.div variants={itemVariants} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <h1 style={{ fontSize:20, fontWeight:700, color:"#111", margin:0, letterSpacing:"-0.3px" }}>Gestion des utilisateurs</h1>
            <p style={{ fontSize:12, color:"#9ca3af", marginTop:3, fontWeight:500 }}>
              {users.length} utilisateurs enregistrés sur la plateforme Taxis-Be.
            </p>
            {/* ✅ Indicateur discret si le backend Render est injoignable */}
            {backendOffline && (
              <p style={{ fontSize:11, color:"#ef4444", fontWeight:600, marginTop:4 }}>
                ⚠ Connexion au serveur impossible — données affichées peuvent être locales/obsolètes.
              </p>
            )}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", justifyContent:"flex-end" }}>
            <div style={{ position:"relative", flex: "1 1 220px", minWidth: 0, maxWidth: 280 }}>
              <Search size={16} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#9ca3af" }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                style={{
                  paddingLeft: 34, paddingRight: 36, paddingTop: 8, paddingBottom: 8,
                  fontSize: 12, borderRadius: 10, border: "1px solid #e5e7eb",
                  background: "#fff", color: "#111", width: "100%", maxWidth: 280,
                  outline: "none", fontFamily: "inherit",
                }}
              />
              <button style={{
                position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
                width:24, height:24, borderRadius:8, border:"none", background:"transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", padding:0, color:"#374151",
              }}>
                <Bell size={16} color="#374151" />
                <span style={{
                  position:"absolute", top:2, right:2,
                  width:5, height:5, borderRadius:"50%",
                  background:"#f97316",
                }} />
              </button>
            </div>
            {/* Bouton "Ajouter" retiré à la demande */}
          </div>
        </motion.div>

        {/* ── MÉTRIQUES ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:12 }}>
          {[
            { label:"Total utilisateurs",  value:users.length, badge:"+14 ce mois", bColor:"#10b981", bBg:"#ecfdf5", bar:82, barC:"#10b981" },
            { label:"Administrateurs",      value:totalAdmins,  badge:`${((totalAdmins/users.length)*100).toFixed(1)}%`, bColor:"#7c3aed", bBg:"#f5f3ff", bar:Math.round((totalAdmins/users.length)*100), barC:"#7c3aed" },
            { label:"Opérateurs",           value:totalOperateurs, badge:`${((totalOperateurs/users.length)*100).toFixed(1)}%`, bColor:"#ea580c", bBg:"#fff7ed", bar:Math.round((totalOperateurs/users.length)*100), barC:"#ea580c" },
            { label:"Utilisateurs actifs",  value:totalActifs,  badge:`${((totalActifs/users.length)*100).toFixed(0)}% actifs`, bColor:"#2563eb", bBg:"#eff6ff", bar:Math.round((totalActifs/users.length)*100), barC:"#2563eb" },
          ].map((m, i) => (
            <motion.div key={i} variants={itemVariants} style={{ ...card, display:"flex", flexDirection:"column", gap:8 }}>
              <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#9ca3af" }}>{m.label}</span>
              <span style={{ fontSize:28, fontWeight:800, color:"#111", lineHeight:1 }}>{m.value}</span>
              <span style={{
                display:"inline-flex", alignItems:"center",
                fontSize:10, fontWeight:700,
                padding:"2px 8px", borderRadius:99,
                color:m.bColor, background:m.bBg, alignSelf:"flex-start",
              }}>
                {m.badge}
              </span>
              <div style={{ height:3, borderRadius:99, background:"#f1f0f0", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${m.bar}%`, background:m.barC, borderRadius:99 }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── TABLEAU ── */}
        <motion.div variants={itemVariants} style={{ ...card, padding:0, overflow:"hidden", display:"flex", flexDirection:"column" }}>

          {/* Header du tableau */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexWrap:"wrap", gap:10, padding:"1rem 1.25rem 0.875rem",
            borderBottom:"1px solid #f1f0f0",
          }}>
            <span style={{ fontSize:14, fontWeight:700, color:"#111" }}>Liste des utilisateurs</span>

            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding:"5px 13px", fontSize:11, fontWeight:600,
                    borderRadius:99, cursor:"pointer", fontFamily:"inherit",
                    border: filter === f.key ? "none" : "1px solid #e5e7eb",
                    background: filter === f.key ? "#111" : "#fff",
                    color: filter === f.key ? "#fff" : "#6b7280",
                    transition:"all 0.15s",
                  }}
                >
                  {f.label}
                  {f.key !== "tous" && (
                    <span style={{ marginLeft:5, opacity:0.7 }}>
                      ({f.key === "suspendu"
                        ? users.filter(u => u.statut === "suspendu").length
                        : users.filter(u => u.role === f.key).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/*
            Zone scrollable dédiée au tableau. On plafonne sa hauteur pour
            forcer l'apparition d'un scroll interne dès que la liste dépasse
            l'espace visible, avec un en-tête de colonnes "collant" (sticky)
            pour rester lisible pendant le défilement.
          */}
          <div style={{ overflowX:"auto", overflowY:"auto", maxHeight:"55vh" }}>
            <table style={{ width:"100%", minWidth:720, borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:"1px solid #f1f0f0" }}>
                  {["Utilisateur","Rôle","Coopérative","Statut","Inscrit le","Activité","Actions"].map(h => (
                    <th key={h} style={{
                      position:"sticky", top:0, zIndex:1,
                      padding:"9px 16px", textAlign:"left",
                      fontSize:10, fontWeight:700, textTransform:"uppercase",
                      letterSpacing:"0.07em", color:"#9ca3af",
                      whiteSpace:"nowrap", background:"#ffffff",
                      boxShadow:"inset 0 -1px 0 #f1f0f0",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {paginated.map(u => (
                    <motion.tr
                      key={u.id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      layout
                      onClick={() => setSelected(selected?.id === u.id ? null : u)}
                      style={{
                        borderBottom:"1px solid #f9f9f9",
                        background: selected?.id === u.id ? "#fafaf9" : "transparent",
                        cursor:"pointer",
                        transition:"background 0.1s",
                      }}
                      onMouseEnter={e => { if (selected?.id !== u.id) e.currentTarget.style.background = "#fafaf9"; }}
                      onMouseLeave={e => { if (selected?.id !== u.id) e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding:"10px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <Avatar prenom={u.prenom} nom={u.nom} color={u.color} bg={u.bg} />
                          <div>
                            <div style={{ fontWeight:600, fontSize:12, color:"#111" }}>{u.prenom} {u.nom}</div>
                            <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"10px 16px" }}><RoleBadge role={u.role} /></td>
                      <td style={{ padding:"10px 16px", fontSize:11, color:"#6b7280", fontWeight:500 }}>{u.coop}</td>
                      <td style={{ padding:"10px 16px" }}><StatutDot statut={u.statut} /></td>
                      <td style={{ padding:"10px 16px", fontSize:11, color:"#9ca3af" }}>{u.date}</td>
                      <td style={{ padding:"10px 16px", fontSize:11, color:"#9ca3af" }}>{u.activite}</td>
                      <td style={{ padding:"10px 16px" }}>
                        <div style={{ display:"flex", gap:4 }}>
                          {/* Bouton Modifier */}
                          <button
                            onClick={e => { e.stopPropagation(); setToEdit(u); }}
                            title="Modifier"
                            style={{
                              width:28, height:28, borderRadius:8,
                              border:"1px solid #e5e7eb", background:"transparent",
                              display:"flex", alignItems:"center", justifyContent:"center",
                              cursor:"pointer", color:"#6b7280",
                              transition:"all 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.borderColor="#2563eb"; e.currentTarget.style.color="#2563eb"; }}
                            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="#6b7280"; }}
                          >
                            <Edit2 size={13} />
                          </button>
                          {/* Bouton Supprimer */}
                          <button
                            onClick={e => { e.stopPropagation(); setToDelete(u); }}
                            title="Supprimer"
                            style={{
                              width:28, height:28, borderRadius:8,
                              border:"1px solid #e5e7eb", background:"transparent",
                              display:"flex", alignItems:"center", justifyContent:"center",
                              cursor:"pointer", color:"#6b7280",
                              transition:"all 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.borderColor="#ef4444"; e.currentTarget.style.color="#ef4444"; }}
                            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="#6b7280"; }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding:"2.5rem", textAlign:"center", color:"#9ca3af", fontSize:13 }}>
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Panneau de détail */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ height:0, opacity:0 }}
                animate={{ height:"auto", opacity:1 }}
                exit={{ height:0, opacity:0 }}
                transition={{ type:"spring", stiffness:300, damping:30 }}
                style={{ overflow:"hidden", borderTop:"1px solid #f1f0f0" }}
              >
                <div style={{ padding:"1rem 1.25rem", background:"#fafaf9", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                  <Avatar prenom={selected.prenom} nom={selected.nom} color={selected.color} bg={selected.bg} size={48} />
                  <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#111" }}>{selected.prenom} {selected.nom}</div>
                    <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{selected.email}</div>
                  </div>
                  <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                    {[
                      ["Rôle",        <RoleBadge role={selected.role} />],
                      ["Coopérative", selected.coop],
                      ["Statut",      <StatutDot statut={selected.statut} />],
                      ["Inscrit le",  selected.date],
                      ["Activité",    selected.activite],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#9ca3af", marginBottom:3 }}>{k}</div>
                        <div style={{ fontSize:12, color:"#374151", fontWeight:500 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#9ca3af", alignSelf:"flex-start" }}
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer pagination */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"0.75rem 1.25rem", borderTop:"1px solid #f1f0f0",
            flexWrap:"wrap", gap:8,
          }}>
            <span style={{ fontSize:11, color:"#9ca3af" }}>
              Affichage de {Math.min((page-1)*PER_PAGE+1, filtered.length)}–{Math.min(page*PER_PAGE, filtered.length)} sur {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            </span>
            <div style={{ display:"flex", gap:4 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width:28, height:28, borderRadius:8,
                    border: page === p ? "none" : "1px solid #e5e7eb",
                    background: page === p ? "#111" : "#fff",
                    color: page === p ? "#fff" : "#6b7280",
                    fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

        </motion.div>
      </motion.div>
    </>
  );
}