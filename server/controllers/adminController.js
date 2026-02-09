const User = require('../models/User');
const Shipment = require('../models/Shipment');
const Courier = require('../models/Courier');
const SystemLog = require('../models/SystemLog');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: err.message });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const shipmentCount = await Shipment.countDocuments({ user: user._id });

    res.status(200).json({
      success: true,
      data: { ...user.toObject(), shipmentCount }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching user', error: err.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive, company, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isActive, company, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await SystemLog.create({
      action: 'update',
      module: 'user',
      user: req.user.id,
      userEmail: req.user.email,
      description: `Updated user: ${user.email}`,
      status: 'success'
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating user', error: err.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);

    await SystemLog.create({
      action: 'delete',
      module: 'user',
      user: req.user.id,
      userEmail: req.user.email,
      description: `Deleted user: ${user.email}`,
      status: 'success'
    });

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting user', error: err.message });
  }
};

// @desc    Get system logs
// @route   GET /api/admin/logs
exports.getSystemLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;

    let query = {};
    if (req.query.action) query.action = req.query.action;
    if (req.query.module) query.module = req.query.module;

    const total = await SystemLog.countDocuments(query);
    const logs = await SystemLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: logs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching logs', error: err.message });
  }
};

// @desc    Get all shipments (admin view)
// @route   GET /api/admin/shipments
exports.getAllShipments = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.courier) query.courier = req.query.courier;

    const total = await Shipment.countDocuments(query);
    const shipments = await Shipment.find(query)
      .populate('user', 'name email company')
      .populate('courier', 'name code')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: shipments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: shipments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching shipments', error: err.message });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalShipments, totalCouriers, activeUsers] = await Promise.all([
      User.countDocuments(),
      Shipment.countDocuments(),
      Courier.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true })
    ]);

    const revenueAgg = await Shipment.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);

    const revenue = revenueAgg[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalShipments,
        totalCouriers,
        totalRevenue: Math.round(revenue)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: err.message });
  }
};
