// backend/create-admin.js
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ ERREUR : MONGO_URI non définie dans le container');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB Atlas réussie');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Un admin existe déjà :', existingAdmin.tel);
      process.exit(0);
    }

    const admin = new User({
      nom: "Admin",
      prenoms: "Super",
      tel: "90000000",
      ministere: "Pasteur",
      motDePasse: "Admin12345!", 
      role: "admin",
      isPremium: true
    });

    await admin.save();

    console.log('\n🎉 ADMIN CRÉÉ AVEC SUCCÈS !');
    console.log('Tel          : 90000000');
    console.log('Mot de passe : Admin12345!');
    console.log('Rôle         : admin');
    console.log('\nTu peux maintenant te connecter à l\'Admin Web avec ces identifiants.');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin :', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();