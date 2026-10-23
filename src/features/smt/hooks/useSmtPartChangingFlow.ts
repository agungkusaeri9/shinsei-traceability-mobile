import { useCallback, useRef, useState } from 'react';

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
import type { OrderLotProduct, SmtOrderData } from '../types';

export type SmtPartChangingStep =
  | 'scan_lot'
  | 'select_product'
  | 'scan_product'
  | 'scan_new_stk'
  | 'finished';

export type PartChangeItem = {
  inventoryCode: string;
  partNumber: string;
  stkList?: string[];
  machineName?: string;
  lineName?: string;
  replaced: boolean;
  replacedWithStk?: string;
  partBatchId?: number;
};

export const useSmtPartChangingFlow = () => {
  const scanBusyRef = useRef(false);

  const [step, setStep] = useState<SmtPartChangingStep>('scan_lot');
  const [lotNumber, setLotNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<OrderLotProduct[]>(
    [],
  );
  const [orderData, setOrderData] = useState<SmtOrderData | null>(null);
  const [productSelect, setProductSelect] = useState('');
  const [partChangeItems, setPartChangeItems] = useState<PartChangeItem[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null,
  );
  const [selectedItemForModal, setSelectedItemForModal] =
    useState<PartChangeItem | null>(null);

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
    if (!trimmed || !orderData) {
      return;
    }

    setProductSelect(trimmed);
    showSuccess(`Product Select: ${trimmed}`);
    setPartChangeItems(
      orderData.details.map(detail => ({
        inventoryCode: detail.inventoryCode,
        partNumber: detail.partNumber || '-',
        stkList: detail.stkList || [],
        lineName: detail.line?.name,
        machineName: detail.machine?.name,
        replaced: false,
      })),
    );
    setSelectedItemIndex(null);
    setStep('scan_new_stk');
  };

  const handleScanNewStk = async (value: string) => {
    const trimmed = extractStkNumber(value);
    if (!trimmed || !orderData) {
      return;
    }

    setIsLoading(true);
    try {
      const stkResponse = await fetchStkData(trimmed);
      if (!stkResponse.status || !stkResponse.data) {
        showError(stkResponse.message || `STK "${trimmed}" tidak ditemukan`);
        return;
      }

      const stkData: StkData = stkResponse.data;
      const latestHistory = (stkData.latestHistory || '').toLowerCase();
      const latestLocation = (stkData.latestLocation || '').toLowerCase();

      if (latestLocation !== 'smt' || latestHistory !== 'acceptance') {
        if (latestHistory === 'register') {
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

      const matchesItem = (item: PartChangeItem) => {
        const inventoryMatches =
          item.inventoryCode.toLowerCase() === inventoryCode.toLowerCase();
        const partMatches =
          !partNumber ||
          item.partNumber.toLowerCase() === partNumber.toLowerCase() ||
          item.partNumber === '-';
        const stkMatches = item.stkList?.some(stk => {
          const normalizedStk = stk.toLowerCase();
          return (
            normalizedStk === trimmed.toLowerCase() ||
            normalizedStk === finalStk.toLowerCase()
          );
        });

        return (inventoryMatches && partMatches) || Boolean(stkMatches);
      };

      let matchingIndex = -1;
      if (
        selectedItemIndex !== null &&
        selectedItemIndex < partChangeItems.length
      ) {
        const selectedItem = partChangeItems[selectedItemIndex];
        const inventoryMatches =
          selectedItem.inventoryCode.toLowerCase() ===
          inventoryCode.toLowerCase();
        const stkMatches = selectedItem.stkList?.some(stk => {
          const normalizedStk = stk.toLowerCase();
          return (
            normalizedStk === trimmed.toLowerCase() ||
            normalizedStk === finalStk.toLowerCase()
          );
        });

        if (!inventoryMatches && !stkMatches) {
          showError(
            `STK ${finalStk} (PDDM: ${
              inventoryCode || '-'
            }, Part: ${partNumber || '-'}) tidak cocok dengan item yang dipilih (${
              selectedItem.inventoryCode
            })`,
          );
          return;
        }
        matchingIndex = selectedItemIndex;
      } else {
        matchingIndex = partChangeItems.findIndex(
          item => !item.replaced && matchesItem(item),
        );

        if (matchingIndex === -1) {
          matchingIndex = partChangeItems.findIndex(
            item =>
              !item.replaced &&
              item.inventoryCode.toLowerCase() === inventoryCode.toLowerCase(),
          );
        }

        if (matchingIndex === -1) {
          matchingIndex = partChangeItems.findIndex(matchesItem);
        }
      }

      if (matchingIndex === -1) {
        showError(
          `STK ${finalStk} (PDDM: ${inventoryCode || '-'}, Part: ${
            partNumber || '-'
          }) tidak cocok dengan order ini`,
        );
        return;
      }

      const matchedItem = partChangeItems[matchingIndex];
      if (matchedItem.replacedWithStk === finalStk) {
        showInfo(
          `STK ${finalStk} sudah di-scan untuk ${matchedItem.inventoryCode}`,
        );
        return;
      }

      setPartChangeItems(previous => {
        const next = [...previous];
        next[matchingIndex] = {
          ...next[matchingIndex],
          replaced: true,
          replacedWithStk: finalStk,
          partBatchId: stkData.id,
        };
        return next;
      });
      setSelectedItemIndex(null);

      if (matchedItem.replaced) {
        showSuccess(
          `STK untuk ${matchedItem.inventoryCode} diperbarui: ${
            matchedItem.replacedWithStk
          } -> ${finalStk}`,
        );
      } else {
        showSuccess(
          `Part ${matchedItem.inventoryCode} (${matchedItem.partNumber}) berhasil diganti dengan ${finalStk}`,
        );
      }
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal mengambil data STK'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
    const partBatchIds = partChangeItems.flatMap(item =>
      item.replaced && item.partBatchId != null ? [item.partBatchId] : [],
    );

    if (partBatchIds.length === 0) {
      showError('Belum ada part yang diganti');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSmt({ lotNumber, partBatchIds, productSelect });
      showSuccess('Part Changing selesai!');
      setStep('finished');
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal mengirim data Part Changing'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = useCallback(() => {
    setStep('scan_lot');
    setLotNumber('');
    setOrderData(null);
    setAvailableProducts([]);
    setProductSelect('');
    setPartChangeItems([]);
    setSelectedItemIndex(null);
    setSelectedItemForModal(null);
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
      case 'scan_new_stk':
        scanTask = handleScanNewStk(value);
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
          : step === 'scan_new_stk'
            ? 'Scan STK Pengganti'
            : 'Selesai';

  const replacedCount = partChangeItems.filter(item => item.replaced).length;

  return {
    step,
    lotNumber,
    isLoading,
    isSubmitting,
    availableProducts,
    orderData,
    productSelect,
    partChangeItems,
    selectedItemIndex,
    setSelectedItemIndex,
    selectedItemForModal,
    setSelectedItemForModal,
    headerSubtitle,
    replacedCount,
    handleSelectProduct,
    handleFinish,
    handleReset,
  };
};
