// ─── Base URL will be loaded dynamically from storage ─────────────────────────

// ─── API Endpoints ────────────────────────────────────────────────────────────
export const API_ENDPOINTS = {
  // Common
  PING: '/ping',

  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',

  // Profile
  PROFILE: '/profile',
  UPDATE_PROFILE: '/profile/update',

  // Dashboard
  DASHBOARD: '/dashboard',
  DASHBOARD_STATS: '/dashboard/stats',

  // SMT
  ORDER_LOT: '/orders/lot',
  SMTS: '/smts',

  // STK
  STKS: '/stks',

  // Warehouse
  SUPPLIERS: '/suppliers',
  MAKERS: '/makers',
  PART_ACCEPTANCES: '/PartAcceptances',
  WH_STOCK_INS: '/wh-stock-ins',
  ORDERS: '/Orders',
  MATERIAL_FEEDINGS: '/MaterialFeedings',
  CHECK_STK_LOCATION: '/locations/check-stk',
} as const;
