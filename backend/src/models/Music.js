// backend/src/models/Music.js
const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre de la musique est obligatoire'],
    trim: true,
    minlength: [3, 'Le titre doit contenir au moins 3 caractères']
  },
  artiste: {
    type: String,
    required: [true, 'L\'artiste ou le groupe est obligatoire'],
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Une description est obligatoire'],
    trim: true,
    maxlength: [800, 'Description trop longue (max 800 caractères)']
  },
  typeMedia: {
    type: String,
    enum: ['audio', 'video'],
    required: [true, 'Type obligatoire : audio ou video']
  },
  urlMedia: {
    type: String,
    required: [true, 'L\'URL du média (Backblaze/Bunny) est obligatoire']
  },
  urlThumbnail: {
    type: String,
    required: [true, 'La miniature est obligatoire']
  },
  duree: {
    type: String,
    required: [true, 'La durée est obligatoire'] 
  },
  paroles: {
    type: String,
    trim: true,
    maxlength: [5000, 'Paroles trop longues']
  },
  datePublication: {
    type: Date,
    default: Date.now
  },
  vues: {
    type: Number,
    default: 0
  },
  telechargements: {
    type: Number,
    default: 0
  },
  isPremium: {
    type: Boolean,
    default: false 
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes pour feed rapide
musicSchema.index({ datePublication: -1 });
musicSchema.index({ artiste: 1 });

module.exports = mongoose.model('Music', musicSchema);