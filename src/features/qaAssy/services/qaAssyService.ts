import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import { extractStkNumber } from '../../../utils/barcode';
import { getErrorMessage } from '../../../utils/errorMessage';
import type { ApiResponse } from '../../../types';
import {
  QaRegisterData,
  QaRegisterPayload,
  QaAddPartPayload,
  QaFinishPayload,
  QaAssyResponse,
  QaAcceptanceResponse,
  QaAssyResultData,
  QaAcceptanceData,
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
 * Validate API response and throw when the server reports a failure
 * (e.g. { status: false, message: '...' }).
 */
const unwrapAssyResponse = (response: {
  data: QaAssyResponse;
}): QaAssyResponse => {
  if (response.data?.status === false) {
    throw new Error(response.data.message || 'Terjadi kesalahan pada server');
  }
  return response.data;
};

/**
 * Normalize any thrown value (axios error, plain object, Error) into an Error
 * with a readable message.
 */
const toAssyError = (error: unknown): Error => {
  return new Error(getErrorMessage(error, 'Terjadi kesalahan pada server'));
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
  try {
    const response = await httpClient.post<ApiResponse<QaAssyResultData>>(
      API_ENDPOINTS.ASSY,
      body,
    );
    return unwrapAssyResponse(response);
  } catch (error) {
    throw toAssyError(error);
  }
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
  try {
    const response = await httpClient.post<ApiResponse<QaAssyResultData>>(
      API_ENDPOINTS.ASSY,
      body,
    );
    return unwrapAssyResponse(response);
  } catch (error) {
    throw toAssyError(error);
  }
};

/**
 * POST API - Finish (Endpoint: /assy/finish)
 * Body: { lotNumber: string, boxName: string }
 */
export const submitQaFinish = async (
  payload: QaFinishPayload,
): Promise<QaAssyResponse> => {
  const body = {
    lotNumber: extractStkNumber(payload.lotNumber),
    boxName: payload.boxName,
  };
  try {
    const response = await httpClient.post<ApiResponse<QaAssyResultData>>(
      API_ENDPOINTS.ASSY_FINISH,
      body,
    );
    return unwrapAssyResponse(response);
  } catch (error) {
    throw toAssyError(error);
  }
};

/**
 * POST API - Acceptance (Endpoint: /assy/acceptance)
 * Body: { stkNumber: string }
 */
export const submitQaAssyAcceptance = async (
  stkNumber: string,
): Promise<QaAcceptanceResponse> => {
  const body = {
    stkNumber: extractStkNumber(stkNumber),
  };
  try {
    const response = await httpClient.post<ApiResponse<QaAcceptanceData>>(
      API_ENDPOINTS.ASSY_ACCEPTANCE,
      body,
    );
    if (response.data && response.data.status === false) {
      throw new Error(response.data.message || 'Gagal melakukan QA Assy Acceptance');
    }
    return response.data;
  } catch (error) {
    throw toAssyError(error);
  }
};
