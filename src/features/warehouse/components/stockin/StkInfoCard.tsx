import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, shadows } from '../../../../theme';
import DetailRow from '../../../../components/DetailRow';
import type { StkData } from '../../types';

type Props = {
  stkData: StkData;
};

/** "Informasi STK" summary card used in Stock In step 2 and step 3. */
const StkInfoCard: React.FC<Props> = ({ stkData }) => (
  <View style={styles.detailCard}>
    <Text style={styles.cardHeaderTitle}>Informasi STK</Text>
    <DetailRow label="STK Number" value={stkData.stkNumber} />
    <DetailRow label="Status" value={stkData.status} />
    <DetailRow label="Quantity" value={String(stkData.quantity)} />
    {stkData.lotNumber && (
      <DetailRow label="Lot Number" value={stkData.lotNumber} />
    )}
    {stkData.part && (
      <>
        <DetailRow label="Part Number" value={stkData.part.partNumber} />
        <DetailRow label="Part Name" value={stkData.part.partName} />
        <DetailRow label="Inventory Code" value={stkData.part.inventoryCode} />
      </>
    )}
  </View>
);

const styles = StyleSheet.create({
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textMuted}15`,
    paddingBottom: 6,
  },
});

export default StkInfoCard;
