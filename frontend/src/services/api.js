import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
});

export const searchByPincode = async (pincode) => {
  const { data } = await api.get(`/api/${pincode}`);
  return data;
};

export const getAllStates = async () => {
  const { data } = await api.get('/states');
  return data;
};

export const getDistrictsByState = async (stateName) => {
  const { data } = await api.get(`/states/${encodeURIComponent(stateName)}`);
  return data;
};

export const getPincodesByDistrict = async (districtName) => {
  const { data } = await api.get(`/district/${encodeURIComponent(districtName)}`);
  return data;
};

export const autoSuggest = async (query, signal) => {
  const { data } = await api.get('/search', { params: { q: query }, signal });
  return data;
};

export default api;
