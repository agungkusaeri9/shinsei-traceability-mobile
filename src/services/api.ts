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
  TRACKING_SUMMARY: '/Dashboard/tracking-summary',
  STK_TRACKING_TABLE: '/Dashboard/stk-tracking-table',
  WAREHOUSE_SUMMARY: '/Dashboard/warehouse-summary',
  RECENT_ACCEPTANCES: '/Dashboard/recent-acceptances',
  STK_BY_AREA: '/Dashboard/stk-by-area',

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
