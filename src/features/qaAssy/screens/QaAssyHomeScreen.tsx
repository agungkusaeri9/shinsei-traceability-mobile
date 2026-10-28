import React from 'react';
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
  PackageCheck,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QaAssyStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import { useTimedRefresh } from '../../../hooks/useTimedRefresh';
import ProcessMenuCard from '../../../components/ProcessMenuCard';

type Props = {
  navigation: NativeStackNavigationProp<QaAssyStackParamList, 'QaAssyHome'>;
};

const QaAssyHomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { refreshing, onRefresh } = useTimedRefresh(800);

  const menuItems = [
    {
      key: 'QaAcceptance',
      title: 'STK Acceptance',
      desc: 'Scan STK Acceptance QA & Assy',
      icon: <PackageCheck color={colors.indigo} size={28} />,
      iconBg: `${colors.indigo}20`,
      borderColor: `${colors.indigo}40`,
      onPress: () => navigation.navigate('QaAcceptance'),
    },
    {
      key: 'QaRegister',
      title: 'Lot Register',
      desc: 'Scan Lot Number dan daftarkan',
      icon: <ClipboardCheck color={colors.indigo} size={28} />,
      iconBg: `${colors.indigo}20`,
      borderColor: `${colors.indigo}40`,
      onPress: () => navigation.navigate('QaRegister'),
    },
    {
      key: 'QaAddPart',
      title: 'Add Part (STK) to Lot',
      desc: 'Scan Lot & beberapa Part STK',
      icon: <PackagePlus color={colors.orange} size={28} />,
      iconBg: `${colors.orange}20`,
      borderColor: `${colors.orange}40`,
      onPress: () => navigation.navigate('QaAddPart'),
    },
    {
      key: 'QaFinish',
      title: 'Finish',
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
        {/* <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role ?? 'qa_assy'}</Text>
        </View> */}
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
            <ProcessMenuCard
              key={item.key}
              title={item.title}
              description={item.desc}
              icon={item.icon}
              iconBackgroundColor={item.iconBg}
              borderColor={item.borderColor}
              onPress={item.onPress}
            />
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
});

export default QaAssyHomeScreen;
