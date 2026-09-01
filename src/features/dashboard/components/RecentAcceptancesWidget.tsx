import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PackageCheck, MapPin, Calendar, Building2 } from 'lucide-react-native';
import { colors, shadows } from '../../../theme';
import { RecentAcceptanceItem } from '../services/dashboardService';

interface Props {
  data: RecentAcceptanceItem[];
}

export const RecentAcceptancesWidget: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Penerimaan Part Terkini (Recent Acceptances)</Text>
      <View style={styles.list}>
        {data.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeStk}>
                <PackageCheck size={14} color={colors.primary} />
                <Text style={styles.stkText}>{item.stkNumber}</Text>
              </View>
              <View style={styles.badgeStatus}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.partName}>{item.partName}</Text>
            <Text style={styles.partCode}>{item.partCode}</Text>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Building2 size={13} color={colors.textMuted} />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.supplierName}
                </Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <View style={styles.detailItem}>
                <MapPin size={13} color={colors.primary} />
                <Text style={styles.locationText}>Lokasi: {item.rackLocation}</Text>
              </View>

              <View style={styles.detailItem}>
                <Calendar size={13} color={colors.textMuted} />
                <Text style={styles.dateText}>{formatDate(item.receivedDate)}</Text>
              </View>

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
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeStk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  badgeStatus: {
    backgroundColor: `${colors.success}20`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  partName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  partCode: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});
