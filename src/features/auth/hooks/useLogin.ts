import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { LoginFormValues, LoginFormErrors } from '../types';
import { loginService } from '../services/authService';
import { useAuth } from '../../../hooks/useAuth';
import { showError } from '../../../services/toastService';
import { getErrorMessage } from '../../../utils/errorMessage';
import { isBaseUrlSet } from '../../../utils/baseUrl';

export const useLogin = () => {
  const { setAuth, isLoading, setLoading } = useAuth();

  const [form, setForm] = useState<LoginFormValues>({
    username: 'superadmin', // 'superadmin'
    password: 'password', // 'password'
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [urlNotSet, setUrlNotSet] = useState(false);

  useFocusEffect(
    useCallback(() => {
      isBaseUrlSet()
        .then(isSet => setUrlNotSet(!isSet))
        .catch(() => setUrlNotSet(true));
    }, []),
  );

  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!form.username.trim()) {
      newErrors.username = 'Username wajib diisi';
    }

    if (!form.password) {
      newErrors.password = 'Password wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof LoginFormValues, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogin = async (): Promise<boolean> => {
    if (!validate()) return false;

    try {
      setLoading(true);
      const data = await loginService(form);
      const token = data.accessToken.token;
      const user = {
        ...data.user,
        id: data.user.id ?? data.user.code,
      };
      setAuth(user, token);
      return true;
    } catch (error) {
      const msg = getErrorMessage(error, 'Login gagal. Coba lagi.');
      showError(msg);
      // setErrors({ username: msg });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    isLoading,
    urlNotSet,
    handleChange,
    handleLogin,
  };
};
