// backend/controllers/busController.js
// CRUD complet pour les lignes de bus (compatible PageLignes.jsx)

const db = require('../config/db');

// ──────────────────────────────────────────────
// Utilitaire : formater une ligne depuis la BDD
// ──────────────────────────────────────────────
function formatLigne(row) {
  return {
    id:        row.id,
    code:      row.ref   || `L-${String(row.id).padStart(3,'0')}`,
    nom:       row.nom   || row.name || 'Sans titre',
    ref:       row.ref,
    name:      row.name  || row.nom,
    depart:    row.depart   || 'Départ',
    arrivee:   row.arrivee  || 'Arrivée',
    coop:      row.coop     || row.operator || 'Autre',
    statut:    row.statut   || 'inactive',
    tarif:     Number(row.tarif)     || 0,
    distance:  Number(row.distance)  || 0,
    duree:     row.duree    || 'N/A',
    vehicules: Number(row.vehicules) || 0,
    activite:  row.activite || 'Jamais',
    date:      row.created_at
      ? new Date(row.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
      : 'N/A',
  };
}

// ──────────────────────────────────────────────
// GET /api/lignes  — liste toutes les lignes
// ──────────────────────────────────────────────
exports.getAllLignes = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM bus_routes ORDER BY ref ASC`
    );
    res.json(rows.map(formatLigne));
  } catch (err) {
    console.error('getAllLignes:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ──────────────────────────────────────────────
// GET /api/lignes/:id  — une seule ligne
// ──────────────────────────────────────────────
exports.getLigneById = async (req, res) => {
  try {
    const idStr = String(req.params.id);
    
    // Validation : doit être un nombre
    if (!/^\d+$/.test(idStr)) {
      return res.status(400).json({ message: 'ID invalide' });
    }

    const [rows] = await db.query(
      `SELECT * FROM bus_routes WHERE id = ?`,
      [idStr]
    );
    if (!rows.length) return res.status(404).json({ message: 'Ligne introuvable' });
    res.json(formatLigne(rows[0]));
  } catch (err) {
    console.error('getLigneById:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ──────────────────────────────────────────────
// POST /api/lignes  — créer une nouvelle ligne
// ──────────────────────────────────────────────
exports.createLigne = async (req, res) => {
  const {
    code, nom, depart, arrivee,
    coop, statut, tarif, distance, duree, vehicules,
  } = req.body;

  // Validations minimales
  if (!code || !depart || !arrivee) {
    return res.status(400).json({ message: 'code, depart et arrivee sont obligatoires' });
  }

  try {
    // Vérifier unicité du code (ref)
    const [exist] = await db.query(
      `SELECT id FROM bus_routes WHERE ref = ?`, [code]
    );
    if (exist.length) {
      return res.status(409).json({ message: `Le code ${code} existe déjà` });
    }

    const [result] = await db.query(
      `INSERT INTO bus_routes
         (ref, name, operator, nom, depart, arrivee, coop, statut, tarif, distance, duree, vehicules, activite)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        nom || `${depart} – ${arrivee}`,
        coop || null,
        nom || `${depart} – ${arrivee}`,
        depart,
        arrivee,
        coop || null,
        statut   || 'active',
        tarif    || 0,
        distance || 0,
        duree    || null,
        vehicules || 0,
        "Vient d'être créé",
      ]
    );

    const [rows] = await db.query(`SELECT * FROM bus_routes WHERE id = ?`, [result.insertId]);
    res.status(201).json(formatLigne(rows[0]));
  } catch (err) {
    console.error('createLigne:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ──────────────────────────────────────────────
// PUT /api/lignes/:id  — modifier une ligne
// ──────────────────────────────────────────────
exports.updateLigne = async (req, res) => {
  // Conversion BigInt pour les ID de type OSM (très grands nombres)
  const idStr = String(req.params.id);

  const {
    code, nom, depart, arrivee,
    coop, statut, tarif, distance, duree, vehicules,
  } = req.body;

  try {
    // Vérifier existence — comparaison en string pour éviter le dépassement JS number
    const [exist] = await db.query(
      `SELECT id, ref FROM bus_routes WHERE id = ?`, [idStr]
    );
    if (!exist.length) return res.status(404).json({ message: 'Ligne introuvable' });

    const currentRef = exist[0].ref;

    // Vérifier unicité du code SEULEMENT si le code a vraiment changé
    if (code && code !== currentRef) {
      const [dup] = await db.query(
        `SELECT id FROM bus_routes WHERE ref = ? AND id <> ?`,
        [code, idStr]
      );
      if (dup.length) {
        return res.status(409).json({ message: `Le code ${code} est déjà utilisé par une autre ligne` });
      }
    }

    await db.query(
      `UPDATE bus_routes SET
         ref       = COALESCE(?, ref),
         name      = COALESCE(?, name),
         operator  = COALESCE(?, operator),
         nom       = COALESCE(?, nom),
         depart    = COALESCE(?, depart),
         arrivee   = COALESCE(?, arrivee),
         coop      = COALESCE(?, coop),
         statut    = COALESCE(?, statut),
         tarif     = COALESCE(?, tarif),
         distance  = COALESCE(?, distance),
         duree     = COALESCE(?, duree),
         vehicules = COALESCE(?, vehicules),
         activite  = 'Modifié récemment'
       WHERE id = ?`,
      [
        code     || null,
        nom      || null,
        coop     || null,
        nom      || null,
        depart   || null,
        arrivee  || null,
        coop     || null,
        statut   || null,
        tarif    !== undefined ? tarif    : null,
        distance !== undefined ? distance : null,
        duree    || null,
        vehicules !== undefined ? vehicules : null,
        idStr,
      ]
    );

    const [rows] = await db.query(`SELECT * FROM bus_routes WHERE id = ?`, [idStr]);
    res.json(formatLigne(rows[0]));
  } catch (err) {
    console.error('updateLigne:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ──────────────────────────────────────────────
// DELETE /api/lignes/:id  — supprimer une ligne
// ──────────────────────────────────────────────
exports.deleteLigne = async (req, res) => {
  const idStr = String(req.params.id);
  try {
    const [exist] = await db.query(`SELECT id FROM bus_routes WHERE id = ?`, [idStr]);
    if (!exist.length) return res.status(404).json({ message: 'Ligne introuvable' });

    // Supprimer les liaisons arrêts en cascade d'abord
    await db.query(`DELETE FROM route_stops WHERE route_id = ?`, [idStr]);
    await db.query(`DELETE FROM bus_routes  WHERE id = ?`,       [idStr]);

    res.json({ message: 'Ligne supprimée avec succès', id: idStr });
  } catch (err) {
    console.error('deleteLigne:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ──────────────────────────────────────────────
// GET /api/lignes/:id/arrets  — liste des arrêts d'une ligne
// ──────────────────────────────────────────────
exports.getArretsByLigne = async (req, res) => {
  const idStr = String(req.params.id);

  if (!/^\d+$/.test(idStr)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  try {
    const [rows] = await db.query(
  `SELECT
     bs.id,
     bs.name,
     ST_X(bs.location) AS lng,
     ST_Y(bs.location) AS lat
   FROM route_stops rs
   JOIN bus_stops bs ON bs.id = rs.stop_id
   WHERE rs.route_id = ?
   ORDER BY bs.id ASC`,
  [idStr]
);

    const arrets = rows.map(r => ({
      id: r.id,
      name: r.name || 'Arrêt',
      lat: Number(r.lat),
      lng: Number(r.lng),
    }));

    res.json(arrets);
  } catch (err) {
    console.error('getArretsByLigne:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};