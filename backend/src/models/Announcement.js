// backend/src/models/Announcement.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre de l\'annonce est obligatoire'],
    trim: true,
    minlength: [5, 'Le titre doit contenir au moins 5 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    trim: true,
    maxlength: [1500, 'Description trop longue (max 1500 caractères)']
  },
  imageUrl: {
    type: String,
    required: [true, 'L\'image principale de l\'annonce est obligatoire']
  },
  lienExterne: {
    type: String,
    trim: true
    
  },
  dateDebut: {
    type: Date,
    required: [true, 'La date de début est obligatoire']
  },
  dateFin: {
    type: Date,
    required: [true, 'La date de fin est obligatoire']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false // Freemium : certaines annonces réservées premium
  },
  priorite: {
    type: Number,
    default: 0,
    min: 0,
    max: 10 // Plus haut = plus visible en haut du feed
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

// Indexes pour feed actif + priorité + date
announcementSchema.index({ isActive: 1, priorite: -1, dateDebut: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);