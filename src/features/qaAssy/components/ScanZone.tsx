import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScanBarcode, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { colors, shadows } from '../../../theme';

type Props = {
  label: string;
  scannedValue?: string | null;
  onReset?: () => void;
  onPress?: () => void;
  accentColor?: string;
  placeholder?: string;
};

const ScanZone: React.FC<Props> = ({
  label,
  scannedValue,
  onReset,
  onPress,
  accentColor = colors.indigo,
  placeholder = 'Arahkan scanner ke barcode',
}) => {
  const isScanned = !!scannedValue;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        isScanned
          ? styles.cardDone
          : [styles.cardEmpty, { borderColor: `${accentColor}50` }],
      ]}
    >
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.label,
            { color: isScanned ? colors.success : accentColor },
          ]}
        >
          {label}
        </Text>
        {isScanned && onReset && (
          <TouchableOpacity
            onPress={onReset}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <RefreshCw color={colors.textMuted} size={15} />
          </TouchableOpacity>
        )}
      </View>

      {isScanned ? (
        <View style={styles.valueRow}>
          <CheckCircle2 color={colors.success} size={18} />
          <Text style={styles.value} numberOfLines={2}>
            {scannedValue}
          </Text>
        </View>
      ) : (
        <View style={styles.emptyRow}>
          <ScanBarcode color={accentColor} size={22} />
          <Text style={[styles.hint, { color: accentColor }]}>{placeholder}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  cardDone: {
    borderWidth: 1,
    borderColor: `${colors.success}40`,
  },
  cardEmpty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  value: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  hint: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ScanZone;
