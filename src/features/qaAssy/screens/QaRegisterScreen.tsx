import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { ClipboardCheck, QrCode } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { QaAssyStackParamList } from '../../../types';
import { colors } from '../../../theme';
import QaAssyHeader from '../components/QaAssyHeader';
import ScanZone from '../components/ScanZone';
import LotInfoCard from '../components/LotInfoCard';
import Button from '../../../components/Button';
import {
  submitQaRegister,
} from '../services/qaAssyService';
import { fetchOrderByLotNumber } from '../../smt/services/smtService';
import type { SmtOrderData } from '../../smt/types';
import { showSuccess, showError } from '../../../services/toastService';
import { getErrorMessage } from '../../../utils/errorMessage';
import { extractStkNumber } from '../../../utils/barcode';

type Props = {
  navigation: NativeStackNavigationProp<QaAssyStackParamList, 'QaRegister'>;
};

const QaRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);
  const inputValueRef = useRef('');
  const [scanBuffer, setScanBuffer] = useState('');
  const [scannedLot, setScannedLot] = useState('');
  const [lotInfo, setLotInfo] = useState<SmtOrderData | null>(null);
  const [isCheckingLot, setIsCheckingLot] = useState(false);
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

  const handleScanSubmit = async (rawValue: string) => {
    const raw = rawValue.trim();
    if (!raw) return;
    if (isCheckingLot) return;
    const cleanLot = extractStkNumber(raw);

    // Cek dulu keberadaan lot number ke /orders/lot/{lot_number}
    setIsCheckingLot(true);
    try {
      const res = await fetchOrderByLotNumber(cleanLot);
      if (res.status && res.data) {
        setScannedLot(cleanLot);
        setLotInfo(res.data);
        showSuccess('Lot ditemukan: ' + cleanLot, 'Lot Terverifikasi');
      } else {
        showError(res.message || 'Lot number tidak ditemukan');
      }
    } catch (error: any) {
      showError(getErrorMessage(error, 'Lot number tidak ditemukan'));
    } finally {
      setIsCheckingLot(false);
      focusScanner();
    }
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
      showError(getErrorMessage(error, 'Gagal melakukan registrasi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    inputValueRef.current = '';
    setScannedLot('');
    setLotInfo(null);
    setScanBuffer('');
    focusScanner();
  };

  return (
    <View style={styles.container} onTouchStart={focusScanner}>
      <TextInput
        ref={barcodeRef}
        style={styles.hiddenInput}
        value={scanBuffer}
        onChangeText={(text) => {
          inputValueRef.current = text;
          setScanBuffer(text);
        }}
        onSubmitEditing={() => {
          const val = inputValueRef.current;
          inputValueRef.current = '';
          setScanBuffer('');
          handleScanSubmit(val);
        }}
        autoFocus
        showSoftInputOnFocus={false}
        blurOnSubmit={false}
        returnKeyType="done"
        onBlur={() => setTimeout(focusScanner, 100)}
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

        {isCheckingLot ? (
          <View style={styles.checkingRow}>
            <Text style={styles.checkingText}>Mengecek lot number...</Text>
          </View>
        ) : null}

        {scannedLot && lotInfo ? <LotInfoCard lotInfo={lotInfo} /> : null}

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
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  infoText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  checkingRow: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: `${colors.indigo}12`,
    borderWidth: 1,
    borderColor: `${colors.indigo}30`,
  },
  checkingText: { fontSize: 13, fontWeight: '600', color: colors.indigo },
  submitBtn: {
    marginTop: 16,
    width: '100%',
    backgroundColor: colors.indigo,
  },
});

export default QaRegisterScreen;