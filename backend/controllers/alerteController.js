const db = require('../config/db'); // adapte le chemin selon ton projet

// GET /api/alertes - liste toutes les alertes
exports.getAlertes = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, type, titre, description, lat, lng, ligne_id, created_at FROM alertes ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur getAlertes:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des alertes.' });
  }
};

// POST /api/alertes - créer une alerte
exports.createAlerte = async (req, res) => {
  const { type, titre, description, lat, lng, ligne_id } = req.body;

  if (!titre || lat === undefined || lng === undefined) {
    return res.status(400).json({ message: 'titre, lat et lng sont obligatoires.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO alertes (type, titre, description, lat, lng, ligne_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [type || 'accident', titre, description || null, lat, lng, ligne_id || null]
    );
    res.status(201).json({ id: result.insertId, type, titre, description, lat, lng, ligne_id });
  } catch (err) {
    console.error('Erreur createAlerte:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'alerte.' });
  }
};

// PUT /api/alertes/:id - modifier une alerte
exports.updateAlerte = async (req, res) => {
  const { id } = req.params;
  const { type, titre, description, lat, lng, ligne_id } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE alertes
       SET type = ?, titre = ?, description = ?, lat = ?, lng = ?, ligne_id = ?
       WHERE id = ?`,
      [type || 'accident', titre, description || null, lat, lng, ligne_id || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alerte introuvable.' });
    }
    res.json({ id, type, titre, description, lat, lng, ligne_id });
  } catch (err) {
    console.error('Erreur updateAlerte:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la modification de l\'alerte.' });
  }
};

// DELETE /api/alertes/:id - supprimer une alerte
exports.deleteAlerte = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM alertes WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alerte introuvable.' });
    }
    res.json({ message: 'Alerte supprimée.' });
  } catch (err) {
    console.error('Erreur deleteAlerte:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'alerte.' });
  }
};