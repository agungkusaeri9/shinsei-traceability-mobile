import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Factory, AlertCircle } from 'lucide-react-native';
import { colors, shadows } from '../../../../theme';
import Button from '../../../../components/Button';
import DetailRow from '../../../../components/DetailRow';
import InfoBanner from '../InfoBanner';
import MissingPartsList from './MissingPartsList';
import type { Order, MissingPart } from '../../types';

type Props = {
  order: Order;
  availableCount: number;
  missingParts: MissingPart[];
  onBack: () => void;
  onStartScan: () => void;
};

/** Stock Out step 2: review Work Order detail before scanning. */
const StockOutConfirmOrder: React.FC<Props> = ({
  order,
  availableCount,
  missingParts,
  onBack,
  onStartScan,
}) => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
    keyboardShouldPersistTaps="handled">
    <InfoBanner
      icon={<Factory color={colors.orange} size={20} />}
      text="Pastikan data Order sudah benar sebelum memulai scan"
      bgColor={`${colors.orange}12`}
    />

    {/* Order Detail Card */}
    <View style={styles.detailCard}>
      <DetailRow layout="column" label="Order Number" value={order.orderNumber} />
      <DetailRow layout="column" label="PO Number" value={order.poNumber} />
      <DetailRow layout="column" label="Customer" value={order.customer?.name ?? 'N/A'} />
      <DetailRow layout="column" label="Model" value={order.product?.name ?? 'N/A'} />
      <DetailRow layout="column" label="Lot Number" value={order.lotNumber} />
      <DetailRow layout="column" label="STK Tersedia" value={String(order.availableParts?.length ?? 0)} />
      <DetailRow layout="column" label="STK Belum Tersedia" value={String(order.missingParts?.length ?? 0)} />
    </View>

    {availableCount === 0 && (
      <View style={styles.missingBanner}>
        <AlertCircle color={colors.warning ?? '#F59E0B'} size={16} />
        <Text style={styles.missingBannerText}>
          Tidak ada STK yang tersedia — berikut part yang belum tersedia di
          gudang
        </Text>
      </View>
    )}

    <MissingPartsList parts={missingParts} />

    <View style={styles.buttonRow}>
      <Button
        title="Kembali"
        variant="outline"
        onPress={onBack}
        style={styles.halfBtn}
      />
      <Button
        title="Proses"
        onPress={onStartScan}
        disabled={availableCount === 0}
        style={styles.halfBtn}
      />
    </View>

    <View style={{ height: 40 }} />
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 40 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  halfBtn: { flex: 1, paddingVertical: 12 },
  // Detail Card
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
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
});

export default StockOutConfirmOrder;
