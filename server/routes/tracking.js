const express = require('express');
const router = express.Router();
const {
  trackShipment,
  getTimeline,
  simulateUpdate
} = require('../controllers/trackingController');
const { protect, authorize } = require('../middleware/auth');

// Public tracking endpoint
router.get('/:trackingId', trackShipment);
router.get('/:trackingId/timeline', getTimeline);

// Protected simulation endpoint for demo
router.post('/:trackingId/simulate', protect, authorize('admin', 'staff'), simulateUpdate);

module.exports = router;
