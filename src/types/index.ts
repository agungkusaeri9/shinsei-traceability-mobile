// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Navigation Types ─────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  Settings: undefined;
};

import { RegisteredPart } from '../features/warehouse/types';

export type AppTabParamList = {
  Dashboard: undefined;
  PartAcceptance: undefined;
  MaterialFeeding: undefined;
  Area: undefined;
  Warehouse: undefined;
  Register: undefined;
  StockIn: { registeredData?: RegisteredPart } | undefined;
  StockOut: undefined;
  Profile: undefined;
};

export type { RegisteredPart };

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}
