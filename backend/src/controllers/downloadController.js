// backend/src/controllers/downloadController.js
const Sermon = require('../models/Sermon');
const Music = require('../models/Music');
const Book = require('../models/Book');
const User = require('../models/User');


exports.downloadContent = async (req, res) => {
  try {
    const { ressource, id } = req.params;
    const userId = req.user.id; // Provenant du JWT via authMiddleware

    // 1. Vérification obligatoire : l'utilisateur doit être premium (pour TOUT téléchargement)
    const user = await User.findById(userId).select('isPremium');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    if (!user.isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Le téléchargement est réservé exclusivement aux membres premium'
      });
    }

    // 2. Identifier le type de contenu
    let Model, urlField, fileFieldName;
    switch (ressource.toLowerCase()) {
      case 'sermon':
        Model = Sermon;
        urlField = 'urlMedia';
        fileFieldName = 'Sermon';
        break;
      case 'music':
        Model = Music;
        urlField = 'urlMedia';
        fileFieldName = 'Musique';
        break;
      case 'book':
        Model = Book;
        urlField = 'urlFichier';
        fileFieldName = 'Livre';
        break;
      default:
        return res.status(400).json({ success: false, message: 'Type de ressource invalide' });
    }

    // 3. Récupérer le contenu
    const content = await Model.findById(id);
    if (!content) {
      return res.status(404).json({ success: false, message: `${fileFieldName} non trouvé` });
    }

    // 4. Incrémenter compteur téléchargement (tracking utile pour stats)
    content.telechargements = (content.telechargements || 0) + 1;
    await content.save();

    // 5. Renvoi de l'URL directe Bunny.net (optimisée, publique)
    const downloadUrl = content[urlField];

    res.status(200).json({
      success: true,
      message: 'Téléchargement autorisé (membre premium)',
      downloadUrl,
      filename: `${content.titre || 'contenu'}.${content.format || 'mp4' || 'pdf'}`,
      contentType: content.typeMedia === 'audio' ? 'audio/mpeg' : content.format === 'pdf' ? 'application/pdf' : 'video/mp4'
    });
  } catch (error) {
    console.error('Erreur downloadContent:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur lors du téléchargement' });
  }
};