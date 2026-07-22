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
  ArrowLeftRight,
  ScanBarcode,
  CheckCircle2,
  X,
  MapPin,
  Cpu,
  Package,
  Layers,
  AlertTriangle,
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
import { fetchStkData } from '../../warehouse/services/warehouseService';
import type { StkData } from '../../warehouse/types';
import SmtHeader from '../components/SmtHeader';

type Props = {
  navigation: NativeStackNavigationProp<SmtStackParamList, 'PartChanging'>;
};

type Step =
  | 'scan_lot'
  | 'scan_line'
  | 'scan_machine'
  | 'scan_product'
  | 'select_parts'
  | 'scan_new_stk'
  | 'finished';

interface PartChangeItem {
  partBatch: SmtPartBatch;
  pddm: string; // inventoryCode from old part
  partNo: string; // partName from old part
  replaced: boolean;
  replacedWithStk?: string;
}

const PartChangingScreen: React.FC<Props> = ({ navigation }) => {
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
  const [partChangeItems, setPartChangeItems] = useState<PartChangeItem[]>([]);

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
    setScanInput('');
    setStep('select_parts');
  };

  // ─── Step 5: Select Parts (auto - just show list, then move to scanning) ─
  const handleStartPartChanging = () => {
    if (!matchedDetail) return;

    // Build part change items from part batches
    const items: PartChangeItem[] = matchedDetail.partBatches.map(pb => ({
      partBatch: pb,
      pddm: pb.part?.inventoryCode ?? '',
      partNo: pb.part?.partName ?? '',
      replaced: false,
    }));
    setPartChangeItems(items);
    setScanInput('');
    setStep('scan_new_stk');
  };

  // ─── Step 6: Scan New STK ──────────────────────────────────────────────
  const handleScanNewStk = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !matchedDetail) {
      focusScanner();
      return;
    }

    setIsLoading(true);
    try {
      const stkResponse = await fetchStkData(trimmed);
      if (!stkResponse.status || !stkResponse.data) {
        showError(stkResponse.message || 'STK tidak ditemukan');
        setScanInput('');
        focusScanner();
        setIsLoading(false);
        return;
      }

      const stkData: StkData = stkResponse.data;
      const stkInventoryCode = stkData.part?.inventoryCode ?? '';
      const stkPartName = stkData.part?.partName ?? '';

      // Find matching part batch by inventoryCode or partName
      const matchIndex = partChangeItems.findIndex(
        item =>
          !item.replaced &&
          ((item.pddm &&
            stkInventoryCode &&
            item.pddm.toLowerCase() === stkInventoryCode.toLowerCase()) ||
            (item.partNo &&
              stkPartName &&
              item.partNo.toLowerCase() === stkPartName.toLowerCase())),
      );

      if (matchIndex === -1) {
        showError(
          'Part yang digunakan salah! Tidak ada kecocokan dengan data lot.',
        );
        setScanInput('');
        focusScanner();
        setIsLoading(false);
        return;
      }

      const matchedItem = partChangeItems[matchIndex];

      // Submit to API
      setIsSubmitting(true);
      try {
        await submitSmt({
          orderId: matchedDetail.orderId,
          partBatchId: matchedItem.partBatch.id,
          productSelect: productSelect,
        });

        // Mark as replaced
        const updatedItems = [...partChangeItems];
        updatedItems[matchIndex] = {
          ...updatedItems[matchIndex],
          replaced: true,
          replacedWithStk: trimmed,
        };
        setPartChangeItems(updatedItems);

        showSuccess(
          `${matchedItem.partBatch.stkNumber} berhasil di-ganti dengan ${trimmed}. Tekan Finish jika sudah selesai.`,
        );
      } catch (error: any) {
        showError(error?.response?.data?.message || `Gagal submit part change`);
      } finally {
        setIsSubmitting(false);
      }
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Gagal mengambil data STK');
    } finally {
      setIsLoading(false);
    }

    setScanInput('');
    focusScanner();
  };

  // ─── Finish ─────────────────────────────────────────────────────────────
  const handleFinish = () => {
    showSuccess('Part Changing selesai!');
    setStep('finished');
  };

  // ─── Reset ──────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep('scan_lot');
    setScanInput('');
    setOrderData(null);
    setMatchedDetail(null);
    setProductSelect('');
    setPartChangeItems([]);
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
      case 'scan_new_stk':
        handleScanNewStk(scanInput);
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
      : step === 'select_parts'
      ? 'Daftar Part'
      : step === 'scan_new_stk'
      ? 'Scan STK Baru'
      : 'Selesai';

  const partBatches = matchedDetail?.partBatches ?? [];
  const replacedCount = partChangeItems.filter(i => i.replaced).length;

  return (
    <View style={styles.container}>
      <SmtHeader
        title="Part Changing"
        subtitle={headerSubtitle}
        icon={<ArrowLeftRight color={colors.orange} size={18} />}
        iconBgColor={`${colors.orange}25`}
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
        {/* Hidden scanner input */}
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
            </View>

            <View style={styles.infoCard}>
              <ScanBarcode color={colors.orange} size={24} />
              <Text style={styles.infoText}>
                Scan Lot Number untuk memulai proses Part Changing
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
            </View>

            <View style={styles.detailCard}>
              <DetailRow label="Customer" value={orderData.customer.name} />
              <DetailRow label="PCB Model" value={orderData.pcbModel.name} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
            </View>

            <View style={styles.infoCard}>
              <MapPin color={colors.orange} size={24} />
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
            </View>

            <View style={styles.detailCard}>
              <DetailRow label="Customer" value={orderData.customer.name} />
              <DetailRow label="PCB Model" value={orderData.pcbModel.name} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
              <DetailRow label="Line" value={matchedDetail.line.name} />
              <DetailRow label="PO Number" value={matchedDetail.poNumber} />
            </View>

            <View style={styles.infoCard}>
              <Cpu color={colors.orange} size={24} />
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
            </View>

            <View style={styles.detailCard}>
              <DetailRow label="Customer" value={orderData.customer.name} />
              <DetailRow label="PCB Model" value={orderData.pcbModel.name} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
              <DetailRow label="Line" value={matchedDetail.line.name} />
              <DetailRow label="Machine" value={matchedDetail.machine.name} />
            </View>

            <View style={styles.infoCard}>
              <Layers color={colors.orange} size={24} />
              <Text style={styles.infoText}>
                Scan Product Select (satu kali saja)
              </Text>
            </View>
          </ScrollView>
        )}

        {/* ── Step 5: Parts List ─────────────────────────────── */}
        {step === 'select_parts' && orderData && matchedDetail && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.infoCard}>
              <Package color={colors.orange} size={24} />
              <Text style={styles.infoText}>
                Daftar part dari lot number. Tekan Mulai untuk mulai scan STK
                pengganti.
              </Text>
            </View>

            {partBatches.map(pb => (
              <View key={pb.id} style={styles.partItem}>
                <Package color={colors.textMuted} size={18} />
                <View style={styles.partItemInfo}>
                  <Text style={styles.partItemStk}>{pb.stkNumber}</Text>
                  <Text style={styles.partItemDetail}>
                    Qty: {pb.quantity} | Lot: {pb.lotNumber ?? '-'}
                  </Text>
                  {pb.part?.inventoryCode ? (
                    <Text style={styles.partItemDetail}>
                      PDDM: {pb.part.inventoryCode}
                    </Text>
                  ) : null}
                  {pb.part?.partName ? (
                    <Text style={styles.partItemDetail}>
                      Part No: {pb.part.partName}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}

            <View style={styles.buttonRow}>
              <Button
                title="Batal"
                variant="outline"
                onPress={handleReset}
                style={styles.halfBtn}
              />
              <Button
                title="Mulai Part Changing"
                onPress={handleStartPartChanging}
                style={styles.halfBtn}
              />
            </View>
          </ScrollView>
        )}

        {/* ── Step 6: Scan New STK ──────────────────────────── */}
        {step === 'scan_new_stk' && orderData && matchedDetail && (
          <View style={{ flex: 1 }}>
            {/* Progress */}
            <View style={styles.progressBar}>
              <Text style={styles.progressText}>
                Progress: {replacedCount} / {partChangeItems.length} diganti
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        partChangeItems.length > 0
                          ? (replacedCount / partChangeItems.length) * 100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Loading indicator */}
            {isLoading && (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Mencari data STK...</Text>
              </View>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stkListContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.scanHint}>
                <ScanBarcode color={colors.orange} size={18} />
                <Text style={styles.scanHintText}>
                  Scan STK baru untuk mengganti part. Product: {productSelect}
                </Text>
              </View>

              {partChangeItems.map((item, index) => (
                <View
                  key={item.partBatch.id}
                  style={[
                    styles.partChangeItem,
                    item.replaced && styles.partChangeItemReplaced,
                  ]}
                >
                  <View style={styles.partChangeItemLeft}>
                    {item.replaced ? (
                      <CheckCircle2 color={colors.success} size={20} />
                    ) : (
                      <Package color={colors.textMuted} size={20} />
                    )}
                    <View style={styles.partChangeItemInfo}>
                      <Text
                        style={[
                          styles.partChangeItemStk,
                          item.replaced && { color: colors.success },
                        ]}
                      >
                        {item.partBatch.stkNumber}
                      </Text>
                      <Text style={styles.partChangeItemDetail}>
                        Qty: {item.partBatch.quantity}
                      </Text>
                      {item.replaced && item.replacedWithStk && (
                        <Text style={styles.replacedWithText}>
                          Diganti: {item.replacedWithStk}
                        </Text>
                      )}
                    </View>
                  </View>
                  {item.replaced && (
                    <View style={styles.replacedBadge}>
                      <Text style={styles.replacedBadgeText}>Done</Text>
                    </View>
                  )}
                </View>
              ))}
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
                title={`Finish (${replacedCount}/${partChangeItems.length})`}
                onPress={handleFinish}
                disabled={isSubmitting || replacedCount === 0}
                isLoading={isSubmitting}
                style={styles.bottomBtn}
              />
            </View>
          </View>
        )}

        {/* ── Step 7: Finished ──────────────────────────────── */}
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
              <Text style={styles.finishedTitle}>Part Changing Selesai!</Text>
              <Text style={styles.finishedSubtitle}>
                Semua part berhasil di-ganti
              </Text>

              <View style={styles.finishedSummary}>
                <DetailRow label="Customer" value={orderData.customer.name} />
                <DetailRow label="PCB Model" value={orderData.pcbModel.name} />
                <DetailRow label="Line" value={matchedDetail.line.name} />
                <DetailRow label="Machine" value={matchedDetail.machine.name} />
                <DetailRow label="Product" value={productSelect} />
                <DetailRow
                  label="Total Changed"
                  value={String(partChangeItems.length)}
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
    backgroundColor: colors.orange,
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
    backgroundColor: `${colors.orange}12`,
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
    paddingHorizontal: 20,
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

  // Part Item (select_parts step)
  partItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    gap: 12,
    ...shadows.sm,
  },
  partItemInfo: {
    flex: 1,
  },
  partItemStk: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  partItemDetail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
    backgroundColor: colors.orange,
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
  partChangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    ...shadows.sm,
  },
  partChangeItemReplaced: {
    backgroundColor: `${colors.success}10`,
    borderColor: colors.success,
    borderWidth: 1,
  },
  partChangeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  partChangeItemInfo: {
    flex: 1,
  },
  partChangeItemStk: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  partChangeItemDetail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  replacedWithText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  replacedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  replacedBadgeText: {
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

  // Button Row
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  halfBtn: { flex: 1, paddingVertical: 12 },

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

export default PartChangingScreen;
