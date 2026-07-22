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
} from 'react-native';
import {
  ArrowDownToLine,
  ScanBarcode,
  MapPin,
  Package,
  CheckCircle2,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { launchCamera, CameraOptions } from 'react-native-image-picker';

import { WarehouseStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import Button from '../../../components/Button';
import { showSuccess, showError } from '../../../services/toastService';
import type { StkData } from '../types';
import WarehouseHeader from '../components/WarehouseHeader';
import InfoBanner from '../components/InfoBanner';
import { fetchStkData, stockIn } from '../services/warehouseService';

type Props = {
  navigation: NativeStackNavigationProp<WarehouseStackParamList, 'StockIn'>;
};

type PhotoAsset = {
  uri: string;
  type: string;
  name: string;
};

type Step = 'scan' | 'confirm' | 'done';

const StockInScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);
  const [step, setStep] = useState<Step>('scan');
  const [stkInput, setStkInput] = useState('');
  const [stkData, setStkData] = useState<StkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // ─── Step 1: Scan STK & Fetch Data ────────────────────────────────────
  const handleScanStk = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      focusScanner();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchStkData(trimmed);
      if (response.status && response.data) {
        setStkData(response.data);
        showSuccess(`STK ${trimmed} ditemukan`);
        setStkInput('');
        setStep('confirm');
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
      setIsLoading(false);
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

  // ─── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!stkData) {
      showError('Data STK belum tersedia');
      return;
    }

    setIsSubmitting(true);
    try {
      await stockIn({
        stkNumber: stkData.stkNumber,
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

  // ─── Reset ─────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep('scan');
    setStkInput('');
    setStkData(null);
    setPhoto(null);
    setIsLoading(false);
    setIsSubmitting(false);
  };

  // ─── Header subtitle ───────────────────────────────────────────────────
  const headerSubtitle =
    step === 'scan'
      ? 'Scan STK Number'
      : step === 'confirm'
      ? 'Konfirmasi & Foto'
      : 'Selesai';

  return (
    <View style={styles.container}>
      <WarehouseHeader
        title="Stock In"
        subtitle={headerSubtitle}
        icon={<ArrowDownToLine color={colors.success} size={18} />}
        iconBgColor={`${colors.success}25`}
        onBack={() => (step === 'scan' ? navigation.goBack() : handleReset())}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Hidden scanner input */}
        <TextInput
          ref={barcodeRef}
          value={stkInput}
          onChangeText={setStkInput}
          autoFocus
          showSoftInputOnFocus={false}
          blurOnSubmit={false}
          returnKeyType="done"
          onSubmitEditing={() => handleScanStk(stkInput)}
          onBlur={() => setTimeout(focusScanner, 100)}
          style={styles.hiddenInput}
        />

        {/* ── Step 1: Scan STK ─────────────────────────────── */}
        {step === 'scan' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <InfoBanner
              icon={<ScanBarcode color={colors.success} size={20} />}
              text="Scan barcode STK Number untuk memulai proses stock in"
              bgColor={`${colors.success}12`}
            />

            {isLoading && (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Mencari data STK...</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* ── Step 2: Confirm & Photo ──────────────────────── */}
        {step === 'confirm' && stkData && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* STK Info Card */}
            <View style={styles.detailCard}>
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

            {/* Location Card */}
            {stkData.part?.location && (
              <View style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <MapPin color={colors.primary} size={20} />
                  <Text style={styles.locationTitle}>Lokasi Penyimpanan</Text>
                </View>
                <View style={styles.locationGrid}>
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>Rack</Text>
                    <Text style={styles.locationValue}>
                      {stkData.part.location.rack}
                    </Text>
                  </View>
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>Shelf</Text>
                    <Text style={styles.locationValue}>
                      {stkData.part.location.shelf}
                    </Text>
                  </View>
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>Bin</Text>
                    <Text style={styles.locationValue}>
                      {stkData.part.location.bin}
                    </Text>
                  </View>
                </View>
                <Text style={styles.locationDesc}>
                  {stkData.part.location.description}
                </Text>
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
                title="Batal"
                variant="outline"
                onPress={handleReset}
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

        {/* ── Step 3: Done ─────────────────────────────────── */}
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
                {stkData.part?.location && (
                  <DetailRow
                    label="Rack"
                    value={`${stkData.part.location.rack} / ${stkData.part.location.shelf} / ${stkData.part.location.bin}`}
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
    paddingVertical: 16,
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

  // Location Card
  locationCard: {
    backgroundColor: `${colors.primary}08`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  locationGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  locationItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    ...shadows.sm,
  },
  locationLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  locationDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },

  // Photo Section
  photoSection: {
    marginTop: 16,
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
