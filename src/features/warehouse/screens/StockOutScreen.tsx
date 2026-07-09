import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import {
  ArrowUpFromLine,
  Factory,
  ScanBarcode,
  CheckCircle2,
  X,
} from 'lucide-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';

import { AppTabParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import Button from '../../../components/Button';
import {
  showSuccess,
  showError,
  showInfo,
} from '../../../services/toastService';
import type { WorkOrderDetail } from '../types';

// Components
import WarehouseHeader from '../components/WarehouseHeader';
import InfoBanner from '../components/InfoBanner';
import SearchableDropdown from '../components/SearchableDropdown';
import WorkOrderDetailCard from '../components/WorkOrderDetailCard';
import StkScanProgress from '../components/StkScanProgress';
import StkScanItem from '../components/StkScanItem';

// Dummy data
import { DUMMY_WORK_ORDERS, DUMMY_WO_DETAIL } from '../data/dummyWorkOrders';

type Props = {
  navigation: BottomTabNavigationProp<AppTabParamList, 'StockOut'>;
};

type Step = 'select_wo' | 'confirm_wo' | 'scanning' | 'finished';

const StockOutScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);

  const [step, setStep] = useState<Step>('select_wo');
  const [selectedWO, setSelectedWO] = useState('');
  const [woDetail, setWoDetail] = useState<WorkOrderDetail | null>(null);
  const [scannedStks, setScannedStks] = useState<Set<string>>(new Set());
  const [stkInput, setStkInput] = useState('');

  const focusScanner = useCallback(() => {
    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (step === 'scanning') {
        const timer = setTimeout(() => focusScanner(), 150);
        return () => clearTimeout(timer);
      }
    }, [step, focusScanner]),
  );

  const handleFetchWO = () => {
    if (!selectedWO) {
      showError('Pilih Work Order terlebih dahulu');
      return;
    }
    const detail = DUMMY_WO_DETAIL[selectedWO];
    if (detail) {
      setWoDetail(detail);
      setScannedStks(new Set());
      setStep('confirm_wo');
      showInfo(`Data ${selectedWO} berhasil dimuat`, 'Work Order Ditemukan');
    } else {
      showError('Work Order tidak ditemukan');
    }
  };

  const handleScanStk = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !woDetail) {
      focusScanner();
      return;
    }

    if (woDetail.stkNumbers.includes(trimmed)) {
      if (scannedStks.has(trimmed)) {
        showInfo(`${trimmed} sudah di-scan sebelumnya`);
      } else {
        const newScanned = new Set(scannedStks);
        newScanned.add(trimmed);
        setScannedStks(newScanned);
        showSuccess(`${trimmed} berhasil di-scan`);
      }
    } else {
      showError(`${trimmed} tidak terdaftar dalam Work Order ini`);
    }

    setStkInput('');
    focusScanner();
  };

  const handleFinish = () => {
    if (!woDetail) return;
    if (scannedStks.size < woDetail.stkNumbers.length) {
      showError(
        `Masih ada ${
          woDetail.stkNumbers.length - scannedStks.size
        } STK yang belum di-scan`,
      );
      return;
    }
    showSuccess(
      `Stock Out ${selectedWO} berhasil diproses`,
      'Stock Out Berhasil',
    );
    setStep('finished');
  };

  const handleReset = () => {
    setStep('select_wo');
    setSelectedWO('');
    setWoDetail(null);
    setScannedStks(new Set());
    setStkInput('');
  };

  const headerSubtitle =
    step === 'select_wo'
      ? 'Pilih Work Order'
      : step === 'confirm_wo'
      ? 'Konfirmasi Data'
      : step === 'scanning'
      ? 'Scan STK Number'
      : 'Selesai';

  return (
    <View style={styles.container}>
      <WarehouseHeader
        title="Stock Out"
        subtitle={headerSubtitle}
        icon={<ArrowUpFromLine color={colors.orange} size={18} />}
        iconBgColor={`${colors.orange}25`}
        onBack={() =>
          step === 'select_wo'
            ? navigation.navigate('Warehouse')
            : handleReset()
        }
        rightSlot={
          step !== 'select_wo' ? (
            <X color={colors.textInverse} size={24} />
          ) : undefined
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* ── Step 1: Select WO ──────────────────────────── */}
        {step === 'select_wo' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <InfoBanner
              icon={<Factory color={colors.orange} size={20} />}
              text="Pilih Work Order untuk memulai proses stock out"
              bgColor={`${colors.orange}12`}
            />

            <SearchableDropdown
              options={DUMMY_WORK_ORDERS}
              selectedValue={selectedWO}
              onSelect={setSelectedWO}
              onClear={() => setSelectedWO('')}
            />

            <View style={styles.buttonRow}>
              <Button
                title="Batal"
                variant="outline"
                onPress={() => navigation.navigate('Warehouse')}
                style={styles.halfBtn}
              />
              <Button
                title="Cari"
                onPress={handleFetchWO}
                disabled={!selectedWO}
                style={styles.halfBtn}
              />
            </View>
          </ScrollView>
        )}

        {/* ── Step 2: Confirm WO ─────────────────────────── */}
        {step === 'confirm_wo' && woDetail && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <InfoBanner
              icon={<Factory color={colors.orange} size={20} />}
              text="Pastikan data Work Order sudah benar sebelum memulai scan"
              bgColor={`${colors.orange}12`}
            />

            <WorkOrderDetailCard woId={selectedWO} detail={woDetail} />

            <View style={styles.buttonRow}>
              <Button
                title="Kembali"
                variant="outline"
                onPress={handleReset}
                style={styles.halfBtn}
              />
              <Button
                title="Proses"
                onPress={() => setStep('scanning')}
                style={styles.halfBtn}
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* ── Step 3: Scanning ───────────────────────────── */}
        {step === 'scanning' && woDetail && (
          <View style={{ flex: 1 }}>
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

            <StkScanProgress
              scanned={scannedStks.size}
              total={woDetail.stkNumbers.length}
            />

            <FlatList
              data={woDetail.stkNumbers}
              keyExtractor={item => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stkListContent}
              renderItem={({ item }) => (
                <StkScanItem
                  stkNumber={item}
                  isScanned={scannedStks.has(item)}
                  onPress={() => handleScanStk(item)}
                />
              )}
              ListHeaderComponent={
                <View style={styles.scanHint}>
                  <ScanBarcode color={colors.primary} size={18} />
                  <Text style={styles.scanHintText}>
                    Scan barcode STK atau tap item di bawah untuk simulasi scan
                  </Text>
                </View>
              }
            />

            <View style={styles.bottomBar}>
              <Button
                title="Batal"
                variant="outline"
                onPress={handleReset}
                style={styles.bottomBtn}
              />
              <Button
                title={`Finish (${scannedStks.size}/${woDetail.stkNumbers.length})`}
                onPress={handleFinish}
                style={styles.bottomBtn}
              />
            </View>
          </View>
        )}

        {/* ── Step 4: Finished ───────────────────────────── */}
        {step === 'finished' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.finishedScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.finishedContainer}>
              <View style={styles.finishedIconBadge}>
                <CheckCircle2 color={colors.success} size={64} />
              </View>
              <Text style={styles.finishedTitle}>Stock Out Selesai!</Text>
              <Text style={styles.finishedSubtitle}>
                Semua STK Number untuk {selectedWO} berhasil di-scan
              </Text>

              <View style={styles.finishedSummary}>
                <SummaryRow label="Work Order" value={selectedWO} />
                <SummaryRow
                  label="Total STK"
                  value={String(woDetail?.stkNumbers.length ?? 0)}
                />
              </View>

              <Button
                title="Kembali ke Warehouse"
                onPress={handleReset}
                style={styles.finishedBtn}
              />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  halfBtn: { flex: 1, paddingVertical: 12 },

  // Scan hint
  scanHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  scanHintText: { flex: 1, fontSize: 12, color: colors.textSecondary },

  // STK List
  stkListContent: { padding: 20, paddingBottom: 100 },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: `${colors.textMuted}15`,
    ...shadows.md,
  },
  bottomBtn: { flex: 1, paddingVertical: 12 },

  // Finished
  finishedScrollContent: { flexGrow: 1, justifyContent: 'center' },
  finishedContainer: { alignItems: 'center', padding: 32, paddingBottom: 40 },
  finishedIconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  finishedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  finishedSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  finishedSummary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: { fontSize: 13, color: colors.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  finishedBtn: { width: '100%', paddingVertical: 12 },
});

export default StockOutScreen;
