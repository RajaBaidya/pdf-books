import express from 'express';
import Book from '../models/Book.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directories if they don't exist
    const uploadDir = path.join('uploads');
    const booksDir = path.join('uploads', 'books');
    const coversDir = path.join('uploads', 'covers');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    if (!fs.existsSync(booksDir)) {
      fs.mkdirSync(booksDir);
    }
    if (!fs.existsSync(coversDir)) {
      fs.mkdirSync(coversDir);
    }
    
    // Set destination based on file type
    const dest = file.fieldname === 'bookFile' ? booksDir : coversDir;
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'bookFile') {
    // Accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Book file must be a PDF'), false);
    }
  } else if (file.fieldname === 'coverImage') {
    // Accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Cover image must be an image file'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Get all books (public)
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({ isActive: true })
      .select('-fileUrl') // Don't send the file URL to clients
      .sort({ createdAt: -1 });
    
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Get book by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, isActive: true })
      .select('-fileUrl');
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Download book file (only authenticated users)
router.get('/:id/download', protect, async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, isActive: true });
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Get absolute path by removing the /api prefix
    const filePath = book.fileUrl.replace('/api/', '');
    
    // Send the file
    res.download(filePath, `${book.title.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Create a new book (admin only)
router.post(
  '/',
  protect,
  admin,
  upload.fields([
    { name: 'bookFile', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, author, description, category, publishedYear } = req.body;
      
      // Check if all required files are uploaded
      if (!req.files.bookFile || !req.files.coverImage) {
        return res.status(400).json({
          message: 'Please upload both a book file and a cover image'
        });
      }
      
      // Create book with file paths
      const book = new Book({
        title,
        author,
        description,
        category,
        publishedYear: parseInt(publishedYear),
        coverImage: `/api/uploads/covers/${req.files.coverImage[0].filename}`,
        fileUrl: `/api/uploads/books/${req.files.bookFile[0].filename}`,
        addedBy: req.user._id
      });
      
      const savedBook = await book.save();
      res.status(201).json(savedBook);
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
);

// Update a book (admin only)
router.put(
  '/:id',
  protect,
  admin,
  upload.fields([
    { name: 'bookFile', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      let book = await Book.findById(req.params.id);
      
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      // Update text fields
      const { title, author, description, category, publishedYear, isActive } = req.body;
      
      if (title) book.title = title;
      if (author) book.author = author;
      if (description) book.description = description;
      if (category) book.category = category;
      if (publishedYear) book.publishedYear = parseInt(publishedYear);
      if (isActive !== undefined) book.isActive = isActive === 'true';
      
      // Update files if provided
      if (req.files.coverImage) {
        // Delete old file
        const oldPath = book.coverImage.replace('/api/', '');
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
        
        // Update with new file
        book.coverImage = `/api/uploads/covers/${req.files.coverImage[0].filename}`;
      }
      
      if (req.files.bookFile) {
        // Delete old file
        const oldPath = book.fileUrl.replace('/api/', '');
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
        
        // Update with new file
        book.fileUrl = `/api/uploads/books/${req.files.bookFile[0].filename}`;
      }
      
      const updatedBook = await book.save();
      res.json(updatedBook);
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
);

// Delete a book (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Delete files
    const coverPath = book.coverImage.replace('/api/', '');
    const filePath = book.fileUrl.replace('/api/', '');
    
    if (fs.existsSync(coverPath)) {
      fs.unlinkSync(coverPath);
    }
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await book.remove();
    
    res.json({ message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Get all books (admin only, includes inactive books)
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .populate('addedBy', 'name email');
    
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router; 