export interface QaRegisterData {
  barcode: string;
  lotNumber: string;
  partName: string;
  model: string;
  customer: string;
  qty: number;
  status: string;
}

export interface QaRegisterPayload {
  lotNumber: string;
  stks?: string[];
}

export interface QaAddPartPayload {
  lotNumber: string;
  stks: string[];
}

export interface QaFinishPayload {
  lotNumber: string;
  boxName: string;
}

export interface QaAssyResultData {
  lotId: number;
  lotNumber: string;
  userId: number;
  parts: any[];
  createdAt: string;
  updatedAt: string;
}

export interface QaAssyResponse {
  status: boolean;
  message: string;
  data: QaAssyResultData;
}

