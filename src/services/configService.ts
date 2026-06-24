import axios from 'axios';
import { API_ENDPOINTS } from './api';

export const testPingService = async (url: string): Promise<boolean> => {
  const response = await axios.get(`${url}${API_ENDPOINTS.PING}`, {
    timeout: 5000,
  });

  return response.status === 200;
};
