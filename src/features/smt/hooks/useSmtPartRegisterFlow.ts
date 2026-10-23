import { useCallback, useMemo, useRef, useState } from 'react';
import type { FlatList } from 'react-native';

import { useKeyenceScanner } from '../../../hooks/useKeyenceScanner';
import { showError, showInfo, showSuccess } from '../../../services/toastService';
import { extractStkNumber } from '../../../utils/barcode';
import { getErrorMessage } from '../../../utils/errorMessage';
import { fetchStkData } from '../../warehouse/services/warehouseService';
import type { StkData } from '../../warehouse/types';
import {
  fetchOrderByLotAndProduct,
  fetchOrderLotsByLotNumber,
  submitSmt,
} from '../services/smtService';
import type {
  OrderLotProduct,
  SmtLine,
  SmtMachine,
  SmtOrderData,
  SmtOrderDetail,
} from '../types';

export type SmtPartRegisterStep =
  | 'scan_lot'
  | 'select_product'
  | 'scan_product'
  | 'scan_line'
  | 'scan_machine'
  | 'scanning_parts'
  | 'finished';

type MachineGroup = {
  key: string;
  machine: SmtMachine | null;
  line: SmtLine | null;
  detailIndices: number[];
};

type CurrentGroupDetail = {
  detail: SmtOrderDetail;
  originalIndex: number;
};

