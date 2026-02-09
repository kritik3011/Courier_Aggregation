const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courier',
    required: true
  },
  courierName: {
    type: String,
    required: true
  },
  // Sender details
  sender: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  // Receiver details
  receiver: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  // Package details
  package: {
    weight: { type: Number, required: true }, // in kg
    length: { type: Number }, // in cm
    width: { type: Number },
    height: { type: Number },
    description: { type: String },
    value: { type: Number }, // declared value
    category: {
      type: String,
      enum: ['documents', 'electronics', 'clothing', 'food', 'fragile', 'other'],
      default: 'other'
    }
  },
  // Shipping details
  serviceType: {
    type: String,
    enum: ['standard', 'express', 'overnight', 'economy'],
    default: 'standard'
  },
  paymentMode: {
    type: String,
    enum: ['prepaid', 'cod'],
    default: 'prepaid'
  },
  codAmount: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    required: true
  },
  insuranceCost: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    required: true
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned', 'cancelled'],
    default: 'pending'
  },
  // Dates
  pickupDate: {
    type: Date
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  // Additional info
  specialInstructions: {
    type: String
  },
  labelGenerated: {
    type: Boolean,
    default: false
  },
  labelUrl: {
    type: String
  },
  // Failure info
  failureReason: {
    type: String
  },
  attemptCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate tracking ID
shipmentSchema.pre('save', async function(next) {
  if (!this.trackingId) {
    const prefix = this.courierName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.trackingId = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Calculate total cost
shipmentSchema.pre('save', function(next) {
  this.totalCost = this.shippingCost + (this.insuranceCost || 0);
  next();
});

// Add index for faster queries
shipmentSchema.index({ trackingId: 1 });
shipmentSchema.index({ user: 1, status: 1 });
shipmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Shipment', shipmentSchema);
