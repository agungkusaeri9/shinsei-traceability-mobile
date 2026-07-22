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
  ClipboardList,
  ArrowLeftRight,
  CheckCircle2,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SmtStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import { useAuth } from '../../../hooks/useAuth';

type Props = {
  navigation: NativeStackNavigationProp<SmtStackParamList, 'SmtHome'>;
};

const SmtHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      key: 'PartRegister',
      title: 'Part Register',
      desc: 'Scan lot number & register part',
      icon: <ClipboardList color={colors.primary} size={28} />,
      iconBg: `${colors.primary}20`,
      borderColor: `${colors.primary}30`,
      onPress: () => navigation.navigate('PartRegister'),
    },
    {
      key: 'PartChanging',
      title: 'Part Changing',
      desc: 'Proses pergantian part',
      icon: <ArrowLeftRight color={colors.orange} size={28} />,
      iconBg: `${colors.orange}20`,
      borderColor: `${colors.orange}30`,
      onPress: () => navigation.navigate('PartChanging'),
    },
    {
      key: 'Finish',
      title: 'Finish',
      desc: 'Selesaikan proses SMT',
      icon: <CheckCircle2 color={colors.success} size={28} />,
      iconBg: `${colors.success}20`,
      borderColor: `${colors.success}30`,
      onPress: () => navigation.navigate('Finish'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.greeting}>SMT Process</Text>
          <Text style={styles.subtitle}>Surface Mount Technology</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role ?? 'smt'}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Menu SMT</Text>
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
    backgroundColor: colors.primary,
    ...shadows.md,
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

  // Actions
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

export default SmtHomeScreen;
