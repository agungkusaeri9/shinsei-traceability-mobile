import { useCallback, useRef, useState } from 'react';

import { useKeyenceScanner } from '../../../hooks/useKeyenceScanner';
import { showError, showSuccess } from '../../../services/toastService';
import { extractStkNumber } from '../../../utils/barcode';
import { getErrorMessage } from '../../../utils/errorMessage';
import { fetchOrderLotsByLotNumber } from '../../smt/services/smtService';
import type { OrderLotProduct } from '../../smt/types';
import { submitQaFinish } from '../services/qaAssyService';

type SubmittedData = {
  lotRaw: string;
  boxRaw: string;
};

export const useQaFinishFlow = () => {
  const scanBusyRef = useRef(false);
  const [scannedLot, setScannedLot] = useState('');
  const [lotProducts, setLotProducts] = useState<OrderLotProduct[]>([]);
  const [isCheckingLot, setIsCheckingLot] = useState(false);
  const [scannedBox, setScannedBox] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<SubmittedData | null>(
    null,
  );

  const resetScan = useCallback((clearLastSubmitted: boolean) => {
    setScannedLot('');
    setLotProducts([]);
    setScannedBox('');
    if (clearLastSubmitted) {
      setLastSubmitted(null);
    }
  }, []);

  const handleReset = useCallback(() => {
    resetScan(true);
    scanBusyRef.current = false;
  }, [resetScan]);

  const submitFinish = async (lotNumber: string, boxName: string) => {
    setIsSubmitting(true);
    try {
      const response = await submitQaFinish({ lotNumber, boxName });
      showSuccess(response.message || 'Finish QA berhasil', 'Finish QA');
      setLastSubmitted({ lotRaw: lotNumber, boxRaw: boxName });
      resetScan(false);
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal finish QA'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScan = async (rawValue: string) => {
    const raw = rawValue.trim();
    if (!raw || scanBusyRef.current || isSubmitting) {
      return;
    }

    scanBusyRef.current = true;
    if (!scannedLot) {
      const lotNumber = extractStkNumber(raw);
      setIsCheckingLot(true);
      try {
        const response = await fetchOrderLotsByLotNumber(lotNumber);
        if (response.status && response.data.length > 0) {
          setScannedLot(lotNumber);
          setLotProducts(response.data);
          showSuccess(`Lot ditemukan: ${lotNumber}`, 'Lot Terverifikasi');
        } else {
          showError(
            response.message ||
              `Order lot with number ${lotNumber} not found.`,
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
      return;
    }

    setScannedBox(raw);
    showSuccess(
      'Box berhasil di-scan. Mengirim otomatis...',
      'Mengirim Otomatis',
    );
    await submitFinish(scannedLot, raw);
    scanBusyRef.current = false;
  };

  useKeyenceScanner({
    onScan: value => handleScan(value).catch(() => undefined),
  });

  return {
    scannedLot,
    lotProducts,
    isCheckingLot,
    scannedBox,
    isSubmitting,
    lastSubmitted,
    handleReset,
  };
};
