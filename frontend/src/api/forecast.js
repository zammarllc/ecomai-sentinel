import apiClient from './client';

export async function fetchForecast() {
  const { data } = await apiClient.get('/forecast');
  return data;
}

export async function submitForecast(payload) {
  const { data } = await apiClient.post('/forecast', payload);
  return data;
}
