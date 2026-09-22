import express from 'express';
import {
  startContainer,
  stopContainer,
  getContainerStatus,
  getContainerLogs,
  getSandboxEngineInfo,
} from '../controllers/sandboxController.js';

const router = express.Router({ mergeParams: true });

router.post('/start', startContainer);
router.post('/stop', stopContainer);
router.get('/status', getContainerStatus);
router.get('/logs', getContainerLogs);
router.get('/engine', getSandboxEngineInfo);

export default router;
