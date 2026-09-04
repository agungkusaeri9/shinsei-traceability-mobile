// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  code?: string;
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

export type WarehouseStackParamList = {
  WarehouseHome: undefined;
  Register: undefined;
  StockIn: { registeredData?: RegisteredPart } | undefined;
  StockOut: undefined;
};

export type AreaStackParamList = {
  AreaHome: undefined;
  WarehouseDashboard: undefined;
  Register: undefined;
  StockIn: { registeredData?: RegisteredPart } | undefined;
  StockOut: undefined;
  SmtDashboard: undefined;
  SmtHome: undefined;
  PartRegister: undefined;
  PartChanging: undefined;
  Finish: undefined;
};

export type SmtStackParamList = {
  SmtHome: undefined;
  PartRegister: undefined;
  PartChanging: undefined;
  Finish: undefined;
};

import { NavigatorScreenParams } from '@react-navigation/native';

export type AppTabParamList = {
  Dashboard: undefined;
  Area: NavigatorScreenParams<AreaStackParamList> | undefined;
  Warehouse: NavigatorScreenParams<WarehouseStackParamList> | undefined;
  SMT: NavigatorScreenParams<SmtStackParamList> | undefined;
  Profile: undefined;
};

export type { RegisteredPart };

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}
