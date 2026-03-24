// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères']
  },
  prenoms: {
    type: String,
    required: [true, 'Les prénoms sont obligatoires'],
    trim: true,
    minlength: [2, 'Les prénoms doivent contenir au moins 2 caractères']
  },
  tel: {
    type: String,
    required: [true, 'Le numéro de téléphone est obligatoire'],
    unique: true,
    trim: true,
    match: [/^(7|9|6)\d{7}$/,]
  },
  ministere: {
    type: String,
    enum: [
      'Hommes', 'Femmes', 'Jeunesse', 'Enfants', 'Chorale', 'Évangélisation',
      'Prière', 'Louange', 'Pasteur', 'Autre'
    ],
    default: 'Autre'
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false 
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user' 
  },
  isPremium: {
    type: Boolean,
    default: false 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true 
});


// Hook pre-save : hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('motDePasse')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer le mot de passe lors du login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.motDePasse);
};

module.exports = mongoose.model('User', userSchema);