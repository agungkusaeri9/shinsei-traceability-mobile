import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, shadows } from '../../../theme';
import type { RegisteredPart } from '../types';

type Props = {
  data: RegisteredPart;
};

const RegisteredPartSummary: React.FC<Props> = ({ data }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Data Part Terdaftar</Text>
      <SummaryRow label="Part Number" value={data.partNumber} />
      <SummaryRow label="Lot Number" value={data.lotNumber} />
      <SummaryRow label="Qty" value={data.qty} />
      <SummaryRow label="Supplier" value={data.supplier} />
    </View>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    ...shadows.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: { fontSize: 13, color: colors.textSecondary },
  value: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
});

export default RegisteredPartSummary;
