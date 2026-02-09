const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getSystemLogs,
  getAllShipments,
  getAdminStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.get('/logs', getSystemLogs);
router.get('/shipments', getAllShipments);

module.exports = router;
