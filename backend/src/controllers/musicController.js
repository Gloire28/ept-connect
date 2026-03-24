const Music = require('../models/Music');
const { uploadToBackblaze, deleteFromBackblaze } = require('../utils/backblaze');
const fs = require('fs').promises;
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

exports.getAllMusic = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { titre: searchRegex },
        { artiste: searchRegex },
        { album: searchRegex },
        { description: searchRegex }
      ];
    }

    const music = await Music.find(query)
      .sort({ datePublication: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('uploadedBy', 'nom prenoms tel role');

    const total = await Music.countDocuments(query);

    res.status(200).json({
      success: true,
      data: music,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur getAllMusic:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getMusicById = async (req, res) => {
  try {
    const music = await Music.findById(req.params.id)
      .populate('uploadedBy', 'nom prenoms tel');

    if (!music) {
      return res.status(404).json({ success: false, message: 'Musique non trouvée' });
    }

    res.status(200).json({ success: true, data: music });
  } catch (error) {
    console.error('Erreur getMusicById:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.createMusic = async (req, res) => {
  try {
    const {
      titre, artiste, album, description, typeMedia,
      duree: dureeManuelle, paroles, isPremium = false, tags = ''
    } = req.body;

    if (!req.files?.media?.[0] || !req.files?.thumbnail?.[0]) {
      return res.status(400).json({
        success: false,
        message: 'Fichier média et miniature obligatoires'
      });
    }

    const mediaFile = req.files.media[0];
    const thumbFile = req.files.thumbnail[0];

    // Upload direct depuis buffer (RAM)
    const mediaUpload = await uploadToBackblaze(mediaFile.buffer, mediaFile.originalname);
    const thumbUpload = await uploadToBackblaze(thumbFile.buffer, thumbFile.originalname);

    // Détection durée via stream
    let dureeFinale = dureeManuelle;
    if (typeMedia === 'video' || typeMedia === 'audio') {
      try {
        const mediaStream = Readable.from(mediaFile.buffer);
        const durationSeconds = await new Promise((resolve, reject) => {
          ffmpeg.ffprobe(mediaStream, (err, metadata) => {
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

        console.log(`✅ Durée détectée pour musique : ${dureeFinale}`);
      } catch (probeError) {
        console.warn('⚠️ Détection durée impossible → utilisation durée manuelle');
        if (!dureeManuelle) {
          return res.status(400).json({
            success: false,
            message: 'Durée manuelle requise (détection auto échouée)'
          });
        }
      }
    }

    const music = new Music({
      titre,
      artiste,
      album,
      description,
      typeMedia,
      urlMedia: mediaUpload.url,
      urlThumbnail: thumbUpload.url,
      duree: dureeFinale,
      paroles,
      isPremium: isPremium === 'true' || isPremium === true,
      uploadedBy: req.user.id,
      tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags
    });

    await music.save();

    res.status(201).json({
      success: true,
      message: 'Musique ajoutée avec succès',
      data: music
    });

  } catch (error) {
    console.error('Erreur createMusic:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur serveur lors de la création de la musique' 
    });
  }
};

exports.deleteMusic = async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) {
      return res.status(404).json({ success: false, message: 'Musique non trouvée' });
    }

    await Promise.all([
      deleteFromBackblaze(music.urlMedia),
      deleteFromBackblaze(music.urlThumbnail)
    ]);

    await Music.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Musique supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteMusic:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la musique'
    });
  }
};