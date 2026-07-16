import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../../../theme';
import { useAuth } from '../../../hooks/useAuth';

// ─── Variant config ───────────────────────────────────────────────────────────

type HeaderVariant = string;

const defaultHeaderConfig = {
  bg: colors.header,
  accent: colors.primary,
  label: 'User',
};

const headerConfig: Record<
  string,
  { bg: string; accent: string; label: string }
> = {
  admin: { bg: colors.header, accent: colors.primary, label: 'Admin' },
  superadmin: {
    bg: colors.headerAlt,
    accent: colors.indigo,
    label: 'Super Admin',
  },
  warehouse: {
    bg: colors.headerWarehouse,
    accent: colors.orange,
    label: 'Warehouse',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface DashboardHeaderProps {
  variant: HeaderVariant;
  onProfilePress: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  variant,
  onProfilePress,
}) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { bg, accent, label } = headerConfig[variant] ?? defaultHeaderConfig;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={bg} />

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, backgroundColor: bg },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Selamat datang,</Text>
          <Text style={styles.username}>{user?.name ?? 'User'}</Text>
          <View style={[styles.roleBadge, { backgroundColor: `${accent}30` }]}>
            <View style={[styles.roleDot, { backgroundColor: accent }]} />
            <Text style={[styles.roleText, { color: accent }]}>{label}</Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.7} onPress={onProfilePress}>
          <View style={[styles.avatar, { backgroundColor: accent }]}>
            <Text style={styles.avatarText}>
              {(user?.name?.[0] ?? 'U').toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    ...shadows.md,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 14, color: colors.textHeaderMuted },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textInverse,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
  },
  roleDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  roleText: { fontSize: 11, fontWeight: '700' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.textInverse },
});

export default DashboardHeader;
