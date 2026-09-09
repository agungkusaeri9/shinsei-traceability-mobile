import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Circle, MapPin } from 'lucide-react-native';
import { colors, shadows } from '../theme';

type Props = {
  stkNumber: string;
  isScanned: boolean;
  partNo?: string;
  pdd?: string;
  location?: string;
};

const StkScanItem: React.FC<Props> = ({
  stkNumber,
  isScanned,
  partNo,
  pdd,
  location,
}) => {
  return (
    <View style={[styles.item, isScanned && styles.itemScanned]}>
      {/* ── Header: Status + STK + Badge ── */}
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          {isScanned ? (
            <CheckCircle2 color={colors.success} size={18} />
          ) : (
            <Circle color={colors.textMuted} size={18} />
          )}
          <Text style={[styles.stkText, isScanned && styles.stkTextScanned]}>
            {stkNumber}
          </Text>
        </View>
        {isScanned && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Scanned</Text>
          </View>
        )}
      </View>

      {/* ── Sub info: PDDM, Part No, Location ── */}
      <View style={styles.metaRow}>
        {pdd ? (
          <View style={styles.metaChip}>
            <Text style={styles.metaLabel}>PDDM:</Text>
            <Text style={styles.metaVal}>{pdd}</Text>
          </View>
        ) : null}

        {partNo ? (
          <View style={styles.metaChip}>
            <Text style={styles.metaLabel}>Part:</Text>
            <Text style={styles.metaVal} numberOfLines={1}>
              {partNo}
            </Text>
          </View>
        ) : null}

        {location ? (
          <View style={[styles.metaChip, styles.locChip]}>
            <MapPin size={11} color={colors.primary} style={{ marginRight: 2 }} />
            <Text style={styles.locText} numberOfLines={1}>
              {location}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: `${colors.textMuted}25`,
    ...shadows.sm,
  },
  itemScanned: {
    borderColor: `${colors.success}50`,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  stkText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  stkTextScanned: {
    color: colors.success,
  },
  badge: {
    backgroundColor: `${colors.success}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${colors.textMuted}15`,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.textMuted}10`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginRight: 3,
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  locChip: {
    backgroundColor: `${colors.primary}12`,
  },
  locText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default StkScanItem;
