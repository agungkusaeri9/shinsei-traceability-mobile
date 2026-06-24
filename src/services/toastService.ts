import Toast from 'react-native-toast-message';
import { ToastType } from '../types';

export const showToast = (type: ToastType, message: string, title?: string) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'bottom',
  });
};

export const showSuccess = (message: string, title = 'Success') => {
  showToast(ToastType.Success, message, title);
};

export const showError = (message: string, title = 'Error') => {
  showToast(ToastType.Error, message, title);
};

export const showWarning = (message: string, title = 'Warning') => {
  showToast(ToastType.Warning, message, title);
};

export const showInfo = (message: string, title = 'Info') => {
  showToast(ToastType.Info, message, title);
};
