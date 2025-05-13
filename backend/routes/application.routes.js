
const express = require('express');
const router = express.Router();
const { Application } = require('../models/application.model');
const { Project } = require('../models/project.model');
const { User } = require('../models/user.model');
const { Notification } = require('../models/notification.model');
const { authenticate, isCoordinator } = require('../middleware/auth.middleware');

// Apply to a project
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, notes } = req.body;
    const userId = req.user._id;
    
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if project is open
    if (project.status !== 'open') {
      return res.status(400).json({ message: 'This project is not accepting applications' });
    }
    
    // Check if user already applied
    const existingApplication = await Application.findOne({ projectId, userId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this project' });
    }
    
    // Create application
    const newApplication = new Application({
      projectId,
      userId,
      notes
    });
    
    await newApplication.save();
    
    // Increment volunteersApplied count
    await Project.findByIdAndUpdate(projectId, {
      $inc: { volunteersApplied: 1 }
    });
    
    // Send notification to project creator
    await Notification.create({
      userId: project.createdBy,
      message: `New application received for "${project.title}"`,
      type: 'info',
      link: `/projects/${projectId}/applications`,
      relatedId: newApplication._id,
      onModel: 'Application'
    });
    
    res.status(201).json({
      message: 'Application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// Get user's applications
router.get('/my-applications', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;
    
    const query = { userId };
    if (status) {
      query.status = status;
    }
    
    const applications = await Application.find(query)
      .populate('projectId', 'title organization startDate endDate status imageUrl');
    
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Failed to retrieve applications' });
  }
});

// Get application details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('projectId', 'title organization startDate endDate status')
      .populate('userId', 'name email skills');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if user is authorized to view this application
    if (
      application.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      !await isProjectCoordinator(req.user._id, application.projectId._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Failed to retrieve application' });
  }
});

// Update application status (project coordinators/admins only)
router.put('/:id/status', authenticate, isCoordinator, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if user is project coordinator or admin
    const project = await Project.findById(application.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }
    
    // Update application status
    application.status = status;
    await application.save();
    
    // Create notification for volunteer
    const notificationType = status === 'approved' ? 'success' : 'info';
    const notificationMessage = status === 'approved' 
      ? `Your application for "${project.title}" has been approved!`
      : `Your application for "${project.title}" has been ${status}.`;
    
    await Notification.create({
      userId: application.userId,
      message: notificationMessage,
      type: notificationType,
      link: `/projects/${application.projectId}`,
      relatedId: application._id,
      onModel: 'Application'
    });
    
    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Failed to update application' });
  }
});

// Add volunteer hours (project coordinators/admins only)
router.put('/:id/hours', authenticate, isCoordinator, async (req, res) => {
  try {
    const { hoursCompleted, feedback, rating } = req.body;
    
    if (hoursCompleted < 0) {
      return res.status(400).json({ message: 'Hours cannot be negative' });
    }
    
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if user is project coordinator or admin
    const project = await Project.findById(application.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }
    
    // Update application and add hours
    application.hoursCompleted = hoursCompleted;
    if (feedback) application.feedback = feedback;
    if (rating) application.rating = rating;
    
    await application.save();
    
    // Update user's total hours and projects completed
    await User.findByIdAndUpdate(application.userId, {
      $inc: { hoursContributed: hoursCompleted }
    });
    
    // Check if project is completed and update user's projectsCompleted count
    if (project.status === 'completed' && hoursCompleted > 0) {
      await User.findByIdAndUpdate(application.userId, {
        $inc: { projectsCompleted: 1 }
      });
      
      // Check if user earned any badges
      await checkAndAwardBadges(application.userId);
    }
    
    // Create notification for volunteer
    await Notification.create({
      userId: application.userId,
      message: `${hoursCompleted} hours have been added to your volunteer record for "${project.title}"`,
      type: 'success',
      link: `/projects/${application.projectId}`,
      relatedId: application._id,
      onModel: 'Application'
    });
    
    res.json({
      message: 'Volunteer hours updated successfully',
      application
    });
  } catch (error) {
    console.error('Update hours error:', error);
    res.status(500).json({ message: 'Failed to update hours' });
  }
});

// Helper function to check project coordinator
async function isProjectCoordinator(userId, projectId) {
  const project = await Project.findById(projectId);
  return project && project.createdBy.toString() === userId.toString();
}

// Helper function to check and award badges
async function checkAndAwardBadges(userId) {
  const user = await User.findById(userId);
  
  // First Timer Badge
  if (user.projectsCompleted === 1) {
    user.badges.push({
      name: 'First Timer',
      description: 'Completed first volunteer project',
      imageUrl: '/badges/first-timer.png',
      earnedAt: new Date()
    });
    
    await Notification.create({
      userId: user._id,
      message: 'You earned the First Timer badge! 🎉',
      type: 'success',
      link: '/dashboard',
      relatedId: user._id,
      onModel: 'User'
    });
  }
  
  // Team Player Badge
  if (user.projectsCompleted === 5) {
    user.badges.push({
      name: 'Team Player',
      description: 'Participated in 5 group projects',
      imageUrl: '/badges/team-player.png',
      earnedAt: new Date()
    });
    
    await Notification.create({
      userId: user._id,
      message: 'You earned the Team Player badge! 🎉',
      type: 'success',
      link: '/dashboard',
      relatedId: user._id,
      onModel: 'User'
    });
  }
  
  // Hour Milestone Badges
  const hourBadges = [
    { hours: 10, name: '10 Hour Club', image: '/badges/10-hour-club.png' },
    { hours: 50, name: '50 Hour Hero', image: '/badges/50-hour-hero.png' },
    { hours: 100, name: 'Century Volunteer', image: '/badges/century-volunteer.png' }
  ];
  
  for (const badge of hourBadges) {
    if (user.hoursContributed >= badge.hours && !user.badges.some(b => b.name === badge.name)) {
      user.badges.push({
        name: badge.name,
        description: `Contributed ${badge.hours} hours of volunteer work`,
        imageUrl: badge.image,
        earnedAt: new Date()
      });
      
      await Notification.create({
        userId: user._id,
        message: `You earned the ${badge.name} badge! 🎉`,
        type: 'success',
        link: '/dashboard',
        relatedId: user._id,
        onModel: 'User'
      });
    }
  }
  
  await user.save();
}

module.exports = router;
