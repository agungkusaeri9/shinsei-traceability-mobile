import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  PackagePlus,
  Trash2,
  CheckCircle2,
  ScanBarcode,
  X,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { QaAssyStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import QaAssyHeader from '../components/QaAssyHeader';
import ScanZone from '../components/ScanZone';
import Button from '../../../components/Button';
import { submitQaAddPart } from '../services/qaAssyService';
import { fetchOrderByLotNumber } from '../../smt/services/smtService';
import { showSuccess, showError } from '../../../services/toastService';
import { extractStkNumber } from '../../../utils/barcode';
import { getErrorMessage } from '../../../utils/errorMessage';

type Props = {
  navigation: NativeStackNavigationProp<QaAssyStackParamList, 'QaAddPart'>;
};

const QaAddPartScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);
  const inputValueRef = useRef('');
  const [scanBuffer, setScanBuffer] = useState('');
  const [scannedLot, setScannedLot] = useState('');
  const [stkList, setStkList] = useState<string[]>([]);
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

    if (!scannedLot) {
      if (isCheckingLot) return;
      const cleanLot = extractStkNumber(raw);

      // Cek dulu keberadaan lot number ke /orders/lot/{lot_number}
      setIsCheckingLot(true);
      try {
        const res = await fetchOrderByLotNumber(cleanLot);
        if (res.status && res.data) {
          setScannedLot(cleanLot);
          showSuccess('Lot ditemukan: ' + cleanLot, 'Lot Terverifikasi');
        } else {
          showError(res.message || 'Lot number tidak ditemukan');
        }
      } catch (error) {
        showError(getErrorMessage(error, 'Lot number tidak ditemukan'));
      } finally {
        setIsCheckingLot(false);
        focusScanner();
      }
      return;
    }

    const cleanStk = extractStkNumber(raw);
    if (stkList.includes(cleanStk)) {
      showError('Part STK sudah pernah di-scan: ' + cleanStk);
    } else {
      setStkList(prev => [...prev, cleanStk]);
      showSuccess('Part STK ditambahkan: ' + cleanStk, 'STK Terscan');
    }
    focusScanner();
  };

  const handleRemoveStk = (index: number) => {
    setStkList(prev => prev.filter((_, i) => i !== index));
    focusScanner();
  };

  const handleSubmit = async () => {
    if (!scannedLot) {
      showError('Silakan scan Lot Number terlebih dahulu');
      return;
    }
    if (stkList.length === 0) {
      showError('Minimal scan 1 Part STK sebelum mengirim');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitQaAddPart({
        lotNumber: scannedLot,
        stks: stkList,
      });
      showSuccess(res.message, 'Part Berhasil Ditambahkan');
      handleReset();
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal menambahkan Part'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    inputValueRef.current = '';
    setScannedLot('');
    setStkList([]);
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
        title="Add Part"
        subtitle="Scan Lot & Part STK"
        icon={<PackagePlus color={colors.orange} size={20} />}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Step 1: Lot Number ── */}
        <Text style={styles.stepLabel}>Step 1 — Lot Number</Text>
        <ScanZone
          label="Lot Number"
          scannedValue={scannedLot}
          onReset={handleReset}
          onPress={focusScanner}
          accentColor={colors.orange}
          placeholder="Arahkan scanner ke barcode lot"
        />

        {isCheckingLot ? (
          <View style={styles.checkingRow}>
            <Text style={styles.checkingText}>Mengecek lot number...</Text>
          </View>
        ) : null}

        {/* ── Step 2: STK Parts ── */}
        {scannedLot ? (
          <View style={styles.stkSection}>
            <View style={styles.stkHeader}>
              <Text style={styles.stepLabel}>Step 2 — Part STK</Text>
              {stkList.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{stkList.length} item</Text>
                </View>
              )}
            </View>

            {/* Scan prompt card */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={focusScanner}
              style={styles.scanPromptCard}
            >
              <ScanBarcode color={colors.orange} size={20} />
              <Text style={styles.scanPromptText}>
                {stkList.length === 0
                  ? 'Scan barcode part STK'
                  : 'Scan STK berikutnya...'}
              </Text>
            </TouchableOpacity>

            {/* STK Chips list */}
            {stkList.length > 0 && (
              <View style={styles.stkListCard}>
                <View style={styles.stkListHeader}>
                  <Text style={styles.stkListTitle}>STK Terscan</Text>
                  <TouchableOpacity
                    onPress={() => { setStkList([]); focusScanner(); }}
                    style={styles.clearBtn}
                  >
                    <Trash2 color={colors.danger} size={13} />
                    <Text style={styles.clearText}>Hapus Semua</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.chipsWrap}>
                  {stkList.map((stk, i) => (
                    <View key={stk + '-' + i} style={styles.chip}>
                      <CheckCircle2 color={colors.success} size={13} />
                      <Text style={styles.chipText}>{stk}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveStk(i)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <X color={colors.textMuted} size={13} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Button
              title={stkList.length === 0 ? 'Tambahkan Part' : `Kirim ${stkList.length} Part`}
              onPress={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting || stkList.length === 0}
              style={styles.submitBtn}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40, gap: 4 },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },

  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 16,
  },

  // Lot checking indicator
  checkingRow: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: `${colors.orange}12`,
    borderWidth: 1,
    borderColor: `${colors.orange}30`,
  },
  checkingText: { fontSize: 13, fontWeight: '600', color: colors.orange },

  // STK section
  stkSection: { gap: 0 },
  stkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: colors.orange,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // Scan prompt
  scanPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${colors.orange}10`,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: `${colors.orange}50`,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  scanPromptText: { fontSize: 13, fontWeight: '600', color: colors.orange },

  // STK list card
  stkListCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    ...shadows.sm,
  },
  stkListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stkListTitle: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearText: { fontSize: 12, fontWeight: '600', color: colors.danger },

  // Chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${colors.success}12`,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },

  submitBtn: { marginTop: 16, width: '100%', backgroundColor: colors.orange },
});

export default QaAddPartScreen;