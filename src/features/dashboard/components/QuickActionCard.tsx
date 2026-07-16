import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, shadows } from '../../../theme';

// ─── Component ────────────────────────────────────────────────────────────────

interface QuickActionCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  onPress?: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  icon,
  color,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.container}
      onPress={onPress}>
      <View style={[styles.iconBadge, { backgroundColor: `${color}20` }]}>
        {icon}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    ...shadows.sm,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

export default QuickActionCard;
