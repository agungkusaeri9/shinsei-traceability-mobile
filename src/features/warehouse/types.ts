export interface RegisteredPart {
  partNumber: string;
  lotNumber: string;
  qty: string;
  supplier: string;
}

export interface WorkOrderDetail {
  machine: string;
  customer: string;
  models: string;
  face: string;
  line: string;
  date: string;
  stkNumbers: string[];
}

export interface WorkOrderOption {
  id: string;
  label: string;
}

// ─── Supplier & Maker ──────────────────────────────────────────────────────

export interface Supplier {
  id: number;
  name: string;
  code?: string;
}

export interface Maker {
  id: number;
  name: string;
  code?: string;
}

// ─── Part Acceptance (Register Warehouse) ──────────────────────────────────

export interface PartAcceptancePayload {
  partNumber: string;
  lotNumber: string;
  quantity: number;
  makerId: number;
  supplierId: number;
  expiredDate: string; // ISO 8601
}

export interface PartAcceptanceResponse {
  id: number;
  partNumber: string;
  lotNumber: string;
  quantity: number;
  makerId: number;
  supplierId: number;
  expiredDate: string;
}

// ─── Stock In ──────────────────────────────────────────────────────────────

export interface StockInPayload {
  stkNumber: string;
  evidencePhoto?: {
    uri: string;
    type: string;
    name: string;
  };
}

export interface StockInResponse {
  id: number;
  stkNumber: string;
  evidencePhotoUrl: string;
  createdAt: string;
}

// ─── Orders (for Stock Out) ──────────────────────────────────────────────

export interface OrderCustomer {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  fax: string;
}

export interface OrderPcbModel {
  id: number;
  name: string;
  description: string;
}

export interface OrderLine {
  id: number;
  name: string;
  description: string;
}

export interface OrderMachine {
  id: number;
  name: string;
  description: string;
}

export interface PartBatch {
  id: number;
  stkNumber: string;
  lotNumber: string;
  quantity: number;
  status: string;
  moistureProof: boolean;
  expiredDate: string;
  receivedDate: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  partBatch: PartBatch;
}

export interface Order {
  id: number;
  poNumber: string;
  customer: OrderCustomer;
  pcbModel: OrderPcbModel;
  pcbModelFace: string;
  orderNumber: string;
  lotNumber: string;
  lotQuantity: number;
  date: string;
  line: OrderLine;
  machine: OrderMachine;
  orderType: string;
  orderItems: OrderItem[];
}

// ─── Material Feeding (Stock Out) ────────────────────────────────────────

export interface MaterialFeedingItem {
  partBatchId: number;
}

export interface MaterialFeedingPayload {
  orderId: number;
  processedDate: string;
  materialFeedingItems: MaterialFeedingItem[];
}

export interface MaterialFeedingResponse {
  id: number;
  orderId: number;
  processedDate: string;
}
