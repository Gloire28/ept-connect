// backend/src/models/LieuDeCulte.js
const mongoose = require('mongoose');

const lieuDeCulteSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  adresse: { type: String, required: true, trim: true },
  quartier: { type: String, required: true, trim: true },
  ville: { type: String, required: true, trim: true, default: 'Lomé' },
  pays: { type: String, default: 'Togo' },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } 
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  pasteurResponsable: { type: String, trim: true },
  telephone: { type: String, trim: true },
  
  // === NOUVEAU : PLUSIEURS HORAIRES DE CULTE ===
  horaires: [{
    jour: { 
      type: String, 
      required: true,
      enum: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    },
    debut: { type: String, required: true },      
    fin: { type: String, required: true },        
    type: { 
      type: String, 
      enum: ['Culte principal', 'Culte de prière', 'Culte jeunesse', 'Réunion de prière', 'Autre'],
      default: 'Culte principal'
    }
  }],

  imageUrl: { type: String },
  isActive: { type: Boolean, default: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

lieuDeCulteSchema.index({ coordinates: '2dsphere' });
lieuDeCulteSchema.index({ ville: 1, quartier: 1 });

module.exports = mongoose.model('LieuDeCulte', lieuDeCulteSchema);