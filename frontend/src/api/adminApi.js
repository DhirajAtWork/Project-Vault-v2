import { getAuthHeaders } from './authApi';

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:5000/api/admin'
  : '/api/admin';

/**
 * Fetch Admin Overview Metrics & System Stats
 */
export const getAdminOverviewApi = async () => {
  const response = await fetch(`${API_BASE_URL}/overview?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch admin overview');
  return data;
};

/**
 * Fetch All Student Users for Administration
 */
export const getAdminUsersApi = async () => {
  const response = await fetch(`${API_BASE_URL}/users?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
  return data;
};

/**
 * Fetch All Student Accounts Dedicated Endpoint
 */
export const getAdminStudentsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/students?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch students');
  return data;
};

/**
 * Fetch All Recruiter Accounts
 */
export const getAdminRecruitersApi = async () => {
  const response = await fetch(`${API_BASE_URL}/recruiters?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch recruiters');
  return data;
};

/**
 * Fetch Projects with Dangerous Health Score (score < 40)
 */
export const getDangerousProjectsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/dangerous-projects?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch dangerous projects');
  return data;
};

/**
 * Fetch All Projects with Health Scores (Dangerous vs Healthy)
 */
export const getAdminProjectsHealthApi = async () => {
  const response = await fetch(`${API_BASE_URL}/projects-health?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch projects health');
  return data;
};

/**
 * Delete a user account (Admin) — sends removal email automatically on server side
 */
export const deleteAdminUserApi = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to remove user');
  return data;
};
