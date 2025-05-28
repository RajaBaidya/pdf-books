import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Update user password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new passwords' });
    }
    
    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password' });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow admin to delete their account if they're the only admin
    if (user.isAdmin) {
      const adminCount = await User.countDocuments({ isAdmin: true });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot delete account. You are the only administrator.' 
        });
      }
    }
    
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

// Admin delete any user account
export const adminDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting the last admin
    if (userToDelete.isAdmin) {
      const adminCount = await User.countDocuments({ isAdmin: true });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot delete the only administrator account.' 
        });
      }
    }
    
    // Don't allow admin to delete themselves through this endpoint
    if (userToDelete._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        message: 'Cannot delete your own account through admin panel. Use profile deletion instead.' 
      });
    }
    
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user account' });
  }
}; 