import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { colors } from '../../../../theme';
import type { MissingPart } from '../../types';

type Props = {
  parts: MissingPart[];
};

/** "Part Belum Tersedia" block listing parts with insufficient stock. */
const MissingPartsList: React.FC<Props> = ({ parts }) => {
  if (parts.length === 0) {
    return null;
  }
  return (
    <View style={styles.missingSection}>
      <Text style={styles.missingSectionTitle}>Part Belum Tersedia</Text>
      {parts.map((p, i) => (
        <View key={`missing-${i}`} style={styles.missingItem}>
          <AlertCircle color={colors.warning ?? '#F59E0B'} size={14} />
          <View style={{ flex: 1 }}>
            <Text style={styles.missingPartNumber}>{p.partNumber}</Text>
            <Text style={styles.missingPartCount}>Qty kurang: {p.stkCount}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  missingSection: {
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#FEF3C710',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F59E0B20',
  },
  missingSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  missingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B15',
  },
  missingPartNumber: { fontSize: 13, fontWeight: '600', color: '#92400E' },
  missingPartCount: { fontSize: 11, color: '#B45309', marginTop: 2 },
});

export default MissingPartsList;
