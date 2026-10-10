import { getErrorMessage } from '../src/utils/errorMessage';

describe('getErrorMessage', () => {
  it('should return API message from axios error response body', () => {
    const error = {
      response: { status: 404, data: { status: false, message: 'Order not found.' } },
      message: 'Request failed with status code 404',
    };
    expect(getErrorMessage(error, 'Gagal memuat data Order')).toBe(
      'Order not found.',
    );
  });

  it('should parse API message when response body is a raw JSON string', () => {
    const error = {
      response: {
        status: 404,
        data: '{"status": false, "message": "Order not found."}',
      },
      message: 'Request failed with status code 404',
    };
    expect(getErrorMessage(error, 'Gagal memuat data Order')).toBe(
      'Order not found.',
    );
  });

  it('should fallback instead of showing generic axios 404 message', () => {
    const error = {
      response: { status: 404, data: '' },
      message: 'Request failed with status code 404',
    };
    expect(getErrorMessage(error, 'Gagal mengambil data lot number')).toBe(
      'Gagal mengambil data lot number',
    );
  });

  it('should fallback instead of showing generic Network Error', () => {
    const error = new Error('Network Error');
    expect(getErrorMessage(error, 'Gagal memuat data Order')).toBe(
      'Gagal memuat data Order',
    );
  });

  it('should return message from plain Error instance', () => {
    const error = new Error('Lot number tidak ditemukan');
    expect(getErrorMessage(error, 'fallback')).toBe(
      'Lot number tidak ditemukan',
    );
  });

  it('should return message from plain { status, message } object', () => {
    const error = { status: false, message: 'Order not found.' };
    expect(getErrorMessage(error, 'fallback')).toBe('Order not found.');
  });

  it('should return message from error.data payload', () => {
    const error = { data: { message: 'Box ID sudah digunakan' } };
    expect(getErrorMessage(error, 'fallback')).toBe('Box ID sudah digunakan');
  });

  it('should fallback when error is null or undefined', () => {
    expect(getErrorMessage(null, 'fallback')).toBe('fallback');
    expect(getErrorMessage(undefined, 'fallback')).toBe('fallback');
  });

  it('should fallback when error has no meaningful message', () => {
    expect(getErrorMessage({ foo: 'bar' }, 'fallback')).toBe('fallback');
  });
});
