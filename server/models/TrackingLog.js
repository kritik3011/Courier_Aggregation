const mongoose = require('mongoose');

const trackingLogSchema = new mongoose.Schema({
  shipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    required: true
  },
  trackingId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['order_created', 'pickup_scheduled', 'picked_up', 'in_transit', 'reached_hub', 'out_for_delivery', 'delivered', 'failed_attempt', 'returned', 'cancelled']
  },
  location: {
    city: String,
    state: String,
    facility: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  description: {
    type: String,
    required: true
  },
  remarks: {
    type: String
  },
  updatedBy: {
    type: String,
    default: 'System'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
trackingLogSchema.index({ trackingId: 1, timestamp: -1 });
trackingLogSchema.index({ shipment: 1 });

module.exports = mongoose.model('TrackingLog', trackingLogSchema);
