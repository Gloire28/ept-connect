// backend/create-admin.js
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect('mongodb://127.0.0.1:27017/eptconnect-local')
.then(async () => {
  await User.deleteOne({ tel: '71364248' });

  const admin = new User({
    nom: 'Admin',
    prenoms: 'Super',
    tel: '71364248',           
    ministere: 'Pasteur',
    motDePasse: 'admin123',
    role: 'admin',
    isPremium: true
  });

  await admin.save();
  console.log('✅ Admin créé avec succès ! Tel: 71364248 | Mot de passe : admin123');
  process.exit(0);
})
.catch(err => {
  console.error('Erreur :', err);
  process.exit(1);
});