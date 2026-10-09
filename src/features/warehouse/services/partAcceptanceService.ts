import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import {
  PartSearchResult,
  AreaItem,
  CustomerItem,
  CreatePartAcceptancePayload,
  PartAcceptanceResponse,
  PartLocation,
  PartSupplierCustomer,
  PartAcceptanceItem,
} from '../types';

export type {
  PartSearchResult,
  AreaItem,
  CustomerItem,
  CreatePartAcceptancePayload,
  PartAcceptanceResponse,
  PartLocation,
  PartSupplierCustomer,
  PartAcceptanceItem,
};

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Search parts by part number
 * Endpoint: GET /api/Parts?search=xxx&paginate=false
 */
export const searchParts = async (
  partNo: string,
): Promise<PartSearchResult[]> => {
  const response = await httpClient.get(API_ENDPOINTS.PARTS, {
    params: { search: partNo, paginate: false },
  });
  const raw = response.data;
  // Handle both array response and paginated response
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw?.data && Array.isArray(raw.data)) {
    return raw.data;
  }
  return [];
};

/**
 * Fetch areas list
 * Endpoint: GET /api/Areas?paginate=false
 */
export const fetchAreas = async (): Promise<AreaItem[]> => {
  const response = await httpClient.get(API_ENDPOINTS.AREAS, {
    params: { paginate: false },
  });
  const raw = response.data;
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw?.data && Array.isArray(raw.data)) {
    return raw.data;
  }
  return [];
};

/**
 * Fetch customers list
 * Endpoint: GET /api/Customers
 */
export const fetchCustomers = async (): Promise<CustomerItem[]> => {
  const response = await httpClient.get(API_ENDPOINTS.CUSTOMERS, {
    params: { paginate: false },
  });
  const raw = response.data;
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw?.data && Array.isArray(raw.data)) {
    return raw.data;
  }
  return [];
};

/**
 * Create a new Part Acceptance
 * Endpoint: POST /api/PartAcceptances
 */
export const createPartAcceptance = async (
  payload: CreatePartAcceptancePayload,
): Promise<PartAcceptanceResponse> => {
  const response = await httpClient.post<PartAcceptanceResponse>(
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
          [loc.shelf, loc.bin, loc.position].filter(Boolean).join(' / ') ||
          loc.description,
      )
      .filter(Boolean) as string[];
    return Array.from(new Set(racks));
  }

  return part.locations.map(
    loc =>
      [loc.rack, loc.shelf, loc.bin, loc.position]
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