export const useSmtPartRegisterFlow = () => {
  const flatListRef = useRef<FlatList<CurrentGroupDetail>>(null);
  const scanBusyRef = useRef(false);

  const [step, setStep] = useState<SmtPartRegisterStep>('scan_lot');
  const [lotNumber, setLotNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<OrderLotProduct[]>(
    [],
  );
  const [orderData, setOrderData] = useState<SmtOrderData | null>(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [productSelect, setProductSelect] = useState('');
  const [scannedMap, setScannedMap] = useState<Map<number, string>>(new Map());
  const [scannedBatchMap, setScannedBatchMap] = useState<Map<number, number>>(
    new Map(),
  );
  const [selectedDetailForModal, setSelectedDetailForModal] =
    useState<SmtOrderDetail | null>(null);

  const machineGroups = useMemo<MachineGroup[]>(() => {
    if (!orderData?.details.length) {
      return [];
    }

    const groups: MachineGroup[] = [];
    const groupsByKey = new Map<string, MachineGroup>();

    orderData.details.forEach((detail, index) => {
      const machineKey =
        detail.machine?.id != null
          ? String(detail.machine.id)
          : detail.machine?.name || `m-${index}`;
      const lineKey =
        detail.line?.id != null
          ? String(detail.line.id)
          : detail.line?.name || `l-${index}`;
      const key = `${lineKey}_${machineKey}`;
      let group = groupsByKey.get(key);

      if (!group) {
        group = {
          key,
          machine: detail.machine ?? null,
          line: detail.line ?? null,
          detailIndices: [],
        };
        groupsByKey.set(key, group);
        groups.push(group);
      }

      group.detailIndices.push(index);
    });

    return groups;
  }, [orderData]);

  const currentMachineGroup = machineGroups[currentGroupIndex] ?? null;

  const currentGroupDetails = useMemo<CurrentGroupDetail[]>(() => {
    if (!orderData || !currentMachineGroup) {
      return [];
    }

    return currentMachineGroup.detailIndices.map(index => ({
      detail: orderData.details[index],
      originalIndex: index,
    }));
  }, [currentMachineGroup, orderData]);

  const totalBatches = orderData?.details.length ?? 0;
  const totalScanned = scannedMap.size;

  const handleScanLotNumber = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    setLotNumber(trimmed);
    setIsLoading(true);
    try {
      const response = await fetchOrderLotsByLotNumber(trimmed);
      if (response.status && response.data.length > 0) {
        setAvailableProducts(response.data);
        showSuccess(`Lot number ${trimmed} ditemukan`);
        setStep('select_product');
        return;
      }

      showError(
        response.message || `Order lot with number ${trimmed} not found.`,
      );
    } catch (error) {
      showError(
        getErrorMessage(
          error,
          `Order lot with number ${trimmed} not found.`,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = async (product: OrderLotProduct) => {
    setIsLoading(true);
    try {
      const response = await fetchOrderByLotAndProduct(lotNumber, product.id);
      if (response.status && response.data) {
        setOrderData(response.data);
        setCurrentGroupIndex(0);
        setScannedMap(new Map());
        setScannedBatchMap(new Map());
        showSuccess(`Product ${product.name} dipilih`);
        setStep('scan_product');
        return;
      }

      showError(response.message || 'Detail order tidak ditemukan');
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal mengambil detail order'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanProductSelect = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    setProductSelect(trimmed);
    showSuccess(`Product Select: ${trimmed}`);
    setStep('scan_line');
  };

  const handleScanLine = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !orderData || !currentMachineGroup) {
      return;
    }

    const isMatch =
      currentMachineGroup.line == null ||
      currentMachineGroup.line.name.toLowerCase() === trimmed.toLowerCase() ||
      String(currentMachineGroup.line.id) === trimmed;

    if (!isMatch) {
      showError(
        `Line "${trimmed}" tidak cocok. Harus: ${currentMachineGroup.line?.name}`,
      );
      return;
    }

    showSuccess(`Line ${currentMachineGroup.line?.name || 'No line'} cocok`);
    setStep('scan_machine');
  };

  const handleScanMachine = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !orderData || !currentMachineGroup) {
      return;
    }

    const isMatch =
      currentMachineGroup.machine == null ||
      currentMachineGroup.machine.name.toLowerCase() ===
        trimmed.toLowerCase() ||
      String(currentMachineGroup.machine.id) === trimmed;

    if (!isMatch) {
      showError(
        `Machine "${trimmed}" tidak cocok. Harus: ${currentMachineGroup.machine?.name}`,
      );
      return;
    }

    showSuccess(
      `Machine ${currentMachineGroup.machine?.name || 'No machine'} cocok`,
    );
    setStep('scanning_parts');
  };

  const handleScanPartBatch = async (value: string) => {
    const trimmed = extractStkNumber(value);
    if (!trimmed || !orderData || !currentMachineGroup) {
      return;
    }

    setIsSubmitting(true);
    try {
      const stkResponse = await fetchStkData(trimmed);
      if (!stkResponse.status || !stkResponse.data) {
        showError(stkResponse.message || `STK "${trimmed}" tidak ditemukan`);
        return;
      }

      const stkData: StkData = stkResponse.data;
      const latestHistory = stkData.latestHistory || '';
      const latestLocation = stkData.latestLocation || '';

      if (
        latestLocation.toLowerCase() !== 'smt' ||
        latestHistory.toLowerCase() !== 'acceptance'
      ) {
        if (latestHistory.toLowerCase() === 'register') {
          showError(`STK ${trimmed} sudah di register!`);
        } else {
          showError(
            `STK ${trimmed} belum distock-out dari warehouse! (Location: ${latestLocation}, Status: ${latestHistory})`,
          );
        }
        return;
      }

      const inventoryCode = (stkData.part?.inventoryCode || '').trim();
      const partNumber = (stkData.part?.partNumber || '').trim();
      const finalStk = stkData.stkNumber || trimmed;

      const isDetailMatching = (detail: SmtOrderDetail) => {
        const inventoryMatches =
          detail.inventoryCode.trim().toLowerCase() ===
          inventoryCode.toLowerCase();
        const partMatches = detail.partNumber
          ? detail.partNumber.trim().toLowerCase() === partNumber.toLowerCase()
          : true;
        const stkMatches =
          Array.isArray(detail.stkList) &&
          detail.stkList.some(stk => {
            const normalizedStk = stk.trim().toLowerCase();
            return (
              normalizedStk === trimmed.toLowerCase() ||
              normalizedStk === finalStk.trim().toLowerCase()
            );
          });

        return (inventoryMatches && partMatches) || stkMatches;
      };

      let matchingIndex = currentMachineGroup.detailIndices.find(
        index =>
          !scannedMap.has(index) &&
          isDetailMatching(orderData.details[index]),
      );

      if (matchingIndex === undefined) {
        matchingIndex = currentMachineGroup.detailIndices.find(index =>
          isDetailMatching(orderData.details[index]),
        );
      }

      if (matchingIndex === undefined) {
        const otherGroup = machineGroups.find(group =>
          group.detailIndices.some(index =>
            isDetailMatching(orderData.details[index]),
          ),
        );

        if (otherGroup) {
          showError(
            `STK ${finalStk} terdaftar untuk Machine "${
              otherGroup.machine?.name || '-'
            }". Selesaikan Machine "${
              currentMachineGroup.machine?.name || '-'
            }" terlebih dahulu.`,
          );
        } else {
          showError(
            `STK ${finalStk} (Part: ${
              partNumber || '-'
            }, PDDM: ${inventoryCode || '-'}) tidak cocok dengan order ini`,
          );
        }
        return;
      }

      const previousStk = scannedMap.get(matchingIndex);
      if (previousStk === finalStk) {
        showInfo(`STK ${finalStk} sudah di-scan sebelumnya`);
        return;
      }

      setScannedMap(previous => {
        const next = new Map(previous);
        next.set(matchingIndex, finalStk);
        return next;
      });
      setScannedBatchMap(previous => {
        const next = new Map(previous);
        next.set(matchingIndex, stkData.id);
        return next;
      });

      if (previousStk) {
        showSuccess(`STK diperbarui: ${previousStk} -> ${finalStk}`);
      } else {
        showSuccess(
          `STK ${finalStk} (${partNumber || '-'}) berhasil di-scan`,
        );
      }

      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

      const scannedGroupCount = currentMachineGroup.detailIndices.filter(
        index => index === matchingIndex || scannedMap.has(index),
      ).length;

      if (scannedGroupCount < currentMachineGroup.detailIndices.length) {
        return;
      }

      const nextGroupIndex = currentGroupIndex + 1;
      if (nextGroupIndex >= machineGroups.length) {
        showSuccess('Semua detail part telah di-scan! Tekan Finish.');
        return;
      }

      const nextGroup = machineGroups[nextGroupIndex];
      setCurrentGroupIndex(nextGroupIndex);
      const lineChanged =
        (currentMachineGroup.line?.id ??
          currentMachineGroup.line?.name ??
          null) !== (nextGroup.line?.id ?? nextGroup.line?.name ?? null);

      if (lineChanged) {
        showInfo(
          `Machine ${
            currentMachineGroup.machine?.name || '-'
          } selesai! Scan Line untuk machine berikutnya.`,
        );
        setStep('scan_line');
      } else {
        showInfo(
          `Machine ${
            currentMachineGroup.machine?.name || '-'
          } selesai! Scan Machine ${nextGroup.machine?.name || '-'}.`,
        );
        setStep('scan_machine');
      }
    } catch (error) {
      showError(
        getErrorMessage(error, `Gagal mengambil data STK ${trimmed}`),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    const partBatchIds = Array.from(scannedBatchMap.values());
    if (partBatchIds.length === 0) {
      showError('Belum ada STK yang di-scan');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSmt({ lotNumber, partBatchIds, productSelect });
      showSuccess('Part Register selesai!');
      setStep('finished');
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal mengirim data Part Register'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = useCallback(() => {
    setStep('scan_lot');
    setLotNumber('');
    setOrderData(null);
    setAvailableProducts([]);
    setCurrentGroupIndex(0);
    setProductSelect('');
    setScannedMap(new Map());
    setScannedBatchMap(new Map());
    setSelectedDetailForModal(null);
    setIsLoading(false);
    setIsSubmitting(false);
    scanBusyRef.current = false;
  }, []);

  const handleScan = (value: string) => {
    if (scanBusyRef.current || isLoading || isSubmitting) {
      return;
    }

    scanBusyRef.current = true;
    let scanTask = Promise.resolve();

    switch (step) {
      case 'scan_lot':
        scanTask = handleScanLotNumber(value);
        break;
      case 'select_product': {
        const normalizedValue = value.trim().toLowerCase();
        const product = availableProducts.find(
          item =>
            String(item.id) === normalizedValue ||
            item.code.toLowerCase() === normalizedValue ||
            item.name.toLowerCase() === normalizedValue,
        );

        if (product) {
          scanTask = handleSelectProduct(product);
        } else if (availableProducts.length > 0) {
          showError(`Produk "${value}" tidak ditemukan dalam pilihan lot.`);
        }
        break;
      }
      case 'scan_product':
        handleScanProductSelect(value);
        break;
      case 'scan_line':
        handleScanLine(value);
        break;
      case 'scan_machine':
        handleScanMachine(value);
        break;
      case 'scanning_parts':
        scanTask = handleScanPartBatch(value);
        break;
      default:
        break;
    }

    scanTask
      .finally(() => {
        scanBusyRef.current = false;
      })
      .catch(() => undefined);
  };

  useKeyenceScanner({ onScan: handleScan });

  const headerSubtitle =
    step === 'scan_lot'
      ? 'Scan Lot Number'
      : step === 'select_product'
        ? 'Pilih Product'
        : step === 'scan_product'
          ? 'Scan Product Select'
          : step === 'scan_line'
            ? `Scan Line (${currentMachineGroup?.line?.name || '-'})`
            : step === 'scan_machine'
              ? `Scan Machine (${currentMachineGroup?.machine?.name || '-'})`
              : step === 'scanning_parts'
                ? `Scan STK Parts (${
                    currentMachineGroup?.machine?.name || '-'
                  })`
                : 'Selesai';

  const machineGroupLabel = currentMachineGroup
    ? `Machine ${currentGroupIndex + 1}/${machineGroups.length}: ${
        currentMachineGroup.machine?.name || '-'
      }`
    : '';

  return {
    step,
    lotNumber,
    isLoading,
    isSubmitting,
    availableProducts,
    orderData,
    currentGroupIndex,
    productSelect,
    scannedMap,
    selectedDetailForModal,
    setSelectedDetailForModal,
    machineGroups,
    currentMachineGroup,
    currentGroupDetails,
    totalBatches,
    totalScanned,
    flatListRef,
    headerSubtitle,
    machineGroupLabel,
    handleSelectProduct,
    handleFinish,
    handleReset,
  };
};
