// backend/src/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const bookController = require('../controllers/bookController');


const storage = multer.memoryStorage();  

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/epub+zip', 'image/jpeg', 'image/png'];
    allowed.includes(file.mimetype) 
      ? cb(null, true) 
      : cb(new Error('Type non autorisé'), false);
  }
});


router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'fichier', maxCount: 1 },   
    { name: 'couverture', maxCount: 1 }
  ]),
  bookController.createBook
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  bookController.deleteBook
);

module.exports = router;