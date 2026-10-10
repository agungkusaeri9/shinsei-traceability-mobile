import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {
  ClipboardList,
  ScanBarcode,
  CheckCircle2,
  Circle,
  X,
  MapPin,
  Cpu,
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
import type { SmtOrderData, SmtOrderDetail } from '../types';
import { fetchOrderByLotNumber, submitSmt } from '../services/smtService';
import { getErrorMessage } from '../../../utils/errorMessage';
import { fetchStkData } from '../../warehouse/services/warehouseService';
import type { StkData } from '../../warehouse/types';
import { extractStkNumber } from '../../../utils/barcode';
import SmtHeader from '../components/SmtHeader';
import StkScanProgress from '../../warehouse/components/StkScanProgress';

type Props = {
  navigation: NativeStackNavigationProp<SmtStackParamList, 'PartRegister'>;
};

type Step =
  | 'scan_lot'
  | 'scan_product'
  | 'scan_line'
  | 'scan_machine'
  | 'scanning_parts'
  | 'finished';

const PartRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);
  const inputValueRef = useRef('');
  const flatListRef = useRef<FlatList>(null);
  const [step, setStep] = useState<Step>('scan_lot');
  const [scanInput, setScanInput] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orderData, setOrderData] = useState<SmtOrderData | null>(null);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const [productSelect, setProductSelect] = useState('');

  // Per-detail scanned tracking: Map<detailIndex, scannedStkNumber>
  const [scannedMap, setScannedMap] = useState<Map<number, string>>(new Map());
  const [scannedBatchMap, setScannedBatchMap] = useState<Map<number, number>>(new Map());

  // Modal for viewing available STKs on long-press
  const [selectedDetailForModal, setSelectedDetailForModal] = useState<SmtOrderDetail | null>(null);

  const currentDetail: SmtOrderDetail | null =
    orderData?.details?.[currentDetailIndex] ?? null;

  const totalBatches = useMemo(
    () => orderData?.details?.length ?? 0,
    [orderData],
  );
  const totalScanned = useMemo(
    () => scannedMap.size,
    [scannedMap],
  );

  const focusScanner = useCallback(() => {
    requestAnimationFrame(() => { barcodeRef.current?.focus(); });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => focusScanner(), 200);
      return () => clearTimeout(timer);
    }, [step, focusScanner]),
  );

  // Helper: lanjut ke detail berikutnya
  const advanceToNextDetail = useCallback(
    (nextIdx: number, prevDetail: SmtOrderDetail) => {
      if (!orderData) return;
      const nextDetail = orderData.details[nextIdx];
      if (!nextDetail) return;

      setCurrentDetailIndex(nextIdx);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });

      const lineChanged = (prevDetail.line?.id ?? null) !== (nextDetail.line?.id ?? null);
      const machineChanged = (prevDetail.machine?.id ?? null) !== (nextDetail.machine?.id ?? null);

      if (lineChanged) {
        showInfo(`Detail ${nextIdx + 1}/${orderData.details.length}: Scan line baru`);
        setStep('scan_line');
      } else if (machineChanged) {
        showInfo(`Detail ${nextIdx + 1}/${orderData.details.length}: Scan machine baru`);
        setStep('scan_machine');
      } else {
        showInfo(`Detail ${nextIdx + 1}/${orderData.details.length}: Scan STK berikutnya`);
        setStep('scanning_parts');
      }
    },
    [orderData],
  );

  // Step 1: Scan Lot
  const handleScanLotNumber = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) { focusScanner(); return; }
    setLotNumber(trimmed);
    setIsLoading(true);
    try {
      const response = await fetchOrderByLotNumber(trimmed);
      if (response.status && response.data) {
        setOrderData(response.data);
        setCurrentDetailIndex(0);
        setScannedMap(new Map());
        showSuccess(`Lot number ${trimmed} ditemukan`);
        setScanInput('');
        setStep('scan_product');
      } else {
        showError(response.message || 'Lot number tidak ditemukan');
        setScanInput('');
        focusScanner();
      }
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal mengambil data lot number'));
      setScanInput('');
      focusScanner();
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Scan Product Select (sekali saja)
  const handleScanProductSelect = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) { focusScanner(); return; }
    setProductSelect(trimmed);
    showSuccess(`Product Select: ${trimmed}`);
    setScanInput('');
    setStep('scan_line');
  };

  // Step 3: Scan Line
  const handleScanLine = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !orderData) { focusScanner(); return; }
    const detail = orderData.details[currentDetailIndex];
    if (!detail) { focusScanner(); return; }

    const match =
      detail.line == null ||
      detail.line.name.toLowerCase() === trimmed.toLowerCase() ||
      String(detail.line.id) === trimmed;

    if (match) {
      showSuccess(`Line ${detail.line?.name || 'No line'} cocok`);
      setScanInput('');
      setStep('scan_machine');
    } else {
      showError(`Line "${trimmed}" tidak cocok. Harus: ${detail.line?.name}`);
      setScanInput('');
      focusScanner();
    }
  };

  // Step 4: Scan Machine
  const handleScanMachine = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !orderData) { focusScanner(); return; }
    const detail = orderData.details[currentDetailIndex];
    if (!detail) { focusScanner(); return; }

    const match =
      detail.machine == null ||
      detail.machine.name.toLowerCase() === trimmed.toLowerCase() ||
      String(detail.machine.id) === trimmed;

    if (match) {
      showSuccess(`Machine ${detail.machine?.name || 'No machine'} cocok`);
      setScanInput('');
      setStep('scanning_parts');
    } else {
      showError(`Machine "${trimmed}" tidak cocok. Harus: ${detail.machine?.name}`);
      setScanInput('');
      focusScanner();
    }
  };

  // Step 5: Scan STK
  const handleScanPartBatch = async (value: string) => {
    const trimmed = extractStkNumber(value);
    if (!trimmed || !orderData) { focusScanner(); return; }

    setIsSubmitting(true);
    try {
      // 1. Hit API /api/stks/{stkNumber}
      const stkResponse = await fetchStkData(trimmed);
      if (!stkResponse.status || !stkResponse.data) {
        showError(stkResponse.message || `STK "${trimmed}" tidak ditemukan`);
        setScanInput('');
        focusScanner();
        return;
      }

      const stkData: StkData = stkResponse.data;
      const latestHist = stkData.latestHistory || '';

      // 2. Validation: check if latestHistory is "Register"
      if (latestHist.toLowerCase() !== 'stockout') {
        if (latestHist.toLowerCase() == "register") {
          showError(`STK ${trimmed} sudah di register!`);
        } else {
          showError(`STK ${trimmed} belum distock-out dari warehouse! (Status: ${latestHist})`);
        }
        setScanInput('');
        focusScanner();
        return;
      }

      const stkInventoryCode = (stkData.part?.inventoryCode || '').trim();
      const stkPartNumber = (stkData.part?.partNumber || '').trim();

      // 3. Find matching detail in orderData.details (prefer currentDetailIndex, then unscanned, then scanned for overwrite)
      let matchIdx = -1;
      if (
        currentDetail &&
        currentDetail.inventoryCode.trim().toLowerCase() === stkInventoryCode.toLowerCase() &&
        currentDetail.stkList.some(s => s.partNumber.trim().toLowerCase() === stkPartNumber.toLowerCase())
      ) {
        matchIdx = currentDetailIndex;
      } else {
        const unscannedIdx = orderData.details.findIndex((d, idx) => {
          if (scannedMap.has(idx)) return false;
          const invMatch = d.inventoryCode.trim().toLowerCase() === stkInventoryCode.toLowerCase();
          const partMatch = d.stkList.some(s => s.partNumber.trim().toLowerCase() === stkPartNumber.toLowerCase());
          return invMatch && partMatch;
        });

        if (unscannedIdx !== -1) {
          matchIdx = unscannedIdx;
        } else {
          matchIdx = orderData.details.findIndex(d => {
            const invMatch = d.inventoryCode.trim().toLowerCase() === stkInventoryCode.toLowerCase();
            const partMatch = d.stkList.some(s => s.partNumber.trim().toLowerCase() === stkPartNumber.toLowerCase());
            return invMatch && partMatch;
          });
        }
      }

      if (matchIdx === -1) {
        showError(
          `STK ${trimmed} (Part: ${stkPartNumber || '-'}, PDDM: ${stkInventoryCode || '-'}) tidak cocok dengan order ini`,
        );
        setScanInput('');
        focusScanner();
        return;
      }

      const matchedDetailItem = orderData.details[matchIdx];
      const finalStk = stkData.stkNumber || trimmed;
      const isOverwrite = scannedMap.has(matchIdx);
      const oldStk = scannedMap.get(matchIdx);

      if (isOverwrite && oldStk === finalStk) {
        showInfo(`STK ${finalStk} sudah di-scan sebelumnya`);
        setScanInput('');
        focusScanner();
        return;
      }

      const partBatchId = stkData.id;

      // 4. Record or overwrite scanned STK & batch ID for this detail
      setScannedMap(prev => {
        const next = new Map(prev);
        next.set(matchIdx, finalStk);
        return next;
      });

      setScannedBatchMap(prev => {
        const next = new Map(prev);
        next.set(matchIdx, partBatchId);
        return next;
      });

      if (isOverwrite) {
        showSuccess(`STK diperbarui: ${oldStk} ➔ ${finalStk}`);
      } else {
        showSuccess(`STK ${finalStk} (${stkPartNumber}) berhasil di-scan`);
      }

      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

      const newScannedCount = isOverwrite ? scannedMap.size : scannedMap.size + 1;
      if (newScannedCount >= orderData.details.length) {
        showSuccess('Semua detail part telah di-scan! Tekan Finish.');
      } else if (!isOverwrite) {
        const nextIdx = matchIdx + 1;
        if (nextIdx < orderData.details.length && matchIdx === currentDetailIndex) {
          advanceToNextDetail(nextIdx, matchedDetailItem);
        }
      }
    } catch (error: any) {
      showError(getErrorMessage(error, `Gagal mengambil data STK ${trimmed}`));
    } finally {
      setIsSubmitting(false);
    }

    setScanInput('');
    focusScanner();
  };

  const handleFinish = async () => {
    const partBatchIds = Array.from(scannedBatchMap.values());
    if (partBatchIds.length === 0) {
      showError('Belum ada STK yang di-scan');
      return;
    }

    console.log('Payload:', {
      lotNumber,
      partBatchIds,
      productSelect,
    });

    setIsSubmitting(true);
    try {
      await submitSmt({
        lotNumber,
        partBatchIds,
        productSelect,
      });
      showSuccess('Part Register selesai!');
      setStep('finished');
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal mengirim data Part Register'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    inputValueRef.current = '';
    setStep('scan_lot');
    setScanInput('');
    setOrderData(null);
    setCurrentDetailIndex(0);
    setProductSelect('');
    setScannedMap(new Map());
    setScannedBatchMap(new Map());
    setSelectedDetailForModal(null);
    setIsLoading(false);
    setIsSubmitting(false);
  };

  const handleSubmitEditing = () => {
    const val = inputValueRef.current;
    inputValueRef.current = '';
    setScanInput('');
    switch (step) {
      case 'scan_lot': handleScanLotNumber(val); break;
      case 'scan_product': handleScanProductSelect(val); break;
      case 'scan_line': handleScanLine(val); break;
      case 'scan_machine': handleScanMachine(val); break;
      case 'scanning_parts': handleScanPartBatch(val); break;
    }
  };

  const headerSubtitle =
    step === 'scan_lot' ? 'Scan Lot Number' :
      step === 'scan_product' ? 'Scan Product Select' :
        step === 'scan_line' ? 'Scan Line' :
          step === 'scan_machine' ? 'Scan Machine' :
            step === 'scanning_parts' ? 'Scan STK Parts' : 'Selesai';

  const detailLabel = orderData
    ? `Detail ${currentDetailIndex + 1}/${orderData.details.length}`
    : '';

  return (
    <View style={styles.container}>
      <SmtHeader
        title="Part Register"
        subtitle={headerSubtitle}
        icon={<ClipboardList color={colors.primary} size={18} />}
        iconBgColor={`${colors.primary}25`}
        onBack={() =>
          step === 'scan_lot'
            ? navigation.canGoBack()
              ? navigation.goBack()
              : navigation.navigate('SmtDashboard' as any)
            : handleReset()
        }
        rightSlot={
          step !== 'scan_lot' ? <X color={colors.textInverse} size={24} /> : undefined
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TextInput
          ref={barcodeRef}
          value={scanInput}
          onChangeText={(text) => {
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

        {/* Step 1: Scan Lot */}
        {step === 'scan_lot' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <StepIndicator current={0} total={5} />
            <View style={styles.infoCard}>
              <ScanBarcode color={colors.primary} size={24} />
              <Text style={styles.infoText}>Scan Lot Number untuk memulai proses Part Register</Text>
            </View>
            {isLoading && (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Mencari data lot number...</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Step 2: Scan Product Select */}
        {step === 'scan_product' && orderData && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <StepIndicator current={1} total={5} />
            <View style={styles.infoCard}>
              <Layers color={colors.primary} size={24} />
              <Text style={styles.infoText}>Scan Product Select</Text>
            </View>
            <View style={styles.detailCard}>
              <DetailRow label="Lot Number" value={lotNumber} />
              <DetailRow label="Customer" value={orderData.customer.name} />
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
              <DetailRow label="Total Detail" value={String(orderData.details.length)} />
            </View>
          </ScrollView>
        )}

        {/* Step 3: Scan Line */}
        {step === 'scan_line' && orderData && currentDetail && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <StepIndicator current={2} total={5} />
            {currentDetailIndex > 0 && (
              <View style={styles.detailBadge}>
                <Text style={styles.detailBadgeText}>{detailLabel}</Text>
              </View>
            )}
            <View style={styles.infoCard}>
              <MapPin color={colors.primary} size={24} />
              <Text style={styles.infoText}>Scan Line untuk mencocokkan data order</Text>
            </View>

            <View style={styles.detailCard}>
              <DetailRow label="Customer" value={orderData.customer.name} />
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
              <DetailRow label="Product Select" value={productSelect} />
            </View>
          </ScrollView>
        )}

        {/* Step 4: Scan Machine */}
        {step === 'scan_machine' && orderData && currentDetail && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <StepIndicator current={3} total={5} />
            {currentDetailIndex > 0 && (
              <View style={styles.detailBadge}>
                <Text style={styles.detailBadgeText}>{detailLabel}</Text>
              </View>
            )}
            <View style={styles.infoCard}>
              <Cpu color={colors.primary} size={24} />
              <Text style={styles.infoText}>Scan Machine untuk mencocokkan data order</Text>
            </View>
            <View style={styles.detailCard}>
              <DetailRow label="Customer" value={orderData.customer.name} />
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
              <DetailRow label="Line" value={currentDetail.line?.name || 'No line'} />
            </View>
          </ScrollView>
        )}

        {/* Step 5: Scanning Parts */}
        {step === 'scanning_parts' && orderData && currentDetail && (
          <View style={{ flex: 1 }}>
            <StkScanProgress scanned={totalScanned} total={totalBatches} />

            {currentDetailIndex > 0 && (
              <View style={styles.detailBadgeRow}>
                <Text style={styles.detailBadgeText}>{detailLabel}</Text>
                <Text style={styles.detailBadgeText}>
                  {`L: ${currentDetail.line?.name || '-'} | M: ${currentDetail.machine?.name || '-'}`}
                </Text>
              </View>
            )}

            <FlatList
              ref={flatListRef}
              data={orderData.details}
              keyExtractor={(item, idx) => `${item.inventoryCode}-${idx}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stkListContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: detail, index: idx }) => {
                const scannedStk = scannedMap.get(idx);
                const isScanned = !!scannedStk;
                const partNo = detail.stkList?.[0]?.partNumber || '-';

                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onLongPress={() => setSelectedDetailForModal(detail)}
                    delayLongPress={400}
                    style={[styles.detailItemCard, isScanned && styles.detailItemCardScanned]}
                  >
                    <View style={styles.detailItemTop}>
                      <View style={styles.detailItemLeft}>
                        {isScanned ? (
                          <CheckCircle2 color={colors.success} size={20} />
                        ) : (
                          <Circle color={colors.textMuted} size={20} />
                        )}
                        <View style={styles.detailItemTitleGroup}>
                          <Text style={[styles.detailItemPartNo, isScanned && styles.detailItemPartNoScanned]}>
                            Part No: {partNo}
                          </Text>
                          <Text style={styles.detailItemPddm}>
                            PDDM: {detail.inventoryCode}
                          </Text>
                        </View>
                      </View>
                      {isScanned ? (
                        <View style={styles.scannedBadge}>
                          <Text style={styles.scannedBadgeText}>Scanned</Text>
                        </View>
                      ) : (
                        <View style={styles.holdBadge}>
                          <Text style={styles.holdBadgeText}>Hold info STK</Text>
                        </View>
                      )}
                    </View>

                    {isScanned && (
                      <View style={styles.scannedStkRow}>
                        <Text style={styles.scannedStkLabel}>STK Registered:</Text>
                        <Text style={styles.scannedStkValue}>{scannedStk}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListHeaderComponent={
                <View style={styles.scanHint}>
                  <ScanBarcode color={colors.primary} size={18} />
                  <Text style={styles.scanHintText}>
                    {`Scan STK • ${totalBatches - totalScanned} sisa (Hold item untuk info STK)`}
                  </Text>
                </View>
              }
            />

            <View style={styles.bottomBar}>
              <Button title="Batal" variant="outline" onPress={handleReset} style={styles.bottomBtn} />
              <Button
                title={`Finish (${totalScanned}/${totalBatches})`}
                onPress={handleFinish}
                disabled={isSubmitting || totalScanned < totalBatches}
                isLoading={isSubmitting}
                style={styles.bottomBtn}
              />
            </View>
          </View>
        )}

        {/* Modal List Available STKs on Hold */}
        <Modal
          visible={!!selectedDetailForModal}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedDetailForModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Daftar STK Available</Text>
                  <Text style={styles.modalSubtitle}>
                    PDDM: {selectedDetailForModal?.inventoryCode} | Part: {selectedDetailForModal?.stkList?.[0]?.partNumber || '-'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedDetailForModal(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X color={colors.textPrimary} size={20} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {selectedDetailForModal?.stkList && selectedDetailForModal.stkList.length > 0 ? (
                  selectedDetailForModal.stkList.map((stk, idx) => (
                    <View key={`${stk.stkNumber}-${idx}`} style={styles.stkModalItem}>
                      <ScanBarcode color={colors.primary} size={18} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.stkModalItemNumber}>{stk.stkNumber}</Text>
                        <Text style={styles.stkModalItemPart}>Part No: {stk.partNumber}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyStkText}>Tidak ada STK yang tersedia</Text>
                )}
              </ScrollView>

              <Button
                title="Tutup"
                variant="outline"
                onPress={() => setSelectedDetailForModal(null)}
                style={{ marginTop: 16 }}
              />
            </View>
          </View>
        </Modal>

        {/* Finished */}
        {step === 'finished' && orderData && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.finishedScrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.finishedContainer}>
              <View style={styles.finishedIconBadge}>
                <CheckCircle2 color={colors.success} size={64} />
              </View>
              <Text style={styles.finishedTitle}>Part Register Selesai!</Text>
              <Text style={styles.finishedSubtitle}>Semua part batch berhasil di-register</Text>
              <View style={styles.finishedSummary}>
                <DetailRow label="Customer" value={orderData.customer.name} />
                <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
                <DetailRow label="Product Select" value={productSelect} />
                <DetailRow label="Total Detail" value={String(orderData.details.length)} />
                <DetailRow label="Total Part Scanned" value={String(totalScanned)} />
              </View>
              <Button title="Kembali ke SMT" onPress={handleReset} style={styles.finishedBtn} />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── StepIndicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ current, total }: { current: number; total: number }) => (
  <View style={styles.stepIndicator}>
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <View
          style={[
            styles.stepDot,
            i < current ? styles.stepDotDone : i === current ? styles.stepDotActive : undefined,
          ]}
        >
          {i < current ? (
            <CheckCircle2 color={colors.textInverse} size={14} />
          ) : (
            <Text style={i === current ? styles.stepDotText : styles.stepDotTextInactive}>
              {i + 1}
            </Text>
          )}
        </View>
        {i < total - 1 && (
          <View style={[styles.stepLine, i < current && styles.stepLineActive]} />
        )}
      </React.Fragment>
    ))}
  </View>
);

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

  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.textMuted}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone: { backgroundColor: colors.success },
  stepDotText: { fontSize: 12, fontWeight: '700', color: colors.textInverse },
  stepDotTextInactive: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: `${colors.textMuted}25`,
    marginHorizontal: 4,
  },
  stepLineActive: { backgroundColor: colors.success },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}12`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  infoText: { flex: 1, fontSize: 14, color: colors.textPrimary, lineHeight: 20 },

  loadingField: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16 },
  loadingText: { fontSize: 13, color: colors.textMuted },

  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.sm,
  },
  detailRow: { flexDirection: 'column', paddingVertical: 6 },
  detailLabel: { fontSize: 13, color: colors.textSecondary },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },

  detailBadge: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    backgroundColor: `${colors.primary}18`,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: `${colors.primary}10`,
  },
  detailBadgeText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  scanHint: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  scanHintText: { flex: 1, fontSize: 12, color: colors.textSecondary },

  stkListContent: { padding: 16, paddingBottom: 100 },

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

  finishedScrollContent: { flexGrow: 1, justifyContent: 'center' },
  finishedContainer: { alignItems: 'center', padding: 32, paddingBottom: 32 },
  finishedIconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  finishedTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  finishedSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  finishedSummary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    ...shadows.sm,
  },
  finishedBtn: { width: '100%', paddingVertical: 12 },

  // Detail Item Cards
  detailItemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: `${colors.textMuted}20`,
    ...shadows.sm,
  },
  detailItemCardScanned: {
    borderColor: `${colors.success}50`,
  },
  detailItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  detailItemTitleGroup: {
    marginLeft: 10,
    flex: 1,
  },
  detailItemPartNo: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detailItemPartNoScanned: {
    color: colors.success,
  },
  detailItemPddm: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  holdBadge: {
    backgroundColor: `${colors.primary}12`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  holdBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  scannedBadge: {
    backgroundColor: `${colors.success}18`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scannedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  scannedStkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${colors.textMuted}20`,
  },
  scannedStkLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginRight: 6,
  },
  scannedStkValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    ...shadows.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stkModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: `${colors.textMuted}15`,
  },
  stkModalItemNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stkModalItemPart: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  emptyStkText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});

export default PartRegisterScreen;
