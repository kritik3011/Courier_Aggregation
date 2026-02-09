const express = require('express');
const router = express.Router();
const {
  getCouriers,
  getCourier,
  compareRates,
  getRecommendations,
  createCourier,
  updateCourier,
  deleteCourier
} = require('../controllers/courierController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCouriers);
router.get('/:id', getCourier);

router.use(protect);

router.post('/compare', compareRates);
router.post('/recommend', getRecommendations);

// Admin only routes
router.post('/', authorize('admin'), createCourier);
router.put('/:id', authorize('admin'), updateCourier);
router.delete('/:id', authorize('admin'), deleteCourier);

module.exports = router;
