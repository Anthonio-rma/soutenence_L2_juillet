const express = require('express');
const router = express.Router();
const alerteController = require('../controllers/alerteController');

router.get('/', alerteController.getAlertes);
router.post('/', alerteController.createAlerte);
router.put('/:id', alerteController.updateAlerte);
router.delete('/:id', alerteController.deleteAlerte);

module.exports = router;