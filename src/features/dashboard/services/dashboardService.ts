import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import { ApiResponse } from '../../../types';

export interface StageItem {
  stage: string;
  label: string;
  count: number;
  description: string;
}

export interface TrackingSummaryData {
  partAcceptanceCount: number;
  stockInCount: number;
  materialFeedingCount: number;
  stages: StageItem[];
}

export interface StkTimelines {
  partAcceptance: string | null;
  stockIn: string | null;
  materialFeeding: string | null;
  smt: string | null;
  assembly: string | null;
  finishGood: string | null;
}

export interface StkTrackingItem {
  id: number;
  stkNumber: string;
  partCode: string;
  partName: string;
  supplierName: string;
  customerName: string;
  quantity: number;
  currentStage: string;
  timelines: StkTimelines;
  lastUpdated: string;
}

export interface WarehouseSummaryData {
  totalPartAcceptanceReady: number;
  totalPartAcceptanceReadyQuantity: number;
  totalPartStockIn: number;
  totalPartStockInQuantity: number;
  totalMaterialFeeding: number;
  totalMaterialFeedingQuantity: number;
  totalPartsInWarehouse: number;
  totalPartQuantity: number;
}

export interface RecentAcceptanceItem {
  id: number;
  stkNumber: string;
  supplierName: string;
  partCode: string;
  partName: string;
  quantity: number;
  rackLocation: string;
  receivedDate: string;
  status: string;
}

export interface StkByAreaItem {
  areaId: number;
  areaName: string;
  stkCount: number;
  percentage: number;
}

// ─── Mock Fallbacks ──────────────────────────────────────────────────────────
export const MOCK_TRACKING_SUMMARY: TrackingSummaryData = {
  partAcceptanceCount: 3,
  stockInCount: 0,
  materialFeedingCount: 1,
  stages: [
    {
      stage: 'Part Acceptance',
      label: 'Part Acceptance',
      count: 3,
      description: 'Penerimaan Part',
    },
    {
      stage: 'Stock In',
      label: 'Stock In',
      count: 0,
      description: 'Masuk Gudang Utama',
    },
    {
      stage: 'Material Feeding',
      label: 'Material Feeding',
      count: 1,
      description: 'Pengisian Bahan SMT',
    },
  ],
};

export const MOCK_STK_TRACKING_TABLE: StkTrackingItem[] = [
  {
    id: 16,
    stkNumber: 'STK202609010004',
    partCode: 'PDDM000807',
    partName: 'PA UBE 1013 NW8',
    supplierName: 'PT. INABATA INDONESIA',
    customerName: 'PT. ASAHI DENSO INDONESIA',
    quantity: 120,
    currentStage: 'Part Acceptance',
    timelines: {
      partAcceptance: '01/09/2026 10:43',
      stockIn: null,
      materialFeeding: null,
      smt: null,
      assembly: null,
      finishGood: null,
    },
    lastUpdated: '01/09/2026 10:43',
  },
  {
    id: 15,
    stkNumber: 'STK202609010003',
    partCode: 'PDDM000512',
    partName: 'CONNECTOR MALE 4P',
    supplierName: 'PT. DENSO INDONESIA',
    customerName: 'PT. YAMAHA MOTOR',
    quantity: 5000,
    currentStage: 'Material Feeding',
    timelines: {
      partAcceptance: '01/09/2026 09:15',
      stockIn: '01/09/2026 09:40',
      materialFeeding: '01/09/2026 10:20',
      smt: null,
      assembly: null,
      finishGood: null,
    },
    lastUpdated: '01/09/2026 10:20',
  },
  {
    id: 14,
    stkNumber: 'STK202609010002',
    partCode: 'RES-100K-0805',
    partName: 'CHIP RESISTOR 100K',
    supplierName: 'PT. MURATA INDONESIA',
    customerName: 'PT. HONDA LOCK',
    quantity: 2500,
    currentStage: 'Part Acceptance',
    timelines: {
      partAcceptance: '01/09/2026 08:30',
      stockIn: null,
      materialFeeding: null,
      smt: null,
      assembly: null,
      finishGood: null,
    },
    lastUpdated: '01/09/2026 08:30',
  },
];

