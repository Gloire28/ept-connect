// backend/src/routes/sermonRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const sermonController = require('../controllers/sermonController');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'video/mp4', 'video/webm', 'video/quicktime',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Seuls mp4, webm, mov, jpg, png, gif, webp acceptés.'), false);
    }
  }
});

// GET /api/sermons/recommended - Feed biaisé sur TAGS (section "Recommandé pour vous")
router.get('/recommended', sermonController.getRecommendedSermons);

// GET /api/sermons - Feed principal (public ou authentifié)
router.get('/', sermonController.getAllSermons);

// GET /api/sermons/:id - Détail d'un sermon
router.get('/:id', sermonController.getSermonById);

// POST /api/sermons - Upload sermon (réservé admin)
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  sermonController.createSermon
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  sermonController.deleteSermon
);

module.exports = router;