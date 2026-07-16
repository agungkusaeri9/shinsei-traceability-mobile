import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  TrendingUp,
  ClipboardList,
} from 'lucide-react-native';

import { colors } from '../../../theme';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCard from '../components/DashboardCard';
import QuickActionCard from '../components/QuickActionCard';
import ActivityItem, { Activity } from '../components/ActivityItem';

type Props = {
  navigation: any;
  showCustomHeader?: boolean;
};

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Stock In #IN-2024-001',
    description: 'Bearing Assembly A-100 masuk (120 unit)',
    time: '10 menit lalu',
    type: 'shipment',
  },
  {
    id: '2',
    title: 'Stok Menipis',
    description: 'Sensor Proximity M-22 di bawah threshold',
    time: '1 jam lalu',
    type: 'alert',
  },
  {
    id: '3',
    title: 'Stock Out #OUT-2024-014',
    description: 'Sensor Proximity M-22 keluar (35 unit)',
    time: '45 menit lalu',
    type: 'order',
  },
  {
    id: '4',
    title: 'Stock In Selesai',
    description: 'Cable Harness V2 diterima (200 unit)',
    time: '2 jam lalu',
    type: 'done',
  },
];

/**
 * Navigate to a warehouse screen.
 * Works with both BottomTab (Warehouse tab) and AreaStack navigation.
 */
const navigateToWarehouseScreen = (navigation: any, screen: string) => {
  // Try AreaStack navigation first (direct navigate)
  // If coming from AreaStack, the screens are direct children
  if (typeof navigation.navigate === 'function') {
    navigation.navigate(screen);
  }
};

const WarehouseDashboard: React.FC<Props> = ({
  navigation,
  showCustomHeader = false,
}) => {
  const renderHeader = () => (
    <View>
      {/* ── Warehouse Stats ────────────────────────────── */}
      <Text style={styles.sectionTitle}>Ringkasan Gudang</Text>
      <View style={styles.statsRow}>
        <DashboardCard
          title="Total Stok"
          value="1.2K"
          color={colors.primary}
          icon={<Package color={colors.primary} size={20} />}
          style={styles.cardHalf}
        />
        <DashboardCard
          title="Stok Menipis"
          value="8"
          color={colors.warning}
          icon={<AlertTriangle color={colors.warning} size={20} />}
          style={styles.cardHalf}
        />
      </View>
      <View style={styles.statsRow}>
        <DashboardCard
          title="Masuk Hari Ini"
          value="340"
          color={colors.success}
          icon={<ArrowDownToLine color={colors.success} size={20} />}
          style={styles.cardHalf}
        />
        <DashboardCard
          title="Keluar Hari Ini"
          value="53"
          color={colors.orange}
          icon={<ArrowUpFromLine color={colors.orange} size={20} />}
          style={styles.cardHalf}
        />
      </View>

      {/* ── Quick Actions ────────────────────────────── */}
      <Text style={[styles.sectionTitle, styles.sectionGap]}>
        Quick Actions
      </Text>
      <View style={styles.statsRow}>
        <QuickActionCard
          title="Register Part"
          color={colors.primary}
          icon={<ClipboardList color={colors.primary} size={22} />}
          onPress={() => navigateToWarehouseScreen(navigation, 'Register')}
        />
        <QuickActionCard
          title="Stock In"
          color={colors.success}
          icon={<ArrowDownToLine color={colors.success} size={22} />}
          onPress={() => navigateToWarehouseScreen(navigation, 'StockIn')}
        />
      </View>
      <View style={styles.statsRow}>
        <QuickActionCard
          title="Stock Out"
          color={colors.orange}
          icon={<ArrowUpFromLine color={colors.orange} size={22} />}
          onPress={() => navigateToWarehouseScreen(navigation, 'StockOut')}
        />
        {!showCustomHeader && (
          <QuickActionCard
            title="Profile"
            color={colors.purple}
            icon={<TrendingUp color={colors.purple} size={22} />}
            onPress={() => navigation.navigate('Profile')}
          />
        )}
      </View>

      {/* ── Recent Activity ──────────────────────────── */}
      <Text style={[styles.sectionTitle, styles.sectionGap]}>
        Aktivitas Terkini
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {!showCustomHeader && (
        <DashboardHeader
          variant="warehouse"
          onProfilePress={() => navigation.navigate('Profile')}
        />
      )}

      <FlatList
        data={mockActivities}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ActivityItem activity={item} />}
        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionGap: { marginTop: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardHalf: { flex: 1 },
  separator: { height: 12 },
});

export default WarehouseDashboard;
