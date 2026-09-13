import crypto from 'crypto';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { 
  sendOtpEmail, 
  sendWelcomeEmail, 
  sendResetPasswordEmail 
} from '../utils/sendEmail.js';

/**
 * Generate a 6-digit OTP Code
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash raw OTP using SHA-256 before storing in database
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Generate JWT Token & Attach to httpOnly Cookie
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    message,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      role: user.role || (user.accountType === 'admin' ? 'admin' : 'user'),
      subscribeNewsletter: user.subscribeNewsletter,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      googleId: user.googleId,
      githubId: user.githubId,
      createdAt: user.createdAt,
    },
  });
};

/**
 * @desc    Register new user & send Email Verification OTP
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, accountType, password, confirmPassword, subscribeNewsletter } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const targetRole = accountType || 'student';

    const existingUser = await User.findOne({
      email: normalizedEmail,
      accountType: targetRole,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with this email already exists as a ${targetRole}. Please sign in or select a different role.`,
      });
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 Minutes

    const user = await User.create({
      name,
      email: normalizedEmail,
      accountType: targetRole,
      password,
      subscribeNewsletter: Boolean(subscribeNewsletter),
      otp: hashedOtp,
      otpExpires,
      isEmailVerified: false,
    });

    // Send Verification OTP Email asynchronously with plaintext OTP
    sendOtpEmail(user.email, user.name, otp);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification OTP code has been sent to your email.',
      requiresOtpVerification: true,
      email: user.email,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user registration',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify Registration OTP Code & Send Welcome Email
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, accountType } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const query = { email: normalizedEmail };
    if (accountType) {
      query.accountType = accountType;
    }

    const user = await User.findOne(query).sort({ createdAt: -1 }).select('+otp +otpExpires');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (user.isEmailVerified) {
      return sendTokenResponse(user, 200, res, 'Email already verified. Logged in successfully.');
    }

    const hashedOtp = hashOtp(otp);
    if (!user.otp || user.otp !== hashedOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check your email and try again.',
      });
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP code has expired. Please request a new verification code.',
      });
    }

    // Mark email as verified and wipe OTP from database
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send Welcome Email asynchronously
    sendWelcomeEmail(user.email, user.name);

    sendTokenResponse(user, 200, res, 'Email verified successfully! Welcome to Project Vault.');
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
      error: error.message,
    });
  }
};

/**
 * @desc    Resend Verification OTP Code
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOTP = async (req, res) => {
  try {
    const { email, accountType } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const query = { email: normalizedEmail };
    if (accountType) {
      query.accountType = accountType;
    }

    const user = await User.findOne(query).sort({ createdAt: -1 });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    const otp = generateOtp();
    user.otp = hashOtp(otp);
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    sendOtpEmail(user.email, user.name, otp);

    res.status(200).json({
      success: true,
      message: 'New OTP verification code sent to your email.',
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP',
      error: error.message,
    });
  }
};

/**
 * @desc    Forgot Password - Request Reset OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email, accountType } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const query = { email: normalizedEmail };
    if (accountType) {
      query.accountType = accountType;
    }

    const user = await User.findOne(query).sort({ createdAt: -1 });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address',
      });
    }

    const resetOtp = generateOtp();
    user.resetPasswordOtp = hashOtp(resetOtp);
    user.resetPasswordOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    sendResetPasswordEmail(user.email, user.name, resetOtp);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP has been sent to your email.',
      email: user.email,
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request',
      error: error.message,
    });
  }
};

/**
 * @desc    Reset Password using OTP Code
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const user = await User.findOne({ email }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    const hashedResetOtp = hashOtp(otp);
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== hashedResetOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password reset OTP code.',
      });
    }

    if (user.resetPasswordOtpExpires && user.resetPasswordOtpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Password reset OTP has expired. Please request a new code.',
      });
    }

    // Update password (triggers pre-save bcrypt hash) and clear reset fields
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset',
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate user & sign in
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password, accountType } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email address and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const query = { email: normalizedEmail };
    if (accountType) {
      query.accountType = accountType;
    }

    const users = await User.find(query).select('+password');
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: accountType
          ? `No ${accountType} account found with this email address`
          : 'Invalid email address or password',
      });
    }

    let matchedUser = null;
    for (const u of users) {
      const isMatch = await u.matchPassword(password);
      if (isMatch) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password',
      });
    }

    sendTokenResponse(matchedUser, 200, res, 'Signed in successfully');
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user authentication',
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate or Register via Google OAuth (JSON API)
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, avatar, accountType } = req.body;

    if (!googleId && !email) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication payload must include googleId or email',
      });
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    }).select('+googleId');

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (avatar) user.avatar = avatar;
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        avatar: avatar || '',
        accountType: accountType || 'student',
        isEmailVerified: true,
      });
    }

    sendTokenResponse(user, 200, res, 'Google authentication successful');
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google authentication',
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate or Register via GitHub OAuth (JSON API)
 * @route   POST /api/auth/github
 * @access  Public
 */
