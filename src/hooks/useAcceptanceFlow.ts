import { useState, useCallback, useRef } from 'react';
import { useKeyenceScanner } from './useKeyenceScanner';
import { showSuccess, showError, showInfo } from '../services/toastService';
import { getErrorMessage } from '../utils/errorMessage';
import { extractStkNumber } from '../utils/barcode';

type SubmitResponse = {
  message?: string;
  data?: { id?: number; partBatchId?: number };
};

type UseAcceptanceFlowOptions = {
  /** API call that submits the STK number for acceptance. */
  submitFn: (stk: string) => Promise<SubmitResponse>;
  /** Toast title on success (e.g. "QA Acceptance"). */
  successTitle: string;
  /** Fallback error message (e.g. "Gagal memproses QA Assy Acceptance"). */
  errorTitle: string;
};

/**
 * Shared logic for STK acceptance screens (QA Assy & SMT).
 *
 * Handles scanner input, STK extraction, submit/reset flows, and feedback state.
 */
export function useAcceptanceFlow({
  submitFn,
  successTitle,
  errorTitle,
}: UseAcceptanceFlowOptions) {
  const [scannedStk, setScannedStk] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<{
    stkNumber: string;
    message: string;
    id?: number;
    partBatchId?: number;
  } | null>(null);

  const handleSubmitRef = useRef<(stk?: string) => Promise<void>>(async () => {});
  const submitBusyRef = useRef(false);

  const handleScanSubmit = useCallback((val: string) => {
    const clean = extractStkNumber(val.trim());
    if (!clean) {
      showError('Format barcode tidak valid');
      return;
    }
    setScannedStk(clean);
    handleSubmitRef.current(clean);
  }, []);

  useKeyenceScanner({ onScan: handleScanSubmit });

  const handleReset = useCallback((showToast = true) => {
    setScannedStk('');
    setLastError(null);
    if (showToast) {
      showInfo('Form direset');
    }
  }, []);

  const handleSubmit = useCallback(
    async (overrideStk?: string) => {
      const rawStk = (overrideStk ?? scannedStk).trim();
      if (!rawStk) {
        showError('Silakan scan STK Number terlebih dahulu');
        return;
      }

      const cleanStk = extractStkNumber(rawStk);
      if (!cleanStk) {
        showError('Format STK Number tidak valid');
        return;
      }

      if (submitBusyRef.current) {
        return;
      }

      submitBusyRef.current = true;
      setScannedStk(cleanStk);
      setIsSubmitting(true);
      setLastError(null);

      try {
        const res = await submitFn(cleanStk);
        const successMsg = res.message || `Acceptance STK ${cleanStk} berhasil`;
        showSuccess(successMsg, successTitle);
        setLastSuccess({
          stkNumber: cleanStk,
          message: successMsg,
          id: res.data?.id,
          partBatchId: res.data?.partBatchId,
        });
        setScannedStk('');
      } catch (error) {
        const message = getErrorMessage(error, errorTitle);
        setLastError(message);
        showError(message);
      } finally {
        submitBusyRef.current = false;
        setIsSubmitting(false);
      }
    },
    [scannedStk, submitFn, successTitle, errorTitle],
  );

  handleSubmitRef.current = handleSubmit;

  return {
    scannedStk,
    isSubmitting,
    lastError,
    lastSuccess,
    handleReset,
    handleSubmit,
    handleScanSubmit,
  };
}
