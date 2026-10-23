import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import type { ApiResponse } from '../../../types';
import type { StkTimelineData } from '../types';

export const fetchStkTimeline = async (
  stkNumber: string,
): Promise<ApiResponse<StkTimelineData>> => {
  const response = await httpClient.get<ApiResponse<StkTimelineData>>(
    `${API_ENDPOINTS.STK_TIMELINES}/${encodeURIComponent(stkNumber)}`,
  );
  return response.data;
};
