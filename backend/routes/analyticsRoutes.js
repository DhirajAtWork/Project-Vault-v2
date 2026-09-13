import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getStudentAnalytics,
  getRecruiterAnalytics,
  updateCollaborationStatus,
  createCollaborationRequest,
} from '../controllers/analyticsController.js';

const router = express.Router();

// Student Analytics routes
router.get('/student', protect, getStudentAnalytics);
router.patch('/collaborations/:id/status', protect, updateCollaborationStatus);

// Recruiter routes
router.get('/recruiter', protect, getRecruiterAnalytics);
router.post('/collaborations', protect, createCollaborationRequest);

export default router;
