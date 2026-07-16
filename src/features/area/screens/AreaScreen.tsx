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
import {
  Warehouse,
  Cpu,
  Settings,
  Package,
  Truck,
  ChevronRight,
  Lock,
} from 'lucide-react-native';
import { AreaStackParamList } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { colors } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AreaStackParamList, 'AreaHome'>;
};

interface AreaItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  onPress?: () => void;
}

const AreaScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();

  const areas: AreaItem[] = [
    {
      id: '1',
      name: 'Warehouse',
      description: 'Kelola stok masuk, keluar, dan registrasi part',
      icon: <Warehouse color={colors.primary} size={28} />,
      available: true,
      onPress: () => navigation.navigate('WarehouseDashboard'),
    },
    {
      id: '2',
      name: 'SMT',
      description: 'Surface Mount Technology',
      icon: <Cpu color="#9CA3AF" size={28} />,
      available: false,
    },
    {
      id: '3',
      name: 'Assembly & QA',
      description: 'Assembly dan Quality Assurance',
      icon: <Settings color="#9CA3AF" size={28} />,
      available: false,
    },
    {
      id: '4',
      name: 'FG Warehouse',
      description: 'Finished Goods Warehouse',
      icon: <Package color="#9CA3AF" size={28} />,
      available: false,
    },
    {
      id: '5',
      name: 'Delivery',
      description: 'Pengiriman dan distribusi',
      icon: <Truck color="#9CA3AF" size={28} />,
      available: false,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Area Management</Text>
        <Text style={styles.subtitle}>Pilih area untuk mengakses fitur</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Area List ────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Daftar Area</Text>
        <View style={styles.areaList}>
          {areas.map(area => (
            <TouchableOpacity
              key={area.id}
              style={[
                styles.areaCard,
                !area.available && styles.areaCardDisabled,
              ]}
              onPress={area.onPress}
              activeOpacity={area.available ? 0.7 : 1}
              disabled={!area.available}
            >
              <View
                style={[
                  styles.iconContainer,
                  !area.available && styles.iconContainerDisabled,
                ]}
              >
                {area.icon}
              </View>
              <View style={styles.areaInfo}>
                <Text
                  style={[
                    styles.areaName,
                    !area.available && styles.areaNameDisabled,
                  ]}
                >
                  {area.name}
                </Text>
                <Text style={styles.areaDescription}>
                  {area.available
                    ? area.description
                    : 'Masih dalam proses development'}
                </Text>
                {!area.available && (
                  <View style={styles.badgeContainer}>
                    <Lock color="#F59E0B" size={12} />
                    <Text style={styles.badgeText}>Coming Soon</Text>
                  </View>
                )}
              </View>
              {area.available ? (
                <ChevronRight color="#9CA3AF" size={20} />
              ) : (
                <View style={styles.developmentBadge}>
                  <Text style={styles.developmentText}>Development</Text>
                </View>
              )}
            </TouchableOpacity>
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
    backgroundColor: '#0D1B2A',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#9BAFCC', marginTop: 4 },

  // Content
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },

  // Area List
  areaList: {
    gap: 12,
  },
  areaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  areaCardDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerDisabled: {
    backgroundColor: '#F3F4F6',
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  areaNameDisabled: {
    color: '#9CA3AF',
  },
  areaDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  developmentBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  developmentText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
});

export default AreaScreen;
