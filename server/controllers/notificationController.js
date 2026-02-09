const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = { user: req.user.id };
    if (req.query.unread === 'true') {
      query.isRead = false;
    }

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit),
      data: notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: err.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating notification', error: err.message });
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating notifications', error: err.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting notification', error: err.message });
  }
};

// @desc    Simulate email notification
// @route   POST /api/notifications/send-email
exports.simulateEmail = async (req, res) => {
  try {
    const { trackingId, type } = req.body;

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update notification as email sent
    await Notification.updateOne(
      { 'data.trackingId': trackingId, user: req.user.id },
      { isEmailSent: true }
    );

    res.status(200).json({
      success: true,
      message: `Email notification sent successfully for ${trackingId}`,
      simulated: true
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error sending email', error: err.message });
  }
};
