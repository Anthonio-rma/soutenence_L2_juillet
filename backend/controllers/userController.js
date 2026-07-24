// backend/controllers/userController.js
const db = require('../config/db');

// ── Utilitaire ──
function normalizeRole(role) {
    const raw = String(role || "").trim().toLowerCase();
    if (raw === "admin" || raw === "administrateur") return "administrateur";
    if (raw === "operateur" || raw === "opérateur")  return "opérateur";
    return "utilisateur";
}

// ── 1. Récupérer UN utilisateur par son ID ──
exports.getUserById = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, nom_complet, email, role, telephone, pays, ville,
                    code_postal, identifiant_fiscal, avatar_url
             FROM users WHERE id = ?`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: "Utilisateur non trouvé." });
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error("Erreur lors de la récupération :", err);
        res.status(500).json({ error: "Erreur serveur interne." });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, nom_complet, email, role, statut, coop, created_at FROM users`
        );

        // ✅ Log temporaire
        const user15 = rows.find(r => r.id === 15);
        console.log("👤 User 15 en BDD :", user15);

        const mapped = rows.map(user => {
            const [prenom, ...rest] = (user.nom_complet || "").split(" ");
            return {
                id:       user.id,
                prenom:   prenom || "",
                nom:      rest.join(" ") || "",
                email:    user.email,
                role:     normalizeRole(user.role),
                coop:     user.coop     || "Indéfini",
                statut:   user.statut   || "actif",
                date:     user.created_at
                            ? new Date(user.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
                            : "N/A",
                activite: "N/A",
            };
        });

        res.status(200).json(mapped);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur interne." });
    }
};

// ── 3. Supprimer un utilisateur ──
exports.deleteUser = async (req, res) => {
    try {
        const [result] = await db.query(`DELETE FROM users WHERE id = ?`, [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }
        res.json({ message: "Utilisateur supprimé avec succès." });
    } catch (err) {
        console.error("Erreur suppression utilisateur :", err);
        res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
    }
};

// ── 4. Upload avatar ──
exports.uploadAvatar = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Pas de fichier" });
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    try {
        await db.query(`UPDATE users SET avatar_url = ? WHERE id = ?`, [imageUrl, req.params.id]);
        res.json({ url: imageUrl });
    } catch (err) {
        console.error("Erreur SQL :", err);
        res.status(500).json({ error: "Erreur serveur BDD" });
    }
};

// ── 5. Mettre à jour un utilisateur ──
exports.updateUser = async (req, res) => {
    try {
        console.log("📥 Body reçu :", req.body);          // ← ce qui arrive du frontend
        console.log("🔑 ID :", req.params.id);

        const { nom_complet, email, role, statut, coop } = req.body;

        console.log("🎭 Role brut :", role);
        console.log("🎭 Role normalisé :", normalizeRole(role));

        const [result] = await db.query(
            `UPDATE users SET nom_complet = ?, email = ?, role = ?, statut = ?, coop = ? WHERE id = ?`,
            [nom_complet, email, normalizeRole(role), statut ?? "actif", coop ?? "Indéfini", req.params.id]
        );

        console.log("✅ Rows affectées :", result.affectedRows);

        if (result.affectedRows === 0)
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        res.json({ message: "Profil mis à jour avec succès !" });
    } catch (err) {
        console.error("❌ Erreur updateUser :", err);
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        res.status(500).json({ error: "Erreur serveur interne" });
    }
};