const express = require('express');
const router = express.Router();
const {
  getShipments,
  getShipment,
  createShipment,
  updateShipment,
  updateShipmentStatus,
  deleteShipment,
  bulkCreate,
  generateLabel,
  schedulePickup
} = require('../controllers/shipmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getShipments)
  .post(createShipment);

router.post('/bulk', bulkCreate);

router.route('/:id')
  .get(getShipment)
  .put(updateShipment)
  .delete(deleteShipment);

router.put('/:id/status', authorize('admin', 'staff'), updateShipmentStatus);
router.post('/:id/label', generateLabel);
router.post('/:id/pickup', schedulePickup);

module.exports = router;
