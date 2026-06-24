import { useState } from 'react';

import { getBaseUrl, setBaseUrl } from '../utils/baseUrl';
import { updateBaseUrl } from '../services/httpClient';
import { testPingService } from '../services/configService';

export const useConfig = () => {
  const [isLoading, setIsLoading] = useState(false);

  const testPing = async (url: string): Promise<boolean> => {
    if (!url.trim()) {
      return false;
    }

    setIsLoading(true);

    try {
      return await testPingService(url);
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadBaseUrl = async (): Promise<string> => {
    return getBaseUrl();
  };

  const saveBaseUrl = async (url: string): Promise<void> => {
    await setBaseUrl(url);
    updateBaseUrl(url);
  };

  return {
    isLoading,
    testPing,
    loadBaseUrl,
    saveBaseUrl,
  };
};
