import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import { User, UserDetail, ApiResponse } from '../../../types';

export const getProfile = async (): Promise<User> => {
  const response = await httpClient.get<ApiResponse<User>>(
    API_ENDPOINTS.PROFILE,
  );
  return response.data.data;
};

/**
 * Get current user detail from /api/auth/me (authenticated via token)
 */
export const getMe = async (): Promise<UserDetail> => {
  const response = await httpClient.get<ApiResponse<UserDetail>>(
    API_ENDPOINTS.ME,
  );
  return response.data.data;
};

export const updateProfile = async (
  payload: Partial<User>,
): Promise<User> => {
  const response = await httpClient.put<ApiResponse<User>>(
    API_ENDPOINTS.UPDATE_PROFILE,
    payload,
  );
  return response.data.data;
};
