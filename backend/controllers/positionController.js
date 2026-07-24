// backend/controllers/positionController.js
const db = require('../config/db');

// 1. Recevoir une nouvelle position envoyée par le téléphone du chauffeur
exports.createPosition = async (req, res) => {
    try {
        const { chauffeur_id, latitude, longitude, vitesse, cap } = req.body;

        if (!chauffeur_id || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                message: "chauffeur_id, latitude et longitude sont obligatoires."
            });
        }

        // Vérifier que le chauffeur existe et récupérer sa ligne
        const [users] = await db.query(
            "SELECT id, role, ligne_id, en_service FROM users WHERE id = ?",
            [chauffeur_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "Chauffeur introuvable." });
        }

        const chauffeur = users[0];
        if (chauffeur.role !== 'chauffeur') {
            return res.status(403).json({ message: "Ce compte n'est pas un chauffeur." });
        }

        const [insert] = await db.query(
            `INSERT INTO positions_gps (chauffeur_id, ligne_id, latitude, longitude, vitesse, cap)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [chauffeur_id, chauffeur.ligne_id, latitude, longitude, vitesse || null, cap || null]
        );

        // Diffusion temps réel aux clients web connectés via Socket.io (si configuré)
        const io = req.app.get('io');
        if (io) {
            io.emit('position_update', {
                chauffeur_id,
                ligne_id: chauffeur.ligne_id,
                latitude,
                longitude,
                vitesse: vitesse || null,
                cap: cap || null,
                created_at: new Date(),
            });
        }

        res.status(201).json({
            message: "Position enregistrée.",
            id: insert.insertId
        });
    } catch (error) {
        console.error('[createPosition]', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 2. Activer / désactiver le statut "en service" d'un chauffeur
exports.setEnService = async (req, res) => {
    try {
        const { id } = req.params;
        const { en_service } = req.body;

        if (en_service === undefined) {
            return res.status(400).json({ message: "en_service est obligatoire (true/false)." });
        }

        const [users] = await db.query(
            "SELECT id, role FROM users WHERE id = ?", [id]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }
        if (users[0].role !== 'chauffeur') {
            return res.status(403).json({ message: "Ce compte n'est pas un chauffeur." });
        }

        await db.query(
            "UPDATE users SET en_service = ? WHERE id = ?",
            [en_service ? 1 : 0, id]
        );

        // ──────────────────────────────────────────────────────────────────
        // NOUVEAU : à la déconnexion (en_service = false), on supprime tout
        // l'historique GPS de ce chauffeur dans positions_gps, pour ne garder
        // en base que les positions des chauffeurs réellement en service.
        // ──────────────────────────────────────────────────────────────────
        if (!en_service) {
            await db.query(
                "DELETE FROM positions_gps WHERE chauffeur_id = ?",
                [id]
            );
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('chauffeur_statut', { chauffeur_id: Number(id), en_service: !!en_service });
        }

        res.status(200).json({ message: "Statut mis à jour.", en_service: !!en_service });
    } catch (error) {
        console.error('[setEnService]', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 3. Récupérer la dernière position connue de chaque chauffeur actuellement en service
exports.getLivePositions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.id, p.chauffeur_id, p.ligne_id, p.latitude, p.longitude,
                   p.vitesse, p.cap, p.created_at,
                   u.nom_complet, u.numero_bus
            FROM positions_gps p
            INNER JOIN (
                SELECT chauffeur_id, MAX(created_at) AS derniere
                FROM positions_gps
                GROUP BY chauffeur_id
            ) latest ON p.chauffeur_id = latest.chauffeur_id AND p.created_at = latest.derniere
            INNER JOIN users u ON u.id = p.chauffeur_id
            WHERE u.en_service = 1
        `);

        res.status(200).json({ data: rows });
    } catch (error) {
        console.error('[getLivePositions]', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 4. Historique des positions d'un chauffeur (utile pour debug / rejouer un trajet)
exports.getPositionsByChauffeur = async (req, res) => {
    try {
        const { id } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 100, 500);

        const [rows] = await db.query(
            `SELECT id, latitude, longitude, vitesse, cap, created_at
             FROM positions_gps
             WHERE chauffeur_id = ?
             ORDER BY created_at DESC
             LIMIT ?`,
            [id, limit]
        );

        res.status(200).json({ data: rows });
    } catch (error) {
        console.error('[getPositionsByChauffeur]', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};