const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const noCache = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};

router.get('/',     noCache, userController.getUsers);
router.get('/:id',  noCache, userController.getUserById);
router.put('/:id',           userController.updateUser);
router.delete('/:id',        userController.deleteUser);

module.exports = router;