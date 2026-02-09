const Courier = require('../models/Courier');

// @desc    Get all couriers
// @route   GET /api/couriers
exports.getCouriers = async (req, res) => {
  try {
    const query = req.query.active === 'true' ? { isActive: true } : {};
    const couriers = await Courier.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: couriers.length,
      data: couriers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching couriers',
      error: err.message
    });
  }
};

// @desc    Get single courier
// @route   GET /api/couriers/:id
exports.getCourier = async (req, res) => {
  try {
    const courier = await Courier.findById(req.params.id);

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Courier not found'
      });
    }

    res.status(200).json({
      success: true,
      data: courier
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courier',
      error: err.message
    });
  }
};

// @desc    Compare courier rates
// @route   POST /api/couriers/compare
exports.compareRates = async (req, res) => {
  try {
    const { weight, serviceType = 'standard', paymentMode = 'prepaid', fromPincode, toPincode } = req.body;

    if (!weight) {
      return res.status(400).json({
        success: false,
        message: 'Please provide package weight'
      });
    }

    const couriers = await Courier.find({ isActive: true });
    const isCod = paymentMode === 'cod';

    const comparison = couriers.map(courier => {
      const rate = courier.calculateRate(weight, serviceType, isCod);
      const estimatedDays = courier.estimateDelivery(serviceType);
      const estimatedDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);

      return {
        courier: {
          id: courier._id,
          name: courier.name,
          code: courier.code,
          logo: courier.logo
        },
        rate,
        estimatedDays,
        estimatedDate,
        successRate: courier.performance.deliverySuccessRate,
        rating: courier.performance.avgRating,
        features: {
          domestic: courier.coverage.domestic,
          international: courier.coverage.international,
          tracking: true,
          insurance: true
        }
      };
    });

    // Sort by rate (cheapest first)
    comparison.sort((a, b) => a.rate - b.rate);

    // Add recommendations
    const cheapest = comparison[0];
    const fastest = comparison.reduce((prev, curr) => 
      prev.estimatedDays < curr.estimatedDays ? prev : curr
    );
    const bestRated = comparison.reduce((prev, curr) => 
      prev.rating > curr.rating ? prev : curr
    );

    res.status(200).json({
      success: true,
      data: {
        comparison,
        recommendations: {
          cheapest: {
            courier: cheapest.courier,
            rate: cheapest.rate,
            reason: 'Lowest shipping cost'
          },
          fastest: {
            courier: fastest.courier,
            estimatedDays: fastest.estimatedDays,
            reason: 'Fastest delivery time'
          },
          recommended: {
            courier: bestRated.courier,
            rating: bestRated.rating,
            successRate: bestRated.successRate,
            reason: 'Best overall performance'
          }
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error comparing rates',
      error: err.message
    });
  }
};

// @desc    Get smart recommendations
// @route   POST /api/couriers/recommend
exports.getRecommendations = async (req, res) => {
  try {
    const { weight, serviceType, priority = 'balanced', fromCity, toCity } = req.body;

    const couriers = await Courier.find({ isActive: true });

    const scored = couriers.map(courier => {
      const rate = courier.calculateRate(weight || 1, serviceType || 'standard', false);
      const days = courier.estimateDelivery(serviceType || 'standard');
      
      // Calculate score based on priority
      let score = 0;
      
      switch (priority) {
        case 'cost':
          // Lower cost = higher score
          score = (500 - rate) / 5 + courier.performance.deliverySuccessRate * 0.3;
          break;
        case 'speed':
          // Fewer days = higher score
          score = (10 - days) * 15 + courier.performance.deliverySuccessRate * 0.5;
          break;
        case 'reliability':
          // Higher success rate = higher score
          score = courier.performance.deliverySuccessRate + courier.performance.avgRating * 5;
          break;
        default: // balanced
          const costScore = (500 - rate) / 10;
          const speedScore = (10 - days) * 8;
          const reliabilityScore = courier.performance.deliverySuccessRate * 0.5;
          score = costScore + speedScore + reliabilityScore;
      }

      return {
        courier: {
          id: courier._id,
          name: courier.name,
          code: courier.code,
          logo: courier.logo
        },
        rate,
        estimatedDays: days,
        successRate: courier.performance.deliverySuccessRate,
        rating: courier.performance.avgRating,
        score: Math.round(score * 100) / 100
      };
    });

    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      priority,
      data: scored,
      topRecommendation: scored[0]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error getting recommendations',
      error: err.message
    });
  }
};

// @desc    Create courier (admin only)
// @route   POST /api/couriers
exports.createCourier = async (req, res) => {
  try {
    const courier = await Courier.create(req.body);

    res.status(201).json({
      success: true,
      data: courier
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating courier',
      error: err.message
    });
  }
};

// @desc    Update courier (admin only)
// @route   PUT /api/couriers/:id
exports.updateCourier = async (req, res) => {
  try {
    const courier = await Courier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Courier not found'
      });
    }

    res.status(200).json({
      success: true,
      data: courier
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating courier',
      error: err.message
    });
  }
};

// @desc    Delete courier (admin only)
// @route   DELETE /api/couriers/:id
exports.deleteCourier = async (req, res) => {
  try {
    const courier = await Courier.findByIdAndDelete(req.params.id);

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Courier not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Courier deleted'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting courier',
      error: err.message
    });
  }
};
