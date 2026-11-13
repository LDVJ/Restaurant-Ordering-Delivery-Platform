import axiosClient from './axiosClient';

/**
 * Address API Service
 * Sourced from API_CONTRACT.md - Saved Addresses Endpoints
 */

/**
 * Get customer saved addresses (plain list, max 10)
 * @returns {Promise<Array>} List of addresses
 */
export async function getAddresses(params = {}) {
  const response = await axiosClient.get('/addresses', { params });
  return response.data?.addresses || [];
}

/**
 * Create a new address
 * @param {Object} data - { house, city, state, country, country_code, phone_number, is_default? }
 * @returns {Promise<Object>} Created address
 */
export async function createAddress(data) {
  const payload = {
    house: data.house.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    country: data.country.trim(),
    country_code: data.country_code || '+91',
    phone_number: data.phone_number.trim(),
  };

  if (typeof data.is_default === 'boolean') {
    payload.is_default = data.is_default;
  }

  const response = await axiosClient.post('/addresses', payload);
  return response.data;
}

/**
 * Update an existing address (is_default is not accepted here)
 * @param {string} id - Address ID
 * @param {Object} data - { house, city, state, country, country_code, phone_number }
 * @returns {Promise<Object>} Updated address
 */
export async function updateAddress(id, data) {
  const payload = {
    house: data.house.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    country: data.country.trim(),
    country_code: data.country_code || '+91',
    phone_number: data.phone_number.trim(),
  };

  const response = await axiosClient.put(`/addresses/${id}`, payload);
  return response.data;
}

/**
 * Set an address as the default address
 * @param {string} id - Address ID
 * @returns {Promise<Object>} Updated address
 */
export async function makeDefaultAddress(id) {
  const response = await axiosClient.post(`/addresses/${id}/default`);
  return response.data;
}

/**
 * Delete a saved address
 * @param {string} id - Address ID
 * @returns {Promise<void>}
 */
export async function deleteAddress(id) {
  await axiosClient.delete(`/addresses/${id}`);
}
