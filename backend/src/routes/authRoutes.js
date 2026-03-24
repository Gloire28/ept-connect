// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Simulation temporaire OTP (à remplacer par Twilio + stockage DB plus tard)
// Map : tel → { otp: string, expiresAt: Date }
const otpStore = new Map(); // DEV ONLY

// ====================== REGISTER ======================
router.post('/register', async (req, res) => {
  const { nom, prenoms, tel, ministere, motDePasse } = req.body;

  if (!nom || !prenoms || !tel || !motDePasse) {
    return res.status(400).json({
      success: false,
      message: 'Tous les champs obligatoires : nom, prénoms, tel, motDePasse'
    });
  }

  try {
    let user = await User.findOne({ tel });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Ce numéro de téléphone est déjà utilisé'
      });
    }

    user = new User({
      nom,
      prenoms,
      tel,
      ministere: ministere || 'Autre',
      motDePasse
    });
    await user.save();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    otpStore.set(tel, { otp, expiresAt, userId: user._id });

    console.log(`[OTP SIMULÉ - REGISTER] Tel: ${tel} | Code: ${otp} | Expire: ${expiresAt}`);

    // ← AJOUT IMPORTANT : on renvoie le code en mode dev
    const responseData = {
      telephone: tel,
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    };

    res.status(201).json({
      success: true,
      message: 'Inscription réussie. Code OTP envoyé (simulé en console)',
      data: responseData
    });
  } catch (error) {
    console.error('Erreur register :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription'
    });
  }
});

// ====================== VERIFY OTP ======================
router.post('/verify-otp', async (req, res) => {
  const { tel, otp } = req.body;
  if (!tel || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Téléphone et OTP obligatoires'
    });
  }

  const stored = otpStore.get(tel);
  if (!stored) {
    return res.status(400).json({
      success: false,
      message: 'Aucune demande OTP en cours'
    });
  }

  if (new Date() > stored.expiresAt) {
    otpStore.delete(tel);
    return res.status(400).json({
      success: false,
      message: 'Code OTP expiré'
    });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: 'Code OTP incorrect'
    });
  }

  otpStore.delete(tel);

  try {
    const user = await User.findById(stored.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const payload = {
      id: user._id,
      tel: user.tel,
      role: user.role,
      isPremium: user.isPremium
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    res.status(200).json({
      success: true,
      message: 'Vérification réussie - Bienvenue !',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenoms: user.prenoms,
        tel: user.tel,
        ministere: user.ministere,
        role: user.role,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('Erreur verify-otp :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ====================== LOGIN-OTP ======================
router.post('/login-otp', async (req, res) => {
  const { tel } = req.body;
  if (!tel) {
    return res.status(400).json({
      success: false,
      message: 'Téléphone obligatoire'
    });
  }

  try {
    const user = await User.findOne({ tel });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun compte associé à ce numéro'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    otpStore.set(tel, { otp, expiresAt, userId: user._id });

    console.log(`[OTP SIMULÉ - LOGIN] Tel: ${tel} | Code: ${otp} | Expire: ${expiresAt}`);

    // ← AJOUT IMPORTANT : on renvoie le code en mode dev
    const responseData = {
      telephone: tel,
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    };

    res.status(200).json({
      success: true,
      message: 'Code OTP envoyé pour connexion (simulé en console)',
      data: responseData
    });
  } catch (error) {
    console.error('Erreur login-otp :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ====================== LOGIN (Mobile User + Admin Web) ======================
router.post('/login', async (req, res) => {
  const { tel, motDePasse } = req.body;

  console.log('🔍 [LOGIN] Requête reçue → tel:', tel, 'motDePasse: ***');

  if (!tel || !motDePasse) {
    return res.status(400).json({
      success: false,
      message: 'Téléphone et mot de passe obligatoires'
    });
  }

  try {
    const user = await User.findOne({ tel }).select('+motDePasse');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }

    // Vérification mot de passe
    const isMatch = await user.comparePassword(motDePasse);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }

    // Connexion autorisée pour user ET admin
    const payload = {
      id: user._id,
      tel: user.tel,
      role: user.role || 'user',
      isPremium: user.isPremium,
      nom: user.nom,
      prenoms: user.prenoms,
      ministere: user.ministere
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    console.log(`✅ Connexion réussie → Rôle: ${user.role || 'user'}`);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenoms: user.prenoms,
        tel: user.tel,
        ministere: user.ministere,
        role: user.role || 'user',
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('❌ Erreur login :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ====================== LOGIN USER (MOBILE) - NOUVEL ENDPOINT ======================
router.post('/login-user', async (req, res) => {
  const { tel, motDePasse } = req.body;
  console.log('🔍 [LOGIN USER MOBILE] Requête reçue → tel:', tel);

  if (!tel || !motDePasse) {
    return res.status(400).json({ success: false, message: 'Téléphone et mot de passe obligatoires' });
  }

  try {
    const user = await User.findOne({ tel }).select('+motDePasse');
    if (!user) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    const isMatch = await user.comparePassword(motDePasse);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    const payload = {
      id: user._id,
      tel: user.tel,
      role: user.role || 'user',
      isPremium: user.isPremium,
      nom: user.nom,
      prenoms: user.prenoms,
      ministere: user.ministere
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

    res.status(200).json({
      success: true,
      message: 'Connexion mobile réussie',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenoms: user.prenoms,
        tel: user.tel,
        ministere: user.ministere,
        role: user.role || 'user',
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('❌ Erreur login-user :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;