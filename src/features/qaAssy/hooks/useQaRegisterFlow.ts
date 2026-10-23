import { useCallback, useRef, useState } from 'react';

import { useKeyenceScanner } from '../../../hooks/useKeyenceScanner';
import { showError, showSuccess } from '../../../services/toastService';
import { extractStkNumber } from '../../../utils/barcode';
import { getErrorMessage } from '../../../utils/errorMessage';
import { fetchOrderLotsByLotNumber } from '../../smt/services/smtService';
import type { OrderLotProduct } from '../../smt/types';
import { submitQaRegister } from '../services/qaAssyService';

export const useQaRegisterFlow = () => {
  const scanBusyRef = useRef(false);
  const [scannedLot, setScannedLot] = useState('');
  const [lotProducts, setLotProducts] = useState<OrderLotProduct[]>([]);
  const [isCheckingLot, setIsCheckingLot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScan = async (rawValue: string) => {
    const lotNumber = extractStkNumber(rawValue.trim());
    if (!lotNumber || scanBusyRef.current || isSubmitting) {
      return;
    }

    scanBusyRef.current = true;
    setIsCheckingLot(true);
    try {
      const response = await fetchOrderLotsByLotNumber(lotNumber);
      if (response.status && response.data.length > 0) {
        setScannedLot(lotNumber);
        setLotProducts(response.data);
        showSuccess(`Lot ditemukan: ${lotNumber}`, 'Lot Terverifikasi');
      } else {
        showError(
          response.message || `Order lot with number ${lotNumber} not found.`,
        );
      }
    } catch (error) {
      showError(
        getErrorMessage(
          error,
          `Order lot with number ${lotNumber} not found.`,
        ),
      );
    } finally {
      setIsCheckingLot(false);
      scanBusyRef.current = false;
    }
  };

  useKeyenceScanner({
    onScan: value => handleScan(value).catch(() => undefined),
  });

  const handleReset = useCallback(() => {
    setScannedLot('');
    setLotProducts([]);
    scanBusyRef.current = false;
  }, []);

  const handleSubmit = async () => {
    if (!scannedLot) {
      showError('Silakan scan Lot Barcode terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitQaRegister({
        lotNumber: scannedLot,
        stks: [],
      });
      showSuccess(response.message, 'Registrasi Berhasil');
      handleReset();
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal melakukan registrasi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    scannedLot,
    lotProducts,
    isCheckingLot,
    isSubmitting,
    handleReset,
    handleSubmit,
  };
};
