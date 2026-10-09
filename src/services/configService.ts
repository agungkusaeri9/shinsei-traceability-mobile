import axios from 'axios';
import { API_ENDPOINTS } from './api';
import { formatUrl } from '../utils/baseUrl';

export interface PingResult {
  success: boolean;
  message?: string;
}

export const testPingService = async (url: string): Promise<PingResult> => {
  const formattedUrl = formatUrl(url);
  if (!formattedUrl) {
    return { success: false, message: 'Format URL tidak valid' };
  }

  try {
    const response = await axios.get(`${formattedUrl}${API_ENDPOINTS.PING}`, {
      timeout: 7000,
      headers: {
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
      },
    });

    if (response.status === 200 || response.data?.status === true) {
      return { success: true, message: 'Server merespon (Pong)' };
    }
    return {
      success: false,
      message: `Server merespon dengan status ${response.status}`,
    };
  } catch (error: any) {
    let errorMsg = error?.message || 'Gagal terhubung ke server';
    if (error?.code === 'ECONNABORTED') {
      errorMsg = 'Timeout: Server tidak merespon dalam 7 detik';
    } else if (error?.response?.status) {
      errorMsg = `HTTP Error ${error.response.status}`;
    } else if (error?.message?.includes('Network Error')) {
      errorMsg = 'Network Error: Cek koneksi Wi-Fi/IP server';
    }
    return { success: false, message: errorMsg };
  }
};
