import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  ClipboardList,
  ScanBarcode,
  CheckCircle2,
  X,
  MapPin,
  Cpu,
  Package,
  Layers,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { SmtStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import Button from '../../../components/Button';
import {
  showSuccess,
  showError,
  showInfo,
} from '../../../services/toastService';
import type { SmtOrderData, SmtOrderDetail, SmtPartBatch } from '../types';
import { fetchOrderByLotNumber, submitSmt } from '../services/smtService';
import SmtHeader from '../components/SmtHeader';

type Props = {
  navigation: NativeStackNavigationProp<SmtStackParamList, 'PartRegister'>;
};

type Step =
  | 'scan_lot'
  | 'scan_line'
  | 'scan_machine'
  | 'scan_product'
  | 'scanning_parts'
  | 'finished';

const PartRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);
  const [step, setStep] = useState<Step>('scan_lot');
  const [scanInput, setScanInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data from API
  const [orderData, setOrderData] = useState<SmtOrderData | null>(null);
  const [matchedDetail, setMatchedDetail] = useState<SmtOrderDetail | null>(
    null,
  );
  const [productSelect, setProductSelect] = useState('');
  const [scannedPartBatchIds, setScannedPartBatchIds] = useState<Set<number>>(
    new Set(),
  );
  const [lastSubmittedOrderId, setLastSubmittedOrderId] = useState<
    number | null
  >(null);

  // Auto-focus scanner
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

  // ─── Step 1: Scan Lot Number ────────────────────────────────────────────
  const handleScanLotNumber = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      focusScanner();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchOrderByLotNumber(trimmed);
      if (response.status && response.data) {
        setOrderData(response.data);
        showSuccess(`Lot number ${trimmed} ditemukan`);
        setScanInput('');
        setStep('scan_line');
      } else {
        showError(response.message || 'Lot number tidak ditemukan');
        setScanInput('');
        focusScanner();
      }
    } catch (error: any) {
      showError(
        error?.response?.data?.message || 'Gagal mengambil data lot number',
      );
      setScanInput('');
      focusScanner();
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Scan Line ──────────────────────────────────────────────────
  const handleScanLine = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !orderData) {
      focusScanner();
      return;
    }

    // Find matching detail by line name or id
    const matched = orderData.details.find(
      d =>
        d.line.name.toLowerCase() === trimmed.toLowerCase() ||
        String(d.line.id) === trimmed,
    );

    if (matched) {
      setMatchedDetail(matched);
      showSuccess(`Line ${matched.line.name} cocok`);
      setScanInput('');
      setStep('scan_machine');
    } else {
      showError(`Line "${trimmed}" tidak cocok dengan data order`);
      setScanInput('');
      focusScanner();
    }
  };

  // ─── Step 3: Scan Machine ───────────────────────────────────────────────
  const handleScanMachine = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !matchedDetail) {
      focusScanner();
      return;
    }

    // Verify machine matches the matched detail
    const machineMatch =
      matchedDetail.machine.name.toLowerCase() === trimmed.toLowerCase() ||
      String(matchedDetail.machine.id) === trimmed;

    if (machineMatch) {
      showSuccess(`Machine ${matchedDetail.machine.name} cocok`);
      setScanInput('');
      setStep('scan_product');
    } else {
      showError(
        `Machine "${trimmed}" tidak cocok. Harus: ${matchedDetail.machine.name}`,
      );
      setScanInput('');
      focusScanner();
    }
  };

  // ─── Step 4: Scan Product Select ────────────────────────────────────────
  const handleScanProductSelect = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      focusScanner();
      return;
    }

    setProductSelect(trimmed);
    showSuccess(`Product Select: ${trimmed}`);
    setScannedPartBatchIds(new Set());
    setScanInput('');
    setStep('scanning_parts');
  };

  // ─── Step 5: Scan Part Batches (loop) ───────────────────────────────────
  const handleScanPartBatch = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !matchedDetail || !orderData) {
      focusScanner();
      return;
    }

    // Find matching partBatch by stkNumber
    const matchedBatch = matchedDetail.partBatches.find(
      pb => pb.stkNumber.toLowerCase() === trimmed.toLowerCase(),
    );

    if (!matchedBatch) {
      showError(`STK "${trimmed}" tidak ditemukan dalam part batches`);
      setScanInput('');
      focusScanner();
      return;
    }

    if (scannedPartBatchIds.has(matchedBatch.id)) {
      showInfo(`${trimmed} sudah di-scan sebelumnya`);
      setScanInput('');
      focusScanner();
      return;
    }

    // Submit to API
    setIsSubmitting(true);
    try {
      const response = await submitSmt({
        orderId: matchedDetail.orderId,
        partBatchId: matchedBatch.id,
        productSelect: productSelect,
      });

      const newScanned = new Set(scannedPartBatchIds);
      newScanned.add(matchedBatch.id);
      setScannedPartBatchIds(newScanned);
      setLastSubmittedOrderId(matchedDetail.orderId);

      showSuccess(`${trimmed} berhasil di-submit`);

      // Check if all part batches are scanned
      if (newScanned.size >= matchedDetail.partBatches.length) {
        showSuccess(
          'Semua part batch sudah ter-scan! Tekan Finish untuk menyelesaikan.',
        );
      }
    } catch (error: any) {
      showError(
        error?.response?.data?.message || `Gagal submit STK ${trimmed}`,
      );
    } finally {
      setIsSubmitting(false);
    }

    setScanInput('');
    focusScanner();
  };

  // ─── Finish ─────────────────────────────────────────────────────────────
  const handleFinish = () => {
    showSuccess('Part Register selesai!');
    setStep('finished');
  };

  // ─── Reset ──────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep('scan_lot');
    setScanInput('');
    setOrderData(null);
    setMatchedDetail(null);
    setProductSelect('');
    setScannedPartBatchIds(new Set());
    setLastSubmittedOrderId(null);
    setIsLoading(false);
    setIsSubmitting(false);
  };

  // ─── Submit handler based on step ───────────────────────────────────────
  const handleSubmitEditing = () => {
    switch (step) {
      case 'scan_lot':
        handleScanLotNumber(scanInput);
        break;
      case 'scan_line':
        handleScanLine(scanInput);
        break;
      case 'scan_machine':
        handleScanMachine(scanInput);
        break;
      case 'scan_product':
        handleScanProductSelect(scanInput);
        break;
      case 'scanning_parts':
        handleScanPartBatch(scanInput);
        break;
    }
  };

  // ─── Header subtitle ────────────────────────────────────────────────────
  const headerSubtitle =
    step === 'scan_lot'
      ? 'Scan Lot Number'
      : step === 'scan_line'
      ? 'Scan Line'
      : step === 'scan_machine'
      ? 'Scan Machine'
      : step === 'scan_product'
      ? 'Scan Product Select'
      : step === 'scanning_parts'
      ? 'Scan Part Batches'
      : 'Selesai';

  const partBatches = matchedDetail?.partBatches ?? [];

  return (
    <View style={styles.container}>
      <SmtHeader
        title="Part Register"
        subtitle={headerSubtitle}
        icon={<ClipboardList color={colors.primary} size={18} />}
        iconBgColor={`${colors.primary}25`}
        onBack={() =>
          step === 'scan_lot' ? navigation.navigate('SmtHome') : handleReset()
        }
        rightSlot={
          step !== 'scan_lot' ? (
            <X color={colors.textInverse} size={24} />
          ) : undefined
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Hidden scanner input - always present */}
        <TextInput
          ref={barcodeRef}
          value={scanInput}
          onChangeText={setScanInput}
          autoFocus
          showSoftInputOnFocus={false}
          blurOnSubmit={false}
          returnKeyType="done"
          onSubmitEditing={handleSubmitEditing}
          onBlur={() => setTimeout(focusScanner, 100)}
          style={styles.hiddenInput}
        />

        {/* ── Step 1: Scan Lot Number ──────────────────────── */}
        {step === 'scan_lot' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotActive]}>
                <Text style={styles.stepDotText}>1</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>2</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>3</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>4</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>5</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <ScanBarcode color={colors.primary} size={24} />
              <Text style={styles.infoText}>
                Scan atau ketik Lot Number untuk memulai proses Part Register
              </Text>
            </View>

            {isLoading && (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>
                  Mencari data lot number...
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* ── Step 2: Scan Line ─────────────────────────────── */}
        {step === 'scan_line' && orderData && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <CheckCircle2 color={colors.textInverse} size={14} />
              </View>
              <View style={[styles.stepLine, styles.stepLineActive]} />
              <View style={[styles.stepDot, styles.stepDotActive]}>
                <Text style={styles.stepDotText}>2</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>3</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>4</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>5</Text>
              </View>
            </View>

            {/* Order Info Card */}
            <View style={styles.detailCard}>
              <DetailRow label="Customer" value={orderData.customer.name} />
              <DetailRow label="PCB Model" value={orderData.pcbModel.name} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
            </View>

            <View style={styles.infoCard}>
              <MapPin color={colors.primary} size={24} />
              <Text style={styles.infoText}>
                Scan Line untuk mencocokkan data order
              </Text>
            </View>
          </ScrollView>
        )}

        {/* ── Step 3: Scan Machine ──────────────────────────── */}
        {step === 'scan_machine' && orderData && matchedDetail && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <CheckCircle2 color={colors.textInverse} size={14} />
              </View>
              <View style={[styles.stepLine, styles.stepLineActive]} />
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <CheckCircle2 color={colors.textInverse} size={14} />
              </View>
              <View style={[styles.stepLine, styles.stepLineActive]} />
              <View style={[styles.stepDot, styles.stepDotActive]}>
                <Text style={styles.stepDotText}>3</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>4</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>5</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <DetailRow label="Customer" value={orderData.customer.name} />
              <DetailRow label="PCB Model" value={orderData.pcbModel.name} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
              <DetailRow label="Line" value={matchedDetail.line.name} />
              <DetailRow label="PO Number" value={matchedDetail.poNumber} />
            </View>

            <View style={styles.infoCard}>
              <Cpu color={colors.primary} size={24} />
              <Text style={styles.infoText}>
                Scan Machine untuk mencocokkan data order
              </Text>
            </View>
          </ScrollView>
        )}

        {/* ── Step 4: Scan Product Select ───────────────────── */}
        {step === 'scan_product' && orderData && matchedDetail && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <CheckCircle2 color={colors.textInverse} size={14} />
              </View>
              <View style={[styles.stepLine, styles.stepLineActive]} />
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <CheckCircle2 color={colors.textInverse} size={14} />
              </View>
              <View style={[styles.stepLine, styles.stepLineActive]} />
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <CheckCircle2 color={colors.textInverse} size={14} />
              </View>
              <View style={[styles.stepLine, styles.stepLineActive]} />
              <View style={[styles.stepDot, styles.stepDotActive]}>
                <Text style={styles.stepDotText}>4</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>5</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <DetailRow label="Customer" value={orderData.customer.name} />
              <DetailRow label="PCB Model" value={orderData.pcbModel.name} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
              <DetailRow label="Line" value={matchedDetail.line.name} />
              <DetailRow label="Machine" value={matchedDetail.machine.name} />
              <DetailRow label="PO Number" value={matchedDetail.poNumber} />
            </View>

            <View style={styles.infoCard}>
              <Layers color={colors.primary} size={24} />
              <Text style={styles.infoText}>
                Scan Product Select (satu kali saja)
              </Text>
            </View>
          </ScrollView>
        )}

        {/* ── Step 5: Scanning Part Batches ─────────────────── */}
        {step === 'scanning_parts' && orderData && matchedDetail && (
          <View style={{ flex: 1 }}>
            {/* Progress */}
            <View style={styles.progressBar}>
              <Text style={styles.progressText}>
                Progress: {scannedPartBatchIds.size} / {partBatches.length}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        partBatches.length > 0
                          ? (scannedPartBatchIds.size / partBatches.length) *
                            100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stkListContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.scanHint}>
                <ScanBarcode color={colors.primary} size={18} />
                <Text style={styles.scanHintText}>
                  Scan STK Number satu per satu. Product: {productSelect}
                </Text>
              </View>

              {partBatches.map(pb => {
                const isScanned = scannedPartBatchIds.has(pb.id);
                return (
                  <View
                    key={pb.id}
                    style={[styles.stkItem, isScanned && styles.stkItemScanned]}
                  >
                    <View style={styles.stkItemLeft}>
                      {isScanned ? (
                        <CheckCircle2 color={colors.success} size={20} />
                      ) : (
                        <Package color={colors.textMuted} size={20} />
                      )}
                      <View style={styles.stkItemInfo}>
                        <Text
                          style={[
                            styles.stkNumber,
                            isScanned && styles.stkNumberScanned,
                          ]}
                        >
                          {pb.stkNumber}
                        </Text>
                        <Text style={styles.stkDetail}>
                          Qty: {pb.quantity} | Lot: {pb.lotNumber}
                        </Text>
                      </View>
                    </View>
                    {isScanned && (
                      <View style={styles.scannedBadge}>
                        <Text style={styles.scannedBadgeText}>Done</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
              <Button
                title="Batal"
                variant="outline"
                onPress={handleReset}
                style={styles.bottomBtn}
              />
              <Button
                title={`Finish (${scannedPartBatchIds.size}/${partBatches.length})`}
                onPress={handleFinish}
                disabled={
                  isSubmitting || scannedPartBatchIds.size < partBatches.length
                }
                isLoading={isSubmitting}
                style={styles.bottomBtn}
              />
            </View>
          </View>
        )}

        {/* ── Step 6: Finished ──────────────────────────────── */}
        {step === 'finished' && orderData && matchedDetail && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.finishedScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.finishedContainer}>
              <View style={styles.finishedIconBadge}>
                <CheckCircle2 color={colors.success} size={64} />
              </View>
              <Text style={styles.finishedTitle}>Part Register Selesai!</Text>
              <Text style={styles.finishedSubtitle}>
                Semua part batch berhasil di-register
              </Text>

              <View style={styles.finishedSummary}>
                <DetailRow label="Customer" value={orderData.customer.name} />
                <DetailRow label="PCB Model" value={orderData.pcbModel.name} />
                <DetailRow label="Line" value={matchedDetail.line.name} />
                <DetailRow label="Machine" value={matchedDetail.machine.name} />
                <DetailRow label="Product" value={productSelect} />
                <DetailRow
                  label="Total Part"
                  value={String(partBatches.length)}
                />
              </View>

              <Button
                title="Kembali ke SMT"
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

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.textMuted}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotDone: {
    backgroundColor: colors.success,
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textInverse,
  },
  stepDotTextInactive: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: `${colors.textMuted}25`,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: colors.success,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}12`,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },

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
  },

  // Progress Bar
  progressBar: {
    padding: 16,
    paddingBottom: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: `${colors.textMuted}20`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },

  // Scan hint
  scanHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  scanHintText: { flex: 1, fontSize: 12, color: colors.textSecondary },

  // STK List
  stkListContent: { padding: 16, paddingBottom: 100 },
  stkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    ...shadows.sm,
  },
  stkItemScanned: {
    backgroundColor: `${colors.success}10`,
    borderColor: colors.success,
    borderWidth: 1,
  },
  stkItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  stkItemInfo: {
    flex: 1,
  },
  stkNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stkNumberScanned: {
    color: colors.success,
  },
  stkDetail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  scannedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scannedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textInverse,
  },

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
  finishedBtn: { width: '100%', paddingVertical: 12 },
});

export default PartRegisterScreen;
