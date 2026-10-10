import httpClient from '../src/services/httpClient';
import { fetchOrderByLotNumber } from '../src/features/smt/services/smtService';

jest.mock('../src/services/httpClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('smtService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchOrderByLotNumber', () => {
    it('should return order data when lot number exists', async () => {
      (httpClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          status: true,
          message: 'OK',
          data: {
            customer: { id: 1, name: 'PT. ASAHI DENSO INDONESIA' },
            product: { id: 2, name: 'CONNECTOR MALE 4P' },
            pcbModelFace: 'FACE-A',
            details: [
              {
                inventoryCode: 'INV-001',
                line: { name: 'Line 1' },
                machine: { name: 'M-100' },
                stkList: [],
              },
            ],
          },
        },
      });

      const res = await fetchOrderByLotNumber('LOT-123');
      expect(res.status).toBe(true);
      expect(res.data.customer.name).toBe('PT. ASAHI DENSO INDONESIA');
      expect(res.data.product.name).toBe('CONNECTOR MALE 4P');
      expect(res.data.pcbModelFace).toBe('FACE-A');
      expect(res.data.details[0].line.name).toBe('Line 1');
      expect(httpClient.get).toHaveBeenCalledWith('/orders/lot/LOT-123');
    });

    it('should return status false when lot number does not exist', async () => {
      (httpClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          status: false,
          message: 'Lot number tidak ditemukan',
          data: null,
        },
      });

      const res = await fetchOrderByLotNumber('LOT-000');
      expect(res.status).toBe(false);
      expect(res.message).toBe('Lot number tidak ditemukan');
    });

    it('should propagate error when API request fails', async () => {
      const error = {
        response: { data: { message: 'Lot number tidak ditemukan' } },
      };
      (httpClient.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(fetchOrderByLotNumber('LOT-404')).rejects.toEqual(error);
    });
  });
});