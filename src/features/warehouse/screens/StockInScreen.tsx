import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  ArrowDownToLine,
  ScanBarcode,
  MapPin,
  CheckCircle2,
  Package,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { launchCamera, CameraOptions } from 'react-native-image-picker';

import { WarehouseStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import Button from '../../../components/Button';
import { showSuccess, showError } from '../../../services/toastService';
import type { StkData, StkLocation } from '../types';
import WarehouseHeader from '../components/WarehouseHeader';
import InfoBanner from '../components/InfoBanner';
import {
  fetchStkData,
  checkStkLocation,
  stockIn,
} from '../services/warehouseService';

type Props = {
  navigation: NativeStackNavigationProp<WarehouseStackParamList, 'StockIn'>;
};

type PhotoAsset = {
  uri: string;
  type: string;
  name: string;
};

type Step = 'scan-stk' | 'scan-rack' | 'confirm' | 'done';

const StockInScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);
  const [step, setStep] = useState<Step>('scan-stk');
  const [stkInput, setStkInput] = useState('');
  const [rackInput, setRackInput] = useState('');
  const [stkData, setStkData] = useState<StkData | null>(null);
  const [scannedLocation, setScannedLocation] = useState<{
    rack: string;
    shelf: string;
    bin: string;
  } | null>(null);
  const [isLoadingStk, setIsLoadingStk] = useState(false);
  const [isCheckingRack, setIsCheckingRack] = useState(false);
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const focusScanner = useCallback(() => {
    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => focusScanner(), 200);
      return () => clearTimeout(timer);
    }, [step, focusScanner]),
  );

  // ─── Helper: Get Locations List ──────────────────────────────────────────
  const getLocationsList = (stk: StkData | null): StkLocation[] => {
    if (!stk?.part) {
      return [];
    }
    if (stk.part.locations && stk.part.locations.length > 0) {
      return stk.part.locations;
    }
    if (stk.part.location) {
      return [stk.part.location];
    }
    return [];
  };

  // ─── Helper: Parse Rack Barcode (Format: rack-shelf-bin) ─────────────────
  const parseRackBarcode = (input: string) => {
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
      const rack = parts.slice(0, parts.length - 2).join(separator).trim();
      if (rack && shelf && bin) {
        return { rack, shelf, bin };
      }
    }
    return null;
  };

  // ─── Step 1: Scan STK & Fetch Data ──────────────────────────────────────
  const handleScanStk = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      focusScanner();
      return;
    }

    setIsLoadingStk(true);
    try {
      const response = await fetchStkData(trimmed);
      if (response.status && response.data) {
        setStkData(response.data);
        showSuccess(`STK ${trimmed} ditemukan. Silakan scan Barcode Rack.`);
        setStkInput('');
        setStep('scan-rack');
      } else {
        showError(response.message || 'STK tidak ditemukan');
        setStkInput('');
        focusScanner();
      }
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Gagal mengambil data STK');
      setStkInput('');
      focusScanner();
    } finally {
      setIsLoadingStk(false);
    }
  };

  // ─── Step 2: Scan Rack Barcode & Check Location API ─────────────────────
  const handleScanRack = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      focusScanner();
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
      setRackInput('');
      focusScanner();
      return;
    }

    setIsCheckingRack(true);
    try {
      /*
      // Commented out API check as per requirement
      const response = await checkStkLocation({
        stk: stkData.stkNumber,
        rack: parsed.rack,
        shelf: parsed.shelf,
        bin: parsed.bin,
      });

      if (response.status) {
        setScannedLocation(parsed);
        showSuccess(response.message || 'Lokasi Rack sesuai!');
        setRackInput('');
        setStep('confirm');
      } else {
        showError(
          response.message ||
            'Lokasi Rack tidak sesuai. Silakan scan ulang Rack.',
        );
        setRackInput('');
        focusScanner();
      }
      */

      const validLocations = getLocationsList(stkData);

      const isMatch =
        validLocations.length === 0 ||
        validLocations.some(loc => {
          const rackMatch =
            !loc.rack ||
            loc.rack.trim().toLowerCase() === parsed.rack.trim().toLowerCase();
          const shelfMatch =
            !loc.shelf ||
            loc.shelf.trim().toLowerCase() === parsed.shelf.trim().toLowerCase();
          const binMatch =
            !loc.bin ||
            loc.bin.trim().toLowerCase() === parsed.bin.trim().toLowerCase();
          return rackMatch && shelfMatch && binMatch;
        });

      if (isMatch) {
        setScannedLocation(parsed);
        showSuccess('Lokasi Rack sesuai!');
        setRackInput('');
        setStep('confirm');
      } else {
        showError('Lokasi Rack tidak sesuai. Silakan scan ulang Rack.');
        setRackInput('');
        focusScanner();
      }
    } catch (error: any) {
      // const msg =
      //   error?.response?.data?.message || 'Gagal mengecek lokasi Rack';
      // showError(msg);
      showError('Gagal memvalidasi lokasi Rack');

      setRackInput('');
      focusScanner();
    } finally {
      setIsCheckingRack(false);
    }
  };

  // ─── Photo ───────────────────────────────────────────────────────────────
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

  // ─── Submit Stock In ──────────────────────────────────────────────────────
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
      setStep('done');
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || 'Gagal stock in. Coba lagi.';
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Reset Form ──────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep('scan-stk');
    setStkInput('');
    setRackInput('');
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

  // ─── Header subtitle ─────────────────────────────────────────────────────
  const headerSubtitle =
    step === 'scan-stk'
      ? 'Step 1: Scan STK Number'
      : step === 'scan-rack'
        ? 'Step 2: Scan Barcode Rack'
        : step === 'confirm'
          ? 'Step 3: Konfirmasi & Foto'
          : 'Selesai';

  const handleBackHeader = () => {
    if (step === 'scan-stk') {
      navigation.goBack();
    } else if (step === 'scan-rack') {
      setStep('scan-stk');
    } else if (step === 'confirm') {
      setStep('scan-rack');
    } else {
      handleReset();
    }
  };

  const locationsList = getLocationsList(stkData);

  return (
    <View style={styles.container}>
      <WarehouseHeader
        title="Stock In"
        subtitle={headerSubtitle}
        icon={<ArrowDownToLine color={colors.success} size={18} />}
        iconBgColor={`${colors.success}25`}
        onBack={handleBackHeader}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Hidden scanner input */}
        <TextInput
          ref={barcodeRef}
          value={step === 'scan-stk' ? stkInput : rackInput}
          onChangeText={
            step === 'scan-stk' ? setStkInput : setRackInput
          }
          autoFocus
          showSoftInputOnFocus={false}
          blurOnSubmit={false}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (step === 'scan-stk') {
              handleScanStk(stkInput);
            } else if (step === 'scan-rack') {
              handleScanRack(rackInput);
            }
          }}
          onBlur={() => setTimeout(focusScanner, 100)}
          style={styles.hiddenInput}
        />

        {/* ── Step 1: Scan STK ─────────────────────────────── */}
        {step === 'scan-stk' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.success]}
                tintColor={colors.success}
              />
            }
          >
            <InfoBanner
              icon={<ScanBarcode color={colors.success} size={20} />}
              text="Scan barcode STK Number untuk memulai proses stock in"
              bgColor={`${colors.success}12`}
            />

            {isLoadingStk && (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Mencari data STK...</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* ── Step 2: Scan Rack ────────────────────────────── */}
        {step === 'scan-rack' && stkData && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <InfoBanner
              icon={<ScanBarcode color={colors.primary} size={20} />}
              text="Scan barcode Rack (Format: Rack-Shelf-Bin)"
              bgColor={`${colors.primary}12`}
            />

            {isCheckingRack && (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>
                  Mengecek keesuaian lokasi Rack...
                </Text>
              </View>
            )}

            {/* STK Info Card */}
            <View style={styles.detailCard}>
              <Text style={styles.cardHeaderTitle}>Informasi STK</Text>
              <DetailRow label="STK Number" value={stkData.stkNumber} />
              <DetailRow label="Status" value={stkData.status} />
              <DetailRow label="Quantity" value={String(stkData.quantity)} />
              {stkData.lotNumber && (
                <DetailRow label="Lot Number" value={stkData.lotNumber} />
              )}
              {stkData.part && (
                <>
                  <DetailRow
                    label="Part Number"
                    value={stkData.part.partNumber}
                  />
                  <DetailRow label="Part Name" value={stkData.part.partName} />
                  <DetailRow
                    label="Inventory Code"
                    value={stkData.part.inventoryCode}
                  />
                </>
              )}
            </View>

            {/* Target Locations List Card */}
            {locationsList.length > 0 && (
              <View style={styles.locationsSection}>
                <Text style={styles.sectionHeaderTitle}>
                  Target Lokasi Penyimpanan ({locationsList.length})
                </Text>
                {locationsList.map((loc, idx) => (
                  <View key={loc.id ?? idx} style={styles.locationCard}>
                    <View style={styles.locationHeader}>
                      <MapPin color={colors.primary} size={18} />
                      <Text style={styles.locationTitle}>
                        Lokasi {locationsList.length > 1 ? `#${idx + 1}` : ''}
                      </Text>
                    </View>
                    <View style={styles.locationGrid}>
                      <View style={styles.locationItem}>
                        <Text style={styles.locationLabel}>Rack</Text>
                        <Text style={styles.locationValue}>{loc.rack}</Text>
                      </View>
                      <View style={styles.locationItem}>
                        <Text style={styles.locationLabel}>Shelf</Text>
                        <Text style={styles.locationValue}>{loc.shelf}</Text>
                      </View>
                      <View style={styles.locationItem}>
                        <Text style={styles.locationLabel}>Bin</Text>
                        <Text style={styles.locationValue}>{loc.bin}</Text>
                      </View>
                    </View>
                    {(loc.position || loc.description) && (
                      <Text style={styles.locationDesc}>
                        {[loc.position, loc.description]
                          .filter(Boolean)
                          .join(' • ')}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            <Button
              title="Batal / Scan STK Lain"
              variant="outline"
              onPress={handleReset}
              style={{ marginTop: 12 }}
            />
          </ScrollView>
        )}

        {/* ── Step 3: Confirm & Photo ──────────────────────── */}
        {step === 'confirm' && stkData && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* STK Info Card */}
            <View style={styles.detailCard}>
              <Text style={styles.cardHeaderTitle}>Informasi STK</Text>
              <DetailRow label="STK Number" value={stkData.stkNumber} />
              <DetailRow label="Status" value={stkData.status} />
              <DetailRow label="Quantity" value={String(stkData.quantity)} />
              {stkData.lotNumber && (
                <DetailRow label="Lot Number" value={stkData.lotNumber} />
              )}
              {stkData.part && (
                <>
                  <DetailRow
                    label="Part Number"
                    value={stkData.part.partNumber}
                  />
                  <DetailRow label="Part Name" value={stkData.part.partName} />
                  <DetailRow
                    label="Inventory Code"
                    value={stkData.part.inventoryCode}
                  />
                </>
              )}
            </View>

            {/* Verified Scanned Location Card */}
            {scannedLocation && (
              <View style={[styles.locationCard, styles.verifiedCard]}>
                <View style={styles.locationHeader}>
                  <CheckCircle2 color={colors.success} size={18} />
                  <Text style={[styles.locationTitle, { color: colors.success }]}>
                    Lokasi Terverifikasi (Match)
                  </Text>
                </View>
                <View style={styles.locationGrid}>
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>Rack</Text>
                    <Text style={styles.locationValue}>
                      {scannedLocation.rack}
                    </Text>
                  </View>
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>Shelf</Text>
                    <Text style={styles.locationValue}>
                      {scannedLocation.shelf}
                    </Text>
                  </View>
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>Bin</Text>
                    <Text style={styles.locationValue}>
                      {scannedLocation.bin}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Evidence Photo Section */}
            <View style={styles.photoSection}>
              <Text style={styles.photoLabel}>Evidence Photo (Opsional)</Text>
              {photo ? (
                <View style={styles.photoPreviewContainer}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoPreview}
                  />
                  <Button
                    title="Hapus Foto"
                    variant="danger"
                    onPress={handleRemovePhoto}
                    style={styles.removePhotoBtn}
                  />
                </View>
              ) : (
                <Button
                  title="Ambil Foto"
                  onPress={handleTakePhoto}
                  style={styles.takePhotoBtn}
                />
              )}
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="Scan Rack Lagi"
                variant="outline"
                onPress={() => setStep('scan-rack')}
                style={styles.halfBtn}
              />
              <Button
                title="Submit"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                style={styles.halfBtn}
              />
            </View>
          </ScrollView>
        )}

        {/* ── Step 4: Done ─────────────────────────────────── */}
        {step === 'done' && stkData && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.doneScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.doneContainer}>
              <View style={styles.doneIconBadge}>
                <CheckCircle2 color={colors.success} size={64} />
              </View>
              <Text style={styles.doneTitle}>Stock In Selesai!</Text>
              <Text style={styles.doneSubtitle}>
                {stkData.stkNumber} berhasil masuk gudang
              </Text>

              <View style={styles.doneSummary}>
                <DetailRow label="STK Number" value={stkData.stkNumber} />
                <DetailRow
                  label="Part"
                  value={stkData.part?.partNumber ?? 'N/A'}
                />
                <DetailRow label="Quantity" value={String(stkData.quantity)} />
                {scannedLocation && (
                  <DetailRow
                    label="Verified Rack"
                    value={`${scannedLocation.rack} / ${scannedLocation.shelf} / ${scannedLocation.bin}`}
                  />
                )}
              </View>

              <Button
                title="Scan STK Lain"
                onPress={handleReset}
                style={styles.doneBtn}
              />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // Loading
  loadingField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // Detail Card
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textMuted}15`,
    paddingBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: { fontSize: 13, color: colors.textSecondary },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },

  // Locations Section
  locationsSection: {
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  locationCard: {
    backgroundColor: `${colors.primary}08`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  verifiedCard: {
    backgroundColor: `${colors.success}08`,
    borderColor: `${colors.success}30`,
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  locationGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  locationItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    ...shadows.sm,
  },
  locationLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  locationDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },

  // Photo Section
  photoSection: {
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.textMuted}20`,
  },
  photoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  photoPreviewContainer: {
    alignItems: 'center',
    gap: 12,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: `${colors.textMuted}10`,
    resizeMode: 'cover',
  },
  removePhotoBtn: {
    alignSelf: 'stretch',
    paddingVertical: 10,
  },
  takePhotoBtn: {
    paddingVertical: 14,
  },

  // Buttons
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  halfBtn: { flex: 1, paddingVertical: 12 },

  // Done
  doneScrollContent: { flexGrow: 1, justifyContent: 'center' },
  doneContainer: { alignItems: 'center', padding: 32, paddingBottom: 40 },
  doneIconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  doneTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  doneSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  doneSummary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    ...shadows.sm,
  },
  doneBtn: { width: '100%', paddingVertical: 12 },
});

export default StockInScreen;
