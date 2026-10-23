// ─── SMT Types ──────────────────────────────────────────────────────────────

import { Product } from "../warehouse/types";
import type { ApiResponse } from '../../types';

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
  partNumber: string;
  line: SmtLine;
  machine: SmtMachine;
  stkList: string[];
}

export interface SmtOrderData {
  customer: SmtCustomer;
  product: Product;
  pcbModelFace: string;
  details: SmtOrderDetail[];
}

export type SmtOrderResponse = ApiResponse<SmtOrderData>;

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

export interface SmtFinishDataItem {
  orderId: number;
  lotNumber: string;
  productSelect: string;
  createdAt: string;
  updatedAt: string;
  printStart: string;
  printEnd: string;
}

export type SmtFinishResponse = ApiResponse<SmtFinishDataItem[]>;

export interface SmtAcceptancePayload {
  stkNumber: string;
}

export interface SmtAcceptanceData {
  id: number;
  partBatchId: number;
  areaId: number;
  areaName: string | null;
  action: string;
  createdAt: string;
  updatedAt: string;
}

export type SmtAcceptanceResponse = ApiResponse<SmtAcceptanceData>;

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

export interface OrderLotSearchResponse extends ApiResponse<OrderLotItem[]> {
  pagination: OrderLotPagination;
}

export interface OrderLotProduct {
  id: number;
  name: string;
  code: string;
  description: string;
  customerId: number;
  customerName: string;
}

export type OrderLotsByLotResponse = ApiResponse<OrderLotProduct[]>;
