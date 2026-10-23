import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';

import { colors, shadows } from '../../../theme';
import type { SmtOrderData, OrderLotProduct } from '../../smt/types';

type LotInfoRowProps = {
  label: string;
  value?: string | null;
};

const LotInfoRow: React.FC<LotInfoRowProps> = ({ label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.lotRow}>
      <Text style={styles.lotLabel}>{label}</Text>
      <Text style={styles.lotValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
};

type Props = {
  lotInfo?: SmtOrderData | null;
  lotProducts?: OrderLotProduct[] | null;
};

/**
 * Kartu "Keterangan Lot" — hasil cek GET /api/orderlots/{lot_number} atau GET /api/orders/lot.
 * Dipakai bersama oleh QA Register & QA Finish.
 */
const LotInfoCard: React.FC<Props> = ({ lotInfo, lotProducts }) => {
  if (lotProducts && lotProducts.length > 0) {
    const firstProduct = lotProducts[0];
    const customerName = firstProduct.customerName || 'N/A';

    return (
      <View style={styles.lotCard}>
        <View style={styles.lotCardHeader}>
          <Info color={colors.indigo} size={16} />
          <Text style={styles.lotCardTitle}>Keterangan Lot</Text>
        </View>

        <LotInfoRow label="Customer" value={customerName} />
        <LotInfoRow label="Jumlah Produk" value={String(lotProducts.length)} />
        {lotProducts.map((prod, index) => (
          <LotInfoRow
            key={`lot-prod-${prod.id || index}`}
            label={`Produk ${index + 1}`}
            value={`${prod.name}${prod.code ? ` (${prod.code})` : ''}`}
          />
        ))}
      </View>
    );
  }

  if (!lotInfo) return null;

  return (
    <View style={styles.lotCard}>
      <View style={styles.lotCardHeader}>
        <Info color={colors.indigo} size={16} />
        <Text style={styles.lotCardTitle}>Keterangan Lot</Text>
      </View>

      <LotInfoRow label="Customer" value={lotInfo.customer?.name} />
      <LotInfoRow label="Product" value={lotInfo.product?.name} />
      <LotInfoRow label="PCB Model Face" value={lotInfo.pcbModelFace} />

      {lotInfo.details && lotInfo.details.length > 0 ? (
        <>
          <LotInfoRow
            label="Jumlah Detail"
            value={String(lotInfo.details.length)}
          />
          {lotInfo.details.map((detail, index) => (
            <LotInfoRow
              key={`lot-detail-${index}`}
              label={`Detail ${index + 1}`}
              value={[
                detail.line?.name,
                detail.machine?.name,
                detail.inventoryCode,
              ]
                .filter(Boolean)
                .join(' - ')}
            />
          ))}
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  lotCard: {
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
    ...shadows.sm,
  },
  lotCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  lotCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.indigo,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  lotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 5,
  },
  lotLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  lotValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
  },
});

export default LotInfoCard;