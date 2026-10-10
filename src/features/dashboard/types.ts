// ─── Dashboard Feature Types ─────────────────────────────────────────────────

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
