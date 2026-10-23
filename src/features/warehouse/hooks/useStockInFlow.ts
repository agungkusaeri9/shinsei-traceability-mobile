import { useState, useCallback } from 'react';
import { launchCamera, CameraOptions } from 'react-native-image-picker';
import { useRef } from 'react';
import { useKeyenceScanner } from '../../../hooks/useKeyenceScanner';
import { showSuccess, showError } from '../../../services/toastService';
import { getErrorMessage } from '../../../utils/errorMessage';
import { extractStkNumber } from '../../../utils/barcode';
import { fetchStkData, stockIn } from '../services/warehouseService';
import type { StkData, StkLocation } from '../types';

export type StockInStep = 'scan-stk' | 'scan-rack' | 'confirm';

export type PhotoAsset = {
  uri: string;
  type: string;
  name: string;
};

export type ScannedLocation = {
  rack: string;
  shelf: string;
  bin: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────

const getLocationsList = (stk: StkData | null): StkLocation[] => {
  if (!stk?.part) {
    return [];
  }
  if (stk.part.locations && stk.part.locations.length > 0) {
    return stk.part.locations;
  }
  return [];
};

// Parse rack barcode (Format: rack-shelf-bin)
const parseRackBarcode = (input: string): ScannedLocation | null => {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const separator = trimmed.includes('-')
    ? '-'
    : trimmed.includes('/')
    ? '/'
    : null;
  if (!separator) {
    return null;
  }

  const parts = trimmed.split(separator);
  if (parts.length >= 3) {
    const bin = parts[parts.length - 1].trim();
    const shelf = parts[parts.length - 2].trim();
    const rack = parts
      .slice(0, parts.length - 2)
      .join(separator)
      .trim();
    if (rack && shelf && bin) {
      return { rack, shelf, bin };
    }
  }
  return null;
};

type UseStockInFlowOptions = {
  /** Called when the header back button is pressed at the first step. */
  onExit: () => void;
};

/**
 * Flow logic for StockInScreen (scan STK -> scan rack -> confirm & photo).
 */
export const useStockInFlow = ({ onExit }: UseStockInFlowOptions) => {
  const [step, setStep] = useState<StockInStep>('scan-stk');
  const [stkData, setStkData] = useState<StkData | null>(null);
  const [scannedLocation, setScannedLocation] =
    useState<ScannedLocation | null>(null);
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [isLoadingStk, setIsLoadingStk] = useState(false);
  const [isCheckingRack, setIsCheckingRack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scanBusyRef = useRef(false);

  // ─── Step 1: Scan STK & Fetch Data ─────────────────────────────────────
  const handleScanStk = async (value: string) => {
    const trimmed = extractStkNumber(value);
    if (!trimmed) {
      return;
    }

    setIsLoadingStk(true);
    try {
      const response = await fetchStkData(trimmed);
      if (response.status && response.data) {
        if (response.data.latestHistory !== 'Acceptance') {
          showError(`STK: ${trimmed} sudah di ${response.data.latestHistory}`);
          return;
        }
        setStkData(response.data);
        showSuccess(`${trimmed} ditemukan. Silakan scan Barcode Rack.`);
        setStep('scan-rack');
      } else {
        showError(response.message || 'STK tidak ditemukan');
      }
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal mengambil data STK'));
    } finally {
      setIsLoadingStk(false);
    }
  };

  // ─── Step 2: Scan Rack & Validate Location ─────────────────────────────
  // API check (checkStkLocation) intentionally disabled as per requirement;
  // validation is done locally against the STK's valid location list.
  const handleScanRack = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    if (!stkData) {
      showError('Data STK tidak tersedia');
      setStep('scan-stk');
      return;
    }

    const parsed = parseRackBarcode(trimmed);
    if (!parsed) {
      showError(
        'Format barcode Rack salah. Gunakan format: Rack-Shelf-Bin (cth: RAK ZZ-ZZ01-1)',
      );
      return;
    }

    setIsCheckingRack(true);
    try {
      const validLocations = getLocationsList(stkData);

      const isMatch =
        validLocations.length === 0 ||
        validLocations.some(loc => {
          const rackMatch =
            !loc.rack ||
            loc.rack.trim().toLowerCase() === parsed.rack.trim().toLowerCase();
          const shelfMatch =
            !loc.shelf ||
            loc.shelf.trim().toLowerCase() ===
              parsed.shelf.trim().toLowerCase();
          const binMatch =
            !loc.bin ||
            loc.bin.trim().toLowerCase() === parsed.bin.trim().toLowerCase();
          return rackMatch && shelfMatch && binMatch;
        });

      if (isMatch) {
        setScannedLocation(parsed);
        showSuccess('Lokasi Rack sesuai!');
        setStep('confirm');
      } else {
        showError('Lokasi Rack tidak sesuai. Silakan scan ulang Rack.');
      }
    } catch {
      showError('Gagal memvalidasi lokasi Rack');
    } finally {
      setIsCheckingRack(false);
    }
  };

  // ─── Photo ─────────────────────────────────────────────────────────────
  const handleTakePhoto = () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1280,
      maxHeight: 1280,
      saveToPhotos: false,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        showError(response.errorMessage || 'Gagal mengambil foto');
        return;
      }
      const asset = response.assets?.[0];
      if (asset?.uri) {
        setPhoto({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `evidence_${Date.now()}.jpg`,
        });
      }
    });
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  // ─── Submit Stock In ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!stkData) {
      showError('Data STK belum tersedia');
      return;
    }

    if (!scannedLocation?.rack) {
      showError('Data barcode Rack belum discan');
      return;
    }

    setIsSubmitting(true);
    try {
      await stockIn({
        stkNumber: stkData.stkNumber,
        rack: scannedLocation.rack,
        shelf: scannedLocation.shelf,
        bin: scannedLocation.bin,
        evidencePhoto: photo ?? undefined,
      });
      showSuccess(
        `STK ${stkData.stkNumber} berhasil di-stock in`,
        'Stock In Berhasil',
      );
      handleReset();
    } catch (error: any) {
      const msg = getErrorMessage(error, 'Gagal stock in. Coba lagi.');
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Reset Form ────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep('scan-stk');
    setStkData(null);
    setScannedLocation(null);
    setPhoto(null);
    setIsLoadingStk(false);
    setIsCheckingRack(false);
    setIsSubmitting(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    handleReset();
    setTimeout(() => setRefreshing(false), 300);
  }, []);

  const handleBackHeader = () => {
    if (step === 'scan-stk') {
      onExit();
    } else if (step === 'scan-rack') {
      setStep('scan-stk');
    } else if (step === 'confirm') {
      setStep('scan-rack');
    } else {
      handleReset();
    }
  };

  const headerSubtitle =
    step === 'scan-stk'
      ? 'Step 1: Scan STK Number'
      : step === 'scan-rack'
      ? 'Step 2: Scan Barcode Rack'
      : 'Step 3: Konfirmasi & Foto';

  const locationsList = getLocationsList(stkData);

  useKeyenceScanner({
    onScan: value => {
      if (
        scanBusyRef.current ||
        isLoadingStk ||
        isCheckingRack ||
        isSubmitting
      ) {
        return;
      }

      let scanTask: Promise<void> | null = null;
      if (step === 'scan-stk') {
        scanTask = handleScanStk(value);
      } else if (step === 'scan-rack') {
        scanTask = handleScanRack(value);
      }

      if (!scanTask) {
        return;
      }

      scanBusyRef.current = true;
      scanTask
        .finally(() => {
          scanBusyRef.current = false;
        })
        .catch(() => undefined);
    },
  });

  return {
    step,
    setStep,
    stkData,
    scannedLocation,
    photo,
    isLoadingStk,
    isCheckingRack,
    isSubmitting,
    refreshing,
    locationsList,
    headerSubtitle,
    handleBackHeader,
    handleTakePhoto,
    handleRemovePhoto,
    handleSubmit,
    handleReset,
    onRefresh,
  };
};
