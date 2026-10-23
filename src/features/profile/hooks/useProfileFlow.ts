import { useCallback, useState } from 'react';

import { useAuth } from '../../../hooks/useAuth';
import { useTimedRefresh } from '../../../hooks/useTimedRefresh';

export const useProfileFlow = () => {
  const { user, logout } = useAuth();
  const { refreshing, onRefresh } = useTimedRefresh(1200);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const openLogoutModal = useCallback(() => setShowLogoutModal(true), []);
  const closeLogoutModal = useCallback(() => setShowLogoutModal(false), []);
  const handleLogout = useCallback(() => {
    setShowLogoutModal(false);
    logout();
  }, [logout]);

  return {
    user: user ?? {
      id: '1',
      name: 'User',
      username: 'user',
      role: 'admin',
    },
    refreshing,
    showLogoutModal,
    onRefresh,
    openLogoutModal,
    closeLogoutModal,
    handleLogout,
  };
};
