import express from 'express';
import { protect, authorizeAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminOverview,
  getAdminUsers,
  getAdminStudents,
  getAdminRecruiters,
  getDangerousProjects,
  getAdminProjectsHealth,
  deleteAdminUser,
} from '../controllers/adminController.js';

const router = express.Router();

// Apply protect & authorizeAdmin to all admin endpoints
router.use(protect);
router.use(authorizeAdmin);

router.get('/overview', getAdminOverview);
router.get('/users', getAdminUsers);
router.get('/students', getAdminStudents);
router.get('/recruiters', getAdminRecruiters);
router.get('/dangerous-projects', getDangerousProjects);
router.get('/projects-health', getAdminProjectsHealth);
router.delete('/users/:id', deleteAdminUser);

export default router;
