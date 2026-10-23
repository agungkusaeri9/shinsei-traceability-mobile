import { useCallback, useRef, useState } from 'react';

import { useKeyenceScanner } from '../../../hooks/useKeyenceScanner';
import { showError, showSuccess } from '../../../services/toastService';
import { extractStkNumber } from '../../../utils/barcode';
import { getErrorMessage } from '../../../utils/errorMessage';
import { fetchOrderLotsByLotNumber } from '../../smt/services/smtService';
import { submitQaAddPart } from '../services/qaAssyService';

export const useQaAddPartFlow = () => {
  const scanBusyRef = useRef(false);
  const stkListRef = useRef<string[]>([]);
  const [scannedLot, setScannedLot] = useState('');
  const [stkList, setStkList] = useState<string[]>([]);
  const [isCheckingLot, setIsCheckingLot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setStks = useCallback((stks: string[]) => {
    stkListRef.current = stks;
    setStkList(stks);
  }, []);

  const handleScan = async (rawValue: string) => {
    const cleanValue = extractStkNumber(rawValue.trim());
    if (!cleanValue || scanBusyRef.current || isSubmitting) {
      return;
    }

    if (!scannedLot) {
      scanBusyRef.current = true;
      setIsCheckingLot(true);
      try {
        const response = await fetchOrderLotsByLotNumber(cleanValue);
        if (response.status && response.data.length > 0) {
          setScannedLot(cleanValue);
          showSuccess(`Lot ditemukan: ${cleanValue}`, 'Lot Terverifikasi');
        } else {
          showError(
            response.message ||
              `Order lot with number ${cleanValue} not found.`,
          );
        }
      } catch (error) {
        showError(
          getErrorMessage(
            error,
            `Order lot with number ${cleanValue} not found.`,
          ),
        );
      } finally {
        setIsCheckingLot(false);
        scanBusyRef.current = false;
      }
      return;
    }

    if (stkListRef.current.includes(cleanValue)) {
      showError(`Part STK sudah pernah di-scan: ${cleanValue}`);
      return;
    }

    setStks([...stkListRef.current, cleanValue]);
    showSuccess(`Part STK ditambahkan: ${cleanValue}`, 'STK Terscan');
  };

  useKeyenceScanner({
    onScan: value => handleScan(value).catch(() => undefined),
  });

  const handleRemoveStk = useCallback(
    (index: number) => {
      setStks(stkListRef.current.filter((_, itemIndex) => itemIndex !== index));
    },
    [setStks],
  );

  const handleClearStks = useCallback(() => setStks([]), [setStks]);

  const handleReset = useCallback(() => {
    setScannedLot('');
    setStks([]);
    scanBusyRef.current = false;
  }, [setStks]);

  const handleSubmit = async () => {
    if (!scannedLot) {
      showError('Silakan scan Lot Number terlebih dahulu');
      return;
    }
    if (stkListRef.current.length === 0) {
      showError('Minimal scan 1 Part STK sebelum mengirim');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitQaAddPart({
        lotNumber: scannedLot,
        stks: stkListRef.current,
      });
      showSuccess(
        response.message ||
          `${stkListRef.current.length} Part berhasil ditambahkan`,
        'Add Part Berhasil',
      );
      handleReset();
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal menambahkan part'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    scannedLot,
    stkList,
    isCheckingLot,
    isSubmitting,
    handleRemoveStk,
    handleClearStks,
    handleSubmit,
    handleReset,
  };
};
