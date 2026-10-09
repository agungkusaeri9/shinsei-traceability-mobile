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
  TouchableOpacity,
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
import type { SmtOrderData, SmtOrderDetail, SmtStkListItem } from '../types';
import { fetchOrderByLotNumber, submitSmt } from '../services/smtService';
import { fetchStkData } from '../../warehouse/services/warehouseService';
import { extractStkNumber } from '../../../utils/barcode';
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
  | 'scan_new_stk'
  | 'finished';

interface PartChangeItem {
  inventoryCode: string;
  partNumber: string;
  replaced: boolean;
  replacedWithStk?: string;
  partBatchId?: number;
}

const PartChangingScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);
  const inputValueRef = useRef('');
  const [step, setStep] = useState<Step>('scan_lot');
  const [lotNumber, setLotNumber] = useState('');
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
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

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
    setLotNumber(trimmed);

    setIsLoading(true);
    try {
      const response = await fetchOrderByLotNumber(trimmed);
      if (response.status && response.data) {
        setOrderData(response.data);
        showSuccess(`Lot number ${trimmed} ditemukan`);
        setScanInput('');
        setStep('scan_product');
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

  // ─── Step 2: Scan Product Select ────────────────────────────────────────
  const handleScanProductSelect = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      focusScanner();
      return;
    }

    setProductSelect(trimmed);
    showSuccess(`Product Select: ${trimmed}`);
    setScanInput('');
    setStep('scan_line');
  };

  // ─── Step 3: Scan Line ──────────────────────────────────────────────────
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

  // ─── Step 4: Scan Machine ───────────────────────────────────────────────
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
      handleStartPartChanging();
    } else {
      showError(
        `Machine "${trimmed}" tidak cocok. Harus: ${matchedDetail.machine.name}`,
      );
      setScanInput('');
      focusScanner();
    }
  };

  // ─── Step 5: Select Parts (auto - just show list, then move to scanning) ─
  const handleStartPartChanging = () => {
    if (!matchedDetail || !orderData) return;

    // Filter matching details for current line & machine
    const lineName = matchedDetail.line.name.toLowerCase();
    const machineName = matchedDetail.machine.name.toLowerCase();
    const matching = orderData.details.filter(
      d =>
        d.line.name.toLowerCase() === lineName &&
        d.machine.name.toLowerCase() === machineName,
    );
    const detailsToUse = matching.length > 0 ? matching : orderData.details;

    const items: PartChangeItem[] = detailsToUse.map(d => ({
      inventoryCode: d.inventoryCode,
      partNumber: d.stkList?.[0]?.partNumber || '-',
      replaced: false,
    }));
    setPartChangeItems(items);
    setSelectedItemIndex(null);
    setScanInput('');
    setStep('scan_new_stk');
  };

  // ─── Step 6: Scan New STK ──────────────────────────────────────────────
  const handleScanNewStk = async (value: string) => {
    const trimmed = extractStkNumber(value);
    if (!trimmed || !matchedDetail) {
      focusScanner();
      return;
    }

    setIsLoading(true);
    try {
      const stkResponse = await fetchStkData(trimmed);
      if (!stkResponse.status || !stkResponse.data) {
        showError(stkResponse.message || `STK "${trimmed}" tidak ditemukan`);
        setScanInput('');
        focusScanner();
        setIsLoading(false);
        return;
      }

      const stkData: StkData = stkResponse.data;
      const latestHist = (stkData.latestHistory || '').toLowerCase();

      // Check latestHistory
      if (latestHist === 'register') {
        showError(`STK ${trimmed} sudah di-register di mesin!`);
        setScanInput('');
        focusScanner();
        setIsLoading(false);
        return;
      }

      if (latestHist !== 'stockout' && latestHist !== 'stock out') {
        showError(
          `STK ${trimmed} belum distock-out dari warehouse! (Status: ${stkData.latestHistory})`,
        );
        setScanInput('');
        focusScanner();
        setIsLoading(false);
        return;
      }

      const stkInventoryCode = (stkData.part?.inventoryCode || '').trim();
      const stkPartNumber = (stkData.part?.partNumber || '').trim();

      // Find matching item
      let matchIndex = -1;

      // If operator manually tapped/selected a card item
      if (selectedItemIndex !== null && selectedItemIndex < partChangeItems.length) {
        const selItem = partChangeItems[selectedItemIndex];
        const invMatch = selItem.inventoryCode.toLowerCase() === stkInventoryCode.toLowerCase();
        if (invMatch) {
          matchIndex = selectedItemIndex;
        } else {
          showError(
            `STK ${trimmed} (PDDM: ${stkInventoryCode}) tidak cocok dengan item yang dipilih (${selItem.inventoryCode})`,
          );
          setScanInput('');
          focusScanner();
          setIsLoading(false);
          return;
        }
      } else {
        // Auto match by inventoryCode & partNumber
        matchIndex = partChangeItems.findIndex(
          item =>
            item.inventoryCode.toLowerCase() === stkInventoryCode.toLowerCase() &&
            (!stkPartNumber || item.partNumber.toLowerCase() === stkPartNumber.toLowerCase() || item.partNumber === '-'),
        );

        if (matchIndex === -1) {
          // Fallback match by inventoryCode only
          matchIndex = partChangeItems.findIndex(
            item => item.inventoryCode.toLowerCase() === stkInventoryCode.toLowerCase(),
          );
        }
      }

      if (matchIndex === -1) {
        showError(
          `STK ${trimmed} (PDDM: ${stkInventoryCode || '-'}, Part: ${stkPartNumber || '-'}) tidak ada di daftar order ini`,
        );
        setScanInput('');
        focusScanner();
        setIsLoading(false);
        return;
      }

      const matchedItem = partChangeItems[matchIndex];
      const newStk = stkData.stkNumber || trimmed;
      const isOverwrite = matchedItem.replaced;
      const oldStk = matchedItem.replacedWithStk;

      // Mark as replaced, store partBatchId
      const updatedItems = [...partChangeItems];
      updatedItems[matchIndex] = {
        ...updatedItems[matchIndex],
        replaced: true,
        replacedWithStk: newStk,
        partBatchId: stkData.id,
      };
      setPartChangeItems(updatedItems);
      setSelectedItemIndex(null);

      if (isOverwrite) {
        showSuccess(
          `STK untuk ${matchedItem.inventoryCode} diperbarui: ${oldStk} ➔ ${newStk}`,
        );
      } else {
        showSuccess(
          `Part ${matchedItem.inventoryCode} (${matchedItem.partNumber}) berhasil diganti dengan ${newStk}`,
        );
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
  const handleFinish = async () => {
    const partBatchIds = partChangeItems
      .filter(i => i.replaced && i.partBatchId != null)
      .map(i => i.partBatchId as number);

    if (partBatchIds.length === 0) {
      showError('Belum ada part yang diganti');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSmt({
        lotNumber,
        partBatchIds,
        productSelect,
      });
      showSuccess('Part Changing selesai!');
      setStep('finished');
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Gagal mengirim data Part Changing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Reset ──────────────────────────────────────────────────────────────
  const handleReset = () => {
    inputValueRef.current = '';
    setStep('scan_lot');
    setScanInput('');
    setOrderData(null);
    setMatchedDetail(null);
    setProductSelect('');
    setPartChangeItems([]);
    setSelectedItemIndex(null);
    setIsLoading(false);
    setIsSubmitting(false);
  };

  // ─── Submit handler based on step ───────────────────────────────────────
  const handleSubmitEditing = () => {
    const val = inputValueRef.current;
    inputValueRef.current = '';
    setScanInput('');
    switch (step) {
      case 'scan_lot':
        handleScanLotNumber(val);
        break;
      case 'scan_line':
        handleScanLine(val);
        break;
      case 'scan_machine':
        handleScanMachine(val);
        break;
      case 'scan_product':
        handleScanProductSelect(val);
        break;
      case 'scan_new_stk':
        handleScanNewStk(val);
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
            : step === 'scan_new_stk'
                ? 'Scan STK Baru'
                : 'Selesai';

  const stkList = matchedDetail?.stkList ?? [];
  const replacedCount = partChangeItems.filter(i => i.replaced).length;

  return (
    <View style={styles.container}>
      <SmtHeader
        title="Part Changing"
        subtitle={headerSubtitle}
        icon={<ArrowLeftRight color={colors.orange} size={18} />}
        iconBgColor={`${colors.orange}25`}
        onBack={() =>
          step === 'scan_lot'
            ? navigation.canGoBack()
              ? navigation.goBack()
              : navigation.navigate('SmtDashboard' as any)
            : handleReset()
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
          onChangeText={text => {
            inputValueRef.current = text;
            setScanInput(text);
          }}
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

        {/* ── Step 2: Scan Product Select ───────────────────── */}
        {step === 'scan_product' && orderData && (
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
              <DetailRow label="Lot Number" value={lotNumber} />
              <DetailRow label="Customer" value={orderData.customer.name} />
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
            </View>

            <View style={styles.infoCard}>
              <Layers color={colors.orange} size={24} />
              <Text style={styles.infoText}>
                Scan Product Select (satu kali saja)
              </Text>
            </View>
          </ScrollView>
        )}

        {/* ── Step 3: Scan Line ─────────────────────────────── */}
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
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
              <DetailRow label="Product Select" value={productSelect} />
            </View>

            <View style={styles.infoCard}>
              <MapPin color={colors.orange} size={24} />
              <Text style={styles.infoText}>
                Scan Line untuk mencocokkan data order
              </Text>
            </View>
          </ScrollView>
        )}

        {/* ── Step 4: Scan Machine ──────────────────────────── */}
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
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
              <DetailRow label="Product Select" value={productSelect} />
              <DetailRow label="Line" value={matchedDetail.line.name} />
            </View>

            <View style={styles.infoCard}>
              <Cpu color={colors.orange} size={24} />
              <Text style={styles.infoText}>
                Scan Machine untuk mencocokkan data order
              </Text>
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
                      width: `${partChangeItems.length > 0
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
                  Tekan card item untuk memilih atau scan STK pengganti. Product: {orderData.product?.name}
                </Text>
              </View>

              {partChangeItems.map((item, index) => {
                const isSelected = selectedItemIndex === index;
                return (
                  <TouchableOpacity
                    key={`${item.inventoryCode}-${index}`}
                    activeOpacity={0.8}
                    onPress={() => setSelectedItemIndex(isSelected ? null : index)}
                    style={[
                      styles.partChangeItem,
                      item.replaced && styles.partChangeItemReplaced,
                      isSelected && styles.partChangeItemSelected,
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
                          PDDM: {item.inventoryCode}
                        </Text>
                        <Text style={styles.partChangeItemDetail}>
                          Part No: {item.partNumber}
                        </Text>
                        {item.replaced && item.replacedWithStk && (
                          <Text style={styles.replacedWithText}>
                            STK Baru: {item.replacedWithStk}
                          </Text>
                        )}
                      </View>
                    </View>
                    {isSelected ? (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>Pilihan</Text>
                      </View>
                    ) : item.replaced ? (
                      <View style={styles.replacedBadge}>
                        <Text style={styles.replacedBadgeText}>Diganti</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>Pilih / Scan</Text>
                      </View>
                    )}
                  </TouchableOpacity>
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
                title={`Finish (${replacedCount}/${partChangeItems.length})`}
                onPress={handleFinish}
                disabled={replacedCount === 0 || isSubmitting}
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
                <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
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
    borderColor: colors.success,
    borderWidth: 1,
  },
  partChangeItemSelected: {
    borderColor: colors.orange,
    borderWidth: 2,
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
  selectedBadge: {
    backgroundColor: colors.orange,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textInverse,
  },
  pendingBadge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },

  scanBtn: {
    flex: 1,
    paddingVertical: 10,
  },

  submitBtn: {
    flex: 2,
    paddingVertical: 10,
  },
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
