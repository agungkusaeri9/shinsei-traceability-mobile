import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../../theme';
import type { StkLocation } from '../../types';
import StkLocationCard from './StkLocationCard';

type Props = {
  locations: StkLocation[];
};

/** "Target Lokasi Penyimpanan" section listing the valid locations of an STK. */
const StkLocationsList: React.FC<Props> = ({ locations }) => {
  if (locations.length === 0) {
    return null;
  }
  return (
    <View style={styles.locationsSection}>
      <Text style={styles.sectionHeaderTitle}>
        Target Lokasi Penyimpanan ({locations.length})
      </Text>
      {locations.map((loc, idx) => (
        <StkLocationCard
          key={`${loc.rack}-${loc.shelf}-${loc.bin}-${idx}`}
          title={`Lokasi ${locations.length > 1 ? `#${idx + 1}` : ''}`}
          rack={loc.rack}
          shelf={loc.shelf}
          bin={loc.bin}
          description={[loc.position, loc.description].filter(Boolean).join(' • ')}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  locationsSection: {
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
});

export default StkLocationsList;
