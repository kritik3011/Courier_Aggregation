const User = require('../models/User');
const SystemLog = require('../models/SystemLog');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Return default settings if user doesn't have any
    const settings = user.settings || {
      darkMode: true,
      compactView: false,
      emailNotifications: true,
      shipmentUpdates: true,
      marketingEmails: false,
      weeklyReports: true,
      defaultServiceType: 'standard',
      autoGenerateLabel: true,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      shareAnalytics: true,
      twoFactorAuth: false
    };

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching settings'
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const allowedSettings = [
      'darkMode', 'compactView', 'emailNotifications', 'shipmentUpdates',
      'marketingEmails', 'weeklyReports', 'defaultServiceType', 
      'autoGenerateLabel', 'currency', 'timezone', 'shareAnalytics', 'twoFactorAuth'
    ];

    // Build settings object with only allowed fields
    const settingsUpdate = {};
    for (const key of allowedSettings) {
      if (req.body[key] !== undefined) {
        settingsUpdate[`settings.${key}`] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: settingsUpdate },
      { new: true, runValidators: true }
    );

    // Log settings update
    await SystemLog.create({
      user: req.user.id,
      userEmail: req.user.email,
      action: 'update',
      module: 'settings',
      description: 'User updated their settings',
      status: 'success'
    });

    res.status(200).json({
      success: true,
      data: user.settings,
      message: 'Settings updated successfully'
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating settings'
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private
exports.resetSettings = async (req, res) => {
  try {
    const defaultSettings = {
      darkMode: true,
      compactView: false,
      emailNotifications: true,
      shipmentUpdates: true,
      marketingEmails: false,
      weeklyReports: true,
      defaultServiceType: 'standard',
      autoGenerateLabel: true,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      shareAnalytics: true,
      twoFactorAuth: false
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { settings: defaultSettings },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user.settings,
      message: 'Settings reset to default'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error resetting settings'
    });
  }
};

// @desc    Export user data
// @route   POST /api/settings/export
// @access  Private
exports.exportData = async (req, res) => {
  try {
    const Shipment = require('../models/Shipment');
    
    // Get user's shipments
    const shipments = await Shipment.find({ user: req.user.id })
      .populate('courier', 'name code')
      .sort('-createdAt');

    // Format data for export
    const exportData = {
      user: {
        name: req.user.name,
        email: req.user.email,
        company: req.user.company,
        exportDate: new Date().toISOString()
      },
      statistics: {
        totalShipments: shipments.length,
        delivered: shipments.filter(s => s.status === 'delivered').length,
        pending: shipments.filter(s => s.status === 'pending').length,
        totalSpent: shipments.reduce((sum, s) => sum + s.totalCost, 0)
      },
      shipments: shipments.map(s => ({
        trackingId: s.trackingId,
        status: s.status,
        courier: s.courierName,
        sender: `${s.sender.city}, ${s.sender.state}`,
        receiver: `${s.receiver.city}, ${s.receiver.state}`,
        weight: s.package.weight,
        cost: s.totalCost,
        createdAt: s.createdAt,
        deliveredAt: s.actualDeliveryDate
      }))
    };

    // Log export action
    await SystemLog.create({
      user: req.user.id,
      userEmail: req.user.email,
      action: 'export',
      module: 'settings',
      description: 'User exported their data',
      status: 'success'
    });

    res.status(200).json({
      success: true,
      data: exportData,
      message: 'Data exported successfully'
    });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({
      success: false,
      message: 'Error exporting data'
    });
  }
};

// @desc    Request account deletion
// @route   POST /api/settings/delete-account
// @access  Private
exports.requestAccountDeletion = async (req, res) => {
  try {
    // In a real app, this would send a confirmation email
    // For demo, we just return a message
    
    await SystemLog.create({
      user: req.user.id,
      userEmail: req.user.email,
      action: 'delete_request',
      module: 'settings',
      description: 'User requested account deletion',
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Account deletion request received. You will receive a confirmation email shortly.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error processing request'
    });
  }
};

// @desc    Change password
// @route   PUT /api/settings/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    // Log password change
    await SystemLog.create({
      user: req.user.id,
      userEmail: req.user.email,
      action: 'update',
      module: 'security',
      description: 'User changed their password',
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};
