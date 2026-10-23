import { useCallback, useState } from 'react';
import { getBaseUrl, setBaseUrl } from '../utils/baseUrl';
import { updateBaseUrl } from '../services/httpClient';
import { testPingService } from '../services/configService';
import type { PingResult } from '../types';

export const useConfig = () => {
  const [isLoading, setIsLoading] = useState(false);

  const testPing = useCallback(async (url: string): Promise<PingResult> => {
    if (!url.trim()) {
      return { success: false, message: 'URL tidak boleh kosong' };
    }

    setIsLoading(true);

    try {
      return await testPingService(url);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Gagal mengecek ping',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadBaseUrl = useCallback(async (): Promise<string> => {
    return getBaseUrl();
  }, []);

  const saveBaseUrl = useCallback(async (url: string): Promise<void> => {
    await setBaseUrl(url);
    updateBaseUrl(url);
  }, []);

  return {
    isLoading,
    testPing,
    loadBaseUrl,
    saveBaseUrl,
  };
};
