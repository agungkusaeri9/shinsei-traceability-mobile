// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  code?: string;
  username: string;
  role: string;
  avatar?: string;
}

export interface Area {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/** Role object embedded in the /api/auth/me response */
export interface UserRole {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Response payload of GET /api/auth/me */
export interface UserDetail {
  id: number;
  name: string;
  code: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
// ─── Service Types ───────────────────────────────────────────────────────────

export interface PingResult {
  success: boolean;
  message?: string;
}

// ─── Navigation Types ─────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  CheckStk: undefined;
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
  PartAcceptance: undefined;
  StockIn: { registeredData?: RegisteredPart } | undefined;
  StockOut: undefined;
};

export type AreaStackParamList = {
  AreaHome: undefined;
  WarehouseDashboard: undefined;
  Register: undefined;
  PartAcceptance: undefined;
  StockIn: { registeredData?: RegisteredPart } | undefined;
  StockOut: undefined;
  SmtDashboard: undefined;
  SmtHome: undefined;
  PartRegister: undefined;
  PartChanging: undefined;
  Finish: undefined;
  SmtAcceptance: undefined;
  QaAssyHome: undefined;
  QaRegister: undefined;
  QaAddPart: undefined;
  QaFinish: undefined;
  QaAcceptance: undefined;
  DeliveryHome: undefined;
};

export type DeliveryStackParamList = {
  DeliveryHome: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  AccountDetail: undefined;
  Settings: undefined;
  ChangeIPAddress: undefined;
};

export type SmtStackParamList = {
  SmtHome: undefined;
  PartRegister: undefined;
  PartChanging: undefined;
  Finish: undefined;
  SmtAcceptance: undefined;
};

export type QaAssyStackParamList = {
  QaAssyHome: undefined;
  QaRegister: undefined;
  QaAddPart: undefined;
  QaFinish: undefined;
  QaAcceptance: undefined;
};

import { NavigatorScreenParams } from '@react-navigation/native';

export type AppTabParamList = {
  Dashboard: undefined;
  Area: NavigatorScreenParams<AreaStackParamList> | undefined;
  Warehouse: NavigatorScreenParams<WarehouseStackParamList> | undefined;
  SMT: NavigatorScreenParams<SmtStackParamList> | undefined;
  QAAssy: NavigatorScreenParams<QaAssyStackParamList> | undefined;
  Delivery: NavigatorScreenParams<DeliveryStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type { RegisteredPart };

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}
