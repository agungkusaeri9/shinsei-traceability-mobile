import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, ScanBarcode } from 'lucide-react-native';
import { colors, shadows } from '../../../theme';

type Props = {
  scannedValue: string;
  isSubmitted: boolean;
};

const ScanResultCard: React.FC<Props> = ({ scannedValue, isSubmitted }) => {
  return (
    <View style={[styles.card, isSubmitted && styles.cardSuccess]}>
      <View style={styles.header}>
        {isSubmitted ? (
          <CheckCircle2 color={colors.success} size={24} />
        ) : (
          <ScanBarcode color={colors.primary} size={24} />
        )}
        <Text style={styles.label}>
          {isSubmitted ? 'STK Tersubmit' : 'STK Ter-scan'}
        </Text>
      </View>
      <Text style={styles.value}>{scannedValue}</Text>
    </View>
  );
};

export const ScanPlaceholder: React.FC = () => (
  <View style={styles.placeholder}>
    <ScanBarcode color={colors.textMuted} size={40} />
    <Text style={styles.placeholderText}>Menunggu scan STK Number...</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${colors.primary}40`,
    marginBottom: 20,
    ...shadows.md,
  },
  cardSuccess: {
    borderColor: `${colors.success}60`,
    backgroundColor: `${colors.success}08`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: { fontSize: 13, color: colors.textSecondary },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  placeholder: {
    backgroundColor: `${colors.textMuted}08`,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${colors.textMuted}20`,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 12,
  },
});

export default ScanResultCard;
