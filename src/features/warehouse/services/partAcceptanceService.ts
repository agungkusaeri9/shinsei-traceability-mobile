import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import type { ApiResponse } from '../../../types';
import {
  PartSearchResult,
  AreaItem,
  CustomerItem,
  CreatePartAcceptancePayload,
  PartAcceptanceResponse,
  PartAcceptanceItem,
} from '../types';

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Search parts by part number
 * Endpoint: GET /api/Parts?search=xxx&paginate=false
 */
export const searchParts = async (
  partNo: string,
): Promise<PartSearchResult[]> => {
  const response = await httpClient.get<ApiResponse<PartSearchResult[]>>(
    API_ENDPOINTS.PARTS,
    { params: { barcodeMatching: partNo, paginate: false } },
  );
  return response.data.data;
};

/**
 * Fetch areas list
 * Endpoint: GET /api/Areas?paginate=false
 */
export const fetchAreas = async (): Promise<AreaItem[]> => {
  const response = await httpClient.get<ApiResponse<AreaItem[]>>(
    API_ENDPOINTS.AREAS,
    { params: { paginate: false } },
  );
  return response.data.data;
};

/**
 * Fetch customers list
 * Endpoint: GET /api/Customers
 */
export const fetchCustomers = async (): Promise<CustomerItem[]> => {
  const response = await httpClient.get<ApiResponse<CustomerItem[]>>(
    API_ENDPOINTS.CUSTOMERS,
    { params: { paginate: false } },
  );
  return response.data.data;
};

/**
 * Create a new Part Acceptance
 * Endpoint: POST /api/PartAcceptances
 */
export const createPartAcceptance = async (
  payload: CreatePartAcceptancePayload,
): Promise<PartAcceptanceResponse> => {
  const response = await httpClient.post<ApiResponse<PartAcceptanceItem>>(
    API_ENDPOINTS.PART_ACCEPTANCES,
    payload,
  );
  return response.data;
};

/**
 * Get display locations for a part
 * For PCB type: unique rack levels only
 * For non-PCB: full location path (rack / shelf / bin / position)
 */
export const getPartDisplayLocations = (
  part: Pick<PartSearchResult, 'type' | 'locations'>,
): string[] => {
  if (!part.locations || part.locations.length === 0) return [];

  const isPcb = part.type?.trim().toUpperCase() === 'PCB';

  if (isPcb) {
    const racks = part.locations
      .map(
        loc =>
          loc.rack ||
          [loc.shelf, loc.bin].filter(Boolean).join(' / ') ||
          loc.description,
      )
      .filter(Boolean) as string[];
    return Array.from(new Set(racks));
  }

  return part.locations.map(
    loc =>
      [loc.rack, loc.shelf, loc.bin]
        .filter(Boolean)
        .join(' / ') ||
      loc.description ||
      `Location #${loc.id}`,
  );
};

/**
 * Get default expired date (1 year from now)
 */
export const getDefaultExpiredDate = (): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};
