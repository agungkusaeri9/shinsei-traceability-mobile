import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AreaStackParamList } from '../../../types';
import { colors } from '../../../theme';
import { useAuth } from '../../../hooks/useAuth';
import WarehouseDashboard from '../../dashboard/screens/WarehouseDashboard';

type Props = {
  navigation: NativeStackNavigationProp<
    AreaStackParamList,
    'WarehouseDashboard'
  >;
};

/**
 * Wrapper around WarehouseDashboard for the Area flow.
 * Adds a custom header with back button and passes it to WarehouseDashboard.
 */
const AreaWarehouseDashboard: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      {/* ── Custom Header ─────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dashboard Warehouse</Text>
          <Text style={styles.headerSubtitle}>
            Selamat datang, {user?.name ?? 'Admin'}
          </Text>
        </View>
      </View>

      <WarehouseDashboard navigation={navigation} showCustomHeader={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: '#0D1B2A',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9BAFCC',
    marginTop: 4,
  },
});

export default AreaWarehouseDashboard;
