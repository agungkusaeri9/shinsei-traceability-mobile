import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL_KEY = 'base_url';
const DEFAULT_BASE_URL = '';

export const formatUrl = (url: string): string => {
  let cleaned = url.trim();
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `http://${cleaned}`;
  }
  return cleaned.replace(/\/+$/, '');
};

export const getBaseUrl = async (): Promise<string> => {
  try {
    const savedUrl = await AsyncStorage.getItem(BASE_URL_KEY);
    return savedUrl ? formatUrl(savedUrl) : DEFAULT_BASE_URL;
  } catch (error) {
    console.error('Error getting base URL:', error);
    return DEFAULT_BASE_URL;
  }
};

export const isBaseUrlSet = async (): Promise<boolean> => {
  try {
    const savedUrl = await AsyncStorage.getItem(BASE_URL_KEY);
    return !!savedUrl && savedUrl.trim().length > 0;
  } catch {
    return false;
  }
};

export const setBaseUrl = async (url: string): Promise<void> => {
  try {
    const formatted = formatUrl(url);
    await AsyncStorage.setItem(BASE_URL_KEY, formatted);
  } catch (error) {
    console.error('Error setting base URL:', error);
    throw error;
  }
};
