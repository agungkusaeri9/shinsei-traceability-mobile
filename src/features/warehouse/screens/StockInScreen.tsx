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
import { ArrowDownToLine, ScanBarcode, Camera, X } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { launchCamera, CameraOptions } from 'react-native-image-picker';

import { WarehouseStackParamList } from '../../../types';
import { colors } from '../../../theme';
import Button from '../../../components/Button';
import { showSuccess, showError } from '../../../services/toastService';
import type { RegisteredPart } from '../types';
import WarehouseHeader from '../components/WarehouseHeader';
import InfoBanner from '../components/InfoBanner';
import RegisteredPartSummary from '../components/RegisteredPartSummary';
import ScanResultCard, { ScanPlaceholder } from '../components/ScanResultCard';
import { stockIn } from '../services/warehouseService';

type Props = {
  navigation: NativeStackNavigationProp<WarehouseStackParamList, 'StockIn'>;
  route: RouteProp<WarehouseStackParamList, 'StockIn'>;
};

type PhotoAsset = {
  uri: string;
  type: string;
  name: string;
};

const StockInScreen: React.FC<Props> = ({ navigation, route }) => {
  const barcodeRef = useRef<TextInput>(null);
  const registeredData = route.params?.registeredData;
  const [stkNumber, setStkNumber] = useState('');
  const [scannedStk, setScannedStk] = useState('');
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const focusScanner = useCallback(() => {
    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }, []);

  const handleScan = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      setScannedStk(trimmed);
      setStkNumber('');
    }
    focusScanner();
  };

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

  const handleSubmit = async () => {
    if (!scannedStk) {
      showError('Silakan scan STK Number terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      await stockIn({
        stkNumber: scannedStk,
        evidencePhoto: photo ?? undefined,
      });
      showSuccess(
        `STK ${scannedStk} berhasil di-stock in`,
        'Stock In Berhasil',
      );
      // Reset form for next stock-in
      setScannedStk('');
      setStkNumber('');
      setPhoto(null);
      focusScanner();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || 'Gagal stock in. Coba lagi.';
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <WarehouseHeader
        title="Stock In"
        subtitle="Scan STK Number & Foto Evidence"
        icon={<ArrowDownToLine color={colors.success} size={18} />}
        iconBgColor={`${colors.success}25`}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {registeredData && <RegisteredPartSummary data={registeredData} />}

          <InfoBanner
            icon={<ScanBarcode color={colors.success} size={20} />}
            text="Scan barcode STK Number, foto evidence opsional"
            bgColor={`${colors.success}12`}
          />

          <TextInput
            ref={barcodeRef}
            value={stkNumber}
            onChangeText={setStkNumber}
            autoFocus
            showSoftInputOnFocus={false}
            blurOnSubmit={false}
            returnKeyType="done"
            onSubmitEditing={() => handleScan(stkNumber)}
            onBlur={() => setTimeout(focusScanner, 100)}
            style={styles.hiddenInput}
          />

          {scannedStk ? (
            <ScanResultCard scannedValue={scannedStk} />
          ) : (
            <ScanPlaceholder />
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
              onPress={() => navigation.goBack()}
              style={styles.halfBtn}
            />
            <Button
              title="Submit"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              disabled={!scannedStk || isSubmitting}
              style={styles.halfBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  halfBtn: { flex: 1, paddingVertical: 12 },
  fullBtn: { flex: 1, paddingVertical: 12 },
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
});

export default StockInScreen;
