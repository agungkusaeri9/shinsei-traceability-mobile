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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  ArrowUpFromLine,
  Factory,
  ScanBarcode,
  CheckCircle2,
  X,
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
import type { Order } from '../types';

// Components
import WarehouseHeader from '../components/WarehouseHeader';
import InfoBanner from '../components/InfoBanner';
import SearchableDropdown from '../components/SearchableDropdown';
import StkScanProgress from '../components/StkScanProgress';
import StkScanItem from '../components/StkScanItem';
import {
  fetchOrders,
  submitMaterialFeeding,
} from '../services/warehouseService';

type Props = {
  navigation: NativeStackNavigationProp<WarehouseStackParamList, 'StockOut'>;
};

type Step = 'select_wo' | 'confirm_wo' | 'scanning' | 'finished';

const StockOutScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);

  const [step, setStep] = useState<Step>('select_wo');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [scannedPartBatchIds, setScannedPartBatchIds] = useState<Set<number>>(
    new Set(),
  );
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
      const data = await fetchOrders({ status: 'created' });
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Gagal memuat data Order');
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
    label: `${o.orderNumber} - ${o.customer?.name ?? 'N/A'}`,
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
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  const handleFetchOrder = () => {
    if (!selectedOrder) {
      showError('Pilih Order terlebih dahulu');
      return;
    }
    if (!selectedOrder.orderItems || selectedOrder.orderItems.length === 0) {
      showError('Order ini tidak memiliki item STK');
      return;
    }
    setScannedPartBatchIds(new Set());
    setStep('confirm_wo');
  };

  // Get STK numbers from order items
  const stkNumbers =
    selectedOrder?.orderItems
      .map(item => item.partBatch?.stkNumber)
      .filter(Boolean) ?? [];

  const handleScanStk = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !selectedOrder) {
      focusScanner();
      return;
    }

    // Find matching order item by stkNumber
    const matchedItem = selectedOrder.orderItems.find(
      item => item.partBatch?.stkNumber === trimmed,
    );

    if (matchedItem) {
      if (scannedPartBatchIds.has(matchedItem.partBatch.id)) {
        showInfo(`${trimmed} sudah di-scan sebelumnya`);
      } else {
        const newScanned = new Set(scannedPartBatchIds);
        newScanned.add(matchedItem.partBatch.id);
        setScannedPartBatchIds(newScanned);
        showSuccess(`${trimmed} berhasil di-scan`);
      }
    } else {
      showError(`${trimmed} tidak terdaftar dalam Order ini`);
    }

    setStkInput('');
    focusScanner();
  };

  const handleSubmit = async () => {
    if (!selectedOrder) return;
    if (scannedPartBatchIds.size < stkNumbers.length) {
      showError(
        `Masih ada ${
          stkNumbers.length - scannedPartBatchIds.size
        } STK yang belum di-scan`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMaterialFeeding({
        orderId: selectedOrder.id,
        processedDate: new Date().toISOString(),
        materialFeedingItems: Array.from(scannedPartBatchIds).map(id => ({
          partBatchId: id,
        })),
      });
      showSuccess(
        `Stock Out ${selectedOrder.orderNumber} berhasil diproses`,
        'Stock Out Berhasil',
      );
      setStep('finished');
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Gagal stock out');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('select_wo');
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setScannedPartBatchIds(new Set());
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
            ? navigation.navigate('WarehouseHome')
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
                onPress={() => navigation.navigate('WarehouseHome')}
                style={styles.halfBtn}
              />
              <Button
                title="Cari"
                onPress={handleFetchOrder}
                disabled={!selectedOrder}
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
                label="Machine"
                value={selectedOrder.machine?.name ?? 'N/A'}
              />
              <DetailRow
                label="Line"
                value={selectedOrder.line?.name ?? 'N/A'}
              />
              <DetailRow
                label="PCB Model"
                value={selectedOrder.pcbModel?.name ?? 'N/A'}
              />
              <DetailRow label="Face" value={selectedOrder.pcbModelFace} />
              <DetailRow label="Lot Number" value={selectedOrder.lotNumber} />
              <DetailRow label="Total STK" value={String(stkNumbers.length)} />
            </View>

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
        {step === 'scanning' && selectedOrder && (
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
              scanned={scannedPartBatchIds.size}
              total={stkNumbers.length}
            />

            <FlatList
              data={stkNumbers}
              keyExtractor={item => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stkListContent}
              renderItem={({ item }) => {
                const matchedItem = selectedOrder.orderItems.find(
                  oi => oi.partBatch?.stkNumber === item,
                );
                const isScanned = matchedItem
                  ? scannedPartBatchIds.has(matchedItem.partBatch.id)
                  : false;
                return (
                  <StkScanItem
                    stkNumber={item}
                    isScanned={isScanned}
                    onPress={() => handleScanStk(item)}
                  />
                );
              }}
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
                title={`Finish (${scannedPartBatchIds.size}/${stkNumbers.length})`}
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
                  label="Total STK"
                  value={String(stkNumbers.length)}
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
  finishedBtn: { width: '100%', paddingVertical: 12 },
});

export default StockOutScreen;
