import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ShoppingCart, Clock, CheckCircle2, Package } from 'lucide-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppTabParamList } from '../../../types';
import { colors } from '../../../theme';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCard from '../components/DashboardCard';
import ActivityItem, { Activity } from '../components/ActivityItem';

type Props = {
  navigation: BottomTabNavigationProp<AppTabParamList, 'Dashboard'>;
};

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Order #ORD-2024-001',
    description: 'Shipment diterima di gudang Surabaya',
    time: '10 menit lalu',
    type: 'shipment',
  },
  {
    id: '2',
    title: 'QC Alert',
    description: 'Produk batch #B-445 memerlukan inspeksi',
    time: '1 jam lalu',
    type: 'alert',
  },
  {
    id: '3',
    title: 'Order #ORD-2024-002',
    description: 'Order baru dari PT Maju Bersama',
    time: '3 jam lalu',
    type: 'order',
  },
  {
    id: '4',
    title: 'Shipment Selesai',
    description: 'Pengiriman #SHP-089 tiba di tujuan',
    time: '5 jam lalu',
    type: 'done',
  },
];

const AdminDashboard: React.FC<Props> = ({ navigation }) => {
  const renderHeader = () => (
    <View>
      <Text style={styles.sectionTitle}>Ringkasan Operasional</Text>
      <View style={styles.statsRow}>
        <DashboardCard
          title="Total Order"
          value="248"
          color={colors.primary}
          icon={<ShoppingCart color={colors.primary} size={20} />}
          style={styles.cardHalf}
        />
        <DashboardCard
          title="Pending"
          value="32"
          color={colors.warning}
          icon={<Clock color={colors.warning} size={20} />}
          style={styles.cardHalf}
        />
      </View>
      <View style={styles.statsRow}>
        <DashboardCard
          title="Selesai"
          value="210"
          color={colors.success}
          icon={<CheckCircle2 color={colors.success} size={20} />}
          style={styles.cardHalf}
        />
        <DashboardCard
          title="Produk"
          value="1.2K"
          color={colors.purple}
          icon={<Package color={colors.purple} size={20} />}
          style={styles.cardHalf}
        />
      </View>

      <Text style={[styles.sectionTitle, styles.activityTitle]}>
        Aktivitas Terkini
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <DashboardHeader
        variant="admin"
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
  activityTitle: { marginTop: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardHalf: { flex: 1 },
  separator: { height: 12 },
});

export default AdminDashboard;
