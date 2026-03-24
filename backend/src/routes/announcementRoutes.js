// backend/src/routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const announcementController = require('../controllers/announcementController');

const storage = multer.memoryStorage();   

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    allowed.includes(file.mimetype) 
      ? cb(null, true) 
      : cb(new Error('Type non autorisé'), false);
  }
});

router.get('/', announcementController.getAllAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),  
  announcementController.createAnnouncement
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  announcementController.deleteAnnouncement
);

module.exports = router;