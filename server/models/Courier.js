const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  logo: {
    type: String
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Pricing structure
  pricing: {
    baseRate: { type: Number, required: true }, // Base rate per shipment
    weightRate: { type: Number, required: true }, // Rate per kg
    expressMultiplier: { type: Number, default: 1.5 },
    overnightMultiplier: { type: Number, default: 2.0 },
    codCharges: { type: Number, default: 50 }, // COD handling charges
    fuelSurcharge: { type: Number, default: 0 } // Percentage
  },
  // Coverage
  coverage: {
    domestic: { type: Boolean, default: true },
    international: { type: Boolean, default: false },
    servicePincodes: [String],
    restrictedPincodes: [String]
  },
  // Performance metrics
  performance: {
    avgDeliveryDays: { type: Number, default: 3 },
    deliverySuccessRate: { type: Number, default: 95 }, // Percentage
    avgRating: { type: Number, default: 4.0 }
  },
  // Contact
  contact: {
    supportEmail: String,
    supportPhone: String,
    website: String
  },
  // API Integration (simulated)
  apiConfig: {
    enabled: { type: Boolean, default: true },
    apiKey: String,
    endpoint: String
  }
}, {
  timestamps: true
});

// Calculate shipping rate
courierSchema.methods.calculateRate = function(weight, serviceType, isCod = false) {
  let rate = this.pricing.baseRate + (weight * this.pricing.weightRate);
  
  // Apply service type multiplier
  switch (serviceType) {
    case 'express':
      rate *= this.pricing.expressMultiplier;
      break;
    case 'overnight':
      rate *= this.pricing.overnightMultiplier;
      break;
    case 'economy':
      rate *= 0.8;
      break;
    default:
      break;
  }
  
  // Add fuel surcharge
  rate += rate * (this.pricing.fuelSurcharge / 100);
  
  // Add COD charges if applicable
  if (isCod) {
    rate += this.pricing.codCharges;
  }
  
  return Math.round(rate);
};

// Estimate delivery days
courierSchema.methods.estimateDelivery = function(serviceType) {
  let days = this.performance.avgDeliveryDays;
  
  switch (serviceType) {
    case 'express':
      days = Math.max(1, days - 1);
      break;
    case 'overnight':
      days = 1;
      break;
    case 'economy':
      days += 2;
      break;
    default:
      break;
  }
  
  return days;
};

module.exports = mongoose.model('Courier', courierSchema);
