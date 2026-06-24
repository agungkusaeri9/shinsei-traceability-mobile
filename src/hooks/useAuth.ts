import { useAuthStore } from '../store/authStore';

/**
 * Hook to access authentication state and actions
 */
export const useAuth = () => {
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const setAuth = useAuthStore(state => state.setAuth);
  const setLoading = useAuthStore(state => state.setLoading);
  const logout = useAuthStore(state => state.logout);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    setAuth,
    setLoading,
    logout,
  };
};
