
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  },
  hoursCompleted: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, { timestamps: true });

// Ensure a user can only apply once to a project
applicationSchema.index({ projectId: 1, userId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = { Application };
