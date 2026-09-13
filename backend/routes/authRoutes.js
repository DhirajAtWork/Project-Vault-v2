import express from 'express';
import passport from 'passport';
import {
  registerUser,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  loginUser,
  googleAuth,
  githubAuth,
  passportOAuthSuccess,
  getCurrentUser,
  updateUserProfile,
  uploadAvatar,
  uploadMedia,
  logoutUser,
  requestEmailChange,
  verifyEmailChange,
  updateAccountType
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingleAvatar, uploadSingleMedia } from '../middleware/multerMiddleware.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyOtp,
  validateForgotPassword,
  validateResetPassword
} from '../middleware/validationMiddleware.js';

const router = express.Router();

/**
 * 1. Standard Credential Auth & OTP Routes (Using validation middleware)
 */
router.post('/register', validateRegister, registerUser);
router.post('/verify-otp', validateVerifyOtp, verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/login', validateLogin, loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateUserProfile);
router.put('/account-type', protect, updateAccountType);
router.post('/request-email-change', protect, requestEmailChange);
router.post('/verify-email-change', protect, verifyEmailChange);
router.post('/upload-avatar', protect, uploadSingleAvatar, uploadAvatar);
router.post('/upload-media', protect, uploadSingleMedia, uploadMedia);

/**
 * 2. Passport.js Google OAuth Routes
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/signin?error=google_failed`, session: false }),
  passportOAuthSuccess
);

/**
 * 3. Passport.js GitHub OAuth Routes
 */
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/signin?error=github_failed`, session: false }),
  passportOAuthSuccess
);

/**
 * 4. Direct JSON API OAuth Routes
 */
router.post('/google', googleAuth);
router.post('/github', githubAuth);

export default router;
