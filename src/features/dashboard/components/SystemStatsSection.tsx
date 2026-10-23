import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users, Building2, ShoppingCart, Package } from 'lucide-react-native';

import { colors } from '../../../theme';
import DashboardCard from './DashboardCard';
import { SuperAdminStatsSkeleton } from '../../../components/Skeleton';

type Props = {
  loading: boolean;
  totalUsers: number;
  totalAreas: number;
  totalOrders: number;
  totalStks: number;
};

const SystemStatsSection: React.FC<Props> = ({
  loading,
  totalUsers,
  totalAreas,
  totalOrders,
  totalStks,
}) => {
  if (loading) {
    return <SuperAdminStatsSkeleton />;
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Ringkasan Sistem</Text>
      <View style={styles.statsRow}>
        <DashboardCard
          title="Total User"
          value={totalUsers}
          color={colors.indigo}
          icon={<Users color={colors.indigo} size={20} />}
          style={styles.cardHalf}
        />
        <DashboardCard
          title="Area Aktif"
          value={totalAreas}
          color={colors.success}
          icon={<Building2 color={colors.success} size={20} />}
          style={styles.cardHalf}
        />
      </View>
      <View style={styles.statsRow}>
        <DashboardCard
          title="Total Order"
          value={totalOrders}
          color={colors.primary}
          icon={<ShoppingCart color={colors.primary} size={20} />}
          style={styles.cardHalf}
        />
        <DashboardCard
          title="Total STK"
          value={totalStks}
          color={colors.purple}
          icon={<Package color={colors.purple} size={20} />}
          style={styles.cardHalf}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardHalf: { flex: 1 },
});

export default SystemStatsSection;