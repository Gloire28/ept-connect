// backend/src/models/Sermon.js
const mongoose = require('mongoose');

const ministereEnum = [
  'Hommes', 'Femmes', 'Jeunesse', 'Enfants', 'Chorale', 'Évangélisation',
  'Prière', 'Louange', 'Pasteur', 'Autre'
];

const sermonSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre du sermon est obligatoire'],
    trim: true,
    minlength: [5, 'Le titre doit contenir au moins 5 caractères']
  },
  theme: {
    type: String,
    required: [true, 'Le thème du sermon est obligatoire'],
    trim: true
  },
  orateur: {
    type: String,
    required: [true, 'L\'orateur est obligatoire'],
    trim: true
  },
  orateurTitre: {
    type: String,
    required: [true, 'Le titre de l\'orateur est obligatoire'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    trim: true,
    maxlength: [1000, 'La description ne doit pas dépasser 1000 caractères']
  },
  ministere: {
    type: [String],                    
    enum: ministereEnum,
    required: [true, 'Le ministère concerné est obligatoire'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Au moins un ministère doit être sélectionné'
    }
  },
  typeMedia: {
    type: String,
    enum: ['video', 'audio'],
    required: [true, 'Type de média obligatoire (video ou audio)']
  },
  urlMedia: {
    type: String,
    required: [true, 'L\'URL du média est obligatoire']
  },
  urlThumbnail: {
    type: String,
    required: [true, 'La miniature est obligatoire']
  },
  duree: {
    type: String,
    required: [true, 'La durée est obligatoire']
  },
  datePublication: {
    type: Date,
    default: Date.now
  },
  vues: {
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
    enum: ministereEnum,
    trim: true
  }]
}, {
  timestamps: true
});

sermonSchema.index({ ministere: 1, datePublication: -1 });
sermonSchema.index({ theme: 1 });
sermonSchema.index({ tags: 1 }); 

module.exports = mongoose.model('Sermon', sermonSchema);