
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Project } = require('../models/project.model');
const { Application } = require('../models/application.model');
const { User } = require('../models/user.model');
const { Notification } = require('../models/notification.model');
const { authenticate, isCoordinator } = require('../middleware/auth.middleware');
const { validateProject } = require('../middleware/validators');

// Configure multer for project image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/project-images/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and GIF files are allowed.'));
  }
});

// Create new project (coordinators/admins only)
router.post('/', authenticate, isCoordinator, validateProject, async (req, res) => {
  try {
    const { 
      title, description, organization, skills, location, 
      coordinates, startDate, endDate, volunteersNeeded, category 
    } = req.body;
    
    const newProject = new Project({
      title,
      description,
      organization,
      skills,
      location,
      coordinates,
      startDate,
      endDate,
      volunteersNeeded,
      category,
      createdBy: req.user._id
    });
    
    await newProject.save();
    
    // Find users with matching skills for notifications
    const skillsSet = new Set(skills);
    const matchingUsers = await User.find({
      role: 'volunteer',
      skills: { $in: skills }
    }).select('_id');
    
    // Create notifications for matching users
    const notifications = matchingUsers.map(user => ({
      userId: user._id,
      message: `New project "${title}" matches your skills!`,
      type: 'info',
      link: `/projects/${newProject._id}`,
      relatedId: newProject._id,
      onModel: 'Project'
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    
    res.status(201).json({
      message: 'Project created successfully',
      project: newProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Get all projects with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      category,
      skills, 
      location,
      startDate,
      endDate,
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = req.query;
    
    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.skills = { $in: skillsArray };
    }
    
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { $lte: new Date(endDate) };
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const projects = await Project.find(query)
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);
    
    const count = await Project.countDocuments(query);
    
    res.json({
      projects,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
      totalCount: count
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to retrieve projects' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to retrieve project' });
  }
});

// Update project (coordinators/admins only)
router.put('/:id', authenticate, isCoordinator, validateProject, async (req, res) => {
  try {
    const { 
      title, description, organization, skills, location, 
      coordinates, startDate, endDate, volunteersNeeded, category, status 
    } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only project creator or admin can update
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        organization,
        skills,
        location,
        coordinates,
        startDate,
        endDate,
        volunteersNeeded,
        category,
        status: status || project.status
      },
      { new: true, runValidators: true }
    );
    
    // Notify applied volunteers about the update
    const applications = await Application.find({ projectId: project._id });
    
    if (applications.length > 0) {
      const notifications = applications.map(app => ({
        userId: app.userId,
        message: `Project "${title}" has been updated`,
        type: 'info',
        link: `/projects/${project._id}`,
        relatedId: project._id,
        onModel: 'Project'
      }));
      
      await Notification.insertMany(notifications);
    }
    
    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Delete project (coordinators/admins only)
router.delete('/:id', authenticate, isCoordinator, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only project creator or admin can delete
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    
    // Delete project and related applications
    await Project.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ projectId: req.params.id });
    
    // Notify applied volunteers about the deletion
    const applications = await Application.find({ projectId: project._id });
    
    if (applications.length > 0) {
      const notifications = applications.map(app => ({
        userId: app.userId,
        message: `Project "${project.title}" has been cancelled`,
        type: 'warning',
        relatedId: req.user._id,
        onModel: 'User'
      }));
      
      await Notification.insertMany(notifications);
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// Upload project image
router.post('/:id/image', authenticate, isCoordinator, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only project creator or admin can upload image
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    // Update project with image URL
    const imageUrl = `/uploads/project-images/${req.file.filename}`;
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { imageUrl },
      { new: true }
    );
    
    res.json({
      message: 'Project image uploaded successfully',
      imageUrl,
      project: updatedProject
    });
  } catch (error) {
    console.error('Project image upload error:', error);
    res.status(500).json({ message: 'Failed to upload project image' });
  }
});

// Get volunteers applied to a project
router.get('/:id/volunteers', authenticate, isCoordinator, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only project creator or admin can view applicants
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view applicants' });
    }
    
    const applications = await Application.find({ projectId: req.params.id })
      .populate('userId', 'name email skills profileImage hoursContributed');
    
    res.json(applications);
  } catch (error) {
    console.error('Get volunteers error:', error);
    res.status(500).json({ message: 'Failed to retrieve volunteers' });
  }
});

module.exports = router;
