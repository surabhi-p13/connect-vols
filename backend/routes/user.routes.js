
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { User } = require('../models/user.model');
const { authenticate, isOwnerOrAdmin, isAdmin } = require('../middleware/auth.middleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
  }
});

// Get user profile by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to retrieve user' });
  }
});

// Update user profile
router.put('/:id', authenticate, isOwnerOrAdmin, async (req, res) => {
  try {
    const { name, skills, location, bio } = req.body;
    
    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        skills,
        location,
        bio
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Upload resume
router.post('/:id/resume', authenticate, isOwnerOrAdmin, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Update user with resume URL
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { resumeUrl },
      { new: true }
    ).select('-password');
    
    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Failed to upload resume' });
  }
});

// Upload profile image
router.post('/:id/profile-image', authenticate, isOwnerOrAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Update user with profile image URL
    const profileImage = `/uploads/profile-images/${req.file.filename}`;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { profileImage },
      { new: true }
    ).select('-password');
    
    res.json({
      message: 'Profile image uploaded successfully',
      profileImage,
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile image' });
  }
});

// Get all users (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const query = role ? { role } : {};
    
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Change user role (admin only)
router.put('/:id/role', authenticate, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['volunteer', 'coordinator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Failed to update role' });
  }
});

// Get user's badges
router.get('/:id/badges', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('badges');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.badges);
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Failed to retrieve badges' });
  }
});

module.exports = router;
