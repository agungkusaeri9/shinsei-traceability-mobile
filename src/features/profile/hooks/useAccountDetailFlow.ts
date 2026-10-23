import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import type { User, UserDetail } from '../../../types';
import { getErrorMessage } from '../../../utils/errorMessage';
import { getMe } from '../services/profileService';

export const useAccountDetailFlow = () => {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDetail = useCallback(async () => {
    setErrorMessage(null);
    try {
      setDetail(await getMe());
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Gagal memuat detail akun'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDetail().catch(() => undefined);
    }, [loadDetail]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDetail();
    setRefreshing(false);
  }, [loadDetail]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    loadDetail().catch(() => undefined);
  }, [loadDetail]);

  const headerUser = useMemo<User | null>(
    () =>
      detail
        ? {
            id: String(detail.id),
            name: detail.name,
            code: detail.code,
            username: detail.username,
            role: detail.role.name,
          }
        : null,
    [detail],
  );

  return {
    detail,
    headerUser,
    isLoading,
    errorMessage,
    refreshing,
    onRefresh,
    handleRetry,
  };
};
