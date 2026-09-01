import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Activity, Check, Clock, ChevronRight } from 'lucide-react-native';
import { colors, shadows } from '../../../theme';
import {
  TrackingSummaryData,
  StkTrackingItem,
} from '../services/dashboardService';

interface Props {
  summary: TrackingSummaryData;
  stkList: StkTrackingItem[];
}

export const StkTrackingTableWidget: React.FC<Props> = ({
  summary,
  stkList,
}) => {
  return (
    <View style={styles.container}>
      {/* ── Summary Badges ── */}
      <Text style={styles.sectionTitle}>Monitoring Stage & Tracking STK</Text>

      <View style={styles.summaryBar}>
        <View style={styles.stageChip}>
          <Text style={styles.stageCount}>{summary.partAcceptanceCount}</Text>
          <Text style={styles.stageLabel}>Part Acceptance</Text>
        </View>
        <ChevronRight size={14} color={colors.textMuted} />
        <View style={styles.stageChip}>
          <Text style={styles.stageCount}>{summary.stockInCount}</Text>
          <Text style={styles.stageLabel}>Stock In</Text>
        </View>
        <ChevronRight size={14} color={colors.textMuted} />
        <View style={styles.stageChip}>
          <Text style={styles.stageCount}>{summary.materialFeedingCount}</Text>
          <Text style={styles.stageLabel}>Material Feeding</Text>
        </View>
      </View>

      {/* ── STK Tracking List ── */}
      <View style={styles.list}>
        {stkList.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.stkNum}>{item.stkNumber}</Text>
              <View style={styles.stageBadge}>
                <Activity size={12} color={colors.primary} />
                <Text style={styles.stageBadgeText}>{item.currentStage}</Text>
              </View>
            </View>

            <Text style={styles.partTitle}>{item.partName}</Text>
            <Text style={styles.partSubtitle}>
              {item.partCode} • {item.supplierName}
            </Text>

            {/* Timeline Progress Pills */}
            <View style={styles.timelineRow}>
              <View
                style={[
                  styles.timelinePill,
                  item.timelines.partAcceptance && styles.timelineDone,
                ]}
              >
                {item.timelines.partAcceptance ? (
                  <Check size={10} color="#FFF" />
                ) : (
                  <Clock size={10} color={colors.textMuted} />
                )}
                <Text
                  style={[
                    styles.timelinePillText,
                    item.timelines.partAcceptance && styles.timelineDoneText,
                  ]}
                >
                  Acceptance
                </Text>
              </View>

              <View
                style={[
                  styles.timelinePill,
                  item.timelines.stockIn && styles.timelineDone,
                ]}
              >
                {item.timelines.stockIn ? (
                  <Check size={10} color="#FFF" />
                ) : (
                  <Clock size={10} color={colors.textMuted} />
                )}
                <Text
                  style={[
                    styles.timelinePillText,
                    item.timelines.stockIn && styles.timelineDoneText,
                  ]}
                >
                  Stock In
                </Text>
              </View>

              <View
                style={[
                  styles.timelinePill,
                  item.timelines.materialFeeding && styles.timelineDone,
                ]}
              >
                {item.timelines.materialFeeding ? (
                  <Check size={10} color="#FFF" />
                ) : (
                  <Clock size={10} color={colors.textMuted} />
                )}
                <Text
                  style={[
                    styles.timelinePillText,
                    item.timelines.materialFeeding && styles.timelineDoneText,
                  ]}
                >
                  Feeding
                </Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.customerText}>Cust: {item.customerName}</Text>
              <Text style={styles.qtyText}>{item.quantity.toLocaleString()} pcs</Text>
            </View>
          </View>
        ))}
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
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    ...shadows.sm,
  },
  stageChip: {
    alignItems: 'center',
    flex: 1,
  },
  stageCount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  stageLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stkNum: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stageBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  partTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  partSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 10,
  },
  timelinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timelineDone: {
    backgroundColor: colors.success,
  },
  timelinePillText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  timelineDoneText: {
    color: '#FFF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  customerText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});
