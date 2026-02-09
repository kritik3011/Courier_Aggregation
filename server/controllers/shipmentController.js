const Shipment = require('../models/Shipment');
const Courier = require('../models/Courier');
const TrackingLog = require('../models/TrackingLog');
const Notification = require('../models/Notification');
const SystemLog = require('../models/SystemLog');

// @desc    Get all shipments
// @route   GET /api/shipments
exports.getShipments = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    // Filter by user role
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    // Filter by courier
    if (req.query.courier) {
      query.courier = req.query.courier;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Search by tracking ID or receiver name
    if (req.query.search) {
      query.$or = [
        { trackingId: { $regex: req.query.search, $options: 'i' } },
        { 'receiver.name': { $regex: req.query.search, $options: 'i' } },
        { 'receiver.city': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Shipment.countDocuments(query);
    const shipments = await Shipment.find(query)
      .populate('courier', 'name code logo')
      .populate('user', 'name email')
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
    res.status(500).json({
      success: false,
      message: 'Error fetching shipments',
      error: err.message
    });
  }
};

// @desc    Get single shipment
// @route   GET /api/shipments/:id
exports.getShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('courier', 'name code logo contact')
      .populate('user', 'name email');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && shipment.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this shipment'
      });
    }

    // Get tracking logs
    const trackingLogs = await TrackingLog.find({ shipment: shipment._id })
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: shipment,
      trackingLogs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipment',
      error: err.message
    });
  }
};

// @desc    Create shipment
// @route   POST /api/shipments
exports.createShipment = async (req, res) => {
  try {
    req.body.user = req.user.id;

    // Get courier details
    const courier = await Courier.findById(req.body.courier);
    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Courier not found'
      });
    }

    req.body.courierName = courier.name;

    // Calculate shipping cost if not provided
    if (!req.body.shippingCost) {
      const weight = req.body.package?.weight || 1;
      const serviceType = req.body.serviceType || 'standard';
      const isCod = req.body.paymentMode === 'cod';
      req.body.shippingCost = courier.calculateRate(weight, serviceType, isCod);
    }

    // Calculate expected delivery date
    const estimatedDays = courier.estimateDelivery(req.body.serviceType || 'standard');
    req.body.expectedDeliveryDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);

    const shipment = await Shipment.create(req.body);

    // Create initial tracking log
    await TrackingLog.create({
      shipment: shipment._id,
      trackingId: shipment.trackingId,
      status: 'order_created',
      description: 'Order has been created and is awaiting pickup',
      location: {
        city: req.body.sender.city,
        state: req.body.sender.state
      }
    });

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'shipment_created',
      title: 'Shipment Created',
      message: `Your shipment ${shipment.trackingId} has been created successfully`,
      data: {
        shipmentId: shipment._id,
        trackingId: shipment.trackingId
      }
    });

    // Log action
    await SystemLog.create({
      action: 'create',
      module: 'shipment',
      user: req.user.id,
      userEmail: req.user.email,
      description: `Shipment created: ${shipment.trackingId}`,
      details: { shipmentId: shipment._id, trackingId: shipment.trackingId },
      status: 'success'
    });

    res.status(201).json({
      success: true,
      data: shipment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating shipment',
      error: err.message
    });
  }
};

// @desc    Update shipment
// @route   PUT /api/shipments/:id
exports.updateShipment = async (req, res) => {
  try {
    let shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && shipment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this shipment'
      });
    }

    // Don't allow status updates through this endpoint
    delete req.body.status;
    delete req.body.trackingId;

    shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: shipment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating shipment',
      error: err.message
    });
  }
};

// @desc    Update shipment status
// @route   PUT /api/shipments/:id/status
exports.updateShipmentStatus = async (req, res) => {
  try {
    const { status, location, remarks } = req.body;

    let shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Update status
    shipment.status = status;

    // Update delivery date if delivered
    if (status === 'delivered') {
      shipment.actualDeliveryDate = new Date();
    }

    // Update failure info
    if (status === 'failed') {
      shipment.failureReason = remarks;
      shipment.attemptCount += 1;
    }

    await shipment.save();

    // Create tracking log
    const statusDescriptions = {
      pending: 'Order is pending confirmation',
      confirmed: 'Order has been confirmed',
      picked_up: 'Package has been picked up',
      in_transit: 'Package is in transit',
      out_for_delivery: 'Package is out for delivery',
      delivered: 'Package has been delivered',
      failed: 'Delivery attempt failed',
      returned: 'Package is being returned to sender',
      cancelled: 'Order has been cancelled'
    };

    await TrackingLog.create({
      shipment: shipment._id,
      trackingId: shipment.trackingId,
      status: status === 'picked_up' ? 'picked_up' : status === 'in_transit' ? 'in_transit' : status,
      description: statusDescriptions[status] || `Status updated to ${status}`,
      location: location || {},
      remarks,
      updatedBy: req.user.email
    });

    // Create notification
    const notificationTypes = {
      picked_up: 'shipment_picked',
      in_transit: 'shipment_in_transit',
      delivered: 'shipment_delivered',
      failed: 'shipment_failed'
    };

    if (notificationTypes[status]) {
      await Notification.create({
        user: shipment.user,
        type: notificationTypes[status],
        title: `Shipment ${status.replace('_', ' ').toUpperCase()}`,
        message: `Your shipment ${shipment.trackingId} status: ${statusDescriptions[status]}`,
        data: {
          shipmentId: shipment._id,
          trackingId: shipment.trackingId
        }
      });
    }

    res.status(200).json({
      success: true,
      data: shipment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating shipment status',
      error: err.message
    });
  }
};

