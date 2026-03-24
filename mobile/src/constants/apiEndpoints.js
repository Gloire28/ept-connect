// mobile/src/constants/apiEndpoints.js
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

export const endpoints = {
  auth: {
    register: `${API_BASE}/auth/register`,
    sendOTP: `${API_BASE}/auth/login-otp`,
    verifyOTP: `${API_BASE}/auth/verify-otp`,
  },
  sermons: `${API_BASE}/sermons`,
  music: `${API_BASE}/music`,
  books: `${API_BASE}/books`,
  announcements: `${API_BASE}/announcements`,
};

export default endpoints;