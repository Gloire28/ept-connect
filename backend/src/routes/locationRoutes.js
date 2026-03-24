// backend/src/routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const locationController = require('../controllers/locationController');

// ====================== ROUTES PUBLIQUES (tout le monde peut voir les lieux) ======================
router.get('/', locationController.getAllLocations);           
router.get('/:id', locationController.getLocationById);        

// ====================== ROUTES ADMIN (seuls les admins peuvent créer/supprimer) ======================
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  locationController.createLocation     
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  locationController.deleteLocation
);

module.exports = router;