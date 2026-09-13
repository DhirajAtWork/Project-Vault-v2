import { body, validationResult } from 'express-validator';

/**
 * Middleware to evaluate express-validator results
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0]?.msg || 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * 1. Express-Validator Rules & Middleware for User Registration
 */
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('accountType')
    .optional()
    .isIn(['student', 'recruiter'])
    .withMessage('Account type must be student or recruiter'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required'),
  handleValidationErrors,
];

/**
 * 2. Express-Validator Rules & Middleware for User Login
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * 3. Express-Validator Rules & Middleware for OTP Verification
 */
export const validateVerifyOtp = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP code must be exactly 6 digits'),
  handleValidationErrors,
];

/**
 * 4. Express-Validator Rules & Middleware for Forgot Password
 */
export const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Please provide your registered email address')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  handleValidationErrors,
];

/**
 * 5. Express-Validator Rules & Middleware for Reset Password
 */
export const validateResetPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('Reset OTP code is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors,
];
