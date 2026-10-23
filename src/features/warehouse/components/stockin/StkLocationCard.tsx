import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin, CheckCircle2 } from 'lucide-react-native';
import { colors, shadows } from '../../../../theme';

type Props = {
  title: string;
  rack: string;
  shelf: string;
  bin: string;
  description?: string;
  variant?: 'default' | 'verified';
};

/**
 * Location card for Stock In: target-location list item (default) or the
 * verified scanned location (verified).
 */
const StkLocationCard: React.FC<Props> = ({
  title,
  rack,
  shelf,
  bin,
  description,
  variant = 'default',
}) => {
  const verified = variant === 'verified';
  return (
    <View style={[styles.locationCard, verified && styles.verifiedCard]}>
      <View style={styles.locationHeader}>
        {verified ? (
          <CheckCircle2 color={colors.success} size={18} />
        ) : (
          <MapPin color={colors.primary} size={18} />
        )}
        <Text
          style={[styles.locationTitle, verified && styles.locationTitleVerified]}>
          {title}
        </Text>
      </View>
      <View style={styles.locationGrid}>
        <View style={styles.locationItem}>
          <Text style={styles.locationLabel}>Rack</Text>
          <Text style={styles.locationValue}>{rack}</Text>
        </View>
        <View style={styles.locationItem}>
          <Text style={styles.locationLabel}>Shelf</Text>
          <Text style={styles.locationValue}>{shelf}</Text>
        </View>
        <View style={styles.locationItem}>
          <Text style={styles.locationLabel}>Bin</Text>
          <Text style={styles.locationValue}>{bin}</Text>
        </View>
      </View>
      {!!description && <Text style={styles.locationDesc}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  locationCard: {
    backgroundColor: `${colors.primary}08`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  verifiedCard: {
    backgroundColor: `${colors.success}08`,
    borderColor: `${colors.success}30`,
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  locationTitleVerified: {
    color: colors.success,
  },
  locationGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  locationItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    ...shadows.sm,
  },
  locationLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  locationDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default StkLocationCard;
