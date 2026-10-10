// ─── Delivery Feature Types ──────────────────────────────────────────────────

export interface DeliveryResponse {
  status: boolean;
  message: string;
  data?: DeliveryResponseData;
}

export interface DeliveryResponseData {
  id: number,
  lotId: number,
  lotNumber: string,
  boxId: number,
  boxName: string,
  userId: number,
  createdAt: string,
  updatedAt: string,
  deliveredAt: string
}

export interface OrderPoItem {
  id: number;
  poNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoxItem {
  id: number;
  name: string;
  used?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PoListResponse {
  status: boolean;
  message: string;
  data?: OrderPoItem[] | any;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface BoxListResponse {
  status: boolean;
  message: string;
  data?: BoxItem[];
}

export interface SubmitDeliveryPayload {
  boxNames: string[];
}
