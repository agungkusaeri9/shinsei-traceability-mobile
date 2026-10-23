import { useCallback, useState } from 'react';

import { forgotPasswordService } from '../services/authService';
import { getErrorMessage } from '../../../utils/errorMessage';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useForgotPasswordFlow = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleChangeEmail = useCallback((value: string) => {
    setEmail(value);
    setErrorMessage('');
  }, []);

  const handleSubmit = useCallback(async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setErrorMessage('Email wajib diisi');
      return;
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setErrorMessage('Format email tidak valid');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    try {
      await forgotPasswordService({ email: normalizedEmail });
      setIsSent(true);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Gagal mengirim instruksi reset password'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  return {
    email,
    errorMessage,
    isLoading,
    isSent,
    handleChangeEmail,
    handleSubmit,
  };
};
