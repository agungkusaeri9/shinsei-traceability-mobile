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
