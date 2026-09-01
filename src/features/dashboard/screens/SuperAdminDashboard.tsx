import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Users,
  Building2,
  ShoppingCart,
  UserCheck,
  MapPin,
} from 'lucide-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppTabParamList } from '../../../types';
import { colors } from '../../../theme';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCard from '../components/DashboardCard';
import QuickActionCard from '../components/QuickActionCard';
import {
  getTrackingSummary,
  getStkTrackingTable,
  getWarehouseSummary,
  getStkByArea,
  TrackingSummaryData,
  StkTrackingItem,
  WarehouseSummaryData,
  StkByAreaItem,
} from '../services/dashboardService';
import { WarehouseSummaryWidget } from '../components/WarehouseSummaryWidget';
import { StkTrackingTableWidget } from '../components/StkTrackingTableWidget';
import { StkByAreaWidget } from '../components/StkByAreaWidget';

type Props = {
  navigation: BottomTabNavigationProp<AppTabParamList, 'Dashboard'>;
};

const SuperAdminDashboard: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [trackingSummary, setTrackingSummary] = useState<TrackingSummaryData | null>(null);
  const [stkTrackingTable, setStkTrackingTable] = useState<StkTrackingItem[]>([]);
  const [whSummary, setWhSummary] = useState<WarehouseSummaryData | null>(null);
  const [stkByArea, setStkByArea] = useState<StkByAreaItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [summaryRes, tableRes, whRes, areaRes] = await Promise.all([
        getTrackingSummary(),
        getStkTrackingTable(),
        getWarehouseSummary(),
        getStkByArea(),
      ]);
      setTrackingSummary(summaryRes);
      setStkTrackingTable(tableRes);
      setWhSummary(whRes);
      setStkByArea(areaRes);
    } catch (e) {
      console.log('Error loading SuperAdminDashboard data:', e);
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
      {/* ── System Stats ─────────────────────────────── */}
      <Text style={styles.sectionTitle}>Ringkasan Sistem</Text>
      <View style={styles.statsRow}>
        <DashboardCard
          title="Total User"
          value="48"
          color={colors.indigo}
          icon={<Users color={colors.indigo} size={20} />}
          style={styles.cardHalf}
        />
        <DashboardCard
          title="Area Aktif"
          value="12"
          color={colors.success}
          icon={<Building2 color={colors.success} size={20} />}
          style={styles.cardHalf}
        />
      </View>
      <View style={styles.statsRow}>
        <DashboardCard
          title="Total Order"
          value="1.4K"
          color={colors.primary}
          icon={<ShoppingCart color={colors.primary} size={20} />}
          style={styles.cardHalf}
        />
        <DashboardCard
          title="Approval"
          value="7"
          color={colors.warning}
          icon={<UserCheck color={colors.warning} size={20} />}
          style={styles.cardHalf}
        />
      </View>

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

      {/* ── Quick Actions ────────────────────────────── */}
      <Text style={[styles.sectionTitle, styles.sectionGap]}>
        Manajemen Cepat
      </Text>
      <View style={styles.statsRow}>
        <QuickActionCard
          title="Kelola User"
          color={colors.indigo}
          icon={<UserCheck color={colors.indigo} size={22} />}
          onPress={() => navigation.navigate('Profile')}
        />
        <QuickActionCard
          title="Kelola Area"
          color={colors.success}
          icon={<MapPin color={colors.success} size={22} />}
          onPress={() => navigation.navigate('Area')}
        />
      </View>
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
  cardHalf: { flex: 1 },
});

export default SuperAdminDashboard;
