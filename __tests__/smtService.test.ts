import httpClient from '../src/services/httpClient';
import {
  fetchOrderLotsByLotNumber,
  fetchOrderByLotAndProduct,
} from '../src/features/smt/services/smtService';

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

  describe('fetchOrderLotsByLotNumber', () => {
    it('should return product list for given lot number', async () => {
      (httpClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Success',
          data: [
            {
              id: 336,
              name: 'DENSO-4600-B-L5',
              code: 'PRO0000375',
              description: 'Imported summary',
              customerId: 2,
              customerName: 'PT. TOYO DENSO INDONESIA',
            },
          ],
        },
      });

      const res = await fetchOrderLotsByLotNumber('LOT-TEST-3');
      expect(res.status).toBe(true);
      expect(res.data.length).toBe(1);
      expect(res.data[0].id).toBe(336);
      expect(httpClient.get).toHaveBeenCalledWith('/orderlots/LOT-TEST-3');
    });
  });

  describe('fetchOrderByLotAndProduct', () => {
    it('should fetch order detail with lotNumber and productId query params', async () => {
      (httpClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Success',
          data: {
            customer: { id: 2, name: 'PT. TOYO DENSO INDONESIA' },
            product: { id: 336, name: 'DENSO-4600-B-L5' },
            pcbModelFace: 'A',
            details: [],
          },
        },
      });

      const res = await fetchOrderByLotAndProduct('LOT-TEST-3', 336);
      expect(res.status).toBe(true);
      expect(res.data.product.id).toBe(336);
      expect(httpClient.get).toHaveBeenCalledWith('/orders/lot', {
        params: { lotNumber: 'LOT-TEST-3', productId: 336 },
      });
    });
  });
});
