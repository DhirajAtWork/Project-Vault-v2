const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:5000/api/projects'
  : '/api/projects';

/**
 * Fetch projects owned by the currently logged-in student
 */
export const getMyProjectsApi = async () => {
  const response = await fetch(`${API_BASE_URL}?scope=me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
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
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE_URL}?${query}` : API_BASE_URL;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
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
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(projectData),
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
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch project details');
  }
  return data;
};

/**
 * Delete a project owned by the student
 */
export const deleteProjectApi = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
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

  const response = await fetch(`${API_BASE_URL}/upload-executable`, {
    method: 'POST',
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
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to run AI evaluation');
  }
  return data;
};
