// backend/src/routes/downloadRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const downloadController = require('../controllers/downloadController');

// Route unique pour tous les téléchargements (protégée JWT)
router.get('/:ressource/:id', authMiddleware, downloadController.downloadContent);

module.exports = router;