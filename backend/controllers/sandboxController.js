import Project from '../models/Project.js';
import {
  startSandbox,
  stopSandbox,
  getSandboxStatus,
  getSandboxLogs,
  isDockerAvailable,
} from '../services/dockerSandbox.service.js';

/**
 * @desc    Start or Restart a Docker Sandbox for a project
 * @route   POST /api/projects/:id/sandbox/start
 * @access  Public / Protected
 */
export const startContainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { envVariables } = req.body || {};

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const result = await startSandbox(project, envVariables);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error starting sandbox container:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start Docker sandbox container',
      error: error.message,
    });
  }
};

/**
 * @desc    Stop a running Docker Sandbox container
 * @route   POST /api/projects/:id/sandbox/stop
 * @access  Public / Protected
 */
export const stopContainer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await stopSandbox(id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error stopping sandbox container:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to stop Docker sandbox container',
      error: error.message,
    });
  }
};

/**
 * @desc    Get current status of a project's Docker Sandbox
 * @route   GET /api/projects/:id/sandbox/status
 * @access  Public
 */
export const getContainerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = getSandboxStatus(id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching sandbox status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sandbox status',
      error: error.message,
    });
  }
};

/**
 * @desc    Get logs for a project's Docker Sandbox
 * @route   GET /api/projects/:id/sandbox/logs
 * @access  Public
 */
export const getContainerLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getSandboxLogs(id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching sandbox logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sandbox logs',
      error: error.message,
    });
  }
};

/**
 * @desc    Get host Docker engine info and sandbox configuration
 * @route   GET /api/projects/:id/sandbox/engine
 * @access  Public
 */
export const getSandboxEngineInfo = async (req, res) => {
  try {
    const dockerLive = await isDockerAvailable();
    return res.status(200).json({
      success: true,
      dockerAvailable: dockerLive,
      mode: dockerLive ? 'DOCKER_DAEMON' : 'CONTAINER_SANDBOX_VIRTUAL',
      portRange: `${process.env.DOCKER_SANDBOX_PORT_START || 3001}-${process.env.DOCKER_SANDBOX_PORT_END || 3100}`,
      memoryLimit: process.env.DOCKER_SANDBOX_MEMORY_LIMIT || '512m',
      cpuLimit: process.env.DOCKER_SANDBOX_CPU_LIMIT || '1.0',
      pidsLimit: process.env.DOCKER_SANDBOX_PIDS_LIMIT || '100',
      maxLifespanMs: Number(process.env.DOCKER_SANDBOX_MAX_LIFESPAN_MS) || 600000,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to query sandbox engine info',
      error: error.message,
    });
  }
};
