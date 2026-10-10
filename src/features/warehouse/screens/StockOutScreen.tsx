import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  ArrowUpFromLine,
  Factory,
  ScanBarcode,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { WarehouseStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import Button from '../../../components/Button';
import {
  showSuccess,
  showError,
  showInfo,
} from '../../../services/toastService';
import type { Order, OrderSummary, AvailablePart, MissingPart } from '../types';

// Components
import WarehouseHeader from '../components/WarehouseHeader';
import InfoBanner from '../components/InfoBanner';
import SearchableDropdown from '../components/SearchableDropdown';
import StkScanProgress from '../components/StkScanProgress';
import StkScanItem from '../../../components/StkScanItem';
import {
  fetchOrders,
  fetchOrderById,
  submitMaterialFeeding,
} from '../services/warehouseService';
import { extractStkNumber } from '../../../utils/barcode';
import { getErrorMessage } from '../../../utils/errorMessage';

type Props = {
  navigation: NativeStackNavigationProp<WarehouseStackParamList, 'StockOut'>;
};

type Step = 'select_wo' | 'confirm_wo' | 'scanning' | 'finished';

const StockOutScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);
  const inputValueRef = useRef('');
  const flatListRef = useRef<FlatList>(null);

  const [step, setStep] = useState<Step>('select_wo');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [scannedStkNumbers, setScannedStkNumbers] = useState<Set<string>>(new Set());
  const [scannedPartIds, setScannedPartIds] = useState<number[]>([]);
  const [stkInput, setStkInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refetch orders when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (step === 'select_wo') {
        loadOrders();
      }
    }, [step]),
  );

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const [createdOrders, partialOrders] = await Promise.all([
        fetchOrders({ status: 'created' }),
        fetchOrders({ status: 'partial' }),
      ]);
      const list1 = Array.isArray(createdOrders) ? createdOrders : [];
      const list2 = Array.isArray(partialOrders) ? partialOrders : [];
      const combinedMap = new Map();
      [...list1, ...list2].forEach(o => combinedMap.set(o.id, o));
      setOrders(Array.from(combinedMap.values()));
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal memuat data Order'));
    } finally {
      setLoadingOrders(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, []);

  // Build dropdown options from orders
  const orderDropdownOptions = orders.map(o => ({
    id: String(o.id),
    label: `${o.orderNumber} - ${o.customerName ?? 'N/A'}`,
  }));

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

  const handleSelectOrder = (id: string) => {
    const orderId = Number(id);
    setSelectedOrderId(orderId);
    setSelectedOrder(null); // Reset, will be fetched on "Cari"
  };

  const handleFetchOrder = async () => {
    if (!selectedOrderId) {
      showError('Pilih Order terlebih dahulu');
      return;
    }

    setLoadingOrderDetail(true);
    try {
      const order = await fetchOrderById(selectedOrderId);
      // Order tanpa part tersedia tetap bisa dibuka —
      // daftar missing part ditampilkan di step konfirmasi
      setSelectedOrder(order);
      setScannedStkNumbers(new Set());
      setStep('confirm_wo');
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal memuat detail Order'));
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  // Sort available parts: unscanned first, scanned last
  const sortedAvailableParts = useMemo(() => {
    if (!selectedOrder?.availableParts) return [];
    const scanned: AvailablePart[] = [];
    const unscanned: AvailablePart[] = [];
    for (const part of selectedOrder.availableParts) {
      if (scannedStkNumbers.has(part.stkNumber)) {
        scanned.push(part);
      } else {
        unscanned.push(part);
      }
    }
    return [...unscanned, ...scanned];
  }, [selectedOrder?.availableParts, scannedStkNumbers]);

  const availableCount = selectedOrder?.availableParts?.length ?? 0;
  const missingParts = selectedOrder?.missingParts ?? [];

  const handleScanStk = (value: string) => {
    const trimmed = extractStkNumber(value);
    if (!trimmed || !selectedOrder) {
      focusScanner();
      return;
    }

    const matchedPart = selectedOrder.availableParts.find(
      p => p.stkNumber?.trim().toLowerCase() === trimmed.toLowerCase(),
    );

    if (matchedPart) {
      if (scannedStkNumbers.has(matchedPart.stkNumber)) {
        showInfo(`${matchedPart.stkNumber} sudah di-scan sebelumnya`);
      } else {
        setScannedStkNumbers(prev => new Set(prev).add(matchedPart.stkNumber));
        setScannedPartIds(prev => [...prev, matchedPart.partId]);
        showSuccess(`${matchedPart.stkNumber} berhasil di-scan`);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    } else {
      const isMissing = selectedOrder.missingParts?.some(
        p => p.partNumber?.trim().toLowerCase() === trimmed.toLowerCase(),
      );
      if (isMissing) {
        showError(`${trimmed} belum tersedia di gudang`);
      } else {
        showError(`${trimmed} tidak terdaftar dalam Order ini`);
      }
    }

    setStkInput('');
    focusScanner();
  };

  const handleSubmit = async () => {
    if (!selectedOrder) return;
    if (scannedStkNumbers.size === 0) {
      showError('Belum ada STK yang di-scan');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMaterialFeeding({
        orderId: selectedOrder.id,
        processedDate: new Date().toISOString(),
        materialFeedingItems: scannedPartIds.map(id => ({ partBatchId: id })),
      });
      showSuccess(
        `Stock Out ${selectedOrder.orderNumber} berhasil diproses`,
        'Stock Out Berhasil',
      );
      setStep('finished');
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal memproses Stock Out'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    inputValueRef.current = '';
    setStep('select_wo');
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setScannedStkNumbers(new Set());
    setScannedPartIds([]);
    setStkInput('');
  };

  const headerSubtitle =
    step === 'select_wo'
      ? 'Pilih Order'
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
            ? navigation.goBack()
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
        {/* ── Step 1: Select Order ──────────────────────── */}
        {step === 'select_wo' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.orange]}
                tintColor={colors.orange}
              />
            }
          >
            <InfoBanner
              icon={<Factory color={colors.orange} size={20} />}
              text="Pilih Order untuk memulai proses stock out"
              bgColor={`${colors.orange}12`}
            />

            {loadingOrders ? (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Memuat data Order...</Text>
              </View>
            ) : (
              <SearchableDropdown
                options={orderDropdownOptions}
                selectedValue={selectedOrderId ? String(selectedOrderId) : ''}
                onSelect={handleSelectOrder}
                onClear={() => {
                  setSelectedOrderId(null);
                  setSelectedOrder(null);
                }}
                label="Order"
                placeholder="Cari atau pilih Order..."
              />
            )}

            <View style={styles.buttonRow}>
              <Button
                title="Batal"
                variant="outline"
                onPress={() => navigation.goBack()}
                style={styles.halfBtn}
              />
              <Button
                title="Cari"
                onPress={handleFetchOrder}
                isLoading={loadingOrderDetail}
                disabled={!selectedOrderId || loadingOrderDetail}
                style={styles.halfBtn}
              />
            </View>
          </ScrollView>
        )}

        {/* ── Step 2: Confirm Order ─────────────────────── */}
        {step === 'confirm_wo' && selectedOrder && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <InfoBanner
              icon={<Factory color={colors.orange} size={20} />}
              text="Pastikan data Order sudah benar sebelum memulai scan"
              bgColor={`${colors.orange}12`}
            />

            {/* Order Detail Card */}
            <View style={styles.detailCard}>
              <DetailRow
                label="Order Number"
                value={selectedOrder.orderNumber}
              />
              <DetailRow label="PO Number" value={selectedOrder.poNumber} />
              <DetailRow
                label="Customer"
                value={selectedOrder.customer?.name ?? 'N/A'}
              />
              <DetailRow
                label="Model"
                value={selectedOrder.product?.name ?? 'N/A'}
              />
              <DetailRow label="Lot Number" value={selectedOrder.lotNumber} />
              <DetailRow
                label="STK Tersedia"
                value={String(selectedOrder.availableParts?.length ?? 0)}
              />
              <DetailRow
                label="STK Belum Tersedia"
                value={String(selectedOrder.missingParts?.length ?? 0)}
              />
            </View>

            {availableCount === 0 && (
              <View style={styles.missingBanner}>
                <AlertCircle color={colors.warning ?? '#F59E0B'} size={16} />
                <Text style={styles.missingBannerText}>
                  Tidak ada STK yang tersedia — berikut part yang belum tersedia
                  di gudang
                </Text>
              </View>
            )}

            <MissingPartsList parts={missingParts} />

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
                disabled={availableCount === 0}
                style={styles.halfBtn}
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* ── Step 3: Scanning ───────────────────────────── */}
        {step === 'scanning' && selectedOrder && (
          <View style={{ flex: 1 }}>
            <TextInput
              ref={barcodeRef}
              value={stkInput}
              onChangeText={(text) => { inputValueRef.current = text; setStkInput(text); }}
              autoFocus
              showSoftInputOnFocus={false}
              blurOnSubmit={false}
              returnKeyType="done"
              onSubmitEditing={() => { const value = inputValueRef.current; inputValueRef.current = ''; handleScanStk(value); }}
              onBlur={() => setTimeout(focusScanner, 100)}
              style={styles.hiddenInput}
            />

            <StkScanProgress
              scanned={scannedStkNumbers.size}
              total={availableCount}
            />

            <FlatList
              ref={flatListRef}
              data={sortedAvailableParts}
              keyExtractor={item => item.stkNumber}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stkListContent}
              renderItem={({ item }) => {
                const isScanned = scannedStkNumbers.has(item.stkNumber);
                return (
                  <StkScanItem
                    stkNumber={item.stkNumber}
                    isScanned={isScanned}
                    partNo={item.partNumber}
                  />
                );
              }}
              ListHeaderComponent={
                <>
                  <View style={styles.scanHint}>
                    <ScanBarcode color={colors.primary} size={18} />
                    <Text style={styles.scanHintText}>
                      Scan barcode STK untuk memproses order
                    </Text>
                  </View>
                  {missingParts.length > 0 && (
                    <View style={styles.missingBanner}>
                      <AlertCircle color={colors.warning ?? '#F59E0B'} size={16} />
                      <Text style={styles.missingBannerText}>
                        {missingParts.length} part belum tersedia di gudang
                      </Text>
                    </View>
                  )}
                </>
              }
              ListFooterComponent={<MissingPartsList parts={missingParts} />}
            />

            <View style={styles.bottomBar}>
              <Button
                title="Batal"
                variant="outline"
                onPress={handleReset}
                style={styles.bottomBtn}
              />
              <Button
                title={`Finish (${scannedStkNumbers.size}/${availableCount})`}
                onPress={handleSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                style={styles.bottomBtn}
              />
            </View>
          </View>
        )}

        {/* ── Step 4: Finished ───────────────────────────── */}
        {step === 'finished' && selectedOrder && (
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
                Semua STK Number untuk {selectedOrder.orderNumber} berhasil
                di-scan
              </Text>

              <View style={styles.finishedSummary}>
                <DetailRow
                  label="Order Number"
                  value={selectedOrder.orderNumber}
                />
                <DetailRow
                  label="Customer"
                  value={selectedOrder.customer?.name ?? 'N/A'}
                />
                <DetailRow
                  label="Total STK Diproses"
                  value={String(scannedStkNumbers.size)}
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

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const MissingPartsList = ({ parts }: { parts: MissingPart[] }) => {
  if (parts.length === 0) return null;
  return (
    <View style={styles.missingSection}>
      <Text style={styles.missingSectionTitle}>Part Belum Tersedia</Text>
      {parts.map((p, i) => (
        <View key={`missing-${i}`} style={styles.missingItem}>
          <AlertCircle color={colors.warning ?? '#F59E0B'} size={14} />
          <View style={{ flex: 1 }}>
            <Text style={styles.missingPartNumber}>{p.partNumber}</Text>
            <Text style={styles.missingPartCount}>Qty kurang: {p.stkCount}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  halfBtn: { flex: 1, paddingVertical: 12 },
  loadingField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
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
    flexDirection: 'column',
    paddingVertical: 6,
  },
  detailLabel: { fontSize: 13, color: colors.textSecondary },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
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
  stkListContent: { padding: 20, paddingBottom: 100 },

  // Missing parts
  missingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C715',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F59E0B30',
  },
  missingBannerText: { fontSize: 12, color: '#B45309', flex: 1 },
  missingSection: {
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#FEF3C710',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F59E0B20',
  },
  missingSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  missingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B15',
  },
  missingPartNumber: { fontSize: 13, fontWeight: '600', color: '#92400E' },
  missingPartCount: { fontSize: 11, color: '#B45309', marginTop: 2 },

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

export default StockOutScreen;
