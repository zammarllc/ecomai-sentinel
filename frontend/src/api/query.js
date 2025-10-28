import apiClient from './client';

export async function submitQuery(payload) {
  const { data } = await apiClient.post('/queries', payload);
  return data;
}

export async function fetchRecentQueries() {
  const { data } = await apiClient.get('/queries/recent');
  return data;
}
