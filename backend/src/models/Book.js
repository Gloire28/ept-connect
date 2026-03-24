// backend/src/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre du livre est obligatoire'],
    trim: true,
    minlength: [3, 'Le titre doit contenir au moins 3 caractères']
  },
  auteur: {
    type: String,
    required: [true, 'L\'auteur est obligatoire'],
    trim: true
  },
  editeur: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Une description est obligatoire'],
    trim: true,
    maxlength: [1000, 'Description trop longue (max 1000 caractères)']
  },
  categorie: {
    type: String,
    required: [true, 'La catégorie est obligatoire'],
    trim: true
    // ex. Étude biblique, Témoignage, Louange, Jeunesse...
  },
  format: {
    type: String,
    enum: ['pdf', 'epub'],
    required: [true, 'Format obligatoire : pdf ou epub']
  },
  urlFichier: {
    type: String,
    required: [true, 'L\'URL du fichier (Backblaze/Bunny) est obligatoire']
  },
  urlCouverture: {
    type: String,
    required: [true, 'La couverture est obligatoire']
  },
  nombrePages: {
    type: Number,
    required: [true, 'Le nombre de pages est obligatoire']
  },
  datePublication: {
    type: Date,
    default: Date.now
  },
  telechargements: {
    type: Number,
    default: 0
  },
  isPremium: {
    type: Boolean,
    default: false // Freemium
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

// Indexes pour feed
bookSchema.index({ datePublication: -1 });
bookSchema.index({ categorie: 1 });

module.exports = mongoose.model('Book', bookSchema);