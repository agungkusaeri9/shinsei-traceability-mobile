import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { CheckCircle2, Zap, Info } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { QaAssyStackParamList } from '../../../types';
import { colors } from '../../../theme';
import QaAssyHeader from '../components/QaAssyHeader';
import ScanZone from '../components/ScanZone';
import { submitQaFinish } from '../services/qaAssyService';
import { getErrorMessage } from '../../../utils/errorMessage';
import { fetchOrderByLotNumber } from '../../smt/services/smtService';
import type { SmtOrderData } from '../../smt/types';
import LotInfoCard from '../components/LotInfoCard';
import { showSuccess, showError } from '../../../services/toastService';
import { extractStkNumber } from '../../../utils/barcode';

type Props = {
  navigation: NativeStackNavigationProp<QaAssyStackParamList, 'QaFinish'>;
};

const QaFinishScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);
  const inputValueRef = useRef('');
  const [scanBuffer, setScanBuffer] = useState('');
  const [scannedLot, setScannedLot] = useState('');
  const [lotInfo, setLotInfo] = useState<SmtOrderData | null>(null);
  const [isCheckingLot, setIsCheckingLot] = useState(false);
  const [scannedBox, setScannedBox] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<{
    lotRaw: string;
    boxRaw: string;
  } | null>(null);

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
    if (isCheckingLot || isSubmitting) return;

    if (!scannedLot) {
      // Tahap 1: verifikasi lot number ke /orders/lot/{lot_number} dulu
      const cleanLot = extractStkNumber(raw);
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
      return;
    }

    // Tahap 2: lot sudah terverifikasi → scan box, langsung POST
    setScannedBox(raw);
    showSuccess(
      'Box berhasil di-scan. Mengirim otomatis...',
      'Mengirim Otomatis',
    );
    triggerAutoSubmit(scannedLot, raw);
  };

  const triggerAutoSubmit = async (
    lot: string,
    boxRaw: string,
  ) => {
    setIsSubmitting(true);
    try {
      const res = await submitQaFinish({ lotNumber: lot, boxName: boxRaw });
      showSuccess(res.message, 'Finish Berhasil');
      setLastSubmitted({ lotRaw: lot, boxRaw });
      // Reset otomatis hanya saat sukses
      handleReset();
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal mengirim data Finish'));
      // Jangan reset lot & box — biarkan user scan ulang box atau reset manual
      focusScanner();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    inputValueRef.current = '';
    setScannedLot('');
    setLotInfo(null);
    setScannedBox('');
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
        title="Finish"
        subtitle="Scan Lot & Box"
        icon={<Zap color={colors.success} size={20} />}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoRow}>
          <Info color={colors.indigo} size={15} />
          <Text style={styles.infoText}>
            Scan Lot untuk verifikasi, lalu scan Box.{'\n'}Pengiriman dilakukan
            secara otomatis.
          </Text>
        </View>

        {/* Lot */}
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

        {/* Box */}
        {scannedLot ? (
          <View style={styles.boxWrap}>
            <ScanZone
              label="Box"
              scannedValue={scannedBox}
              onPress={focusScanner}
              accentColor={colors.success}
              placeholder="Arahkan scanner ke barcode box"
            />
          </View>
        ) : null}

        {/* Auto-submit loading */}
        {isSubmitting && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.success} size="small" />
            <Text style={styles.loadingText}>Mengirim data...</Text>
          </View>
        )}

        {/* Last submitted */}
        {lastSubmitted && !isSubmitting && (
          <View style={styles.lastCard}>
            <CheckCircle2 color={colors.success} size={18} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lastLabel}>Terakhir Dikirim</Text>
              <Text style={styles.lastValue}>
                {lastSubmitted.lotRaw} / {lastSubmitted.boxRaw}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
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
  boxWrap: { marginTop: 12 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, padding: 14, backgroundColor: `${colors.success}10`, borderRadius: 12 },
  loadingText: { fontSize: 14, fontWeight: '600', color: colors.success },
  lastCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, padding: 14, backgroundColor: `${colors.success}10`, borderRadius: 12, borderWidth: 1, borderColor: `${colors.success}30` },
  lastLabel: { fontSize: 11, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },
  lastValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
});

export default QaFinishScreen;