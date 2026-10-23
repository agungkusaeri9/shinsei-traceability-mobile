// ─── Base URL will be loaded dynamically from storage ─────────────────────────

// ─── API Endpoints ────────────────────────────────────────────────────────────
export const API_ENDPOINTS = {
  // Common
  PING: '/ping',

  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  ME: '/auth/me',
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
  ORDER_LOTS: '/orderlots',
  SMTS: '/smts',
  SMTS_FINISH: '/smts/finish',
  SMTS_ACCEPTANCE: '/smts/acceptance',

  // STK
  STKS: '/stks',
  STK_TIMELINES: '/Stks/timelines',
  CHECK_STK_LOCATION: '/stks/check-location',

  // Parts
  PARTS: '/Parts',

  // Areas
  AREAS: '/Areas',

  // Users
  USERS: '/Users',

  // Customers
  CUSTOMERS: '/Customers',

  // Warehouse
  SUPPLIERS: '/suppliers',
  MAKERS: '/makers',
  PART_ACCEPTANCES: '/PartAcceptances',
  WH_STOCK_INS: '/wh-stock-ins',
  ORDERS: '/Orders',
  ORDER_LOTS_SEARCH: '/OrderLots/search',
  MATERIAL_FEEDINGS: '/MaterialFeedings',
  // QA & ASSY
  ASSY: '/assy',
  ASSY_FINISH: '/assy/finish',
  ASSY_DELIVERED: '/assy/delivered',
  ASSY_ACCEPTANCE: '/assy/acceptance',

  // Delivery & PO
  PO_NUMBER: '/po-Number',
  ORDER_POS: '/orderpos',
  BOXES_BY_PO: '/boxes/by-po',
} as const;
