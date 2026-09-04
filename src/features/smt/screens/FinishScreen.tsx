import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { CheckCircle2, Factory } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { SmtStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import SmtHeader from '../components/SmtHeader';
import Button from '../../../components/Button';
import SearchableDropdown from '../../warehouse/components/SearchableDropdown';
import InfoBanner from '../../warehouse/components/InfoBanner';
import { fetchSubmittedOrders, finishSmt } from '../services/smtService';
import { showSuccess, showError } from '../../../services/toastService';
import type { Order } from '../../warehouse/types';

type Props = {
  navigation: NativeStackNavigationProp<SmtStackParamList, 'Finish'>;
};

const FinishScreen: React.FC<Props> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const loadSubmittedOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchSubmittedOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Gagal memuat data Order');
    } finally {
      setLoadingOrders(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSubmittedOrders();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSubmittedOrders();
    setRefreshing(false);
  }, []);

  const orderDropdownOptions = orders.map(o => ({
    id: String(o.id),
    label: `${o.orderNumber} - ${o.customer?.name ?? 'N/A'} (Lot: ${o.lotNumber})`,
  }));

  const handleSelectOrder = (id: string) => {
    const orderId = Number(id);
    setSelectedOrderId(orderId);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  const handleClearOrder = () => {
    setSelectedOrderId(null);
    setSelectedOrder(null);
  };

  const handleSubmitFinish = async () => {
    if (!selectedOrder) {
      showError('Pilih Order terlebih dahulu');
      return;
    }

    const payload = {
      lotNumber: selectedOrder.lotNumber || '',
      ip: selectedOrder.line?.name || selectedOrder.machine?.name || '',
      model: selectedOrder.pcbModel?.name || '',
      customer: selectedOrder.customer?.name || '',
    };

    setIsSubmitting(true);
    try {
      await finishSmt(payload);
      showSuccess(`Finish SMT ${selectedOrder.orderNumber} berhasil`, 'SMT Finish');
      setIsSuccess(true);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Gagal menyelesaikan proses SMT Finish');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSelectedOrderId(null);
    setSelectedOrder(null);
    loadSubmittedOrders();
  };

  return (
    <View style={styles.container}>
      <SmtHeader
        title="SMT Finish"
        subtitle="Konfirmasi & Selesaikan Proses SMT"
        icon={<CheckCircle2 color={colors.success} size={18} />}
        iconBgColor={`${colors.success}25`}
        onBack={() =>
          navigation.canGoBack()
            ? navigation.goBack()
            : navigation.navigate('SmtDashboard' as any)
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {isSuccess ? (
          <View style={styles.finishedContainer}>
            <View style={styles.finishedIconBadge}>
              <CheckCircle2 color={colors.success} size={64} />
            </View>
            <Text style={styles.finishedTitle}>SMT Finish Selesai!</Text>
            <Text style={styles.finishedSubtitle}>
              Order {selectedOrder?.orderNumber} berhasil di-finish
            </Text>

            <Button
              title="Proses Order Lain"
              onPress={handleReset}
              style={styles.finishedBtn}
            />
          </View>
        ) : (
          <>
            <InfoBanner
              icon={<Factory color={colors.primary} size={20} />}
              text="Pilih Order dengan status submitted untuk melakukan konfirmasi & finish SMT"
              bgColor={`${colors.primary}12`}
            />

            {loadingOrders ? (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Memuat data Order submitted...</Text>
              </View>
            ) : (
              <SearchableDropdown
                options={orderDropdownOptions}
                selectedValue={selectedOrderId ? String(selectedOrderId) : ''}
                onSelect={handleSelectOrder}
                onClear={handleClearOrder}
                label="Order (Submitted)"
                placeholder="Cari atau pilih Order..."
              />
            )}

            {selectedOrder && (
              <View style={styles.confirmationCard}>
                <Text style={styles.cardTitle}>Konfirmasi Data Order</Text>
                
                <DetailRow label="Order Number" value={selectedOrder.orderNumber} />
                <DetailRow label="PO Number" value={selectedOrder.poNumber} />
                <DetailRow label="Lot Number" value={selectedOrder.lotNumber} />
                <DetailRow label="Customer" value={selectedOrder.customer?.name ?? '-'} />
                <DetailRow label="Model" value={selectedOrder.pcbModel?.name ?? '-'} />
                <DetailRow label="Face" value={selectedOrder.pcbModelFace ?? '-'} />
                <DetailRow
                  label="IP / Line"
                  value={selectedOrder.line?.name ?? selectedOrder.machine?.name ?? '-'}
                />

                <Button
                  title="Submit Finish SMT"
                  onPress={handleSubmitFinish}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  scrollContent: { padding: 20, paddingBottom: 40 },
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
  confirmationCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textMuted}20`,
    paddingBottom: 8,
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
  submitBtn: {
    marginTop: 20,
    paddingVertical: 12,
  },
  finishedContainer: { alignItems: 'center', padding: 32, paddingTop: 60 },
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
  finishedBtn: { width: '100%', paddingVertical: 12 },
});

export default FinishScreen;
