const Shipment = require('../models/Shipment');
const TrackingLog = require('../models/TrackingLog');

// @desc    Get sample tracking IDs for demo
// @route   GET /api/tracking/samples
exports.getSampleIds = async (req, res) => {
  try {
    const shipments = await Shipment.find()
      .select('trackingId status courierName')
      .limit(5)
      .sort('-createdAt');

    const samples = shipments.map(s => ({
      trackingId: s.trackingId,
      status: s.status,
      courier: s.courierName
    }));

    res.status(200).json({
      success: true,
      data: samples
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching samples'
    });
  }
};

// @desc    Track shipment by tracking ID
// @route   GET /api/tracking/:trackingId
exports.trackShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId })
      .populate('courier', 'name code logo contact');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found. Please check the tracking ID.'
      });
    }

    const trackingLogs = await TrackingLog.find({ trackingId: req.params.trackingId })
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: {
        trackingId: shipment.trackingId,
        status: shipment.status,
        courier: shipment.courierName,
        courierDetails: shipment.courier,
        sender: {
          city: shipment.sender.city,
          state: shipment.sender.state
        },
        receiver: {
          name: shipment.receiver.name,
          city: shipment.receiver.city,
          state: shipment.receiver.state
        },
        package: shipment.package,
        serviceType: shipment.serviceType,
        createdAt: shipment.createdAt,
        expectedDeliveryDate: shipment.expectedDeliveryDate,
        actualDeliveryDate: shipment.actualDeliveryDate,
        timeline: trackingLogs
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error tracking shipment',
      error: err.message
    });
  }
};

// @desc    Get tracking timeline
// @route   GET /api/tracking/:trackingId/timeline
exports.getTimeline = async (req, res) => {
  try {
    const trackingLogs = await TrackingLog.find({ trackingId: req.params.trackingId })
      .sort({ timestamp: 1 });

    if (trackingLogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No tracking information found'
      });
    }

    // Format timeline with icons
    const statusIcons = {
      order_created: '📦',
      pickup_scheduled: '📅',
      picked_up: '🚛',
      in_transit: '✈️',
      reached_hub: '🏢',
      out_for_delivery: '🚚',
      delivered: '✅',
      failed_attempt: '❌',
      returned: '↩️',
      cancelled: '🚫'
    };

    const timeline = trackingLogs.map(log => ({
      status: log.status,
      icon: statusIcons[log.status] || '📍',
      description: log.description,
      location: log.location,
      remarks: log.remarks,
      timestamp: log.timestamp,
      updatedBy: log.updatedBy
    }));

    res.status(200).json({
      success: true,
      count: timeline.length,
      data: timeline
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timeline',
      error: err.message
    });
  }
};

// @desc    Simulate tracking update (for demo)
// @route   POST /api/tracking/:trackingId/simulate
exports.simulateUpdate = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Define status progression
    const statusProgression = [
      'pending',
      'confirmed',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered'
    ];

    const currentIndex = statusProgression.indexOf(shipment.status);
    
    if (currentIndex === -1 || currentIndex >= statusProgression.length - 1) {
      return res.status(400).json({
        success: false,
        message: 'Shipment already at final status or cannot progress'
      });
    }

    const nextStatus = statusProgression[currentIndex + 1];
    shipment.status = nextStatus;

    if (nextStatus === 'delivered') {
      shipment.actualDeliveryDate = new Date();
    }

    await shipment.save();

    // Create tracking log
    const statusDescriptions = {
      confirmed: 'Order confirmed, awaiting pickup',
      picked_up: 'Package picked up from sender',
      in_transit: 'Package in transit to destination',
      out_for_delivery: 'Package out for delivery',
      delivered: 'Package delivered successfully'
    };

    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];

    await TrackingLog.create({
      shipment: shipment._id,
      trackingId: shipment.trackingId,
      status: nextStatus === 'picked_up' ? 'picked_up' : nextStatus === 'in_transit' ? 'in_transit' : nextStatus,
      description: statusDescriptions[nextStatus],
      location: {
        city: nextStatus === 'delivered' ? shipment.receiver.city : randomCity,
        state: nextStatus === 'delivered' ? shipment.receiver.state : 'Transit Hub'
      },
      updatedBy: 'Simulation'
    });

    res.status(200).json({
      success: true,
      message: `Shipment status updated to: ${nextStatus}`,
      data: {
        trackingId: shipment.trackingId,
        previousStatus: statusProgression[currentIndex],
        newStatus: nextStatus
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error simulating update',
      error: err.message
    });
  }
};
