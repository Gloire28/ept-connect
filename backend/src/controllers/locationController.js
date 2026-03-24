// backend/src/controllers/locationController.js
const LieuDeCulte = require('../models/LieuDeCulte');
const { uploadToBackblaze, deleteFromBackblaze } = require('../utils/backblaze');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Seules les images JPG, PNG, WEBP sont autorisées'), false);
  }
});

// ====================== PUBLIC ======================
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await LieuDeCulte.find({ isActive: true })
      .sort({ nom: 1 })
      .select('-__v');
    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('Erreur getAllLocations:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const location = await LieuDeCulte.findById(req.params.id);
    if (!location || !location.isActive) {
      return res.status(404).json({ success: false, message: 'Lieu de culte non trouvé' });
    }
    res.status(200).json({ success: true, data: location });
  } catch (error) {
    console.error('Erreur getLocationById:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ====================== ADMIN ======================
exports.createLocation = async (req, res) => {
  try {
    const {
      nom, adresse, quartier, ville = 'Lomé', pays = 'Togo',
      latitude, longitude, pasteurResponsable, telephone, horaires
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude et longitude obligatoires' });
    }

    // === NOUVEAU : Parsing du tableau horaires ===
    let horairesParsed = [];
    if (horaires) {
      try {
        horairesParsed = typeof horaires === 'string' 
          ? JSON.parse(horaires) 
          : Array.isArray(horaires) ? horaires : [];
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Format des horaires invalide (doit être un tableau JSON)' });
      }
    }

    let imageUrl = null;
    if (req.file) {
      const uploadResult = await uploadToBackblaze(req.file.buffer, req.file.originalname);
      imageUrl = uploadResult.url;
    }

    const location = new LieuDeCulte({
      nom,
      adresse,
      quartier,
      ville,
      pays,
      coordinates: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      pasteurResponsable,
      telephone,
      horaires: horairesParsed,           // ← Tableau d'objets maintenant
      imageUrl,
      uploadedBy: req.user.id
    });

    await location.save();

    res.status(201).json({
      success: true,
      message: 'Lieu de culte enregistré avec succès',
      data: location
    });
  } catch (error) {
    console.error('Erreur createLocation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const location = await LieuDeCulte.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Lieu non trouvé' });
    }
    if (location.imageUrl) {
      await deleteFromBackblaze(location.imageUrl);
    }
    await LieuDeCulte.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Lieu de culte supprimé' });
  } catch (error) {
    console.error('Erreur deleteLocation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
