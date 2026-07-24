// backend/routes/positionRoutes.js
const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');

// Recevoir une position envoyée par le téléphone du chauffeur
router.post('/', positionController.createPosition);

// Activer / désactiver le statut "en service" d'un chauffeur
router.put('/:id/service', positionController.setEnService);

// Récupérer les positions en direct de tous les chauffeurs en service (pour la carte web)
router.get('/live', positionController.getLivePositions);

// Historique des positions d'un chauffeur précis
router.get('/:id/historique', positionController.getPositionsByChauffeur);

module.exports = router;