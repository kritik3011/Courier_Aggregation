const Shipment = require('../models/Shipment');
const Courier = require('../models/Courier');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const [total, pending, inTransit, delivered, failed] = await Promise.all([
      Shipment.countDocuments(query),
      Shipment.countDocuments({ ...query, status: { $in: ['pending', 'confirmed'] } }),
      Shipment.countDocuments({ ...query, status: { $in: ['picked_up', 'in_transit', 'out_for_delivery'] } }),
      Shipment.countDocuments({ ...query, status: 'delivered' }),
      Shipment.countDocuments({ ...query, status: { $in: ['failed', 'returned'] } })
    ]);

    const costAgg = await Shipment.aggregate([
      { $match: query },
      { $group: { _id: null, totalCost: { $sum: '$totalCost' }, avgCost: { $avg: '$totalCost' } } }
    ]);

    const costs = costAgg[0] || { totalCost: 0, avgCost: 0 };

    const recentShipments = await Shipment.find(query)
      .populate('courier', 'name code')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('trackingId status courierName receiver.name receiver.city totalCost createdAt');

    res.status(200).json({
      success: true,
      data: {
        counts: { total, pending, inTransit, delivered, failed },
        costs: { total: Math.round(costs.totalCost), average: Math.round(costs.avgCost) },
        recentShipments
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: err.message });
  }
};

// @desc    Get courier performance
// @route   GET /api/analytics/courier-performance
exports.getCourierPerformance = async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.role !== 'admin') matchQuery.user = req.user._id;

    const performance = await Shipment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$courier',
          courierName: { $first: '$courierName' },
          totalShipments: { $sum: 1 },
          deliveredCount: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          totalCost: { $sum: '$totalCost' },
          avgCost: { $avg: '$totalCost' }
        }
      },
      {
        $project: {
          courierName: 1, totalShipments: 1, deliveredCount: 1, totalCost: 1,
          avgCost: { $round: ['$avgCost', 2] },
          successRate: { $multiply: [{ $divide: ['$deliveredCount', { $max: ['$totalShipments', 1] }] }, 100] }
        }
      },
      { $sort: { totalShipments: -1 } }
    ]);

    res.status(200).json({ success: true, data: performance });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching performance', error: err.message });
  }
};

// @desc    Get monthly costs
// @route   GET /api/analytics/monthly-costs
exports.getMonthlyCosts = async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.role !== 'admin') matchQuery.user = req.user._id;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    matchQuery.createdAt = { $gte: startDate };

    const monthlyCosts = await Shipment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          totalCost: { $sum: '$totalCost' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = monthlyCosts.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      totalCost: Math.round(item.totalCost),
      shipments: item.count
    }));

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching costs', error: err.message });
  }
};

// @desc    Get success rate
// @route   GET /api/analytics/success-rate
exports.getSuccessRate = async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.role !== 'admin') matchQuery.user = req.user._id;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    matchQuery.createdAt = { $gte: startDate };

    const rates = await Shipment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } }
        }
      },
      { $project: { total: 1, delivered: 1, rate: { $multiply: [{ $divide: ['$delivered', { $max: ['$total', 1] }] }, 100] } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = rates.map(item => ({
      month: `${monthNames[item._id.month - 1]}`,
      successRate: Math.round(item.rate * 10) / 10,
      total: item.total
    }));

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching rates', error: err.message });
  }
};

// @desc    Get delivery time analysis
// @route   GET /api/analytics/delivery-time
exports.getDeliveryTimeAnalysis = async (req, res) => {
  try {
    let matchQuery = { status: 'delivered', actualDeliveryDate: { $ne: null } };
    if (req.user.role !== 'admin') matchQuery.user = req.user._id;

    const times = await Shipment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$courierName',
          avgDays: { $avg: { $divide: [{ $subtract: ['$actualDeliveryDate', '$createdAt'] }, 86400000] } },
          count: { $sum: 1 }
        }
      },
      { $project: { courier: '$_id', avgDays: { $round: ['$avgDays', 1] }, count: 1 } },
      { $sort: { avgDays: 1 } }
    ]);

    res.status(200).json({ success: true, data: times });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching delivery times', error: err.message });
  }
};
