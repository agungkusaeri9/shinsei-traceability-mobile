import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { colors, shadows } from '../../../theme';

type Props = {
  stkNumber: string;
  isScanned: boolean;
  onPress: () => void;
};

const StkScanItem: React.FC<Props> = ({ stkNumber, isScanned, onPress }) => {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.item, isScanned && styles.itemScanned]}>
        {isScanned ? (
          <CheckCircle2 color={colors.success} size={22} />
        ) : (
          <Circle color={colors.textMuted} size={22} />
        )}
        <Text style={[styles.text, isScanned && styles.textScanned]}>
          {stkNumber}
        </Text>
        {isScanned && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Scanned</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: `${colors.textMuted}20`,
    ...shadows.sm,
  },
  itemScanned: {
    borderColor: `${colors.success}40`,
    backgroundColor: `${colors.success}08`,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 12,
  },
  textScanned: {
    color: colors.success,
  },
  badge: {
    backgroundColor: `${colors.success}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
});

export default StkScanItem;
