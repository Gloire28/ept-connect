// backend/src/controllers/bookController.js
const Book = require('../models/Book');
const { uploadToBackblaze, deleteFromBackblaze } = require('../utils/backblaze');
const fs = require('fs').promises;

exports.getAllBooks = async (req, res) => {
  try {
    const { categorie, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filtre catégorie (déjà existant)
    if (categorie) query.categorie = categorie;

    // === NOUVEAUTÉ : RECHERCHE SUR TITRE + AUTEUR + EDITEUR + DESCRIPTION ===
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i'); // insensible à la casse
      query.$or = [
        { titre: searchRegex },
        { auteur: searchRegex },
        { editeur: searchRegex },
        { description: searchRegex }
      ];
    }

    const books = await Book.find(query)
      .sort({ datePublication: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('uploadedBy', 'nom prenoms tel role');

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur getAllBooks:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('uploadedBy', 'nom prenoms tel');

    if (!book) {
      return res.status(404).json({ success: false, message: 'Livre non trouvé' });
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    console.error('Erreur getBookById:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.createBook = async (req, res) => {
  try {
    const {
      titre,
      auteur,
      editeur,
      description,
      categorie,
      format,
      nombrePages,
      isPremium = false,
      tags = ''
    } = req.body;

    if (!req.files?.fichier?.[0] || !req.files?.couverture?.[0]) {
      return res.status(400).json({
        success: false,
        message: 'Fichier livre et couverture obligatoires'
      });
    }

    const fileBook = req.files.fichier[0];
    const coverFile = req.files.couverture[0];

    // Upload direct depuis buffer (RAM)
    const bookUpload = await uploadToBackblaze(fileBook.buffer, fileBook.originalname);
    const coverUpload = await uploadToBackblaze(coverFile.buffer, coverFile.originalname);

    const book = new Book({
      titre,
      auteur,
      editeur,
      description,
      categorie,
      format,
      urlFichier: bookUpload.url,
      urlCouverture: coverUpload.url,
      nombrePages: Number(nombrePages),
      isPremium: isPremium === 'true' || isPremium === true,
      uploadedBy: req.user.id,
      tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags
    });

    await book.save();

    res.status(201).json({
      success: true,
      message: 'Livre ajouté avec succès',
      data: book
    });

  } catch (error) {
    console.error('Erreur createBook:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur serveur lors de la création du livre' 
    });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Livre non trouvé' });
    }

    await Promise.all([
      deleteFromBackblaze(book.urlFichier),
      deleteFromBackblaze(book.urlCouverture)
    ]);

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Livre supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteBook:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du livre'
    });
  }
};