import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors, shadows } from '../../../theme';
import { StkByAreaItem } from '../services/dashboardService';

interface Props {
  data: StkByAreaItem[];
}

export const StkByAreaWidget: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Distribusi STK Berdasarkan Area</Text>
      <View style={styles.card}>
        {data.map((item, idx) => (
          <View key={item.areaId} style={[styles.itemRow, idx < data.length - 1 && styles.borderBottom]}>
            <View style={styles.topRow}>
              <View style={styles.areaInfo}>
                <MapPin size={16} color={colors.primary} />
                <Text style={styles.areaName}>{item.areaName}</Text>
              </View>
              <Text style={styles.stkCount}>
                {item.stkCount} <Text style={styles.unitText}>STK ({item.percentage}%)</Text>
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.max(item.percentage, 4)}%` },
                ]}
              />
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    ...shadows.sm,
  },
  itemRow: {
    paddingVertical: 10,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  areaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  areaName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stkCount: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});
