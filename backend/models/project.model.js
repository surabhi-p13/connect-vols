
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    index: '2dsphere' // Geospatial index for location queries
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'ongoing', 'completed'],
    default: 'open'
  },
  volunteersNeeded: {
    type: Number,
    required: true,
    min: 1
  },
  volunteersApplied: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for search and location queries
projectSchema.index({ title: 'text', description: 'text', skills: 'text' });

const Project = mongoose.model('Project', projectSchema);

module.exports = { Project };
