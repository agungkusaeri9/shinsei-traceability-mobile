import { useCallback, useRef, useState } from 'react';

import { useKeyenceScanner } from '../../../hooks/useKeyenceScanner';
import { showError } from '../../../services/toastService';
import { extractStkNumber } from '../../../utils/barcode';
import { getErrorMessage } from '../../../utils/errorMessage';
import { fetchStkTimeline } from '../services/stkTrackingService';
import type { StkTimelineData } from '../types';

export const useCheckStkFlow = () => {
  const scanBusyRef = useRef(false);
  const [scannedStk, setScannedStk] = useState('');
  const [timeline, setTimeline] = useState<StkTimelineData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleScan = async (rawValue: string) => {
    const stkNumber = extractStkNumber(rawValue.trim());
    if (!stkNumber || scanBusyRef.current) {
      return;
    }

    scanBusyRef.current = true;
    setScannedStk(stkNumber);
    setTimeline(null);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetchStkTimeline(stkNumber);
      if (!response.status || !response.data) {
        const message = response.message || `STK ${stkNumber} tidak ditemukan`;
        setErrorMessage(message);
        showError(message);
        return;
      }

      setTimeline(response.data);
    } catch (error) {
      const message = getErrorMessage(
        error,
        `Gagal mengambil timeline STK ${stkNumber}`,
      );
      setErrorMessage(message);
      showError(message);
    } finally {
      setIsLoading(false);
      scanBusyRef.current = false;
    }
  };

  useKeyenceScanner({
    onScan: value => handleScan(value).catch(() => undefined),
  });

  const handleReset = useCallback(() => {
    setScannedStk('');
    setTimeline(null);
    setErrorMessage(null);
    setIsLoading(false);
    scanBusyRef.current = false;
  }, []);

  return {
    scannedStk,
    timeline,
    isLoading,
    errorMessage,
    handleReset,
  };
};
