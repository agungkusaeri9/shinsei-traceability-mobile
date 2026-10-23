import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useKeyenceScanner } from '../../../hooks/useKeyenceScanner';
import {
  showError,
  showInfo,
  showSuccess,
} from '../../../services/toastService';
import { getErrorMessage } from '../../../utils/errorMessage';
import {
  getBoxesByPo,
  getPoNumbers,
  submitDelivery,
} from '../services/deliveryService';
import type {
  BoxItem,
  DeliveryPoOption,
  LastDelivered,
  OrderPoItem,
} from '../types';

export const useDeliveryFlow = () => {
  const [poList, setPoList] = useState<OrderPoItem[]>([]);
  const [isLoadingPoList, setIsLoadingPoList] = useState(false);
  const [selectedPo, setSelectedPo] = useState<string | null>(null);
  const [isLoadingPoDetail, setIsLoadingPoDetail] = useState(false);
  const [expectedBoxes, setExpectedBoxes] = useState<BoxItem[]>([]);
  const [scannedBoxes, setScannedBoxes] = useState<string[]>([]);
  const [lastScannedBox, setLastScannedBox] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastDelivered, setLastDelivered] = useState<LastDelivered | null>(null);

  const selectedPoRef = useRef<string | null>(null);
  const expectedBoxesRef = useRef<BoxItem[]>([]);
  const scannedBoxesRef = useRef<string[]>([]);
  const isDropdownOpenRef = useRef(false);
  const poRequestIdRef = useRef(0);
  const scanBusyRef = useRef(false);
  const submitBusyRef = useRef(false);

  const loadPoList = useCallback(async () => {
    setIsLoadingPoList(true);
    try {
      setPoList(await getPoNumbers());
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal mengambil daftar PO Number'));
    } finally {
      setIsLoadingPoList(false);
    }
  }, []);

  useEffect(() => {
    loadPoList().catch(() => undefined);
  }, [loadPoList]);

  const poDropdownOptions = useMemo<DeliveryPoOption[]>(
    () => poList.map(po => ({ id: po.poNumber, label: po.poNumber })),
    [poList],
  );

  const handleSelectPo = useCallback(async (poNumber: string) => {
    if (!poNumber) {
      return;
    }

    const requestId = ++poRequestIdRef.current;
    selectedPoRef.current = poNumber;
    expectedBoxesRef.current = [];
    scannedBoxesRef.current = [];
    setSelectedPo(poNumber);
    setExpectedBoxes([]);
    setScannedBoxes([]);
    setLastScannedBox(null);
    setIsLoadingPoDetail(true);

    try {
      const boxes = await getBoxesByPo(poNumber);
      if (requestId !== poRequestIdRef.current) {
        return;
      }

      expectedBoxesRef.current = boxes;
      setExpectedBoxes(boxes);
      showSuccess(
        `PO ${poNumber} dipilih. ${boxes.length} box didapatkan.`,
        'PO Terpilih',
      );
    } catch (error) {
      if (requestId !== poRequestIdRef.current) {
        return;
      }

      selectedPoRef.current = null;
      setSelectedPo(null);
      showError(
        getErrorMessage(error, `Gagal mengambil detail box PO ${poNumber}`),
      );
    } finally {
      if (requestId === poRequestIdRef.current) {
        setIsLoadingPoDetail(false);
      }
    }
  }, []);

  const handleResetPo = useCallback(() => {
    poRequestIdRef.current += 1;
    selectedPoRef.current = null;
    expectedBoxesRef.current = [];
    scannedBoxesRef.current = [];
    scanBusyRef.current = false;
    setSelectedPo(null);
    setExpectedBoxes([]);
    setScannedBoxes([]);
    setLastScannedBox(null);
    setIsLoadingPoDetail(false);
  }, []);

  const handlePoSelection = useCallback(
    (poNumber: string) => {
      if (!poNumber) {
        handleResetPo();
        return;
      }
      handleSelectPo(poNumber).catch(() => undefined);
    },
    [handleResetPo, handleSelectPo],
  );

  const handleScannerValue = useCallback(
    async (rawValue: string) => {
      const value = rawValue.trim();
      if (
        !value ||
        scanBusyRef.current ||
        submitBusyRef.current ||
        isDropdownOpenRef.current
      ) {
        return;
      }

      scanBusyRef.current = true;
      try {
        const activePo = selectedPoRef.current;
        if (!activePo) {
          const matchedPo = poList.find(
            po => po.poNumber.toLowerCase() === value.toLowerCase(),
          );

          if (!matchedPo) {
            showInfo(
              `Barcode "${value}" di-scan. Silakan pilih PO Number terlebih dahulu.`,
            );
            return;
          }

          await handleSelectPo(matchedPo.poNumber);
          return;
        }

        const matchedBox = expectedBoxesRef.current.find(
          box => box.name.toLowerCase() === value.toLowerCase(),
        );
        if (!matchedBox) {
          showError(`Box "${value}" tidak ada dalam daftar box PO ${activePo}.`);
          return;
        }

        if (scannedBoxesRef.current.includes(matchedBox.name)) {
          showInfo(`Box "${matchedBox.name}" sudah di-scan.`);
          return;
        }

        const nextScannedBoxes = [...scannedBoxesRef.current, matchedBox.name];
        scannedBoxesRef.current = nextScannedBoxes;
        setScannedBoxes(nextScannedBoxes);
        setLastScannedBox(matchedBox.name);
        showSuccess(`Box "${matchedBox.name}" terverifikasi!`, 'Box Ter-scan');
      } finally {
        scanBusyRef.current = false;
      }
    },
    [handleSelectPo, poList],
  );

  useKeyenceScanner({
    onScan: value => handleScannerValue(value).catch(() => undefined),
  });

  const handleRemoveScannedBox = useCallback((boxName: string) => {
    if (!boxName) {
      return;
    }

    const nextScannedBoxes = scannedBoxesRef.current.filter(
      scannedBox => scannedBox !== boxName,
    );
    scannedBoxesRef.current = nextScannedBoxes;
    setScannedBoxes(nextScannedBoxes);
    setLastScannedBox(current => (current === boxName ? null : current));
    showInfo(`Scan box "${boxName}" dihapus.`);
  }, []);

  const handleSubmitDelivery = useCallback(async () => {
    if (submitBusyRef.current) {
      return;
    }

    const activePo = selectedPoRef.current;
    const boxesToSubmit = [...scannedBoxesRef.current];
    if (!activePo) {
      showError('Pilih PO Number terlebih dahulu');
      return;
    }
    if (boxesToSubmit.length === 0) {
      showError('Scan minimal 1 box sebelum submit delivery');
      return;
    }

    submitBusyRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await submitDelivery({ boxNames: boxesToSubmit });
      showSuccess(
        response.message || 'Delivery berhasil disubmit!',
        'Delivery Berhasil',
      );
      setLastDelivered({
        poNumber: activePo,
        boxes: boxesToSubmit,
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      handleResetPo();
      await loadPoList();
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal mengirim data delivery'));
    } finally {
      submitBusyRef.current = false;
      setIsSubmitting(false);
    }
  }, [handleResetPo, loadPoList]);

  const handleDropdownToggle = useCallback((isOpen: boolean) => {
    isDropdownOpenRef.current = isOpen;
  }, []);

  const progressPercent = useMemo(() => {
    if (expectedBoxes.length > 0) {
      return Math.min(
        100,
        Math.round((scannedBoxes.length / expectedBoxes.length) * 100),
      );
    }
    return scannedBoxes.length > 0 ? 100 : 0;
  }, [expectedBoxes.length, scannedBoxes.length]);

  const isBoxScanned = useCallback(
    (boxName: string) => scannedBoxes.includes(boxName),
    [scannedBoxes],
  );

  return {
    poList,
    isLoadingPoList,
    selectedPo,
    isLoadingPoDetail,
    expectedBoxes,
    scannedBoxes,
    lastScannedBox,
    isSubmitting,
    lastDelivered,
    poDropdownOptions,
    progressPercent,
    canSubmit: scannedBoxes.length > 0 && !isSubmitting,
    loadPoList,
    handlePoSelection,
    handleResetPo,
    handleRemoveScannedBox,
    handleSubmitDelivery,
    handleDropdownToggle,
    isBoxScanned,
  };
};
