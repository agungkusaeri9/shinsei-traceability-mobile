import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Package, CheckCircle2, ArrowDownToLine, Cpu } from 'lucide-react-native';
import { colors, shadows } from '../../../theme';
import { WarehouseSummaryData } from '../services/dashboardService';

interface Props {
  data: WarehouseSummaryData;
}

export const WarehouseSummaryWidget: React.FC<Props> = ({ data }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ringkasan Stok & Area Gudang</Text>

      {/* Primary Highlight Card */}
      <View style={styles.mainCard}>
        <View style={styles.mainCardHeader}>
          <View style={styles.mainIconBadge}>
            <Package color="#FFFFFF" size={22} />
          </View>
          <View style={styles.mainTextGroup}>
            <Text style={styles.mainLabel}>Total Part di Gudang</Text>
            <Text style={styles.mainValue}>
              {data.totalPartsInWarehouse.toLocaleString()} <Text style={styles.unitText}>STK</Text>
            </Text>
          </View>
        </View>
        <View style={styles.mainCardFooter}>
          <Text style={styles.footerLabel}>Total Kuantitas Part:</Text>
          <Text style={styles.footerValue}>{data.totalPartQuantity.toLocaleString()} Unit</Text>
        </View>
      </View>

      {/* Summary Grid */}
      <View style={styles.grid}>
        {/* Part Acceptance Ready */}
        <View style={[styles.gridCard, { borderLeftColor: colors.primary }]}>
          <View style={styles.cardHeader}>
            <CheckCircle2 color={colors.primary} size={18} />
            <Text style={styles.cardTitle}>Acceptance Ready</Text>
          </View>
          <Text style={styles.cardCount}>{data.totalPartAcceptanceReady} STK</Text>
          <Text style={styles.cardQty}>
            {data.totalPartAcceptanceReadyQuantity.toLocaleString()} unit ready
          </Text>
        </View>

        {/* Material Feeding */}
        <View style={[styles.gridCard, { borderLeftColor: colors.warning }]}>
          <View style={styles.cardHeader}>
            <Cpu color={colors.warning} size={18} />
            <Text style={styles.cardTitle}>Material Feeding</Text>
          </View>
          <Text style={styles.cardCount}>{data.totalMaterialFeeding} STK</Text>
          <Text style={styles.cardQty}>
            {data.totalMaterialFeedingQuantity.toLocaleString()} unit feeding
          </Text>
        </View>

        {/* Stock In */}
        <View style={[styles.gridCard, { borderLeftColor: colors.success }]}>
          <View style={styles.cardHeader}>
            <ArrowDownToLine color={colors.success} size={18} />
            <Text style={styles.cardTitle}>Part Stock In</Text>
          </View>
          <Text style={styles.cardCount}>{data.totalPartStockIn} STK</Text>
          <Text style={styles.cardQty}>
            {data.totalPartStockInQuantity.toLocaleString()} unit terproses
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  mainCard: {
    backgroundColor: '#0D1B2A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...shadows.md,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mainTextGroup: {
    flex: 1,
  },
  mainLabel: {
    fontSize: 12,
    color: '#9BAFCC',
    fontWeight: '600',
  },
  mainValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9BAFCC',
  },
  mainCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 12,
    paddingTop: 10,
  },
  footerLabel: {
    fontSize: 12,
    color: '#9BAFCC',
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4ADE80',
  },
  grid: {
    gap: 10,
  },
  gridCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardCount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 6,
  },
  cardQty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