export const githubAuth = async (req, res) => {
  try {
    const { githubId, email, name, avatar, accountType } = req.body;

    if (!githubId && !email) {
      return res.status(400).json({
        success: false,
        message: 'GitHub authentication payload must include githubId or email',
      });
    }

    let user = await User.findOne({
      $or: [{ githubId }, { email }],
    }).select('+githubId');

    if (user) {
      if (!user.githubId) {
        user.githubId = githubId;
        if (avatar) user.avatar = avatar;
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || 'GitHub Developer',
        email: email || `${githubId}@users.noreply.github.com`,
        githubId,
        avatar: avatar || '',
        accountType: accountType || 'student',
        isEmailVerified: true,
      });
    }

    sendTokenResponse(user, 200, res, 'GitHub authentication successful');
  } catch (error) {
    console.error('GitHub Auth Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during GitHub authentication',
      error: error.message,
    });
  }
};

/**
 * @desc    Passport OAuth Success Handler (Redirects browser back to client dashboard)
 * @route   GET /api/auth/google/callback & GET /api/auth/github/callback
 * @access  Public
 */
export const passportOAuthSuccess = (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/signin?error=oauth_failed`);
  }

  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);
  return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`);
};

/**
 * @desc    Get Current Authenticated User Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, invalid token',
    });
  }
};

/**
 * @desc    Update Current User Profile & Resume Data
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    const {
      name,
      accountType,
      subscribeNewsletter,
      avatar,
      headline,
      phone,
      location,
      bio,
      socialLinks,
      education,
      experience,
      skills,
      certifications,
    } = req.body;

    if (name !== undefined) user.name = name;
    if (accountType !== undefined) user.accountType = accountType;
    if (subscribeNewsletter !== undefined) user.subscribeNewsletter = Boolean(subscribeNewsletter);
    if (avatar !== undefined) user.avatar = avatar;
    if (headline !== undefined) user.headline = headline;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (socialLinks !== undefined) user.socialLinks = socialLinks;
    if (education !== undefined) user.education = education;
    if (experience !== undefined) user.experience = experience;
    if (skills !== undefined) user.skills = skills;
    if (certifications !== undefined) user.certifications = certifications;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile and resume details saved successfully!',
      user,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Log out user & clear httpOnly cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutUser = (req, res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Signed out successfully',
  });
};

/**
 * @desc    Upload User Avatar to Cloudinary via Multer
 * @route   POST /api/auth/upload-avatar
 * @access  Private
 */
export const uploadAvatar = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload',
      });
    }

    // Upload image buffer stream to Cloudinary
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'project_vault/avatars',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    user.avatar = cloudinaryResult.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded and saved successfully!',
      avatar: user.avatar,
      user,
    });
  } catch (error) {
    console.error('Avatar Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image to Cloudinary',
      error: error.message,
    });
  }
};

/**
 * @desc    Upload Project Thumbnail or Media to Cloudinary
 * @route   POST /api/auth/upload-media
 * @access  Private
 */
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload',
      });
    }

    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'project_vault/thumbnails',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    res.status(200).json({
      success: true,
      message: 'Thumbnail uploaded successfully!',
      url: cloudinaryResult.secure_url,
    });
  } catch (error) {
    console.error('Media Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload project thumbnail',
      error: error.message,
    });
  }
};

