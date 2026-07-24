const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ⚠️ adapte ce chemin/nom si ta connexion s'appelle autrement

// GET /api/cooperatives — liste toutes les coopératives
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM cooperatives');
    res.json(rows);
  } catch (err) {
    console.error('Erreur /api/cooperatives :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des coopératives.' });
  }
});

// GET /api/cooperatives/:id — une seule coopérative
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM cooperatives WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Coopérative non trouvée.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erreur /api/cooperatives/:id :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de la coopérative.' });
  }
});

// POST /api/cooperatives — créer une coopérative
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Le nom de la coopérative est requis.' });
  }
  try {
    const [result] = await db.query('INSERT INTO cooperatives (name) VALUES (?)', [name.trim()]);
    res.status(201).json({ id: result.insertId, name: name.trim() });
  } catch (err) {
    console.error('Erreur POST /api/cooperatives :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la coopérative.' });
  }
});

module.exports = router;