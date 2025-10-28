import apiClient from './client';

export const authApi = {
  async login(credentials) {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },
  async register(payload) {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },
  async getProfile() {
    const { data } = await apiClient.get('/auth/me');
    return data;
  }
};
