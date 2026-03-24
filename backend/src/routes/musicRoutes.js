// backend/src/routes/musicRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const musicController = require('../controllers/musicController');


const storage = multer.memoryStorage();  

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowed = [
      'audio/mpeg', 'audio/mp3', 'audio/wav',
      'video/mp4', 'video/webm',
      'image/jpeg', 'image/png'
    ];
    allowed.includes(file.mimetype) 
      ? cb(null, true) 
      : cb(new Error('Type non autorisé'), false);
  }
});

// ========================
// ROUTES
// ========================
router.get('/', musicController.getAllMusic);
router.get('/:id', musicController.getMusicById);

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'media', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  musicController.createMusic
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  musicController.deleteMusic
);

module.exports = router;