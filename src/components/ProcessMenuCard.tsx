import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, shadows } from '../theme';

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBackgroundColor: string;
  borderColor: string;
  onPress: () => void;
};

const ProcessMenuCard: React.FC<Props> = ({
  title,
  description,
  icon,
  iconBackgroundColor,
  borderColor,
  onPress,
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={[styles.card, { borderColor }]}
    onPress={onPress}>
    <View style={[styles.iconBadge, { backgroundColor: iconBackgroundColor }]}>
      {icon}
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    padding: 20,
    ...shadows.md,
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    marginRight: 16,
    width: 56,
  },
  textContainer: { flex: 1 },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: { color: colors.textSecondary, fontSize: 13 },
});

export default ProcessMenuCard;
