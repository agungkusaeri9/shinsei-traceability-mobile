import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL_KEY = 'base_url';
const DEFAULT_BASE_URL = 'http://192.168.245.101:5051/api';

export const getBaseUrl = async (): Promise<string> => {
  try {
    const savedUrl = await AsyncStorage.getItem(BASE_URL_KEY);
    return savedUrl || DEFAULT_BASE_URL;
  } catch (error) {
    console.error('Error getting base URL:', error);
    return DEFAULT_BASE_URL;
  }
};

export const setBaseUrl = async (url: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(BASE_URL_KEY, url);
  } catch (error) {
    console.error('Error setting base URL:', error);
    throw error;
  }
};

// export const testBaseUrl = async (url: string): Promise<boolean> => {
//   try {
//     // Simple test - just try to fetch something or check URL format
//     const isValidUrl = /^https?:\/\/.+/.test(url);
//     if (!isValidUrl) return false;
//     // In real app, you might want to make a test request
//     return true;
//   } catch (error) {
//     return false;
//   }
// };
