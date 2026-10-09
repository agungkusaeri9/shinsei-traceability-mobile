import httpClient from '../src/services/httpClient';
import {
  fetchQaRegisterData,
  submitQaRegister,
  submitQaAddPart,
  submitQaFinish,
} from '../src/features/qaAssy/services/qaAssyService';

jest.mock('../src/services/httpClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

describe('qaAssyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchQaRegisterData', () => {
    it('should throw error when barcode is empty', async () => {
      await expect(fetchQaRegisterData('')).rejects.toThrow(
        'Barcode tidak boleh kosong',
      );
    });

    it('should return valid register data for valid barcode', async () => {
      const data = await fetchQaRegisterData('BC-123456');
      expect(data).toBeDefined();
      expect(data.barcode).toBe('BC-123456');
    });
  });

  describe('submitQaRegister', () => {
    it('should submit QA Register payload successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Created successfully',
          data: { lotId: 3, lotNumber: 'LOT-123' },
        },
      });

      const payload = { lotNumber: 'LOT-123', stks: [] };
      const res = await submitQaRegister(payload);
      expect(res.status).toBe(true);
      expect(res.message).toBe('Created successfully');
    });

    it('should throw error when API request returns status false', async () => {
      (httpClient.post as jest.Mock).mockResolvedValueOnce({
        data: {
          status: false,
          message: 'STK numbers not found: STK-999.',
        },
      });

      const payload = { lotNumber: 'LOT-123', stks: ['STK-999'] };
      await expect(submitQaRegister(payload)).rejects.toThrow(
        'STK numbers not found: STK-999.',
      );
    });

    it('should throw error when API request fails with HTTP error status', async () => {
      (httpClient.post as jest.Mock).mockRejectedValueOnce({
        response: { data: { message: 'STK numbers not found: string.' } },
      });

      const payload = { lotNumber: 'LOT-123', stks: [] };
      await expect(submitQaRegister(payload)).rejects.toThrow(
        'STK numbers not found: string.',
      );
    });
  });

  describe('submitQaAddPart', () => {
    it('should submit QA Add Part payload successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Created successfully',
        },
      });

      const payload = { lotNumber: 'LOT-123', stks: ['STK-001', 'STK-002'] };
      const res = await submitQaAddPart(payload);
      expect(res.status).toBe(true);
      expect(res.message).toBe('Created successfully');
    });

    it('should throw error when API request fails', async () => {
      (httpClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('Network error'),
      );

      const payload = { lotNumber: 'LOT-123', stks: ['STK-001'] };
      await expect(submitQaAddPart(payload)).rejects.toThrow('Network error');
    });
  });

  describe('submitQaFinish', () => {
    it('should submit QA Finish payload successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Finish successfully',
        },
      });

      const payload = { lotNumber: 'LOT-123', boxName: 'BOX-001' };
      const res = await submitQaFinish(payload);
      expect(res.status).toBe(true);
      expect(res.message).toBe('Finish successfully');
    });

    it('should throw error when API request fails', async () => {
      (httpClient.post as jest.Mock).mockRejectedValueOnce({
        response: { data: { message: 'Box ID sudah digunakan' } },
      });

      const payload = { lotNumber: 'LOT-123', boxName: 'BOX-001' };
      await expect(submitQaFinish(payload)).rejects.toThrow(
        'Box ID sudah digunakan',
      );
    });
  });
});
