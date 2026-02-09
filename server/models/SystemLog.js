const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'create', 'update', 'delete', 'bulk_upload', 'export', 'api_call', 'error', 'system']
  },
  module: {
    type: String,
    required: true,
    enum: ['auth', 'shipment', 'courier', 'tracking', 'user', 'analytics', 'admin', 'system']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: String,
  description: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  errorMessage: String
}, {
  timestamps: true
});

// Index for efficient queries
systemLogSchema.index({ createdAt: -1 });
systemLogSchema.index({ user: 1, action: 1 });
systemLogSchema.index({ module: 1 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
