// ─── SMT Types ──────────────────────────────────────────────────────────────

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

export interface SmtPartBatch {
  id: number;
  stkNumber: string;
  lotNumber: string;
  quantity: number;
  status: string;
  moistureProof: boolean;
  part: any | null;
  maker: any | null;
  supplier: any | null;
  latestHistory: any | null;
  expiredDate: string;
  receivedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmtOrderDetail {
  orderId: number;
  poNumber: string;
  line: SmtLine;
  machine: SmtMachine;
  partBatches: SmtPartBatch[];
}

export interface SmtOrderData {
  customer: SmtCustomer;
  pcbModel: SmtPcbModel;
  pcbModelFace: string;
  details: SmtOrderDetail[];
}

export interface SmtOrderResponse {
  status: boolean;
  message: string;
  data: SmtOrderData;
}

export interface SmtPayload {
  orderId: number;
  partBatchId: number;
  productSelect: string;
}

export interface SmtResponse {
  id: number;
  orderId: number;
  partBatchId: number;
  productSelect: string;
  createdAt?: string;
}
