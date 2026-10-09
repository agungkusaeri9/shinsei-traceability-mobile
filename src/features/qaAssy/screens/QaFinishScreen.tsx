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
import { showSuccess, showError } from '../../../services/toastService';
import { extractStkNumber } from '../../../utils/barcode';

type Props = {
  navigation: NativeStackNavigationProp<QaAssyStackParamList, 'QaFinish'>;
};

const QaFinishScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);
  const [scanBuffer, setScanBuffer] = useState('');
  const [scannedLot, setScannedLot] = useState('');
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

  const handleScanSubmit = () => {
    const raw = scanBuffer.trim();
    setScanBuffer('');
    if (!raw) return;

    if (!scannedLot) {
      const cleanLot = extractStkNumber(raw);
      setScannedLot(cleanLot);
      showSuccess('Lot berhasil di-scan: ' + cleanLot, 'Lot Terscan');
      focusScanner();
    } else {
      const parsed = parseInt(raw.replace(/\D/g, ''), 10) || Number(raw) || 0;
      setScannedBox(raw);
      showSuccess('Box berhasil di-scan. Mengirim otomatis...', 'Mengirim Otomatis');
      triggerAutoSubmit(scannedLot, raw);
    }
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
    } catch (error: any) {
      showError(error?.message || 'Gagal mengirim data Finish');
    } finally {
      setIsSubmitting(false);
      handleReset();
    }
  };

  const handleReset = () => {
    setScannedLot('');
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
        onChangeText={setScanBuffer}
        onSubmitEditing={handleScanSubmit}
        autoFocus
        showSoftInputOnFocus={false}
        blurOnSubmit={false}
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
            Arahkan scanner ke Lot, lalu ke Box.{'\n'}Pengiriman dilakukan secara otomatis.
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
  hiddenInput: { position: 'absolute', top: -1000, left: -1000, width: 1, height: 1, opacity: 0 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  infoText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  boxWrap: { marginTop: 12 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, padding: 14, backgroundColor: `${colors.success}10`, borderRadius: 12 },
  loadingText: { fontSize: 14, fontWeight: '600', color: colors.success },
  lastCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, padding: 14, backgroundColor: `${colors.success}10`, borderRadius: 12, borderWidth: 1, borderColor: `${colors.success}30` },
  lastLabel: { fontSize: 11, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },
  lastValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
});

export default QaFinishScreen;