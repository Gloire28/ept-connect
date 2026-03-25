// backend/scripts/createAdmin.js
const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Un admin existe déjà :', existingAdmin.tel);
      process.exit(0);
    }

    const admin = new User({
      nom: "Admin",
      prenoms: "Super",
      tel: "71364248",           
      ministere: "Pasteur",
      motDePasse: "Glory", 
      role: "admin",
      isPremium: true
    });

    await admin.save();

    console.log('✅ Admin créé avec succès !');
    console.log('Tel     : 71364248');
    console.log('Mot de passe : Glory');
    console.log('Rôle    : admin');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin :', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
