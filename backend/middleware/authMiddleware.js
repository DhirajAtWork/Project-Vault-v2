import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes middleware - Verifies JWT Token from Cookie or Bearer Header
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Token missing.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!req.user.isEmailVerified && !req.user.isOAuthUser) {
      return res.status(403).json({
        success: false,
        requiresEmailVerification: true,
        message: 'Email not verified. Please complete OTP verification to access this resource.',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or token expired.',
      error: error.message,
    });
  }
};

/**
 * Authorize Admin Middleware - Ensures the authenticated user has admin privileges
 */
export const authorizeAdmin = (req, res, next) => {
  if (!req.user || (req.user.accountType !== 'admin' && req.user.role !== 'admin')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required.',
    });
  }
  next();
};

