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
import {
  searchOrderLots,
  fetchOrderByLotNumber,
  finishSmt,
} from '../services/smtService';
import { showSuccess, showError } from '../../../services/toastService';
import { getErrorMessage } from '../../../utils/errorMessage';
import type { OrderLotItem, SmtOrderData } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<SmtStackParamList, 'Finish'>;
};

const FinishScreen: React.FC<Props> = ({ navigation }) => {
  const [orderLots, setOrderLots] = useState<OrderLotItem[]>([]);
  const [loadingLots, setLoadingLots] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLotNumber, setSelectedLotNumber] = useState<string | null>(null);
  const [smtOrderData, setSmtOrderData] = useState<SmtOrderData | null>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const loadOrderLots = async () => {
    setLoadingLots(true);
    try {
      const data = await searchOrderLots('', 1, 20);
      setOrderLots(Array.isArray(data) ? data : []);
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal memuat data Order Lot'));
    } finally {
      setLoadingLots(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrderLots();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrderLots();
    setRefreshing(false);
  }, []);

  const dropdownOptions = orderLots.map(item => {
    const lot = item.lotNumber || String(item.id || '');
    const meta = [item.customerName, item.productName].filter(Boolean).join(' - ');
    return {
      id: lot,
      label: meta ? `${lot} (${meta})` : lot,
    };
  });

  const handleSelectLot = async (lotNumber: string) => {
    setSelectedLotNumber(lotNumber);
    setSmtOrderData(null);

    setLoadingOrderDetail(true);
    try {
      const response = await fetchOrderByLotNumber(lotNumber);
      if (response.status && response.data) {
        setSmtOrderData(response.data);
      } else {
        showError(response.message || 'Detail Order Lot tidak ditemukan');
        setSelectedLotNumber(null);
      }
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal mengambil detail Order Lot'));
      setSelectedLotNumber(null);
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  const handleClearLot = () => {
    setSelectedLotNumber(null);
    setSmtOrderData(null);
  };

  const handleSubmitFinish = async () => {
    if (!selectedLotNumber || !smtOrderData) {
      showError('Pilih Lot Number terlebih dahulu');
      return;
    }

    const payload = {
      lotNumber: selectedLotNumber,
      model: smtOrderData.product?.name || '',
      customer: smtOrderData.customer?.name || '',
    };

    setIsSubmitting(true);
    try {
      await finishSmt(payload);
      showSuccess(`Finish SMT Lot ${selectedLotNumber} berhasil`, 'SMT Finish');
      setIsSuccess(true);
    } catch (error: any) {
      showError(getErrorMessage(error, 'Gagal menyelesaikan proses SMT Finish'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSelectedLotNumber(null);
    setSmtOrderData(null);
    loadOrderLots();
  };

  const lineNames = smtOrderData?.details
    ? [...new Set(smtOrderData.details.map(d => d.line?.name).filter(Boolean))].join(', ')
    : 'N/A';

  const machineNames = smtOrderData?.details
    ? [...new Set(smtOrderData.details.map(d => d.machine?.name).filter(Boolean))].join(', ')
    : 'N/A';

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
              Lot Number {selectedLotNumber} berhasil di-finish
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
              text="Cari / pilih Lot Number untuk melakukan konfirmasi & finish SMT"
              bgColor={`${colors.primary}12`}
            />

            {loadingLots ? (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Memuat data Order Lot...</Text>
              </View>
            ) : (
              <SearchableDropdown
                options={dropdownOptions}
                selectedValue={selectedLotNumber || ''}
                onSelect={handleSelectLot}
                onClear={handleClearLot}
                label="Lot Number"
                placeholder="Cari atau pilih Lot Number..."
              />
            )}

            {loadingOrderDetail && (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Memuat detail Order Lot...</Text>
              </View>
            )}

            {smtOrderData && !loadingOrderDetail && selectedLotNumber && (
              <>
                <View style={styles.confirmationCard}>
                  <Text style={styles.cardTitle}>Konfirmasi Data Order Lot</Text>

                  <DetailRow label="Lot Number" value={selectedLotNumber} />
                  <DetailRow label="Customer" value={smtOrderData.customer?.name ?? '-'} />
                  <DetailRow label="Model" value={smtOrderData.product?.name ?? '-'} />
                  <DetailRow label="Face" value={smtOrderData.pcbModelFace ?? '-'} />
                  <DetailRow label="Line" value={lineNames || 'N/A'} />
                  <DetailRow label="Machine" value={machineNames || 'N/A'} />

                </View>
                <Button
                  title="Submit Finish SMT"
                  onPress={handleSubmitFinish}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                />
              </>
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
