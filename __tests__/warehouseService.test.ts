import httpClient from '../src/services/httpClient';
import { API_ENDPOINTS } from '../src/services/api';
import {
  checkStkLocation,
  createMaker,
  createSupplier,
  fetchMakers,
  fetchStkData,
  fetchSuppliers,
  getExpiredDateTwoWeeks,
  registerPartAcceptance,
  stockIn,
  submitMaterialFeeding,
} from '../src/features/warehouse/services/warehouseService';

jest.mock('../src/services/httpClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = jest.mocked(httpClient.get);
const mockPost = jest.mocked(httpClient.post);

describe('warehouseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkStkLocation', () => {
    it('should post location data and return the API response', async () => {
      const payload = {
        stk: 'STK-001',
        rack: 'R01',
        shelf: 'S01',
        bin: 'B01',
      };
      const apiResponse = {
        status: true,
        message: 'Location is valid',
        data: null,
      };
      mockPost.mockResolvedValueOnce({ data: apiResponse });

      await expect(checkStkLocation(payload)).resolves.toEqual(apiResponse);
      expect(mockPost).toHaveBeenCalledWith(
        API_ENDPOINTS.CHECK_STK_LOCATION,
        payload,
      );
    });
  });

  describe('supplier', () => {
    it('should fetch suppliers', async () => {
      const suppliers = [{ id: 1, name: 'Supplier A', code: 'SUP-A' }];
      mockGet.mockResolvedValueOnce({
        data: { status: true, message: 'Success', data: suppliers },
      });

      await expect(fetchSuppliers()).resolves.toEqual(suppliers);
      expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.SUPPLIERS);
    });

    it('should create a supplier', async () => {
      const payload = { name: 'Supplier B', code: 'SUP-B' };
      const supplier = { id: 2, ...payload };
      mockPost.mockResolvedValueOnce({
        data: { status: true, message: 'Created', data: supplier },
      });

      await expect(createSupplier(payload)).resolves.toEqual(supplier);
      expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.SUPPLIERS, payload);
    });
  });

  describe('maker', () => {
    it('should fetch makers', async () => {
      const makers = [{ id: 1, name: 'Maker A', code: 'MKR-A' }];
      mockGet.mockResolvedValueOnce({
        data: { status: true, message: 'Success', data: makers },
      });

      await expect(fetchMakers()).resolves.toEqual(makers);
      expect(mockGet).toHaveBeenCalledWith(API_ENDPOINTS.MAKERS);
    });

    it('should create a maker', async () => {
      const payload = { name: 'Maker B', code: 'MKR-B' };
      const maker = { id: 2, ...payload };
      mockPost.mockResolvedValueOnce({
        data: { status: true, message: 'Created', data: maker },
      });

      await expect(createMaker(payload)).resolves.toEqual(maker);
      expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.MAKERS, payload);
    });
  });

  describe('registerPartAcceptance', () => {
    it('should submit part acceptance and return the API response', async () => {
      const payload = {
        partNumber: 'PART-001',
        lotNumber: 'LOT-001',
        quantity: 100,
        makerId: 1,
        supplierId: 2,
        expiredDate: '2026-11-06T00:00:00.000Z',
      };
      const apiResponse = {
        status: true,
        message: 'Part accepted',
        data: { id: 10, stkNumber: 'STK-001' },
      };
      mockPost.mockResolvedValueOnce({ data: apiResponse });

      await expect(registerPartAcceptance(payload)).resolves.toEqual(
        apiResponse,
      );
      expect(mockPost).toHaveBeenCalledWith(
        API_ENDPOINTS.PART_ACCEPTANCES,
        payload,
      );
    });
  });

  describe('stockIn', () => {
    it('should submit stock-in as multipart form data', async () => {
      const appendSpy = jest.spyOn(FormData.prototype, 'append');
      const payload = {
        stkNumber: 'STK-001',
        rack: 'R01',
        shelf: 'S01',
        bin: 'B01',
        evidencePhoto: {
          uri: 'file:///photo.jpg',
          type: 'image/jpeg',
          name: 'photo.jpg',
        },
      };
      const result = {
        id: 1,
        stkNumber: 'STK-001',
        evidencePhotoUrl: '/uploads/photo.jpg',
        createdAt: '2026-10-23T10:00:00.000Z',
      };
      mockPost.mockResolvedValueOnce({
        data: { status: true, message: 'Stock-in success', data: result },
      });

      await expect(stockIn(payload)).resolves.toEqual(result);
      expect(appendSpy).toHaveBeenCalledWith('StkNumber', payload.stkNumber);
      expect(appendSpy).toHaveBeenCalledWith('Rack', payload.rack);
      expect(appendSpy).toHaveBeenCalledWith('Shelf', payload.shelf);
      expect(appendSpy).toHaveBeenCalledWith('Bin', payload.bin);
      expect(appendSpy).toHaveBeenCalledWith(
        'EvidencePhoto',
        payload.evidencePhoto,
      );
      expect(mockPost).toHaveBeenCalledWith(
        API_ENDPOINTS.WH_STOCK_INS,
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      appendSpy.mockRestore();
    });

    it('should omit optional fields when they are empty', async () => {
      const appendSpy = jest.spyOn(FormData.prototype, 'append');
      const result = {
        id: 2,
        stkNumber: 'STK-002',
        evidencePhotoUrl: '',
        createdAt: '2026-10-23T10:00:00.000Z',
      };
      mockPost.mockResolvedValueOnce({
        data: { status: true, message: 'Stock-in success', data: result },
      });

      await stockIn({ stkNumber: 'STK-002', rack: '' });

      expect(appendSpy).toHaveBeenCalledTimes(1);
      expect(appendSpy).toHaveBeenCalledWith('StkNumber', 'STK-002');
      appendSpy.mockRestore();
    });
  });

  describe('fetchStkData', () => {
    it('should normalize a scanner barcode before requesting STK data', async () => {
      const apiResponse = {
        status: true,
        message: 'STK found',
        data: { id: 1, stkNumber: 'STK-001' },
      };
      mockGet.mockResolvedValueOnce({ data: apiResponse });

      await expect(
        fetchStkData(' STK-001 ; PDDM-001 ; 100 '),
      ).resolves.toEqual(apiResponse);
      expect(mockGet).toHaveBeenCalledWith(`${API_ENDPOINTS.STKS}/STK-001`);
    });
  });

  describe('submitMaterialFeeding', () => {
    it('should submit material feeding and return its data', async () => {
      const payload = {
        orderId: 20,
        processedDate: '2026-10-23T10:00:00.000Z',
        materialFeedingItems: [{ partBatchId: 101 }],
      };
      const result = {
        id: 5,
        orderId: 20,
        processedDate: payload.processedDate,
      };
      mockPost.mockResolvedValueOnce({
        data: { status: true, message: 'Submitted', data: result },
      });

      await expect(submitMaterialFeeding(payload)).resolves.toEqual(result);
      expect(mockPost).toHaveBeenCalledWith(
        API_ENDPOINTS.MATERIAL_FEEDINGS,
        payload,
      );
    });
  });

  describe('getExpiredDateTwoWeeks', () => {
    it('should return an ISO date exactly 14 days from now', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-10-23T08:30:00.000Z'));

      expect(getExpiredDateTwoWeeks()).toBe('2026-11-06T08:30:00.000Z');

      jest.useRealTimers();
    });
  });

  it('should propagate HTTP errors', async () => {
    const networkError = new Error('Network error');
    mockGet.mockRejectedValueOnce(networkError);

    await expect(fetchSuppliers()).rejects.toThrow('Network error');
  });
});
