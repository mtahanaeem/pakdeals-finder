import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const classifyQuery = (query) => API.post('/classify', { query });
export const extractEntities = (query) => API.post('/extract', { query });
export const searchDeals = (query, entities) => API.post('/search', { query, entities });
export const getPriceHistory = (productId) => API.get(`/history/${encodeURIComponent(productId)}`);
export const getStatus = () => API.get('/status');

export default API;
