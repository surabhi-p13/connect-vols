
const express = require('express');
const router = express.Router();
const { Project } = require('../models/project.model');
const { User } = require('../models/user.model');
const { authenticate, isCoordinator } = require('../middleware/auth.middleware');

// Search projects
router.get('/projects', async (req, res) => {
  try {
    const { q, location, skills, category, page = 1, limit = 10 } = req.query;
    
    // Build search query
    const query = {};
    
    if (q) {
      query.$text = { $search: q };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.skills = { $in: skillsArray };
    }
    
    if (category) {
      query.category = category;
    }
    
    // Only show open or ongoing projects in search
    query.status = { $in: ['open', 'ongoing'] };
    
    const projects = await Project.find(query)
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: 1 });
    
    const count = await Project.countDocuments(query);
    
    res.json({
      projects,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
      totalCount: count
    });
  } catch (error) {
    console.error('Search projects error:', error);
    res.status(500).json({ message: 'Failed to search projects' });
  }
});

// Search volunteers by skills (coordinators/admins only)
router.get('/volunteers', authenticate, isCoordinator, async (req, res) => {
  try {
    const { skills, location, page = 1, limit = 10 } = req.query;
    
    // Build search query
    const query = { role: 'volunteer' };
    
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.skills = { $in: skillsArray };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    const volunteers = await User.find(query)
      .select('name email skills location hoursContributed projectsCompleted profileImage')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ hoursContributed: -1 });
    
    const count = await User.countDocuments(query);
    
    res.json({
      volunteers,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
      totalCount: count
    });
  } catch (error) {
    console.error('Search volunteers error:', error);
    res.status(500).json({ message: 'Failed to search volunteers' });
  }
});

// Find nearby projects based on coordinates
router.get('/nearby', async (req, res) => {
  try {
    const { lng, lat, maxDistance = 10000 } = req.query; // maxDistance in meters
    
    if (!lng || !lat) {
      return res.status(400).json({ message: 'Coordinates required' });
    }
    
    const nearbyProjects = await Project.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      status: { $in: ['open', 'ongoing'] }
    })
    .populate('createdBy', 'name')
    .limit(10);
    
    res.json(nearbyProjects);
  } catch (error) {
    console.error('Nearby search error:', error);
    res.status(500).json({ message: 'Failed to find nearby projects' });
  }
});

// Find recommended projects for a user
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.skills || user.skills.length === 0) {
      // If user has no skills, return recent projects
      const recentProjects = await Project.find({ status: 'open' })
        .populate('createdBy', 'name')
        .limit(10)
        .sort({ createdAt: -1 });
      
      return res.json(recentProjects);
    }
    
    // Find projects matching user skills
    const matchingProjects = await Project.find({
      skills: { $in: user.skills },
      status: 'open'
    })
    .populate('createdBy', 'name')
    .limit(10);
    
    // If user has location, add nearby projects
    let nearbyProjects = [];
    if (user.location) {
      // Note: This is a simplified approach. In a real app, you would geocode the location string
      // to coordinates and then perform a geospatial query
      nearbyProjects = await Project.find({
        location: { $regex: user.location.split(',')[0], $options: 'i' },
        status: 'open',
        _id: { $nin: matchingProjects.map(p => p._id) }
      })
      .populate('createdBy', 'name')
      .limit(5);
    }
    
    // Combine results
    const recommendations = [...matchingProjects, ...nearbyProjects];
    
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

module.exports = router;
