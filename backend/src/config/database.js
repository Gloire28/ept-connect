// backend/src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  console.log('Tentative de connexion à MongoDB Atlas...');
  console.log('URI utilisée :', uri ? '*** (masquée pour sécurité)' : 'NON DÉFINIE !');

  if (!uri) {
    console.error('❌ ERREUR : Aucune variable MONGO_URI trouvée dans le .env');
    console.error('Vérifie que la ligne MONGO_URI=... est bien présente et sans fautes de frappe.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);

    console.log('✅ CONNEXION MONGO ATLAS RÉUSSIE !');
    console.log(` → Base de données : ${conn.connection.name}`);
    console.log(` → Host : ${conn.connection.host}`);
    console.log(` → État de la connexion : ${conn.connection.readyState} (1 = connecté)`);
  } catch (error) {
    console.error('❌ ÉCHEC CONNEXION MONGO ATLAS');
    console.error('Message d\'erreur complet :', error.message);
    console.error('Stack trace complète :', error.stack);
  }
};

module.exports = connectDB;