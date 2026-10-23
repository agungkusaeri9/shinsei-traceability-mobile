import { useCallback, useEffect, useRef, useState } from 'react';
import { useKeyenceScanner } from '../../../hooks/useKeyenceScanner';
import { showError, showSuccess } from '../../../services/toastService';
import { extractPartNo } from '../../../utils/barcode';
import { getErrorMessage } from '../../../utils/errorMessage';
import {
  createPartAcceptance,
  fetchAreas,
  fetchCustomers,
  getDefaultExpiredDate,
  getPartDisplayLocations,
  searchParts,
} from '../services/partAcceptanceService';
import type {
  AreaItem,
  CreatePartAcceptancePayload,
  CustomerItem,
  PartSearchResult,
} from '../types';

export type PartAcceptanceStep = 'search' | 'select' | 'detail';

const WAREHOUSE_AREAS = ['warehouse 1', 'warehouse 2', 'receiving'];

export const usePartAcceptanceFlow = () => {
  const [step, setStep] = useState<PartAcceptanceStep>('search');
  const [partNoInput, setPartNoInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PartSearchResult[]>([]);
  const [selectedPart, setSelectedPart] = useState<PartSearchResult | null>(
    null,
  );
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [expiredDate, setExpiredDate] = useState(getDefaultExpiredDate());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputValueRef = useRef('');
  const scanBusyRef = useRef(false);

  const loadFilterData = useCallback(async () => {
    try {
      const [areaData, customerData] = await Promise.all([
        fetchAreas(),
        fetchCustomers(),
      ]);
      setAreas(
        areaData.filter(area =>
          WAREHOUSE_AREAS.some(name =>
            (area.name || '').toLowerCase().includes(name),
          ),
        ),
      );
      setCustomers(customerData);
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal memuat filter Part Acceptance'));
    }
  }, []);

  useEffect(() => {
    loadFilterData().catch(() => undefined);
  }, [loadFilterData]);

  const handleSearchPartNo = useCallback(
    async (overrideValue?: string) => {
      const rawValue =
        overrideValue !== undefined ? overrideValue : inputValueRef.current;
      const targetValue = extractPartNo(rawValue);

      if (!targetValue) {
        showError('Masukkan Part No terlebih dahulu');
        return;
      }

      inputValueRef.current = targetValue;
      setPartNoInput(targetValue);
      setSelectedPart(null);
      setSearchResults([]);
      setIsSearching(true);

      try {
        const results = await searchParts(targetValue);
        if (results.length === 0) {
          showError('Part tidak ditemukan');
          return;
        }

        if (results.length === 1) {
          setSelectedPart(results[0]);
          setQuantity(results[0].qty ? String(results[0].qty) : '');
          setExpiredDate(getDefaultExpiredDate());
          setStep('detail');
          return;
        }

        setSearchResults(results);
        const matched = selectedCustomerId
          ? results.find(part => part.customer?.id === selectedCustomerId)
          : null;

        if (matched) {
          setSelectedPart(matched);
          setQuantity(matched.qty ? String(matched.qty) : '');
          setExpiredDate(getDefaultExpiredDate());
          setStep('detail');
        } else {
          setStep('select');
        }
      } catch (error) {
        showError(getErrorMessage(error, 'Gagal mencari Part'));
      } finally {
        setIsSearching(false);
      }
    },
    [selectedCustomerId],
  );

  useKeyenceScanner({
    onScan: value => {
      if (step !== 'search' || isSearching || scanBusyRef.current) {
        return;
      }

      scanBusyRef.current = true;
      handleSearchPartNo(value)
        .finally(() => {
          scanBusyRef.current = false;
        })
        .catch(() => undefined);
    },
  });

  const handlePartNoChange = useCallback((text: string) => {
    inputValueRef.current = text;
    setPartNoInput(text);
  }, []);

  const handleSelectCustomer = useCallback((id: number | null) => {
    setSelectedCustomerId(id);
    setShowCustomerDropdown(false);
  }, []);

  const handleSelectArea = useCallback((id: number | null) => {
    setSelectedAreaId(id);
    setShowAreaDropdown(false);
  }, []);

  const handleManualSearch = useCallback(() => {
    handleSearchPartNo(inputValueRef.current).catch(() => undefined);
  }, [handleSearchPartNo]);

  const handleSelectPart = useCallback((part: PartSearchResult) => {
    setSelectedPart(part);
    setQuantity(part.qty ? String(part.qty) : '');
    setExpiredDate(getDefaultExpiredDate());
    setStep('detail');
  }, []);

  const handleReset = useCallback(() => {
    inputValueRef.current = '';
    setPartNoInput('');
    setSearchResults([]);
    setSelectedPart(null);
    setQuantity('');
    setExpiredDate(getDefaultExpiredDate());
    setStep('search');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedPart) {
      showError('Pilih Part terlebih dahulu');
      return;
    }
    if (!selectedAreaId) {
      showError('Pilih Area terlebih dahulu');
      return;
    }

    const quantityNumber = Number(quantity);
    if (
      !quantity.trim() ||
      Number.isNaN(quantityNumber) ||
      quantityNumber < 1
    ) {
      showError('Quantity minimal 1');
      return;
    }
    if (!expiredDate.trim()) {
      showError('Expired Date wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const locations = getPartDisplayLocations(selectedPart);
      const payload: CreatePartAcceptancePayload = {
        inventoryCode: selectedPart.inventoryCode || selectedPart.code || '',
        quantity: quantityNumber,
        supplierId: selectedPart.supplier?.id ?? 0,
        customerId: selectedPart.customer?.id ?? 0,
        expiredDate: new Date(`${expiredDate}T00:00:00`).toISOString(),
        areaId: selectedAreaId,
        pddm: selectedPart.inventoryCode || selectedPart.code || '-',
        rak: locations[0] ?? '',
        partNo: selectedPart.partNumber || '-',
      };

      const response = await createPartAcceptance(payload);
      showSuccess(
        `Part Acceptance berhasil! STK: ${response.data?.stkNumber || '-'}`,
        'Sukses',
      );
      handleReset();
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal membuat Part Acceptance'));
    } finally {
      setIsSubmitting(false);
    }
  }, [expiredDate, handleReset, quantity, selectedAreaId, selectedPart]);

  return {
    step,
    partNoInput,
    isSearching,
    searchResults,
    selectedPart,
    customers,
    areas,
    selectedCustomerId,
    selectedAreaId,
    showCustomerDropdown,
    setShowCustomerDropdown,
    showAreaDropdown,
    setShowAreaDropdown,
    quantity,
    setQuantity,
    expiredDate,
    setExpiredDate,
    isSubmitting,
    handlePartNoChange,
    handleSelectCustomer,
    handleSelectArea,
    handleManualSearch,
    handleSelectPart,
    handleReset,
    handleSubmit,
  };
};
