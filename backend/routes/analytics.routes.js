
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User } = require('../models/user.model');
const { Project } = require('../models/project.model');
const { Application } = require('../models/application.model');
const { authenticate, isAdmin, isCoordinator } = require('../middleware/auth.middleware');

// Get user's volunteer stats
router.get('/user/:id', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if requesting own stats or admin/coordinator
    if (
      userId !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'coordinator'
    ) {
      return res.status(403).json({ message: 'Not authorized to view these statistics' });
    }
    
    // Get user's basic stats
    const user = await User.findById(userId).select('hoursContributed projectsCompleted');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get projects by status
    const applications = await Application.find({ userId });
    const projectIds = applications.map(app => app.projectId);
    const projects = await Project.find({ _id: { $in: projectIds } });
    
    const projectsByStatus = {
      pending: projects.filter(p => p.status === 'open').length,
      ongoing: projects.filter(p => p.status === 'ongoing').length,
      completed: projects.filter(p => p.status === 'completed').length
    };
    
    // Get hours by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const hoursByMonth = await Application.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          hoursCompleted: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" }
          },
          hours: { $sum: "$hoursCompleted" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format hours by month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedHours = hoursByMonth.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      hours: item.hours
    }));
    
    // Get applications by status
    const applicationsByStatus = {
      pending: await Application.countDocuments({ userId, status: 'pending' }),
      approved: await Application.countDocuments({ userId, status: 'approved' }),
      rejected: await Application.countDocuments({ userId, status: 'rejected' })
    };
    
    res.json({
      totalHours: user.hoursContributed,
      projectsCompleted: user.projectsCompleted,
      projectsByStatus,
      hoursByMonth: formattedHours,
      applicationsByStatus
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ message: 'Failed to retrieve user analytics' });
  }
});

// Get organization stats (admin only)
router.get('/organization', authenticate, isAdmin, async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const totalCoordinators = await User.countDocuments({ role: 'coordinator' });
    
    // Get total volunteer hours
    const totalHours = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$hoursContributed" }
        }
      }
    ]);
    
    // Projects by status
    const projectsByStatus = {
      open: await Project.countDocuments({ status: 'open' }),
      ongoing: await Project.countDocuments({ status: 'ongoing' }),
      completed: await Project.countDocuments({ status: 'completed' })
    };
    
    // Applications by status
    const applicationsByStatus = {
      pending: await Application.countDocuments({ status: 'pending' }),
      approved: await Application.countDocuments({ status: 'approved' }),
      rejected: await Application.countDocuments({ status: 'rejected' })
    };
    
    // Projects by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const projectsByMonth = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format projects by month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedProjects = projectsByMonth.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      count: item.count
    }));
    
    // Top 5 skills in demand
    const skillsInDemand = await Project.aggregate([
      { $unwind: "$skills" },
      {
        $group: {
          _id: "$skills",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Top 5 locations with most projects
    const topLocations = await Project.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      totalUsers,
      totalProjects,
      totalVolunteers,
      totalCoordinators,
      totalHours: totalHours.length > 0 ? totalHours[0].total : 0,
      projectsByStatus,
      applicationsByStatus,
      projectsByMonth: formattedProjects,
      skillsInDemand: skillsInDemand.map(skill => ({ 
        skill: skill._id, 
        count: skill.count 
      })),
      topLocations: topLocations.map(location => ({ 
        location: location._id, 
        count: location.count 
      }))
    });
  } catch (error) {
    console.error('Organization analytics error:', error);
    res.status(500).json({ message: 'Failed to retrieve organization analytics' });
  }
});

// Get project analytics (admin or project coordinator)
router.get('/project/:id', authenticate, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Get project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check authorization
    if (
      project.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view these statistics' });
    }
    
    // Get applications for this project
    const applications = await Application.find({ projectId });
    
    // Applications by status
    const applicationsByStatus = {
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
    
    // Total hours contributed
    const totalHours = applications.reduce((sum, app) => sum + (app.hoursCompleted || 0), 0);
    
    // Skills distribution among applicants
    const applicantUserIds = applications.map(app => app.userId);
    const applicants = await User.find({ _id: { $in: applicantUserIds } });
    
    const skillsDistribution = {};
    applicants.forEach(user => {
      user.skills.forEach(skill => {
        skillsDistribution[skill] = (skillsDistribution[skill] || 0) + 1;
      });
    });
    
    const formattedSkills = Object.entries(skillsDistribution).map(([skill, count]) => ({
      skill,
      count
    })).sort((a, b) => b.count - a.count);
    
    res.json({
      projectName: project.title,
      totalApplications: applications.length,
      applicationsByStatus,
      totalHours,
      applicantSkills: formattedSkills,
      fillRate: Math.round((applications.length / project.volunteersNeeded) * 100),
      status: project.status
    });
  } catch (error) {
    console.error('Project analytics error:', error);
    res.status(500).json({ message: 'Failed to retrieve project analytics' });
  }
});

// Get AI matching recommendations (advanced feature)
router.get('/match/:projectId', authenticate, isCoordinator, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Get project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check authorization
    if (
      project.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view these matches' });
    }
    
    // Find volunteers with matching skills
    const volunteers = await User.find({
      role: 'volunteer',
      skills: { $in: project.skills }
    }).select('name skills hoursContributed projectsCompleted profileImage');
    
    // Calculate match score based on skill overlap
    const projectSkillsSet = new Set(project.skills);
    const rankedVolunteers = volunteers.map(volunteer => {
      const matchingSkills = volunteer.skills.filter(skill => projectSkillsSet.has(skill));
      const matchScore = (matchingSkills.length / projectSkillsSet.size) * 100;
      
      return {
        volunteer,
        matchScore: Math.round(matchScore),
        matchingSkills
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
    
    // Return top matches
    res.json({
      project: {
        title: project.title,
        skills: project.skills
      },
      matches: rankedVolunteers.slice(0, 10)
    });
  } catch (error) {
    console.error('Match analytics error:', error);
    res.status(500).json({ message: 'Failed to calculate matches' });
  }
});

module.exports = router;
