export type StkTimelines = {
  partAcceptance: string | null;
  stockIn: string | null;
  materialFeeding: string | null;
  smt: string | null;
  assembly: string | null;
  finishGood: string | null;
};

export type StkTimelineData = {
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
};
