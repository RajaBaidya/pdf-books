import express from 'express';
import { getAllUsers, updatePassword, deleteAccount, adminDeleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, admin, getAllUsers);

// Update user password
router.put('/password', protect, updatePassword);

// Delete user account
router.delete('/profile', protect, deleteAccount);

// Admin delete any user account
router.delete('/:userId', protect, admin, adminDeleteUser);

export default router; 