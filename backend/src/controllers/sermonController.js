// backend/src/controllers/sermonController.js
const Sermon = require('../models/Sermon');
const { uploadToBackblaze, deleteFromBackblaze } = require('../utils/backblaze');
const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { Readable } = require('stream');  

ffmpeg.setFfmpegPath(ffmpegPath);

exports.getAllSermons = async (req, res) => {
  try {
    const { ministere, theme, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filtre ministère (multi-sélection)
    if (ministere) {
      query.ministere = { $in: Array.isArray(ministere) ? ministere : [ministere] };
    }

    // Filtre thème
    if (theme) query.theme = theme;

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i'); 
      query.$or = [
        { titre: searchRegex },
        { orateur: searchRegex },
        { theme: searchRegex },
        { description: searchRegex }
      ];
    }

    const sermons = await Sermon.find(query)
      .sort({ datePublication: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('uploadedBy', 'nom prenoms tel role');

    const total = await Sermon.countDocuments(query);

    res.status(200).json({
      success: true,
      data: sermons,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur getAllSermons:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération des sermons' });
  }
};

exports.getRecommendedSermons = async (req, res) => {
  try {
    const { tag, limit = 40 } = req.query;

    if (!tag) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre "tag" est obligatoire pour les recommandations'
      });
    }

    const sermons = await Sermon.aggregate([
      { $match: { tags: tag } },                    // Filtre EXCLUSIF sur tags
      { $sample: { size: Number(limit) } },         // 40 sermons complètement aléatoires
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'uploadedBy'
        }
      },
      { $unwind: { path: '$uploadedBy', preserveNullAndEmptyArrays: true } }
    ]);

    res.status(200).json({
      success: true,
      data: sermons
    });
  } catch (error) {
    console.error('Erreur getRecommendedSermons:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des recommandations'
    });
  }
};

exports.getSermonById = async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id)
      .populate('uploadedBy', 'nom prenoms tel');
    if (!sermon) {
      return res.status(404).json({ success: false, message: 'Sermon non trouvé' });
    }
    res.status(200).json({ success: true, data: sermon });
  } catch (error) {
    console.error('Erreur getSermonById:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.createSermon = async (req, res) => {
  try {
    const {
      titre, theme, orateur, orateurTitre, description, ministere,
      typeMedia, duree: dureeManuelle, isPremium = false, tags = []
    } = req.body;

    if (!req.files?.video?.[0] || !req.files?.thumbnail?.[0]) {
      return res.status(400).json({ success: false, message: 'Vidéo et miniature obligatoires' });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];

    // Upload direct vers Backblaze
    const videoUpload = await uploadToBackblaze(videoFile.buffer, videoFile.originalname);
    const thumbUpload = await uploadToBackblaze(thumbnailFile.buffer, thumbnailFile.originalname);

    // Détection automatique de durée
    let dureeFinale = dureeManuelle;
    if (typeMedia === 'video') {
      try {
        const videoStream = Readable.from(videoFile.buffer);
        const durationSeconds = await new Promise((resolve, reject) => {
          ffmpeg.ffprobe(videoStream, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration);
          });
        });
        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        const seconds = Math.floor(durationSeconds % 60);
        dureeFinale = hours > 0
          ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } catch (probeError) {
        console.warn('⚠️ Impossible de détecter la durée automatiquement → utilisation de la durée manuelle');
        if (!dureeManuelle) {
          return res.status(400).json({ success: false, message: 'Durée manuelle requise (détection auto échouée)' });
        }
      }
    }
    const sermon = new Sermon({
      titre,
      theme,
      orateur,
      orateurTitre,
      description,
      ministere: Array.isArray(ministere) ? ministere : [ministere], 
      typeMedia,
      urlMedia: videoUpload.url,
      urlThumbnail: thumbUpload.url,
      duree: dureeFinale,
      isPremium: isPremium === 'true' || isPremium === true,
      uploadedBy: req.user.id,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [])
    });

    await sermon.save();

    res.status(201).json({
      success: true,
      message: 'Sermon ajouté avec succès',
      data: sermon
    });
  } catch (error) {
    console.error('Erreur createSermon:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur serveur lors de la création du sermon'
    });
  }
};

exports.deleteSermon = async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    if (!sermon) {
      return res.status(404).json({ success: false, message: 'Sermon non trouvé' });
    }

    await Promise.all([
      deleteFromBackblaze(sermon.urlMedia),
      deleteFromBackblaze(sermon.urlThumbnail)
    ]);

    await Sermon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Sermon supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteSermon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du sermon'
    });
  }
};
