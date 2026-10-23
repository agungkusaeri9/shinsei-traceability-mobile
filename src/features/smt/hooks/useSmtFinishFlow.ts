import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { showError, showSuccess } from '../../../services/toastService';
import { getErrorMessage } from '../../../utils/errorMessage';
import {
  fetchOrderLotsByLotNumber,
  finishSmt,
  searchOrderLots,
} from '../services/smtService';
import type { OrderLotItem, OrderLotProduct } from '../types';

export const useSmtFinishFlow = () => {
  const [orderLots, setOrderLots] = useState<OrderLotItem[]>([]);
  const [loadingLots, setLoadingLots] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLotNumber, setSelectedLotNumber] = useState<string | null>(null);
  const [availableProducts, setAvailableProducts] = useState<OrderLotProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<OrderLotProduct | null>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const submitBusyRef = useRef(false);

  const loadOrderLots = useCallback(async () => {
    setLoadingLots(true);
    try {
      const data = await searchOrderLots('', 1, 20);
      setOrderLots(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal memuat data Order Lot'));
    } finally {
      setLoadingLots(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrderLots().catch(() => undefined);
    }, [loadOrderLots]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrderLots();
    setRefreshing(false);
  }, [loadOrderLots]);

  const lotOptions = useMemo(
    () =>
      orderLots.map(item => {
        const lotNumber = item.lotNumber || String(item.id || '');
        const metadata = [item.customerName, item.productName]
          .filter(Boolean)
          .join(' - ');
        return {
          id: lotNumber,
          label: metadata ? `${lotNumber} (${metadata})` : lotNumber,
        };
      }),
    [orderLots],
  );

  const productOptions = useMemo(
    () =>
      availableProducts.map(product => ({
        id: String(product.id),
        label: `${product.name} (${product.code})`,
      })),
    [availableProducts],
  );

  const clearSelection = useCallback(() => {
    setSelectedLotNumber(null);
    setAvailableProducts([]);
    setSelectedProduct(null);
  }, []);

  const handleSelectLot = useCallback(
    async (lotNumber: string) => {
      if (!lotNumber) {
        clearSelection();
        return;
      }

      setSelectedLotNumber(lotNumber);
      setAvailableProducts([]);
      setSelectedProduct(null);
      setLoadingOrderDetail(true);
      try {
        const response = await fetchOrderLotsByLotNumber(lotNumber);
        if (!response.status || !Array.isArray(response.data) || response.data.length === 0) {
          showError(response.message || 'Detail Order Lot tidak ditemukan');
          clearSelection();
          return;
        }

        setAvailableProducts(response.data);
        setSelectedProduct(response.data[0]);
      } catch (error) {
        showError(getErrorMessage(error, 'Gagal mengambil detail Order Lot'));
        clearSelection();
      } finally {
        setLoadingOrderDetail(false);
      }
    },
    [clearSelection],
  );

  const handleLotSelection = useCallback(
    (lotNumber: string) => {
      handleSelectLot(lotNumber).catch(() => undefined);
    },
    [handleSelectLot],
  );

  const handleProductSelection = useCallback(
    (productId: string) => {
      const product = availableProducts.find(
        item => String(item.id) === productId,
      );
      if (product) {
        setSelectedProduct(product);
      }
    },
    [availableProducts],
  );

  const handleSubmitFinish = useCallback(async () => {
    if (submitBusyRef.current) {
      return;
    }
    if (!selectedLotNumber || !selectedProduct) {
      showError('Pilih Lot Number terlebih dahulu');
      return;
    }

    submitBusyRef.current = true;
    setIsSubmitting(true);
    try {
      await finishSmt({
        lotNumber: selectedLotNumber,
        model: selectedProduct.name || '',
        customer: selectedProduct.customerName || '',
      });
      showSuccess(`Finish SMT Lot ${selectedLotNumber} berhasil`, 'SMT Finish');
      setIsSuccess(true);
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal menyelesaikan proses SMT Finish'));
    } finally {
      submitBusyRef.current = false;
      setIsSubmitting(false);
    }
  }, [selectedLotNumber, selectedProduct]);

  const handleReset = useCallback(() => {
    setIsSuccess(false);
    clearSelection();
    loadOrderLots().catch(() => undefined);
  }, [clearSelection, loadOrderLots]);

  return {
    loadingLots,
    refreshing,
    selectedLotNumber,
    availableProducts,
    selectedProduct,
    loadingOrderDetail,
    isSubmitting,
    isSuccess,
    lotOptions,
    productOptions,
    onRefresh,
    handleLotSelection,
    handleProductSelection,
    handleSubmitFinish,
    handleReset,
  };
};
