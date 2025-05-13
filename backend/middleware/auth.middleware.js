
const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');

// Middleware to verify JWT token and authenticate user
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
  next();
};

// Check if user is coordinator
const isCoordinator = (req, res, next) => {
  if (!req.user || (req.user.role !== 'coordinator' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Access denied: Coordinator privileges required' });
  }
  next();
};

// Check if user is accessing their own resource or is admin
const isOwnerOrAdmin = (req, res, next) => {
  const resourceId = req.params.userId || req.params.id;
  
  if (req.user && (req.user._id.toString() === resourceId || req.user.role === 'admin')) {
    return next();
  }
  
  res.status(403).json({ message: 'Access denied: Not authorized to access this resource' });
};

module.exports = { authenticate, isAdmin, isCoordinator, isOwnerOrAdmin };