// @desc    Delete shipment
// @route   DELETE /api/shipments/:id
exports.deleteShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Only allow deletion of pending shipments
    if (!['pending', 'cancelled'].includes(shipment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Can only delete pending or cancelled shipments'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && shipment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this shipment'
      });
    }

    await Shipment.findByIdAndDelete(req.params.id);
    await TrackingLog.deleteMany({ shipment: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Shipment deleted'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting shipment',
      error: err.message
    });
  }
};

// @desc    Bulk create shipments via CSV
// @route   POST /api/shipments/bulk
exports.bulkCreate = async (req, res) => {
  try {
    const { shipments } = req.body;

    if (!shipments || !Array.isArray(shipments) || shipments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of shipments'
      });
    }

    const createdShipments = [];
    const errors = [];

    for (let i = 0; i < shipments.length; i++) {
      try {
        const shipmentData = shipments[i];
        shipmentData.user = req.user.id;

        const courier = await Courier.findById(shipmentData.courier);
        if (!courier) {
          errors.push({ row: i + 1, error: 'Courier not found' });
          continue;
        }

        shipmentData.courierName = courier.name;
        
        const weight = shipmentData.package?.weight || 1;
        const serviceType = shipmentData.serviceType || 'standard';
        const isCod = shipmentData.paymentMode === 'cod';
        shipmentData.shippingCost = courier.calculateRate(weight, serviceType, isCod);

        const estimatedDays = courier.estimateDelivery(serviceType);
        shipmentData.expectedDeliveryDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);

        const shipment = await Shipment.create(shipmentData);

        await TrackingLog.create({
          shipment: shipment._id,
          trackingId: shipment.trackingId,
          status: 'order_created',
          description: 'Order created via bulk upload',
          location: {
            city: shipmentData.sender.city,
            state: shipmentData.sender.state
          }
        });

        createdShipments.push(shipment);
      } catch (err) {
        errors.push({ row: i + 1, error: err.message });
      }
    }

    // Log bulk action
    await SystemLog.create({
      action: 'bulk_upload',
      module: 'shipment',
      user: req.user.id,
      userEmail: req.user.email,
      description: `Bulk created ${createdShipments.length} shipments`,
      details: { created: createdShipments.length, errors: errors.length },
      status: errors.length === 0 ? 'success' : 'partial'
    });

    res.status(201).json({
      success: true,
      created: createdShipments.length,
      errors,
      data: createdShipments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error in bulk create',
      error: err.message
    });
  }
};

// @desc    Generate shipping label
// @route   POST /api/shipments/:id/label
exports.generateLabel = async (req, res) => {
  try {
    let shipment = await Shipment.findById(req.params.id).populate('courier', 'name');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Simulate label generation
    shipment.labelGenerated = true;
    shipment.labelUrl = `/labels/${shipment.trackingId}.pdf`;
    await shipment.save();

    res.status(200).json({
      success: true,
      message: 'Label generated successfully',
      labelUrl: shipment.labelUrl,
      labelData: {
        trackingId: shipment.trackingId,
        courier: shipment.courierName,
        sender: shipment.sender,
        receiver: shipment.receiver,
        package: shipment.package,
        serviceType: shipment.serviceType,
        paymentMode: shipment.paymentMode,
        codAmount: shipment.codAmount
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error generating label',
      error: err.message
    });
  }
};

// @desc    Schedule pickup
// @route   POST /api/shipments/:id/pickup
exports.schedulePickup = async (req, res) => {
  try {
    const { pickupDate, pickupTime, instructions } = req.body;

    let shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    shipment.pickupDate = new Date(pickupDate);
    shipment.specialInstructions = instructions;
    shipment.status = 'confirmed';
    await shipment.save();

    // Add tracking log
    await TrackingLog.create({
      shipment: shipment._id,
      trackingId: shipment.trackingId,
      status: 'pickup_scheduled',
      description: `Pickup scheduled for ${pickupDate} ${pickupTime || ''}`,
      location: {
        city: shipment.sender.city,
        state: shipment.sender.state
      }
    });

    res.status(200).json({
      success: true,
      message: 'Pickup scheduled successfully',
      data: shipment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error scheduling pickup',
      error: err.message
    });
  }
};
