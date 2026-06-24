import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: string;
  style?: ViewStyle;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  color = '#1A73E8',
  icon,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconBadge, { backgroundColor: `${color}20` }]}>
        <Text style={styles.icon}>{icon ?? '📊'}</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: { fontSize: 20 },
  value: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});

export default DashboardCard;
