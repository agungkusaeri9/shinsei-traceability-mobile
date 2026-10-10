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

export interface PartLocation {
  id: number;
  rack: string;
  shelf: string;
  bin: string;
  position: string;
  description: string;
  qty: number;
}

export interface PartSupplierCustomer {
  id: number;
  code: string | null;
  name: string;
  address: string | null;
  phone: string | null;
  fax: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartSearchResult {
  id: number;
  inventoryCode?: string;
  partNumber?: string;
  partName?: string;
  name?: string;
  code?: string;
  type?: string;
  qty?: number;
  locations?: PartLocation[];
  supplier?: PartSupplierCustomer;
  customer?: PartSupplierCustomer;
  createdAt: string;
  updatedAt: string;
}

export interface AreaItem {
  id: number;
  name: string;
  description?: string;
}

export interface CustomerItem {
  id: number;
  name: string;
  code?: string;
}

export interface CreatePartAcceptancePayload {
  inventoryCode: string;
  quantity: number;
  supplierId: number;
  customerId: number;
  expiredDate: string;
  areaId?: number;
  pddm: string;
  rak: string;
  partNo: string;
}

export interface PartAcceptancePayload {
  partNumber: string;
  lotNumber: string;
  quantity: number;
  makerId: number;
  supplierId: number;
  expiredDate: string;
}

export interface PartAcceptanceItem {
  id: number;
  stkNumber: string;
  qty: number;
  supplierName?: string;
  customerName?: string;
  workerName?: string;
  inventoryCode: string;
  partNumber: string;
  partName: string;
  receivedDate: string;
  expiredDate: string;
  areaId: number;
  areaName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartAcceptanceResponse {
  status: boolean;
  message: string;
  data: PartAcceptanceItem;
}

// ─── Stock In ──────────────────────────────────────────────────────────────

export interface StockInPayload {
  stkNumber: string;
  rack: string;
  shelf?: string;
  bin?: string;
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

export interface OrderSummary {
  id: number;
  poNumber: string;
  productName: string;
  customerName: string;
  pcbModelFace: string;
  orderNumber: string;
  lotNumber: string;
  lotQuantity: number;
  orderStatus: string;
  stkCounter: number;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

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
  part?: StkPart;
}

export interface OrderItem {
  id: number;
  orderId: number;
  partBatch: PartBatch;
  line: OrderLine;
  machine: OrderMachine;
  isActive?: boolean;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Part Availability (new API response) ────────────────────────────────

export interface AvailablePart {
  stkNumber: string;
  partId: number;
  partNumber: string;
  stkCount: number;
}

export interface MissingPart {
  stkNumber: string | null;
  partId: number;
  partNumber: string;
  stkCount: number;
}

export interface Order {
  id: number;
  poNumber: string;
  customer: OrderCustomer;
  pcbModelFace: string;
  orderNumber: string;
  lotNumber: string;
  lotQuantity: number;
  product: Product;
  date: string;
  orderType: string;
  status: string;
  availableParts: AvailablePart[];
  missingParts: MissingPart[];
  orderItems: OrderItem[];
  materialFeedings: any[];
  updatedBy: string | null;
  updatedByUser: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  status: boolean;
  message: string;
  data: Order[];
}

export interface Product {
  id: number;
  name: string;
  code: string;
  description?: string;
  customerId?: number;
  customerName?: string;
  parts?: any[];
  createdAt?: string;
  updatedAt?: string;
}
// ─── Material Feeding (Stock Out) ────────────────────────────────────────

// ─── STK Data (for Stock In) ─────────────────────────────────────

export interface StkLocation {
  id: number;
  rack: string;
  shelf: string;
  bin: string;
  position?: string;
  description?: string;
}

export interface StkSupplier {
  id: number;
  code: string | null;
  name: string;
  address: string | null;
  phone: string | null;
  fax: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StkCustomer {
  id: number;
  code: string | null;
  name: string;
  address: string | null;
  phone: string | null;
  fax: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StkPart {
  id: number;
  inventoryCode: string;
  partNumber: string;
  partName: string;
  type: string;
  qty: number;
  locations?: StkLocation[];
  supplier?: StkSupplier;
  customer?: StkCustomer;
  createdAt: string;
  updatedAt: string;
}

export interface StkData {
  id: number;
  stkNumber: string;
  lotNumber: string | null;
  quantity: number;
  status: string;
  moistureProof: boolean;
  part: StkPart;
  maker: any | null;
  latestHistory: string | null;
  stockInLocation: StockInLocation;
  expiredDate: string;
  receivedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockInLocation {
  rack: string;
  shelf: string;
  bin: string;
  position: string;
}

export interface StkResponse {
  status: boolean;
  message: string;
  data: StkData;
}

export interface CheckStkLocationPayload {
  stk: string;
  rack: string;
  shelf: string;
  bin: string;
}

export interface CheckStkLocationResponse {
  status: boolean;
  message: string;
  data?: any;
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

// ─── Order Query Params ─────────────────────────────────────────────────────

export type OrderStatus =
  | 'created'
  | 'submitted'
  | 'processing'
  | 'finished'
  | 'completed'
  | string;

export interface FetchOrdersParams {
  status?: OrderStatus;
  [key: string]: any;
}
