import { useState, useRef, useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useKeyenceScanner } from '../../../hooks/useKeyenceScanner';
import {
  showSuccess,
  showError,
  showInfo,
} from '../../../services/toastService';
import { getErrorMessage } from '../../../utils/errorMessage';
import { extractStkNumber } from '../../../utils/barcode';
import {
  fetchOrders,
  fetchOrderById,
  submitMaterialFeeding,
} from '../services/warehouseService';
import type {
  Order,
  OrderSummary,
  AvailablePart,
  MissingPart,
} from '../types';

export type StockOutStep = 'select_wo' | 'confirm_wo' | 'scanning' | 'finished';

type UseStockOutFlowOptions = {
  /** Called when the header back button is pressed on the first step. */
  onExit: () => void;
};

/**
 * Flow logic for StockOutScreen (select WO -> confirm -> scan STK -> finished).
 */
export const useStockOutFlow = ({ onExit }: UseStockOutFlowOptions) => {
  const flatListRef = useRef<FlatList<AvailablePart>>(null);

  const [step, setStep] = useState<StockOutStep>('select_wo');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [scannedStkNumbers, setScannedStkNumbers] = useState<Set<string>>(new Set());
  const [scannedPartIds, setScannedPartIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const scannedStkNumbersRef = useRef<Set<string>>(new Set());

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const [createdOrders, partialOrders] = await Promise.all([
        fetchOrders({ status: 'created' }),
        fetchOrders({ status: 'partial' }),
      ]);
      const list1 = Array.isArray(createdOrders) ? createdOrders : [];
      const list2 = Array.isArray(partialOrders) ? partialOrders : [];
      const combinedMap = new Map();
      [...list1, ...list2].forEach(o => combinedMap.set(o.id, o));
      setOrders(Array.from(combinedMap.values()));
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal memuat data Order'));
    } finally {
      setLoadingOrders(false);
    }
  };

  // Refetch orders when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (step === 'select_wo') {
        loadOrders();
      }
    }, [step]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, []);

  // Build dropdown options from orders
  const orderDropdownOptions = orders.map(o => ({
    id: String(o.id),
    label: `${o.orderNumber} - ${o.customerName ?? 'N/A'}`,
  }));

  const handleSelectOrder = (id: string) => {
    if (!id) {
      setSelectedOrderId(null);
      setSelectedOrder(null);
      return;
    }
    const orderId = Number(id);
    setSelectedOrderId(orderId);
    setSelectedOrder(null); // Reset, will be fetched on "Cari"
  };

  const handleFetchOrder = async () => {
    if (!selectedOrderId) {
      showError('Pilih Order terlebih dahulu');
      return;
    }

    setLoadingOrderDetail(true);
    try {
      const order = await fetchOrderById(selectedOrderId);
      // Order tanpa part tersedia tetap bisa dibuka -
      // daftar missing part ditampilkan di step konfirmasi
      setSelectedOrder(order);
      scannedStkNumbersRef.current = new Set();
      setScannedStkNumbers(new Set());
      setStep('confirm_wo');
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal memuat detail Order'));
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  const handleScanStk = (value: string) => {
    const trimmed = extractStkNumber(value);
    if (!trimmed || !selectedOrder) {
      return;
    }

    const matchedPart = selectedOrder.availableParts.find(
      p => p.stkNumber?.trim().toLowerCase() === trimmed.toLowerCase(),
    );

    if (matchedPart) {
      if (scannedStkNumbersRef.current.has(matchedPart.stkNumber)) {
        showInfo(`${matchedPart.stkNumber} sudah di-scan sebelumnya`);
      } else {
        const nextScanned = new Set(scannedStkNumbersRef.current).add(
          matchedPart.stkNumber,
        );
        scannedStkNumbersRef.current = nextScanned;
        setScannedStkNumbers(nextScanned);
        setScannedPartIds(prev => [...prev, matchedPart.partId]);
        showSuccess(`${matchedPart.stkNumber} berhasil di-scan`);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    } else {
      const isMissing = selectedOrder.missingParts?.some(
        p => p.partNumber?.trim().toLowerCase() === trimmed.toLowerCase(),
      );
      if (isMissing) {
        showError(`${trimmed} belum tersedia di gudang`);
      } else {
        showError(`${trimmed} tidak terdaftar dalam Order ini`);
      }
    }
  };

  useKeyenceScanner({
    onScan: value => {
      if (step === 'scanning' && !isSubmitting) {
        handleScanStk(value);
      }
    },
  });

  // Sort available parts: unscanned first, scanned last
  const sortedAvailableParts = useMemo(() => {
    if (!selectedOrder?.availableParts) return [];
    const scanned: AvailablePart[] = [];
    const unscanned: AvailablePart[] = [];
    for (const part of selectedOrder.availableParts) {
      if (scannedStkNumbers.has(part.stkNumber)) {
        scanned.push(part);
      } else {
        unscanned.push(part);
      }
    }
    return [...unscanned, ...scanned];
  }, [selectedOrder?.availableParts, scannedStkNumbers]);

  const availableCount = selectedOrder?.availableParts?.length ?? 0;
  const missingParts: MissingPart[] = selectedOrder?.missingParts ?? [];

  const handleStartScan = () => {
    setStep('scanning');
  };

  const handleSubmit = async () => {
    if (!selectedOrder) return;
    if (scannedStkNumbers.size === 0) {
      showError('Belum ada STK yang di-scan');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMaterialFeeding({
        orderId: selectedOrder.id,
        processedDate: new Date().toISOString(),
        materialFeedingItems: scannedPartIds.map(id => ({ partBatchId: id })),
      });
      showSuccess(
        `Stock Out ${selectedOrder.orderNumber} berhasil diproses`,
        'Stock Out Berhasil',
      );
      setStep('finished');
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal memproses Stock Out'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('select_wo');
    setSelectedOrderId(null);
    setSelectedOrder(null);
    scannedStkNumbersRef.current = new Set();
    setScannedStkNumbers(new Set());
    setScannedPartIds([]);
  };

  const handleBackHeader = () => {
    if (step === 'select_wo') {
      onExit();
    } else {
      handleReset();
    }
  };

  const headerSubtitle =
    step === 'select_wo'
      ? 'Pilih Order'
      : step === 'confirm_wo'
        ? 'Konfirmasi Data'
        : step === 'scanning'
          ? 'Scan STK Number'
          : 'Selesai';

  return {
    step,
    setStep,
    orders,
    loadingOrders,
    selectedOrderId,
    selectedOrder,
    loadingOrderDetail,
    scannedStkNumbers,
    scannedPartIds,
    isSubmitting,
    refreshing,
    dropdownOpen,
    setDropdownOpen,
    sortedAvailableParts,
    availableCount,
    missingParts,
    orderDropdownOptions,
    headerSubtitle,
    flatListRef,
    loadOrders,
    onRefresh,
    handleSelectOrder,
    handleFetchOrder,
    handleStartScan,
    handleScanStk,
    handleSubmit,
    handleReset,
    handleBackHeader,
  };
};
