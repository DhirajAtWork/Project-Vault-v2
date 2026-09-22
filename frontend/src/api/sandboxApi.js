const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:5000/api/projects'
  : '/api/projects';

/**
 * Common Headers Helper
 */
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vault_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

/**
 * Start or Restart a Docker Sandbox container for a project
 */
export const startSandboxApi = async (projectId, envVariables = []) => {
  const response = await fetch(`${API_BASE_URL}/${projectId}/sandbox/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ envVariables }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to start Docker sandbox container');
  }
  return data;
};

/**
 * Stop a running Docker Sandbox container for a project
 */
export const stopSandboxApi = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/${projectId}/sandbox/stop`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to stop Docker sandbox container');
  }
  return data;
};

/**
 * Get the current status of a project's Docker Sandbox
 */
export const getSandboxStatusApi = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/${projectId}/sandbox/status?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch sandbox status');
  }
  return data;
};

/**
 * Get live logs from a project's Docker Sandbox
 */
export const getSandboxLogsApi = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/${projectId}/sandbox/logs?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch sandbox logs');
  }
  return data;
};

/**
 * Get Docker host engine capabilities
 */
export const getSandboxEngineApi = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/${projectId}/sandbox/engine?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch sandbox engine info');
  }
  return data;
};
