const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

const {
  getAllLignes,
  getLigneById,
  createLigne,
  updateLigne,
  deleteLigne,
  getArretsByLigne
} = require('../controllers/busController');

// ── Routes GPS pour SuiviGPS ──────────────────────────────────
router.get('/routes', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, ref, name, depart, arrivee, coop,
             statut, tarif, distance, duree, vehicules,
             ST_AsText(route_geom) AS geom
      FROM bus_routes
      ORDER BY ref ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('[GET /routes]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/stops', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, ST_AsText(location) AS geom
      FROM bus_stops
    `);
    res.json(rows);
  } catch (err) {
    console.error('[GET /stops]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── Route arrêts d'une ligne (DOIT être avant /:id) ───────────
router.get('/:id/arrets', getArretsByLigne);

// ── Routes CRUD ───────────────────────────────────────────────
router.get('/',       getAllLignes);
router.post('/',      createLigne);

router.get('/:id',    getLigneById);
router.put('/:id',    updateLigne);
router.delete('/:id', deleteLigne);

module.exports = router;