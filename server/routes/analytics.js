const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getCourierPerformance,
  getMonthlyCosts,
  getSuccessRate,
  getDeliveryTimeAnalysis
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/courier-performance', getCourierPerformance);
router.get('/monthly-costs', getMonthlyCosts);
router.get('/success-rate', getSuccessRate);
router.get('/delivery-time', getDeliveryTimeAnalysis);

module.exports = router;