export const MOCK_WAREHOUSE_SUMMARY: WarehouseSummaryData = {
  totalPartAcceptanceReady: 3,
  totalPartAcceptanceReadyQuantity: 5120,
  totalPartStockIn: 0,
  totalPartStockInQuantity: 0,
  totalMaterialFeeding: 1,
  totalMaterialFeedingQuantity: 5000,
  totalPartsInWarehouse: 2417,
  totalPartQuantity: 10000,
};

export const MOCK_RECENT_ACCEPTANCES: RecentAcceptanceItem[] = [
  {
    id: 16,
    stkNumber: 'STK202609010004',
    supplierName: 'PT. INABATA INDONESIA',
    partCode: 'PDDM000807',
    partName: 'PA UBE 1013 NW8',
    quantity: 120,
    rackLocation: 'Rak A-12',
    receivedDate: '2026-09-01T03:43:09.098265',
    status: 'Ready',
  },
  {
    id: 14,
    stkNumber: 'STK202609010002',
    supplierName: 'PT. MURATA INDONESIA',
    partCode: 'RES-100K-0805',
    partName: 'CHIP RESISTOR 100K',
    quantity: 2500,
    rackLocation: 'Rak B-04',
    receivedDate: '2026-09-01T01:30:00.000000',
    status: 'Ready',
  },
  {
    id: 13,
    stkNumber: 'STK202608310088',
    supplierName: 'PT. SUMITOMO ELECTRIC',
    partCode: 'WIR-HARN-01',
    partName: 'WIRE HARNESS MAIN',
    quantity: 2500,
    rackLocation: 'Rak A-02',
    receivedDate: '2026-08-31T15:20:00.000000',
    status: 'Ready',
  },
];

export const MOCK_STK_BY_AREA: StkByAreaItem[] = [
  {
    areaId: 1,
    areaName: 'Part Acceptance',
    stkCount: 3,
    percentage: 75,
  },
  {
    areaId: 2,
    areaName: 'Main Warehouse',
    stkCount: 0,
    percentage: 0,
  },
  {
    areaId: 3,
    areaName: 'SMT Feeding Area',
    stkCount: 1,
    percentage: 25,
  },
];

// ─── Service Functions ───────────────────────────────────────────────────────
export const getTrackingSummary = async (): Promise<TrackingSummaryData> => {
  try {
    const res = await httpClient.get<ApiResponse<TrackingSummaryData>>(
      API_ENDPOINTS.TRACKING_SUMMARY,
    );
    return res.data?.data || MOCK_TRACKING_SUMMARY;
  } catch {
    return MOCK_TRACKING_SUMMARY;
  }
};

export const getStkTrackingTable = async (): Promise<StkTrackingItem[]> => {
  try {
    const res = await httpClient.get<ApiResponse<StkTrackingItem[]>>(
      API_ENDPOINTS.STK_TRACKING_TABLE,
    );
    return res.data?.data || MOCK_STK_TRACKING_TABLE;
  } catch {
    return MOCK_STK_TRACKING_TABLE;
  }
};

export const getWarehouseSummary = async (): Promise<WarehouseSummaryData> => {
  try {
    const res = await httpClient.get<ApiResponse<WarehouseSummaryData>>(
      API_ENDPOINTS.WAREHOUSE_SUMMARY,
    );
    return res.data?.data || MOCK_WAREHOUSE_SUMMARY;
  } catch {
    return MOCK_WAREHOUSE_SUMMARY;
  }
};

export const getRecentAcceptances = async (): Promise<
  RecentAcceptanceItem[]
> => {
  try {
    const res = await httpClient.get<ApiResponse<RecentAcceptanceItem[]>>(
      API_ENDPOINTS.RECENT_ACCEPTANCES,
    );
    return res.data?.data || MOCK_RECENT_ACCEPTANCES;
  } catch {
    return MOCK_RECENT_ACCEPTANCES;
  }
};

export const getStkByArea = async (): Promise<StkByAreaItem[]> => {
  try {
    const res = await httpClient.get<ApiResponse<StkByAreaItem[]>>(
      API_ENDPOINTS.STK_BY_AREA,
    );
    return res.data?.data || MOCK_STK_BY_AREA;
  } catch {
    return MOCK_STK_BY_AREA;
  }
};
