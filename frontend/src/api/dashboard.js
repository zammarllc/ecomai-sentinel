import apiClient from './client';

export async function fetchDashboard() {
  const { data } = await apiClient.get('/dashboard');
  return data;
}
