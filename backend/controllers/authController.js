// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Utilitaire : générer les deux tokens
const generateTokens = (user) => {
    const payload = { id: user.id, role: user.role };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });

    return { accessToken, refreshToken };
};

// 1. Inscription classique
exports.register = async (req, res) => {
    try {
        const { nom_complet, email, password, role, numero_bus, ligne_id } = req.body;

        if (!nom_complet || !email || !password)
            return res.status(400).json({ message: "Champs incomplets." });

        const finalRole = role || 'utilisateur';

        // Validation supplémentaire si l'inscription concerne un chauffeur
        if (finalRole === 'chauffeur') {
            if (!numero_bus || !ligne_id) {
                return res.status(400).json({
                    message: "Le numéro de bus et la ligne sont obligatoires pour un chauffeur."
                });
            }

            const [ligneExists] = await db.query(
                "SELECT id FROM bus_routes WHERE id = ?", [ligne_id]
            );
            if (ligneExists.length === 0)
                return res.status(400).json({ message: "Ligne sélectionnée invalide." });
        }

        const [existingUser] = await db.query(
            "SELECT id FROM users WHERE email = ?", [email]
        );
        if (existingUser.length > 0)
            return res.status(409).json({ message: "Cet email est déjà utilisé." });

        const hashedPassword = await bcrypt.hash(password, 10);

        let insert;
        if (finalRole === 'chauffeur') {
            [insert] = await db.query(
                `INSERT INTO users (nom_complet, email, password, role, numero_bus, ligne_id, en_service)
                 VALUES (?, ?, ?, ?, ?, ?, 0)`,
                [nom_complet, email, hashedPassword, finalRole, numero_bus, ligne_id]
            );
        } else {
            [insert] = await db.query(
                "INSERT INTO users (nom_complet, email, password, role) VALUES (?, ?, ?, ?)",
                [nom_complet, email, hashedPassword, finalRole]
            );
        }

        const newUser = { id: insert.insertId, role: finalRole };
        const { accessToken, refreshToken } = generateTokens(newUser);

        res.status(201).json({
            message: "Inscription réussie !",
            accessToken,
            refreshToken,
            user: {
                id: newUser.id,
                nom_complet,
                email,
                role: finalRole,
                ...(finalRole === 'chauffeur' && { numero_bus, ligne_id })
            }
        });
    } catch (error) {
        console.error('[register]', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 2. Connexion classique
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Champs incomplets." });

        const [results] = await db.query(
            "SELECT * FROM users WHERE email = ?", [email]
        );

        const user = results[0];
        if (!user || !user.password || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });

        const { accessToken, refreshToken } = generateTokens(user);

        res.status(200).json({
            message: "Connexion réussie",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                nom_complet: user.nom_complet,
                email: user.email,
                role: user.role,
                ...(user.role === 'chauffeur' && {
                    numero_bus: user.numero_bus,
                    ligne_id: user.ligne_id,
                    en_service: !!user.en_service
                })
            }
        });
    } catch (error) {
        console.error('[login]', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 3. Connexion Google (OAuth)
exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token)
            return res.status(400).json({ message: "Token Google manquant." });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email } = ticket.getPayload();

        const [results] = await db.query(
            "SELECT * FROM users WHERE email = ?", [email]
        );

        let user;
        if (results.length > 0) {
            user = results[0];
        } else {
            const [insert] = await db.query(
                "INSERT INTO users (nom_complet, email, role) VALUES (?, ?, ?)",
                [name, email, 'utilisateur']
            );
            user = { id: insert.insertId, nom_complet: name, email, role: 'utilisateur' };
        }

        const { accessToken, refreshToken } = generateTokens(user);

        res.status(200).json({
            message: "Connexion Google réussie",
            accessToken,
            refreshToken,
            user: { id: user.id, nom_complet: user.nom_complet, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('[googleLogin]', error);
        res.status(401).json({ message: "Authentification Google échouée." });
    }
};

// 4. Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken)
            return res.status(400).json({ message: "Refresh token manquant." });

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const [results] = await db.query(
            "SELECT id, role FROM users WHERE id = ?", [decoded.id]
        );

        if (results.length === 0)
            return res.status(401).json({ message: "Utilisateur introuvable." });

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(results[0]);

        res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        console.error('[refreshToken]', error);
        res.status(401).json({ message: "Refresh token invalide ou expiré." });
    }
};