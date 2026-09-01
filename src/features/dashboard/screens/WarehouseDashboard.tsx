import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp } from 'lucide-react-native';

import { colors } from '../../../theme';
import DashboardHeader from '../components/DashboardHeader';
import QuickActionCard from '../components/QuickActionCard';
import ActivityItem, { Activity } from '../components/ActivityItem';
import {
  getWarehouseSummary,
  getRecentAcceptances,
  getTrackingSummary,
  WarehouseSummaryData,
  RecentAcceptanceItem,
  TrackingSummaryData,
} from '../services/dashboardService';
import { WarehouseSummaryWidget } from '../components/WarehouseSummaryWidget';
import { RecentAcceptancesWidget } from '../components/RecentAcceptancesWidget';

type Props = {
  navigation: any;
  showCustomHeader?: boolean;
};

const navigateToWarehouseScreen = (navigation: any, screen: string) => {
  if (typeof navigation.navigate !== 'function') {
    return;
  }

  const state = navigation.getState?.();
  const routeNames: string[] = state?.routeNames || [];

  if (routeNames.includes(screen)) {
    navigation.navigate(screen);
  } else if (routeNames.includes('Warehouse')) {
    navigation.navigate('Warehouse', { screen });
  } else {
    try {
      navigation.navigate('Warehouse', { screen });
    } catch {
      navigation.navigate(screen);
    }
  }
};

const WarehouseDashboard: React.FC<Props> = ({
  navigation,
  showCustomHeader = false,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [whSummary, setWhSummary] = useState<WarehouseSummaryData | null>(null);
  const [recentAcceptances, setRecentAcceptances] = useState<RecentAcceptanceItem[]>([]);
  const [trackingSummary, setTrackingSummary] = useState<TrackingSummaryData | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [summaryRes, acceptancesRes, trackingRes] = await Promise.all([
        getWarehouseSummary(),
        getRecentAcceptances(),
        getTrackingSummary(),
      ]);
      setWhSummary(summaryRes);
      setRecentAcceptances(acceptancesRes);
      setTrackingSummary(trackingRes);
    } catch (e) {
      console.log('Error loading warehouse dashboard data:', e);
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
      {/* ── Quick Actions ────────────────────────────── */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.statsRow}>
        <QuickActionCard
          title="Stock In"
          color={colors.success}
          icon={<ArrowDownToLine color={colors.success} size={22} />}
          onPress={() => navigateToWarehouseScreen(navigation, 'StockIn')}
        />
        <QuickActionCard
          title="Stock Out"
          color={colors.orange}
          icon={<ArrowUpFromLine color={colors.orange} size={22} />}
          onPress={() => navigateToWarehouseScreen(navigation, 'StockOut')}
        />
      </View>

      {/* ── Real API Warehouse Summary Widget ────────────────────────────── */}
      {whSummary && <WarehouseSummaryWidget data={whSummary} />}


      {/* {!showCustomHeader && (
        <View style={styles.statsRow}>
          <QuickActionCard
            title="Profile"
            color={colors.purple}
            icon={<TrendingUp color={colors.purple} size={22} />}
            onPress={() => navigation.navigate('Profile')}
          />
        </View>
      )} */}

      {/* ── Recent Acceptances (Real API Data) ──────────────────────────── */}
      <RecentAcceptancesWidget data={recentAcceptances} />
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
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
});

export default WarehouseDashboard;
