import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import { LoginPayload, LoginResponse, ForgotPasswordPayload } from '../types';
import { ApiResponse } from '../../../types';

/**
 * Login user with email and password
 */
export const loginService = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const response = await httpClient.post<ApiResponse<LoginResponse>>(
    API_ENDPOINTS.LOGIN,
    payload,
  );
  return response.data.data;
};

/**
 * Logout current user
 */
export const logoutService = async (): Promise<void> => {
  await httpClient.post(API_ENDPOINTS.LOGOUT);
};

/**
 * Send forgot password email
 */
export const forgotPasswordService = async (
  payload: ForgotPasswordPayload,
): Promise<{ message: string }> => {
  const response = await httpClient.post<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.FORGOT_PASSWORD,
    payload,
  );
  return response.data.data;
};
