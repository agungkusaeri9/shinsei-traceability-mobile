import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { PackageSearch } from 'lucide-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppTabParamList } from '../../../types';
import { colors } from '../../../theme';
import DashboardHeader from '../components/DashboardHeader';
import QuickActionCard from '../components/QuickActionCard';
import SystemStatsSection from '../components/SystemStatsSection';
import {
  getTrackingSummary,
  getStkTrackingTable,
  getWarehouseSummary,
  getStkByArea,
  getTotalUsers,
  getTotalAreas,
  getTotalOrders,
  getTotalStks,
} from '../services/dashboardService';
import type {
  StkByAreaItem,
  StkTrackingItem,
  TrackingSummaryData,
  WarehouseSummaryData,
} from '../types';
import { WarehouseSummaryWidget } from '../components/WarehouseSummaryWidget';
import { StkTrackingTableWidget } from '../components/StkTrackingTableWidget';
import { StkByAreaWidget } from '../components/StkByAreaWidget';
import { navigateToCheckStk } from '../../../navigation/navigationHelpers';

type Props = {
  navigation: BottomTabNavigationProp<AppTabParamList, 'Dashboard'>;
};

const SuperAdminDashboard: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trackingSummary, setTrackingSummary] =
    useState<TrackingSummaryData | null>(null);
  const [stkTrackingTable, setStkTrackingTable] = useState<StkTrackingItem[]>(
    [],
  );
  const [whSummary, setWhSummary] = useState<WarehouseSummaryData | null>(null);
  const [stkByArea, setStkByArea] = useState<StkByAreaItem[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAreas, setTotalAreas] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalStks, setTotalStks] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [summaryRes, tableRes, whRes, areaRes, users, areas, orders, stks] =
        await Promise.all([
          getTrackingSummary(),
          getStkTrackingTable(),
          getWarehouseSummary(),
          getStkByArea(),
          getTotalUsers(),
          getTotalAreas(),
          getTotalOrders(),
          getTotalStks(),
        ]);
      setTrackingSummary(summaryRes);
      setStkTrackingTable(tableRes);
      setWhSummary(whRes);
      setStkByArea(areaRes);
      setTotalUsers(users);
      setTotalAreas(areas);
      setTotalOrders(orders);
      setTotalStks(stks);
    } catch (e) {
      console.log('Error loading SuperAdminDashboard data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const renderHeader = () => (
    <View>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.statsRow}>
        <QuickActionCard
          title="Check STK"
          color={colors.primary}
          icon={<PackageSearch color={colors.primary} size={22} />}
          onPress={() => navigateToCheckStk(navigation)}
        />
      </View>

      {/* ── System Stats ─────────────────────────────── */}
      <SystemStatsSection
        loading={loading}
        totalUsers={totalUsers}
        totalAreas={totalAreas}
        totalOrders={totalOrders}
        totalStks={totalStks}
      />

      {/* ── Warehouse Summary Widget ── */}
      {whSummary && <WarehouseSummaryWidget data={whSummary} />}

      {/* ── STK By Area Distribution Widget ── */}
      <StkByAreaWidget data={stkByArea} />

      {/* ── STK Tracking Table Widget ── */}
      {trackingSummary && (
        <StkTrackingTableWidget
          summary={trackingSummary}
          stkList={stkTrackingTable}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <DashboardHeader
        variant="superadmin"
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
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
});

export default SuperAdminDashboard;
