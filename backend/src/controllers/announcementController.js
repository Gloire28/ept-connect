// backend/src/controllers/announcementController.js
const Announcement = require('../models/Announcement');
const { uploadToBackblaze,  deleteFromBackblaze } = require('../utils/backblaze');
const fs = require('fs').promises;

exports.getAllAnnouncements = async (req, res) => {
  try {
    const { activeOnly = 'true', page = 1, limit = 10 } = req.query;

    const query = {};
    if (activeOnly === 'true') {
      query.isActive = true;
      query.dateDebut = { $lte: new Date() };
      query.dateFin = { $gte: new Date() };
    }

    const announcements = await Announcement.find(query)
      .sort({ priorite: -1, dateDebut: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('uploadedBy', 'nom prenoms tel role');

    const total = await Announcement.countDocuments(query);

    res.status(200).json({
      success: true,
      data: announcements,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur getAllAnnouncements:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('uploadedBy', 'nom prenoms tel');

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
    }

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    console.error('Erreur getAnnouncementById:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const {
      titre,
      description,
      lienExterne,
      dateDebut,
      dateFin,
      isActive = true,
      isPremium = false,
      priorite = 0,
      tags = ''
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image principale obligatoire'
      });
    }

    const imageFile = req.file;

    // Upload direct depuis buffer
    const imageUpload = await uploadToBackblaze(imageFile.buffer, imageFile.originalname);

    const announcement = new Announcement({
      titre,
      description,
      imageUrl: imageUpload.url,
      lienExterne,
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      isActive: isActive === 'true' || isActive === true,
      isPremium: isPremium === 'true' || isPremium === true,
      priorite: Number(priorite),
      uploadedBy: req.user.id,
      tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags
    });

    await announcement.save();

    res.status(201).json({
      success: true,
      message: 'Annonce ajoutée avec succès',
      data: announcement
    });

  } catch (error) {
    console.error('Erreur createAnnouncement:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur serveur lors de la création de l’annonce' 
    });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
    }

    // Suppression réelle de l’image sur Backblaze + Bunny.net
    await deleteFromBackblaze(announcement.imageUrl);

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Annonce supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteAnnouncement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l’annonce'
    });
  }
};