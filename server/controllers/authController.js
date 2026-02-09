const User = require('../models/User');
const SystemLog = require('../models/SystemLog');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, company, phone, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user (role defaults to 'business' unless admin creates the user)
    const user = await User.create({
      name,
      email,
      password,
      company,
      phone,
      role: role || 'business'
    });

    // Log the action
    await SystemLog.create({
      action: 'create',
      module: 'auth',
      user: user._id,
      userEmail: email,
      description: `New user registered: ${email}`,
      status: 'success'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: err.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Contact admin.'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await SystemLog.create({
        action: 'login',
        module: 'auth',
        userEmail: email,
        description: `Failed login attempt for: ${email}`,
        status: 'failed'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Log successful login
    await SystemLog.create({
      action: 'login',
      module: 'auth',
      user: user._id,
      userEmail: email,
      description: `User logged in: ${email}`,
      status: 'success'
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: err.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: err.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      company: req.body.company
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: err.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: err.message
    });
  }
};

// @desc    Forgot password (simulated - just returns success)
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In a real app, send email here
    // For demo, just return success
    res.status(200).json({
      success: true,
      message: 'Password reset email sent (simulated)',
      resetToken // In production, don't send this in response
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password',
      error: err.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    if (req.user) {
      await SystemLog.create({
        action: 'logout',
        module: 'auth',
        user: req.user._id,
        userEmail: req.user.email,
        description: `User logged out: ${req.user.email}`,
        status: 'success'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: err.message
    });
  }
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone
    }
  });
};
