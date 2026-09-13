import { getAuthHeaders } from './authApi';

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:5000/api/projects'
  : '/api/projects';

/**
 * Fetch projects owned by the currently logged-in student
 */
export const getMyProjectsApi = async () => {
  const timestamp = Date.now();
  const response = await fetch(`${API_BASE_URL}?scope=me&_t=${timestamp}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch projects');
  }
  return data;
};

/**
 * Fetch public projects (for showcase catalog or recruiter visit)
 */
export const getAllProjectsApi = async (params = {}) => {
  const queryParams = new URLSearchParams({ ...params, _t: Date.now() }).toString();
  const url = `${API_BASE_URL}?${queryParams}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch projects catalog');
  }
  return data;
};

/**
 * Create and publish a new engineering project
 */
export const createProjectApi = async (projectData) => {
  // Normalize command and environment variables
  const payload = {
    ...projectData,
    installCmd: projectData.installCmd || projectData.installCommand || '',
    runCommand: projectData.runCommand || '',
    testCmd: projectData.testCmd || projectData.testCommand || '',
    envVariables: Array.isArray(projectData.envVariables) && projectData.envVariables.length > 0
      ? projectData.envVariables
      : (Array.isArray(projectData.envVars)
          ? projectData.envVars
              .filter((ev) => ev && ev.key && ev.key.trim())
              .map((ev) => ({ key: ev.key.trim(), value: ev.value || '' }))
          : []),
  };

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to publish project');
  }
  return data;
};

/**
 * Fetch a single project by ID with full details, runtime commands, and environment variables
 */
export const getProjectByIdApi = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch project details');
  }
  return data;
};

/**
 * Update an existing project
 */
export const updateProjectApi = async (projectId, projectData) => {
  const payload = {
    ...projectData,
    installCmd: projectData.installCmd !== undefined ? projectData.installCmd : (projectData.installCommand || ''),
    runCommand: projectData.runCommand || '',
    testCmd: projectData.testCmd !== undefined ? projectData.testCmd : (projectData.testCommand || ''),
    envVariables: Array.isArray(projectData.envVariables)
      ? projectData.envVariables
      : (Array.isArray(projectData.envVars)
          ? projectData.envVars
              .filter((ev) => ev && ev.key && ev.key.trim())
              .map((ev) => ({ key: ev.key.trim(), value: ev.value || '' }))
          : []),
  };

  const response = await fetch(`${API_BASE_URL}/${projectId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update project');
  }
  return data;
};

/**
 * Delete a project owned by the student
 */
export const deleteProjectApi = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/${projectId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete project');
  }
  return data;
};

/**
 * Upload an executable (.exe) or binary build file for automated execution & AI project testing
 */
export const uploadExecutableApi = async (file) => {
  const formData = new FormData();
  formData.append('executable', file);

  const token = typeof window !== 'undefined' ? localStorage.getItem('vault_token') : null;
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE_URL}/upload-executable`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload executable file');
  }
  return data;
};

/**
 * Trigger AI project evaluation to generate official Grade & Score
 */
export const evaluateProjectAiApi = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/${projectId}/evaluate-ai`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to run AI evaluation');
  }
  return data;
};
