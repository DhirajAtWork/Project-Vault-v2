import { getAuthHeaders } from './authApi';

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:5000/api/analytics'
  : '/api/analytics';

/**
 * Fetch Student Analytics (KPIs, GitHub heatmap matrix, monthly trends, and collaboration requests)
 */
export const getStudentAnalyticsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/student?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch student analytics');
  }
  return data;
};

/**
 * Update recruiter collaboration request status (accept, decline, schedule)
 */
export const updateCollaborationStatusApi = async (id, status) => {
  const response = await fetch(`${API_BASE_URL}/collaborations/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update collaboration status');
  }
  return data;
};

/**
 * Send a new collaboration inquiry (Recruiter action)
 */
export const sendCollaborationRequestApi = async ({ studentId, projectName, message, projectId }) => {
  const response = await fetch(`${API_BASE_URL}/collaborations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ studentId, projectName, message, projectId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send collaboration request');
  }
  return data;
};

/**
 * Fetch Recruiter Analytics (Verified project counts, AI grade metrics, active inquiries pipeline)
 */
export const getRecruiterAnalyticsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/recruiter?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch recruiter analytics');
  }
  return data;
};

