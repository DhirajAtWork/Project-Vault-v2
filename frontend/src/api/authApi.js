const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:5000/api/auth'
  : '/api/auth';

/**
 * Common Authorization & Content-Type Headers helper
 */
export const getAuthHeaders = (customHeaders = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vault_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...customHeaders,
  };
};

/**
 * Register new user API integration
 */
export const registerUserApi = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(formData),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.errors?.[0]?.message || data.message || 'Registration failed';
    throw new Error(errorMsg);
  }
  if (data.token && typeof window !== 'undefined') {
    localStorage.setItem('vault_token', data.token);
  }
  return data;
};

/**
 * Verify Registration OTP Code
 */
export const verifyOtpApi = async ({ email, otp }) => {
  const response = await fetch(`${API_BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed');
  }
  return data;
};

/**
 * Resend OTP Verification Code
 */
export const resendOtpApi = async ({ email }) => {
  const response = await fetch(`${API_BASE_URL}/resend-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to resend OTP code');
  }
  return data;
};

/**
 * Request Password Reset OTP
 */
export const forgotPasswordApi = async ({ email }) => {
  const response = await fetch(`${API_BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Password reset request failed');
  }
  return data;
};

/**
 * Reset Password with OTP Code
 */
export const resetPasswordApi = async ({ email, otp, newPassword, confirmPassword }) => {
  const response = await fetch(`${API_BASE_URL}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Password reset failed');
  }
  return data;
};

/**
 * Login user API integration
 */
export const loginUserApi = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Invalid credentials');
  }
  if (data.token && typeof window !== 'undefined') {
    localStorage.setItem('vault_token', data.token);
  }
  return data;
};

/**
 * Direct JSON Google OAuth API integration
 */
export const googleAuthApi = async (googlePayload) => {
  const response = await fetch(`${API_BASE_URL}/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(googlePayload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Google authentication failed');
  }
  if (data.token && typeof window !== 'undefined') {
    localStorage.setItem('vault_token', data.token);
  }
  return data;
};

/**
 * Direct JSON GitHub OAuth API integration
 */
export const githubAuthApi = async (githubPayload) => {
  const response = await fetch(`${API_BASE_URL}/github`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(githubPayload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'GitHub authentication failed');
  }
  if (data.token && typeof window !== 'undefined') {
    localStorage.setItem('vault_token', data.token);
  }
  return data;
};

/**
 * Trigger Passport.js Google OAuth Redirect
 */
export const triggerPassportGoogleAuth = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  window.location.href = `${API_BASE_URL}/google${origin ? `?origin=${encodeURIComponent(origin)}` : ''}`;
};

/**
 * Trigger Passport.js GitHub OAuth Redirect
 */
export const triggerPassportGithubAuth = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  window.location.href = `${API_BASE_URL}/github${origin ? `?origin=${encodeURIComponent(origin)}` : ''}`;
};

/**
 * Fetch Current Authenticated User Profile
 */
export const getCurrentUserApi = async () => {
  const response = await fetch(`${API_BASE_URL}/me?_t=${Date.now()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Not authenticated');
  }
  return data;
};

/**
 * Log out user session
 */
export const logoutUserApi = async () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vault_token');
    localStorage.removeItem('vault_role');
  }
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Logout failed');
  }
  return data;
};

/**
 * Update User Profile & Resume Data
 */
export const updateProfileApi = async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }
  return data;
};

/**
 * Upload User Avatar Image to Backend / Cloudinary
 */
export const uploadAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_BASE_URL}/upload-avatar`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload profile image');
  }
  return data;
};

/**
 * Upload Project Thumbnail or Media to Cloudinary
 */
export const uploadMediaApi = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/upload-media`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload project thumbnail');
  }
  return data;
};

/**
 * Request OTP code to authenticate a new email address
 */
export const requestEmailChangeApi = async (newEmail) => {
  const response = await fetch(`${API_BASE_URL}/request-email-change`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ newEmail }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send verification code');
  }
  return data;
};

/**
 * Verify OTP and authenticate the new email address
 */
export const verifyEmailChangeApi = async (newEmail, otp) => {
  const response = await fetch(`${API_BASE_URL}/verify-email-change`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ newEmail, otp }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify and update email');
  }
  if (data.token && typeof window !== 'undefined') {
    localStorage.setItem('vault_token', data.token);
  }
  if (data.user && typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

/**
 * Update user account type (student or recruiter)
 */
export const updateAccountTypeApi = async (accountType) => {
  const response = await fetch(`${API_BASE_URL}/account-type`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ accountType }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update account type');
  }
  if (data.token && typeof window !== 'undefined') {
    localStorage.setItem('vault_token', data.token);
  }
  if (data.user && typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('vault_role', data.user.accountType);
  }
  return data;
};

