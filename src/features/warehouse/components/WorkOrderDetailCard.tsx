import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScanBarcode } from 'lucide-react-native';
import { colors, shadows } from '../../../theme';
import type { WorkOrderDetail } from '../types';

type Props = {
  woId: string;
  detail: WorkOrderDetail;
};

const WorkOrderDetailCard: React.FC<Props> = ({ woId, detail }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{woId}</Text>

      <DetailRow label="Machine" value={detail.machine} />
      <DetailRow label="Customer" value={detail.customer} />
      <DetailRow label="Models" value={detail.models} />
      <DetailRow label="Face" value={detail.face} />
      <DetailRow label="Line" value={detail.line} />
      <DetailRow label="Date" value={detail.date} />

      <View style={styles.stkCountBadge}>
        <ScanBarcode color={colors.primary} size={16} />
        <Text style={styles.stkCountText}>
          {detail.stkNumbers.length} STK Number perlu di-scan
        </Text>
      </View>
    </View>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${colors.orange}30`,
    ...shadows.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textMuted}10`,
  },
  label: { fontSize: 13, color: colors.textSecondary },
  value: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  stkCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${colors.primary}12`,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  stkCountText: { fontSize: 13, fontWeight: '600', color: colors.primary },
});

export default WorkOrderDetailCard;
