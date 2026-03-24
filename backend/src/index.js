// backend/src/index.js
console.log('=== EPT Connect Backend - Chargement du fichier index.js ===');

const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');

dotenv.config();

console.log('Variables d\'environnement chargées (dotenv OK)');
console.log('PORT utilisé :', process.env.PORT || 5000);

const app = express();
const PORT = process.env.PORT || 5000;

// ========================
// MIDDLEWARES DE SÉCURITÉ (conformité Cahier des Charges Technique §4.2)
// ========================
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:19006',
    'http://192.168.1.68:19006',
    'http://192.168.1.68',
    'http://192.168.1.68:5000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Trop de requêtes, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

console.log('Middlewares installés');

// ========================
// ROUTES
// ========================
app.use('/api/auth', require('./routes/authRoutes'));
console.log('Routes auth montées sur /api/auth');

app.use('/api/sermons', require('./routes/sermonRoutes'));
console.log('Routes sermons montées sur /api/sermons');

app.use('/api/music', require('./routes/musicRoutes'));
console.log('Routes music montées sur /api/music');

app.use('/api/books', require('./routes/bookRoutes'));
console.log('Routes books montées sur /api/books');

app.use('/api/announcements', require('./routes/announcementRoutes'));
console.log('Routes announcements montées sur /api/announcements');

app.use('/api/locations', require('./routes/locationRoutes'));
console.log('Routes locations montées sur /api/locations');

app.use('/api/download', require('./routes/downloadRoutes'));
console.log('Routes download montées sur /api/download');

// Route de test racine (mise à jour Atlas)
app.get('/', (req, res) => {
  res.json({
    message: '🚀 EPT Connect Backend est en ligne !',
    version: '1.0.0',
    status: 'OK',
    dbStatus: 'Connecté à MongoDB Atlas (ept-connect)',
    env: process.env.NODE_ENV || 'development',
    authRoutesAvailable: true
  });
});

// ========================
// DÉMARRAGE ASYNCHRONE
// ========================
(async () => {
  try {
    console.log('→ Début connexion DB Atlas...');
    await connectDB();
    console.log('→ Connexion DB Atlas terminée avec succès');

    app.listen(PORT, () => {
      console.log(`\n✅ SERVEUR DÉMARRÉ SUR http://localhost:${PORT}`);
      console.log('Test 1 : ouvre http://localhost:5000/ dans ton navigateur');
      console.log('Test 2 : POST http://localhost:5000/api/auth/register (avec ton téléphone)');
      console.log('Test 3 : GET http://localhost:5000/api/locations (liste des lieux)');
    });
  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE AU DÉMARRAGE :');
    console.error(error.message);
    console.error(error.stack);
    console.log('Serveur reste en vie pour debug (arrête avec Ctrl+C)');
  }
})();

console.log('Fichier index.js chargé - attente fin du bloc async...');