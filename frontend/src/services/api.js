import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 15000,
});

// ========== Existing APIs ==========
export const searchByPincode = async (pincode) => {
  const { data } = await api.get(`/api/pincode/${pincode}`);
  return data;
};

export const getAllStates = async () => {
  const { data } = await api.get('/api/states');
  return data;
};

export const getDistrictsByState = async (stateName) => {
  const { data } = await api.get(`/api/states/${encodeURIComponent(stateName)}/districts`);
  return data;
};

export const getTaluksByDistrict = async (stateName, districtName) => {
  const { data } = await api.get(`/api/states/${encodeURIComponent(stateName)}/districts/${encodeURIComponent(districtName)}/taluks`);
  return data;
};

export const getPincodesByDistrict = async (districtName) => {
  const { data } = await api.get(`/district/${encodeURIComponent(districtName)}`);
  return data;
};

export const autoSuggest = async (query, signal) => {
  const { data } = await api.get('/api/search', { params: { q: query }, signal });
  return data;
};

// ========== New APIs ==========

// Paginated pincode data with filters
export const getPincodes = async ({ state, district, taluk, page = 1, limit = 20 }, signal) => {
  const params = { page, limit };
  if (state) params.state = state;
  if (district) params.district = district;
  if (taluk) params.taluk = taluk;
  const { data } = await api.get('/api/pincodes', { params, signal });
  return data;
};

// Get pincode details
export const getPincodeDetails = async (pincode) => {
  const { data } = await api.get(`/api/pincode/${pincode}`);
  return data;
};

// Dashboard stats
export const getStats = async () => {
  const { data } = await api.get('/api/stats');
  return data;
};

export const getStateDistribution = async () => {
  const { data } = await api.get('/api/stats/state-distribution');
  return data;
};

export const getDeliveryDistribution = async () => {
  const { data } = await api.get('/api/stats/delivery-distribution');
  return data;
};

// Export CSV
export const getExportUrl = (state) => {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const params = state ? `?state=${encodeURIComponent(state)}` : '';
  return `${base}/api/export${params}`;
};

export default api;
