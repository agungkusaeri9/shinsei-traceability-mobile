import React, { useState, useCallback } from 'react';
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
  ClipboardCheck,
  PackagePlus,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QaAssyStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import { useAuth } from '../../../hooks/useAuth';

type Props = {
  navigation: NativeStackNavigationProp<any, 'QaAssyHome'>;
};

const QaAssyHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const menuItems = [
    {
      key: 'QaRegister',
      title: '1. Register',
      desc: 'Scan Lot Number dan daftarkan',
      icon: <ClipboardCheck color={colors.indigo} size={28} />,
      iconBg: `${colors.indigo}20`,
      borderColor: `${colors.indigo}40`,
      onPress: () => navigation.navigate('QaRegister'),
    },
    {
      key: 'QaAddPart',
      title: '2. Add Part',
      desc: 'Scan Lot & beberapa Part STK',
      icon: <PackagePlus color={colors.orange} size={28} />,
      iconBg: `${colors.orange}20`,
      borderColor: `${colors.orange}40`,
      onPress: () => navigation.navigate('QaAddPart'),
    },
    {
      key: 'QaFinish',
      title: '3. Finish',
      desc: 'Scan Lot & Box (pengiriman otomatis)',
      icon: <CheckCircle2 color={colors.success} size={28} />,
      iconBg: `${colors.success}20`,
      borderColor: `${colors.success}40`,
      onPress: () => navigation.navigate('QaFinish'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.indigo} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.greeting}>QA & Assembly</Text>
            <Text style={styles.subtitle}>Quality Assurance & Assembly Process</Text>
          </View>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role ?? 'qa_assy'}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.indigo]}
            tintColor={colors.indigo}
          />
        }
      >
        <Text style={styles.sectionTitle}>Pilih Proses QA & Assy</Text>
        <View style={styles.actionsGrid}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.7}
              style={[styles.actionCard, { borderColor: item.borderColor }]}
              onPress={item.onPress}
            >
              <View
                style={[
                  styles.actionIconBadge,
                  { backgroundColor: item.iconBg },
                ]}
              >
                {item.icon}
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>{item.title}</Text>
                <Text style={styles.actionDesc}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
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
    backgroundColor: colors.indigo,
    ...shadows.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: { fontSize: 20, fontWeight: '700', color: colors.textInverse },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  roleText: { fontSize: 11, fontWeight: '700', color: colors.textInverse },

  // Content
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },

  // Actions Grid
  actionsGrid: { gap: 16 },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
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
    marginRight: 16,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  actionDesc: { fontSize: 13, color: colors.textSecondary },
});

export default QaAssyHomeScreen;
