import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppTabParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import { useAuth } from '../../../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  navigation: BottomTabNavigationProp<AppTabParamList, 'Warehouse'>;
};

const recentMovements = [
  {
    id: '1',
    type: 'in',
    product: 'Bearing Assembly A-100',
    qty: 120,
    ref: 'IN-2024-001',
    time: '10 menit lalu',
  },
  {
    id: '2',
    type: 'out',
    product: 'Sensor Proximity M-22',
    qty: 35,
    ref: 'OUT-2024-014',
    time: '45 menit lalu',
  },
  {
    id: '3',
    type: 'in',
    product: 'Cable Harness V2',
    qty: 200,
    ref: 'IN-2024-002',
    time: '2 jam lalu',
  },
  {
    id: '4',
    type: 'out',
    product: 'Motor DC 24V',
    qty: 18,
    ref: 'OUT-2024-015',
    time: '4 jam lalu',
  },
];

const WarehouseScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

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
      >
        {/* ── Stats Overview ───────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBadge,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              <Package color={colors.primary} size={20} />
            </View>
            <Text style={styles.statNumber}>1.2K</Text>
            <Text style={styles.statLabel}>Total Stok</Text>
          </View>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBadge,
                { backgroundColor: `${colors.warning}20` },
              ]}
            >
              <AlertTriangle color={colors.warning} size={20} />
            </View>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Stok Menipis</Text>
          </View>
        </View>

        {/* ── Main Actions ─────────────────────────────── */}
        <Text style={styles.sectionTitle}>Menu Gudang</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionCard, { borderColor: `${colors.primary}30` }]}
            onPress={() => navigation.navigate('Register')}
          >
            <View
              style={[
                styles.actionIconBadge,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              <ClipboardList color={colors.primary} size={28} />
            </View>
            <Text style={styles.actionTitle}>Register</Text>
            <Text style={styles.actionDesc}>Daftarkan part</Text>
          </TouchableOpacity>

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

        {/* ── Movement Summary ─────────────────────────── */}
        <View style={styles.summaryRow}>
          <View
            style={[styles.summaryCard, { borderLeftColor: colors.success }]}
          >
            <TrendingUp color={colors.success} size={18} />
            <View style={styles.summaryText}>
              <Text style={styles.summaryValue}>340</Text>
              <Text style={styles.summaryLabel}>Masuk Hari Ini</Text>
            </View>
          </View>
          <View
            style={[styles.summaryCard, { borderLeftColor: colors.orange }]}
          >
            <TrendingDown color={colors.orange} size={18} />
            <View style={styles.summaryText}>
              <Text style={styles.summaryValue}>53</Text>
              <Text style={styles.summaryLabel}>Keluar Hari Ini</Text>
            </View>
          </View>
        </View>

        {/* ── Recent Movements ─────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
          Pergerakan Terkini
        </Text>
        <View style={styles.movementList}>
          {recentMovements.map(m => (
            <View key={m.id} style={styles.movementItem}>
              <View
                style={[
                  styles.movementIcon,
                  {
                    backgroundColor:
                      m.type === 'in'
                        ? `${colors.success}20`
                        : `${colors.orange}20`,
                  },
                ]}
              >
                {m.type === 'in' ? (
                  <ArrowDownToLine color={colors.success} size={18} />
                ) : (
                  <ArrowUpFromLine color={colors.orange} size={18} />
                )}
              </View>
              <View style={styles.movementInfo}>
                <Text style={styles.movementProduct} numberOfLines={1}>
                  {m.product}
                </Text>
                <Text style={styles.movementRef}>{m.ref}</Text>
              </View>
              <View style={styles.movementRight}>
                <Text
                  style={[
                    styles.movementQty,
                    {
                      color: m.type === 'in' ? colors.success : colors.orange,
                    },
                  ]}
                >
                  {m.type === 'in' ? '+' : '-'}
                  {m.qty}
                </Text>
                <Text style={styles.movementTime}>{m.time}</Text>
              </View>
            </View>
          ))}
        </View>
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

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    ...shadows.md,
  },
  statIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

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

  // Summary
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  summaryText: { marginLeft: 12 },
  summaryValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  // Movement List
  movementList: { gap: 12 },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    ...shadows.sm,
  },
  movementIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  movementInfo: { flex: 1 },
  movementProduct: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  movementRef: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  movementRight: { alignItems: 'flex-end' },
  movementQty: { fontSize: 15, fontWeight: '700' },
  movementTime: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});

export default WarehouseScreen;
