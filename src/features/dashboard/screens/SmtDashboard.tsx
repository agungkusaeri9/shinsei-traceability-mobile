import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import {
  ClipboardList,
  ArrowLeftRight,
  CheckCircle2,
  Cpu,
  Layers,
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
    title: 'Part Register Selesai',
    description: 'LOT20260709001 - 5 part batch ter-register',
    time: '10 menit lalu',
    type: 'done',
  },
  {
    id: '2',
    title: 'Part Changing',
    description: 'PCB-001 Face B - Part batch #164268 diubah',
    time: '30 menit lalu',
    type: 'order',
  },
  {
    id: '3',
    title: 'Produksi Selesai',
    description: 'Order #485 - Denso MFG Indonesia selesai',
    time: '2 jam lalu',
    type: 'shipment',
  },
];

const navigateToSmtScreen = (navigation: any, screen: string) => {
  // Navigate to SMT tab screens via parent navigator
  if (typeof navigation.navigate === 'function') {
    navigation.navigate('SMT', { screen });
  }
};

const SmtDashboard: React.FC<Props> = ({
  navigation,
  showCustomHeader = false,
}) => {
  const renderHeader = () => (
    <View>
      {/* ── SMT Stats ──────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Ringkasan SMT</Text>
      <View style={styles.statsRow}>
        <DashboardCard
          title="Total Register"
          value="48"
          color={colors.primary}
          icon={<ClipboardList color={colors.primary} size={20} />}
          style={styles.cardHalf}
        />
        <DashboardCard
          title="Part Changes"
          value="5"
          color={colors.orange}
          icon={<ArrowLeftRight color={colors.orange} size={20} />}
          style={styles.cardHalf}
        />
      </View>
      <View style={styles.statsRow}>
        <DashboardCard
          title="Selesai Hari Ini"
          value="12"
          color={colors.success}
          icon={<CheckCircle2 color={colors.success} size={20} />}
          style={styles.cardHalf}
        />
        <DashboardCard
          title="Dalam Proses"
          value="3"
          color={colors.warning}
          icon={<Cpu color={colors.warning} size={20} />}
          style={styles.cardHalf}
        />
      </View>

      {/* ── Quick Actions ─────────────────────────────── */}
      <Text style={[styles.sectionTitle, styles.sectionGap]}>
        Quick Actions
      </Text>
      <View style={styles.statsRow}>
        <QuickActionCard
          title="Part Register"
          color={colors.primary}
          icon={<ClipboardList color={colors.primary} size={22} />}
          onPress={() => navigateToSmtScreen(navigation, 'PartRegister')}
        />
        <QuickActionCard
          title="Part Changing"
          color={colors.orange}
          icon={<ArrowLeftRight color={colors.orange} size={22} />}
          onPress={() => navigateToSmtScreen(navigation, 'PartChanging')}
        />
      </View>
      <View style={styles.statsRow}>
        <QuickActionCard
          title="Finish"
          color={colors.success}
          icon={<CheckCircle2 color={colors.success} size={22} />}
          onPress={() => navigateToSmtScreen(navigation, 'Finish')}
        />
        {!showCustomHeader && (
          <QuickActionCard
            title="Profile"
            color={colors.purple}
            icon={<Layers color={colors.purple} size={22} />}
            onPress={() => navigation.navigate('Profile')}
          />
        )}
      </View>

      {/* ── Recent Activity ───────────────────────────── */}
      <Text style={[styles.sectionTitle, styles.sectionGap]}>
        Aktivitas Terkini
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {!showCustomHeader && (
        <DashboardHeader
          variant="smt"
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

export default SmtDashboard;
