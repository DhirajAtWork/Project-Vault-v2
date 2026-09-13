import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingleExecutable } from '../middleware/multerMiddleware.js';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  uploadExecutable,
  evaluateProjectAi,
} from '../controllers/projectController.js';

const router = express.Router();

// Public / optional auth routes (scope === 'me' strictly requires authentication)
router.get('/', (req, res, next) => {
  if (req.query?.scope === 'me' || req.cookies?.token || req.headers?.authorization) {
    return protect(req, res, next);
  }
  next();
}, getProjects);

router.get('/:id', (req, res, next) => {
  if (req.cookies?.token || req.headers?.authorization) {
    return protect(req, res, next);
  }
  next();
}, getProjectById);

// AI Project Health & Quality Evaluation (generates Grade & Score)
router.post('/:id/evaluate-ai', evaluateProjectAi);

// Protected routes (Student project creation & management)
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/upload-executable', protect, uploadSingleExecutable, uploadExecutable);

export default router;
