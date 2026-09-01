import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppTabParamList } from '../../../types';
import { colors } from '../../../theme';
import DashboardHeader from '../components/DashboardHeader';
import {
  getTrackingSummary,
  getStkTrackingTable,
  getStkByArea,
  TrackingSummaryData,
  StkTrackingItem,
  StkByAreaItem,
} from '../services/dashboardService';
import { StkTrackingTableWidget } from '../components/StkTrackingTableWidget';
import { StkByAreaWidget } from '../components/StkByAreaWidget';

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

  const renderHeader = () => (
    <View>
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
});

export default AdminDashboard;
