import axiosClient from './axiosClient';

/**
 * Restaurant & Menu API Services
 * Sourced from API_CONTRACT.md (Customer: restaurants and menu)
 */

/**
 * Fetch active restaurants with optional search, cuisine, and pagination
 */
export async function getRestaurants({
  search = '',
  cuisine = '',
  page = 1,
  page_size = 9,
} = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.append('search', search.trim());
  if (cuisine.trim() && cuisine.trim().toLowerCase() !== 'all') {
    params.append('cuisine', cuisine.trim());
  }
  if (page) params.append('page', page);
  if (page_size) params.append('page_size', page_size);

  const response = await axiosClient.get(`/restaurants?${params.toString()}`);
  return response.data;
}

/**
 * Fetch a single restaurant's detail by ID
 */
export async function getRestaurantById(id) {
  const response = await axiosClient.get(`/restaurants/${id}`);
  return response.data;
}

/**
 * Fetch paginated menu dishes for a restaurant with optional filters
 */
export async function getRestaurantMenu(
  restaurantId,
  { search = '', min_price = '', max_price = '', page = 1, page_size = 20 } = {}
) {
  const params = new URLSearchParams();
  if (search.trim()) params.append('search', search.trim());
  if (min_price !== '' && min_price !== null && !isNaN(Number(min_price))) {
    params.append('min_price', min_price);
  }
  if (max_price !== '' && max_price !== null && !isNaN(Number(max_price))) {
    params.append('max_price', max_price);
  }
  if (page) params.append('page', page);
  if (page_size) params.append('page_size', page_size);

  const response = await axiosClient.get(
    `/restaurants/${restaurantId}/menu?${params.toString()}`
  );
  return response.data;
}
