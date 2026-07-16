import { useState, useEffect, useRef, useCallback } from 'react';
import { TextInput, Alert } from 'react-native';
import { Supplier, Maker, PartAcceptancePayload } from '../types';
import {
  fetchSuppliers,
  fetchMakers,
  registerPartAcceptance,
  createSupplier,
  createMaker,
  getExpiredDateTwoWeeks,
} from '../services/warehouseService';
import { showSuccess, showError } from '../../../services/toastService';

export const useRegisterWarehouse = () => {
  // ─── Form State ───────────────────────────────────────────────────────────
  const [partNumber, setPartNumber] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [barcode, setBarcode] = useState('');

  // ─── Supplier / Maker State ───────────────────────────────────────────────
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [makers, setMakers] = useState<Maker[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    null,
  );
  const [selectedMakerId, setSelectedMakerId] = useState<number | null>(null);

  // ─── Loading State ────────────────────────────────────────────────────────
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingMakers, setLoadingMakers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ─── Master Data Not Found Popup ──────────────────────────────────────────
  const [showMasterDataModal, setShowMasterDataModal] = useState(false);
  const [masterDataType, setMasterDataType] = useState<'supplier' | 'maker'>(
    'supplier',
  );
  const [masterDataName, setMasterDataName] = useState('');

  // ─── Focused Field Tracking ──────────────────────────────────────────────
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const focusedFieldRef = useRef<string | null>(null);
  const allowScannerRefocus = useRef(true);

  const handleFocusField = useCallback((field: string) => {
    focusedFieldRef.current = field;
    allowScannerRefocus.current = false;
    setFocusedField(field);
  }, []);

  const handleBlurField = useCallback((field: string) => {
    if (focusedFieldRef.current === field) {
      focusedFieldRef.current = null;
      setFocusedField(null);
      // Allow scanner to refocus after a short delay, then trigger it
      setTimeout(() => {
        allowScannerRefocus.current = true;
        requestAnimationFrame(() => {
          barcodeRef.current?.focus();
        });
      }, 300);
    }
  }, []);

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const barcodeRef = useRef<TextInput>(null);
  const partNumberRef = useRef<TextInput>(null);
  const lotNumberRef = useRef<TextInput>(null);
  const quantityRef = useRef<TextInput>(null);

  // ─── Load Suppliers & Makers on mount ─────────────────────────────────────
  useEffect(() => {
    loadSuppliers();
    loadMakers();
  }, []);

  const loadSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const data = await fetchSuppliers();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Gagal memuat data supplier');
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const loadMakers = async () => {
    setLoadingMakers(true);
    try {
      const data = await fetchMakers();
      setMakers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Gagal memuat data maker');
    } finally {
      setLoadingMakers(false);
    }
  };

  // ─── Focus Scanner ────────────────────────────────────────────────────────
  const focusScanner = useCallback(() => {
    // Don't steal focus from form fields or when not allowed
    if (focusedFieldRef.current || !allowScannerRefocus.current) {
      return;
    }
    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }, []);

  // ─── Parse Barcode ────────────────────────────────────────────────────────
  // Format: partNo-lotNo-qty-makerName-supplierName
  // Example: PART1-LOT1-100-DENSO KIMCO-TOYO DOYO
  //
  // When a specific field is focused (partNumber, lotNumber, quantity),
  // the scanner input fills only that field.
  // When no field is focused, it does full barcode parsing.
  const parseBarcode = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setBarcode('');
        focusScanner();
        return;
      }

      // If a specific field is focused, fill only that field
      if (focusedFieldRef.current === 'partNumber') {
        setPartNumber(trimmed);
        setBarcode('');
        // Move focus to lotNumber
        setTimeout(() => lotNumberRef.current?.focus(), 100);
        return;
      }
      if (focusedFieldRef.current === 'lotNumber') {
        setLotNumber(trimmed);
        setBarcode('');
        // Move focus to quantity
        setTimeout(() => quantityRef.current?.focus(), 100);
        return;
      }
      if (focusedFieldRef.current === 'quantity') {
        setQuantity(trimmed);
        setBarcode('');
        // Clear focus tracking and refocus scanner
        focusedFieldRef.current = null;
        setFocusedField(null);
        allowScannerRefocus.current = true;
        setTimeout(() => {
          requestAnimationFrame(() => {
            barcodeRef.current?.focus();
          });
        }, 100);
        return;
      }

      // No specific field focused - do full barcode parse
      const parts = trimmed.split('-');
      if (parts.length !== 5) {
        showError(
          'Format barcode tidak valid. Format: partNo-lotNo-qty-maker-supplier',
        );
        setBarcode('');
        focusScanner();
        return;
      }
      const [partNo, lotNo, qtyVal, makerVal, supplierVal] = parts;
      setPartNumber(partNo);
      setLotNumber(lotNo);
      setQuantity(qtyVal);

      // Try to match maker by name or code
      const matchedMaker = makers.find(
        m =>
          m.name.toLowerCase() === makerVal.toLowerCase() ||
          m.code?.toLowerCase() === makerVal.toLowerCase(),
      );
      if (matchedMaker) {
        setSelectedMakerId(matchedMaker.id);
      } else {
        setSelectedMakerId(null);
        setMasterDataType('maker');
        setMasterDataName(makerVal);
        setShowMasterDataModal(true);
      }

      // Try to match supplier by name or code
      const matchedSupplier = suppliers.find(
        s =>
          s.name.toLowerCase() === supplierVal.toLowerCase() ||
          s.code?.toLowerCase() === supplierVal.toLowerCase(),
      );
      if (matchedSupplier) {
        setSelectedSupplierId(matchedSupplier.id);
      } else {
        setSelectedSupplierId(null);
        setMasterDataType('supplier');
        setMasterDataName(supplierVal);
        setShowMasterDataModal(true);
      }

      setBarcode('');
      focusScanner();
    },
    [focusedField, suppliers, makers, focusScanner],
  );

  // ─── Select Supplier from dropdown ────────────────────────────────────────
  const handleSelectSupplier = useCallback(
    (id: string) => {
      const supplier = suppliers.find(s => String(s.id) === id);
      if (supplier) {
        setSelectedSupplierId(supplier.id);
      }
    },
    [suppliers],
  );

  // ─── Select Maker from dropdown ───────────────────────────────────────────
  const handleSelectMaker = useCallback(
    (id: string) => {
      const maker = makers.find(m => String(m.id) === id);
      if (maker) {
        setSelectedMakerId(maker.id);
      }
    },
    [makers],
  );

  // ─── Create Master Data (Supplier or Maker) ──────────────────────────────
  const handleCreateMasterData = useCallback(async () => {
    try {
      if (masterDataType === 'supplier') {
        const newSupplier = await createSupplier({ name: masterDataName });
        setSuppliers(prev => [...prev, newSupplier]);
        setSelectedSupplierId(newSupplier.id);
        showSuccess(`Supplier "${masterDataName}" berhasil dibuat`);
      } else {
        const newMaker = await createMaker({ name: masterDataName });
        setMakers(prev => [...prev, newMaker]);
        setSelectedMakerId(newMaker.id);
        showSuccess(`Maker "${masterDataName}" berhasil dibuat`);
      }
      setShowMasterDataModal(false);
    } catch (error: any) {
      showError(
        error?.response?.data?.message ||
          `Gagal membuat data ${masterDataType}`,
      );
    }
  }, [masterDataType, masterDataName]);

  // ─── Submit Part Acceptance ───────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    // Validation
    if (!partNumber.trim()) {
      showError('Part Number wajib diisi');
      return;
    }
    if (!lotNumber.trim()) {
      showError('Lot Number wajib diisi');
      return;
    }
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      showError('Quantity harus berupa angka lebih dari 0');
      return;
    }
    if (selectedSupplierId === null) {
      // Check if supplier data exists
      if (suppliers.length === 0) {
        setMasterDataType('supplier');
        setMasterDataName('');
        setShowMasterDataModal(true);
        return;
      }
      showError('Supplier wajib dipilih');
      return;
    }
    if (selectedMakerId === null) {
      // Check if maker data exists
      if (makers.length === 0) {
        setMasterDataType('maker');
        setMasterDataName('');
        setShowMasterDataModal(true);
        return;
      }
      showError('Maker wajib dipilih');
      return;
    }

    setSubmitting(true);
    try {
      const payload: PartAcceptancePayload = {
        partNumber: partNumber.trim(),
        lotNumber: lotNumber.trim(),
        quantity: Number(quantity),
        makerId: selectedMakerId,
        supplierId: selectedSupplierId,
        expiredDate: getExpiredDateTwoWeeks(),
      };

      await registerPartAcceptance(payload);
      showSuccess('Part berhasil didaftarkan', 'Register Berhasil');

      // Reset form
      resetForm();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Gagal mendaftarkan part';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [
    partNumber,
    lotNumber,
    quantity,
    selectedSupplierId,
    selectedMakerId,
    suppliers,
    makers,
  ]);

  // ─── Reset Form ───────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setPartNumber('');
    setLotNumber('');
    setQuantity('');
    setBarcode('');
    setSelectedSupplierId(null);
    setSelectedMakerId(null);
    focusScanner();
  }, [focusScanner]);

  // ─── Get selected supplier/maker names ────────────────────────────────────
  const selectedSupplierName =
    suppliers.find(s => s.id === selectedSupplierId)?.name ?? '';
  const selectedMakerName =
    makers.find(m => m.id === selectedMakerId)?.name ?? '';

  return {
    // Form state
    partNumber,
    setPartNumber,
    lotNumber,
    setLotNumber,
    quantity,
    setQuantity,
    barcode,
    setBarcode,

    // Supplier / Maker
    suppliers,
    makers,
    selectedSupplierId,
    selectedMakerId,
    selectedSupplierName,
    selectedMakerName,
    handleSelectSupplier,
    handleSelectMaker,

    // Loading
    loadingSuppliers,
    loadingMakers,
    submitting,

    // Focused field
    focusedField,
    focusedFieldRef,
    handleFocusField,
    handleBlurField,

    // Refs
    barcodeRef,
    partNumberRef,
    lotNumberRef,
    quantityRef,

    // Actions
    parseBarcode,
    handleSubmit,
    resetForm,
    focusScanner,
    loadSuppliers,
    loadMakers,

    // Master data modal
    showMasterDataModal,
    masterDataType,
    masterDataName,
    setMasterDataName,
    setShowMasterDataModal,
    handleCreateMasterData,
  };
};
