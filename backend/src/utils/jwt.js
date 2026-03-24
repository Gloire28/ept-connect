// backend/src/utils/jwt.js
const jwt = require('jsonwebtoken');

/**
 * Génère un token JWT signé
 * @param {Object} payload - Données à signer (id, role, etc.)
 * @returns {string} Token JWT
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Vérifie un token JWT (utilisé par le middleware)
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };