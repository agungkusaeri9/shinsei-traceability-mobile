import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { WarehouseStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import { useAuth } from '../../../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getWarehouseSummary,
  getRecentAcceptances,
  WarehouseSummaryData,
  RecentAcceptanceItem,
} from '../../dashboard/services/dashboardService';
import { WarehouseSummaryWidget } from '../../dashboard/components/WarehouseSummaryWidget';
import { RecentAcceptancesWidget } from '../../dashboard/components/RecentAcceptancesWidget';

type Props = {
  navigation: NativeStackNavigationProp<
    WarehouseStackParamList,
    'WarehouseHome'
  >;
};

const WarehouseScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [whSummary, setWhSummary] = useState<WarehouseSummaryData | null>(null);
  const [recentAcceptances, setRecentAcceptances] = useState<RecentAcceptanceItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [summaryRes, acceptancesRes] = await Promise.all([
        getWarehouseSummary(),
        getRecentAcceptances(),
      ]);
      setWhSummary(summaryRes);
      setRecentAcceptances(acceptancesRes);
    } catch (e) {
      console.log('Error loading warehouse screen data:', e);
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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.headerWarehouse}
      />

      {/* ── Header ─────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.greeting}>Warehouse Management</Text>
          <Text style={styles.subtitle}>
            Kelola stok masuk dan keluar gudang
          </Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role ?? 'warehouse'}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.orange]}
            tintColor={colors.orange}
          />
        }
      >
        {/* ── Warehouse Summary Widget (Real API Data) ── */}
        {whSummary && <WarehouseSummaryWidget data={whSummary} />}

        {/* ── Main Actions ─────────────────────────────── */}
        <Text style={styles.sectionTitle}>Menu Gudang</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionCard, { borderColor: `${colors.success}30` }]}
            onPress={() => navigation.navigate('StockIn')}
          >
            <View
              style={[
                styles.actionIconBadge,
                { backgroundColor: `${colors.success}20` },
              ]}
            >
              <ArrowDownToLine color={colors.success} size={28} />
            </View>
            <Text style={styles.actionTitle}>Stock In</Text>
            <Text style={styles.actionDesc}>Scan STK masuk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionCard, { borderColor: `${colors.orange}30` }]}
            onPress={() => navigation.navigate('StockOut')}
          >
            <View
              style={[
                styles.actionIconBadge,
                { backgroundColor: `${colors.orange}20` },
              ]}
            >
              <ArrowUpFromLine color={colors.orange} size={28} />
            </View>
            <Text style={styles.actionTitle}>Stock Out</Text>
            <Text style={styles.actionDesc}>Proses keluar</Text>
          </TouchableOpacity>
        </View>

        {/* ── Recent Acceptances (Real API Data) ─────────────────────────── */}
        <RecentAcceptancesWidget data={recentAcceptances} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: colors.headerWarehouse,
    ...shadows.md,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: colors.textInverse },
  subtitle: { fontSize: 13, color: colors.textHeaderMuted, marginTop: 4 },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: `${colors.orange}30`,
  },
  roleText: { fontSize: 11, fontWeight: '700', color: colors.orange },

  // Content
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    ...shadows.md,
  },
  actionIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  actionDesc: { fontSize: 12, color: colors.textSecondary },
});

export default WarehouseScreen;
