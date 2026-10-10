// ─── SMT Types ──────────────────────────────────────────────────────────────

import { Product } from "../warehouse/types";

export interface SmtCustomer {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  fax: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmtPcbModel {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmtLine {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmtMachine {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmtLocation {
  id: number;
  rack: string;
  shelf: string;
  bin: string;
  position: string;
  description: string;
}

export interface SmtPart {
  id: number;
  inventoryCode: string;
  partNumber: string;
  partName: string;
  type: string;
  qty: number;
  locations: SmtLocation[] | null;
  areas: any[] | null;
  supplier: any | null;
  customer: SmtCustomer | null;
  createdAt: string;
  updatedAt: string;
}

export interface SmtSupplier {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  fax: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmtPartBatch {
  id: number;
  stkNumber: string;
  lotNumber: string;
  quantity: number;
  status: string;
  moistureProof: boolean;
  part: SmtPart;
  maker: any | null;
  supplier: SmtSupplier | null;
  latestHistory: any | null;
  expiredDate: string;
  receivedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmtStkListItem {
  stkNumber: string;
  partNumber: string;
}

export interface SmtOrderDetail {
  inventoryCode: string;
  line: SmtLine;
  machine: SmtMachine;
  stkList: SmtStkListItem[];
}

export interface SmtOrderData {
  customer: SmtCustomer;
  product: Product;
  pcbModelFace: string;
  details: SmtOrderDetail[];
}

export interface SmtOrderResponse {
  status: boolean;
  message: string;
  data: SmtOrderData;
}

export interface SmtPayload {
  lotNumber: string;
  partBatchIds: number[];
  productSelect: string;
}

export interface SmtResponse {
  id: number;
  orderId: number;
  partBatchId: number;
  productSelect: string;
  createdAt?: string;
}

export interface SmtFinishPayload {
  lotNumber: string;
  model: string;
  customer: string;
}

export interface SmtFinishResponse {
  status: boolean;
  message: string;
  data?: unknown;
}

// ─── Order Lot ───────────────────────────────────────────────────────────────

export interface OrderLotItem {
  id?: number;
  lotNumber: string;
  customerName?: string;
  productName?: string;
}

export interface OrderLotPagination {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OrderLotSearchResponse {
  status: boolean;
  message: string;
  data: OrderLotItem[];
  pagination: OrderLotPagination;
}