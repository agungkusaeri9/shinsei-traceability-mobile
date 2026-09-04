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
  CheckCircle2,
  Package,
  Cpu,
  Clock,
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
import {
  StatCardsSkeleton,
  ActivityListSkeleton,
} from '../../../components/Skeleton';

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
  const [loading, setLoading] = useState(true);
  const [whSummary, setWhSummary] = useState<WarehouseSummaryData | null>(null);
  const [recentAcceptances, setRecentAcceptances] = useState<RecentAcceptanceItem[]>([]);

  // Prevent re-navigation when the Warehouse tab is pressed while already focused.
  // This fixes the issue where rapid tab presses could trigger navigation to StockOut.
  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;

    const unsubscribe = (parent as any).addListener(
      'tabPress',
      (e: any) => {
        if (navigation.isFocused()) {
          e.preventDefault();
        }
      },
    );

    return unsubscribe;
  }, [navigation]);

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

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.headerWarehouse}
      />

      {/* ── Header ─────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.greeting}>Warehouse</Text>
          <Text style={styles.subtitle}>
            Halo, {user?.name ?? 'Admin'}
          </Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role ?? 'WH'}</Text>
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
        {/* ── Quick Stats ──────────────────────────────── */}
        {loading ? (
          <StatCardsSkeleton />
        ) : (
          whSummary && (
            <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
              <CheckCircle2 color={colors.success} size={18} />
              <Text style={styles.statValue}>
                {whSummary.totalPartAcceptanceReady}
              </Text>
              <Text style={styles.statLabel}>STK Ready</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
              <Package color={colors.primary} size={18} />
              <Text style={styles.statValue}>
                {whSummary.totalPartsInWarehouse.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Di Gudang</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
              <Cpu color={colors.warning} size={18} />
              <Text style={styles.statValue}>
                {whSummary.totalMaterialFeeding}
              </Text>
              <Text style={styles.statLabel}>Feeding</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: colors.orange }]}>
              <ArrowDownToLine color={colors.orange} size={18} />
              <Text style={styles.statValue}>
                {whSummary.totalPartStockIn}
              </Text>
              <Text style={styles.statLabel}>Stock In</Text>
            </View>
          </View>
          )
        )}

        {/* ── Menu Gudang ──────────────────────────────── */}
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

        {/* ── Aktivitas Terakhir ────────────────────────── */}
        {loading ? (
          <>
            <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
            <ActivityListSkeleton />
          </>
        ) : (
          recentAcceptances.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
            <View style={styles.activityList}>
              {recentAcceptances.map(item => (
                <View key={item.id} style={styles.activityCard}>
                  <View style={styles.activityLeft}>
                    <Text style={styles.activityStk}>{item.stkNumber}</Text>
                    <Text style={styles.activityPart} numberOfLines={1}>
                      {item.partName}
                    </Text>
                  </View>
                  <View style={styles.activityRight}>
                    <Text style={styles.activityQty}>
                      {item.quantity.toLocaleString()} pcs
                    </Text>
                    <View style={styles.activityTimeRow}>
                      <Clock size={11} color={colors.textMuted} />
                      <Text style={styles.activityTime}>
                        {formatTime(item.receivedDate)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
          )
        )}
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

  // Quick Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: '47.5%' as any,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    gap: 4,
    ...shadows.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
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

  // Recent Activity
  activityList: { gap: 8 },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    ...shadows.sm,
  },
  activityLeft: { flex: 1, marginRight: 12 },
  activityStk: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  activityPart: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityRight: { alignItems: 'flex-end' },
  activityQty: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  activityTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
});

export default WarehouseScreen;
