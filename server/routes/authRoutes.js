import express from 'express';
import { register, login, getCurrentUser, promoteToAdmin } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user (protected route)
router.get('/me', protect, getCurrentUser);

// Promote user to admin (admin only)
router.put('/promote/:userId', protect, admin, promoteToAdmin);

export default router; 