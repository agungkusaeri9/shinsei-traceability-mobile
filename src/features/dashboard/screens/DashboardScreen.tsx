import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../types';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../../../hooks/useAuth';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Dashboard'>;
};

const mockActivities = [
  {
    id: '1',
    title: 'Order #ORD-2024-001',
    description: 'Shipment diterima di gudang Surabaya',
    time: '10 menit lalu',
    type: 'shipment',
    icon: '📦',
  },
  {
    id: '2',
    title: 'QC Alert',
    description: 'Produk batch #B-445 memerlukan inspeksi',
    time: '1 jam lalu',
    type: 'alert',
    icon: '⚠️',
  },
  {
    id: '3',
    title: 'Order #ORD-2024-002',
    description: 'Order baru dari PT Maju Bersama',
    time: '3 jam lalu',
    type: 'order',
    icon: '🛒',
  },
  {
    id: '4',
    title: 'Shipment Selesai',
    description: 'Pengiriman #SHP-089 tiba di tujuan',
    time: '5 jam lalu',
    type: 'shipment',
    icon: '✅',
  },
];

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Selamat datang,</Text>
          <Text style={styles.username}>{user?.name ?? 'User'} 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name?.[0] ?? 'U').toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Stats Cards ─────────────────────────────── */}
        <Text style={styles.sectionTitle}>Ringkasan</Text>
        <View style={styles.statsRow}>
          <DashboardCard
            title="Total Order"
            value="248"
            icon="🛒"
            color="#1A73E8"
            style={styles.cardHalf}
          />
          <DashboardCard
            title="Pending"
            value="32"
            icon="⏳"
            color="#F59E0B"
            style={styles.cardHalf}
          />
        </View>
        <View style={styles.statsRow}>
          <DashboardCard
            title="Selesai"
            value="210"
            icon="✅"
            color="#10B981"
            style={styles.cardHalf}
          />
          <DashboardCard
            title="Produk"
            value="1.2K"
            icon="📦"
            color="#8B5CF6"
            style={styles.cardHalf}
          />
        </View>

        {/* ── Recent Activity ─────────────────────────── */}
        <Text style={styles.sectionTitle}>Aktivitas Terkini</Text>
        <View style={styles.activityList}>
          {mockActivities.map(item => (
            <View key={item.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>{item.icon}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDesc}>{item.description}</Text>
              </View>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D1B2A',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 24,
  },
  greeting: { fontSize: 14, color: '#9BAFCC' },
  username: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  profileBtn: {},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },

  // Content
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cardHalf: { flex: 1 },

  // Activity
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIconText: { fontSize: 18 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  activityDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  activityTime: { fontSize: 11, color: '#9CA3AF', marginLeft: 8 },
});

export default DashboardScreen;
