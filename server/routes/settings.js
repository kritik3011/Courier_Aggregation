const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  resetSettings,
  exportData,
  requestAccountDeletion,
  changePassword
} = require('../controllers/settingsController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getSettings)
  .put(updateSettings);

router.post('/reset', resetSettings);
router.post('/export', exportData);
router.post('/delete-account', requestAccountDeletion);
router.put('/password', changePassword);

module.exports = router;
