import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import { extractStkNumber } from '../../../utils/barcode';
import {
  QaRegisterData,
  QaRegisterPayload,
  QaAddPartPayload,
  QaFinishPayload,
  QaAssyResponse,
} from '../types';

/**
 * Fetch data barcode untuk QA Register
 */
export const fetchQaRegisterData = async (
  barcode: string,
): Promise<QaRegisterData> => {
  if (!barcode || barcode.trim() === '') {
    throw new Error('Barcode tidak boleh kosong');
  }

  const cleanBarcode = extractStkNumber(barcode);
  return {
    barcode: cleanBarcode,
    lotNumber: cleanBarcode,
    partName: `ASSY-BOARD-${cleanBarcode.slice(0, 3).toUpperCase()}`,
    model: 'MODEL-X200',
    customer: 'SHINSEI CORP',
    qty: 50,
    status: 'READY_TO_REGISTER',
  };
};

/**
 * POST API - Register (Endpoint: /assy)
 * Body: { lotNumber: string, stks: string[] }
 */
export const submitQaRegister = async (
  payload: QaRegisterPayload,
): Promise<QaAssyResponse> => {
  const body = {
    lotNumber: extractStkNumber(payload.lotNumber),
    stks: (payload.stks ?? []).map(s => extractStkNumber(s)),
  };
  const response = await httpClient.post<QaAssyResponse>(
    API_ENDPOINTS.ASSY,
    body,
  );
  console.log("🚀 ~ submitQaRegister ~ response:", response)
  return response.data;
};

/**
 * POST API - Add Part (Endpoint: /assy)
 * Body: { lotNumber: string, stks: string[] }
 */
export const submitQaAddPart = async (
  payload: QaAddPartPayload,
): Promise<QaAssyResponse> => {
  const body = {
    lotNumber: extractStkNumber(payload.lotNumber),
    stks: (payload.stks ?? []).map(s => extractStkNumber(s)),
  };
  const response = await httpClient.post<QaAssyResponse>(
    API_ENDPOINTS.ASSY,
    body,
  );
  return response.data;
};

/**
 * POST API - Finish (Endpoint: /assy/finish)
 * Body: { lotNumber: string, boxId: number }
 */
export const submitQaFinish = async (
  payload: QaFinishPayload,
): Promise<QaAssyResponse> => {
  const body = {
    lotNumber: extractStkNumber(payload.lotNumber),
    boxName: payload.boxName,
  };
  const response = await httpClient.post<QaAssyResponse>(
    API_ENDPOINTS.ASSY_FINISH,
    body,
  );
  return response.data;
};
