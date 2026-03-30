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
console.log('NODE_ENV :', process.env.NODE_ENV || 'development');

const app = express();
const PORT = process.env.PORT || 5000;

// ========================
// MIDDLEWARES DE SÉCURITÉ (conformité Cahier des Charges Technique §4.2)
// ========================
app.use(helmet()); // Protection headers de sécurité

// CORS dynamique et sécurisé via variable d'environnement
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:19006'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,           // nécessaire pour JWT + cookies si besoin futur
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting renforcé sur toutes les routes API (anti-brute-force OTP/login)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100,
  message: { message: 'Trop de requêtes, veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

console.log('Middlewares installés - CORS autorisé pour :', allowedOrigins);

// ========================
// ROUTES
// ========================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sermons', require('./routes/sermonRoutes'));
app.use('/api/music', require('./routes/musicRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/download', require('./routes/downloadRoutes'));

// Route de test racine (production ready)
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
    
      console.log('✅ CORS configuré dynamiquement via ALLOWED_ORIGINS');
      console.log('✅ Rate-limiting + Helmet activés');
    });
  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE AU DÉMARRAGE :');
    console.error(error.message);
  }
})();