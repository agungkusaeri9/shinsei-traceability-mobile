import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, shadows } from '../../../theme';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  color = colors.primary,
  icon,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconBadge, { backgroundColor: `${color}20` }]}>
        {icon}
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    ...shadows.md,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  title: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});

export default DashboardCard;
