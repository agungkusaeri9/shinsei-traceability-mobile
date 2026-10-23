import { useCallback, useEffect, useState } from 'react';

import { useConfig } from '../../../hooks/useConfig';
import { showError, showSuccess } from '../../../services/toastService';
import { formatUrl } from '../../../utils/baseUrl';
import { getErrorMessage } from '../../../utils/errorMessage';

type Options = {
  onSaved: () => void;
};

export const useSettingsFlow = ({ onSaved }: Options) => {
  const [baseUrl, setBaseUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { loadBaseUrl, saveBaseUrl, testPing } = useConfig();

  useEffect(() => {
    loadBaseUrl()
      .then(setBaseUrl)
      .catch(error => {
        showError(getErrorMessage(error, 'Gagal memuat Base URL'));
      });
  }, [loadBaseUrl]);

  const handleChangeBaseUrl = useCallback((value: string) => {
    setBaseUrl(value);
  }, []);

  const handleTest = useCallback(async () => {
    if (!baseUrl.trim()) {
      showError('Base URL tidak boleh kosong');
      return;
    }

    setIsTesting(true);
    try {
      const formattedUrl = formatUrl(baseUrl);
      setBaseUrl(formattedUrl);
      const result = await testPing(formattedUrl);
      if (result.success) {
        showSuccess(result.message || 'Base URL valid & server merespon!');
        return;
      }
      showError(result.message || 'Base URL tidak dapat dijangkau');
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal melakukan koneksi'));
    } finally {
      setIsTesting(false);
    }
  }, [baseUrl, testPing]);

  const handleSave = useCallback(async () => {
    if (!baseUrl.trim()) {
      showError('Base URL tidak boleh kosong');
      return;
    }

    setIsSaving(true);
    try {
      const formattedUrl = formatUrl(baseUrl);
      setBaseUrl(formattedUrl);
      await saveBaseUrl(formattedUrl);
      showSuccess('Base URL berhasil disimpan');
      onSaved();
    } catch (error) {
      showError(getErrorMessage(error, 'Terjadi kesalahan saat menyimpan'));
    } finally {
      setIsSaving(false);
    }
  }, [baseUrl, onSaved, saveBaseUrl]);

  return {
    baseUrl,
    isTesting,
    isSaving,
    handleChangeBaseUrl,
    handleTest,
    handleSave,
  };
};
