import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { ClipboardCheck, QrCode } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { QaAssyStackParamList } from '../../../types';
import { colors } from '../../../theme';
import QaAssyHeader from '../components/QaAssyHeader';
import ScanZone from '../components/ScanZone';
import Button from '../../../components/Button';
import { submitQaRegister } from '../services/qaAssyService';
import { showSuccess, showError } from '../../../services/toastService';
import { extractStkNumber } from '../../../utils/barcode';

type Props = {
  navigation: NativeStackNavigationProp<QaAssyStackParamList, 'QaRegister'>;
};

const QaRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);
  const [scanBuffer, setScanBuffer] = useState('');
  const [scannedLot, setScannedLot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const focusScanner = useCallback(() => {
    requestAnimationFrame(() => barcodeRef.current?.focus());
  }, []);

  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => focusScanner(), 200);
      return () => clearTimeout(t);
    }, [focusScanner]),
  );

  const handleScanSubmit = () => {
    const raw = scanBuffer.trim();
    setScanBuffer('');
    if (!raw) return;
    const cleanLot = extractStkNumber(raw);
    setScannedLot(cleanLot);
    showSuccess('Lot berhasil di-scan: ' + cleanLot, 'Scan Berhasil');
    focusScanner();
  };

  const handleSubmit = async () => {
    if (!scannedLot) {
      showError('Silakan scan Lot Barcode terlebih dahulu');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitQaRegister({ lotNumber: scannedLot, stks: [] });
      showSuccess(res.message, 'Registrasi Berhasil');
      handleReset();
    } catch (error: any) {
      showError(error?.message || 'Gagal melakukan registrasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setScannedLot('');
    setScanBuffer('');
    focusScanner();
  };

  return (
    <View style={styles.container} onTouchStart={focusScanner}>
      <TextInput
        ref={barcodeRef}
        style={styles.hiddenInput}
        value={scanBuffer}
        onChangeText={setScanBuffer}
        onSubmitEditing={handleScanSubmit}
        autoFocus
        showSoftInputOnFocus={false}
        blurOnSubmit={false}
        caretHidden
      />

      <QaAssyHeader
        title="QA Register"
        subtitle="Scan & Daftarkan Lot"
        icon={<ClipboardCheck color={colors.indigo} size={20} />}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoRow}>
          <QrCode color={colors.indigo} size={15} />
          <Text style={styles.infoText}>
            Arahkan scanner ke barcode Lot, lalu tekan Register.
          </Text>
        </View>

        <ScanZone
          label="Lot Number"
          scannedValue={scannedLot}
          onReset={handleReset}
          onPress={focusScanner}
          placeholder="Arahkan scanner ke barcode lot"
        />

        {scannedLot ? (
          <Button
            title="Register"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitBtn}
          />
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  hiddenInput: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    width: 1,
    height: 1,
    opacity: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  infoText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  submitBtn: {
    marginTop: 16,
    width: '100%',
    backgroundColor: colors.indigo,
  },
});

export default QaRegisterScreen;