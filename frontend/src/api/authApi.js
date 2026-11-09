import axiosClient from './axiosClient';

/**
 * Authentication API Service
 * Sourced from API_CONTRACT.md & Backend Auth Endpoints
 */

/**
 * Register a new user
 * @param {Object} data - { name, email, password, role, country_code, phone_number }
 * @returns {Promise<Object>} Created user object
 */
export async function register(data) {
  const payload = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    role: data.role,
    country_code: data.country_code || '+91',
    phone_number: data.phone_number.trim(),
  };

  const response = await axiosClient.post('/auth/register', payload);
  return response.data;
}

/**
 * Login user using OAuth2 Password Request format
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} { access_token, token_type, user }
 */
export async function login({ email, password }) {
  const params = new URLSearchParams();
  params.append('username', email.trim().toLowerCase());
  params.append('password', password);

  const response = await axiosClient.post('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
}

/**
 * Fetch currently authenticated user profile
 * @returns {Promise<Object>} User object
 */
export async function getMe() {
  const response = await axiosClient.get('/auth/me');
  return response.data;
}

/**
 * Update user profile
 * @param {Object} data - { name, country_code, phone_number }
 * @returns {Promise<Object>} Updated user object
 */
export async function updateProfile(data) {
  const payload = {
    name: data.name.trim(),
    country_code: data.country_code || '+91',
    phone_number: data.phone_number.trim(),
  };

  const response = await axiosClient.put('/auth/me', payload);
  return response.data;
}
