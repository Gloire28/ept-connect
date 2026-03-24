// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification JWT
 * Vérifie le token dans Authorization: Bearer <token>
 * Attache l'utilisateur décodé à req.user (userId + role)
 * Utilisé pour toutes les routes protégées
 */
const authMiddleware = (req, res, next) => {
  // 1. Récupérer le token de l'en-tête
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Accès refusé : token manquant ou mal formaté (Bearer requis)'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accès refusé : token vide'
    });
  }

  try {
    // 2. Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attacher les infos utilisateur à la requête
    req.user = {
      id: decoded.id,
      role: decoded.role || 'user' // rôle par défaut 'user' (mobile), 'admin' pour web
    };

    // 4. Passer au middleware/route suivant
    next();
  } catch (error) {
    console.error('Erreur vérification JWT :', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expirée : veuillez vous reconnecter'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Token invalide ou corrompu'
    });
  }
};

/**
 * Middleware optionnel : restreint aux admins (pour admin-web uniquement)
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès interdit : droits administrateur requis'
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };