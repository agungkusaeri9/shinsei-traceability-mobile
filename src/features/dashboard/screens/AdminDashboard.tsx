import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  PackagePlus,
  PackageSearch,
} from 'lucide-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppTabParamList } from '../../../types';
import { colors } from '../../../theme';
import DashboardHeader from '../components/DashboardHeader';
import QuickActionCard from '../components/QuickActionCard';
import {
  getTrackingSummary,
  getStkTrackingTable,
  getStkByArea,
} from '../services/dashboardService';
import type {
  StkByAreaItem,
  StkTrackingItem,
  TrackingSummaryData,
} from '../types';
import { StkTrackingTableWidget } from '../components/StkTrackingTableWidget';
import { StkByAreaWidget } from '../components/StkByAreaWidget';
import { navigateToCheckStk } from '../../../navigation/navigationHelpers';

type Props = {
  navigation: BottomTabNavigationProp<AppTabParamList, 'Dashboard'>;
};

const AdminDashboard: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [trackingSummary, setTrackingSummary] = useState<TrackingSummaryData | null>(null);
  const [stkTrackingTable, setStkTrackingTable] = useState<StkTrackingItem[]>([]);
  const [stkByArea, setStkByArea] = useState<StkByAreaItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [summaryRes, tableRes, areaRes] = await Promise.all([
        getTrackingSummary(),
        getStkTrackingTable(),
        getStkByArea(),
      ]);
      setTrackingSummary(summaryRes);
      setStkTrackingTable(tableRes);
      setStkByArea(areaRes);
    } catch (e) {
      console.log('Error loading AdminDashboard data:', e);
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

  const navigateToQaScreen = (screen: string) => {
    let nav = navigation as any;
    while (nav) {
      const routeNames: string[] = nav.getState?.()?.routeNames || [];
      if (routeNames.includes(screen)) { nav.navigate(screen); return; }
      nav = nav.getParent?.();
    }
    try {
      (navigation as any).navigate('QAAssy', { screen });
    } catch {
      (navigation as any).navigate(screen);
    }
  };

  const renderHeader = () => (
    <View>
      {/* ── QA Assy Quick Actions ─────────────────────── */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <QuickActionCard
          title="Acceptance"
          color={colors.indigo}
          icon={<PackageCheck color={colors.indigo} size={22} />}
          onPress={() => navigateToQaScreen('QaAcceptance')}
        />
        <QuickActionCard
          title="Register"
          color={colors.indigo}
          icon={<ClipboardCheck color={colors.indigo} size={22} />}
          onPress={() => navigateToQaScreen('QaRegister')}
        />
      </View>
      <View style={styles.actionsRow}>
        <QuickActionCard
          title="Add Part"
          color={colors.orange}
          icon={<PackagePlus color={colors.orange} size={22} />}
          onPress={() => navigateToQaScreen('QaAddPart')}
        />
        <QuickActionCard
          title="Finish"
          color={colors.success}
          icon={<CheckCircle2 color={colors.success} size={22} />}
          onPress={() => navigateToQaScreen('QaFinish')}
        />
      </View>
      <View style={styles.actionsRow}>
        <QuickActionCard
          title="Check STK"
          color={colors.primary}
          icon={<PackageSearch color={colors.primary} size={22} />}
          onPress={() => navigateToCheckStk(navigation)}
        />
      </View>

      {/* ── STK By Area Distribution Widget ── */}
      <StkByAreaWidget data={stkByArea} />

      {/* ── STK Stage & Live Tracking Table Widget ── */}
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
        variant="admin"
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
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
});

export default AdminDashboard;
