import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import {
  Users,
  Building2,
  ShoppingCart,
  UserCheck,
  MapPin,
  FileText,
  Settings,
} from 'lucide-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppTabParamList } from '../../../types';
import { colors } from '../../../theme';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCard from '../components/DashboardCard';
import QuickActionCard from '../components/QuickActionCard';
import ActivityItem, { Activity } from '../components/ActivityItem';

type Props = {
  navigation: BottomTabNavigationProp<AppTabParamList, 'Dashboard'>;
};

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'User baru terdaftar',
    description: 'Akun Budi_Santoso dibuat oleh sistem',
    time: '15 menit lalu',
    type: 'user',
  },
  {
    id: '2',
    title: 'Konfigurasi diperbarui',
    description: 'Threshold QC batch diperbarui menjadi 5%',
    time: '1 jam lalu',
    type: 'config',
  },
  {
    id: '3',
    title: 'Backup sistem selesai',
    description: 'Database berhasil di-backup (1.2 GB)',
    time: '3 jam lalu',
    type: 'system',
  },
  {
    id: '4',
    title: 'Akses dicabut',
    description: 'Akun Andi_Wirawan dinonaktifkan',
    time: '5 jam lalu',
    type: 'user',
  },
];

const SuperAdminDashboard: React.FC<Props> = ({ navigation }) => {
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
      {/* <View style={styles.statsRow}>
        <QuickActionCard
          title="Laporan"
          color={colors.primary}
          icon={<FileText color={colors.primary} size={22} />}
        />
        <QuickActionCard
          title="Pengaturan"
          color={colors.purple}
          icon={<Settings color={colors.purple} size={22} />}
        />
      </View> */}

      {/* ── Audit Log ────────────────────────────────── */}
      <Text style={[styles.sectionTitle, styles.sectionGap]}>Log Sistem</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <DashboardHeader
        variant="superadmin"
        onProfilePress={() => navigation.navigate('Profile')}
      />

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

export default SuperAdminDashboard;
