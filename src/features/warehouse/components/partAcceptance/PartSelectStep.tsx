import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Package, MapPin, ChevronRight } from 'lucide-react-native';
import { colors, shadows } from '../../../../theme';
import { getPartDisplayLocations } from '../../services/partAcceptanceService';
import type { PartSearchResult } from '../../types';

type Props = {
  results: PartSearchResult[];
  onSelect: (part: PartSearchResult) => void;
};

/** Part Acceptance step 2 (multi-match): pick one of the found parts. */
const PartSelectStep: React.FC<Props> = ({ results, onSelect }) => (
  <View style={styles.stepCard}>
    <View style={styles.stepHeader}>
      <Package color={colors.orange} size={18} />
      <Text style={styles.stepTitle}>Langkah 2: Pilih Part ({results.length} ditemukan)</Text>
    </View>
    <Text style={styles.stepDesc}>Ditemukan beberapa part. Pilih part yang diinginkan.</Text>
    <ScrollView style={styles.partList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
      {results.map((item, idx) => {
        const locs = getPartDisplayLocations(item);
        return (
          <TouchableOpacity key={`${item.id}-${idx}`} activeOpacity={0.7} style={styles.partItem}
            onPress={() => onSelect(item)}>
            <View style={styles.partItemLeft}>
              <View style={styles.partItemBadge}>
                <Text style={styles.partItemBadgeText}>{item.inventoryCode || item.code || '-'}</Text>
              </View>
              <View style={styles.partItemInfo}>
                <Text style={styles.partItemName} numberOfLines={1}>{item.partName || item.name || '-'}</Text>
                <Text style={styles.partItemSub} numberOfLines={1}>{item.supplier?.name || '-'} · {item.customer?.name || '-'}</Text>
                {locs.length > 0 && (
                  <View style={styles.partItemLocations}>
                    {locs.slice(0, 3).map((loc, lidx) => (
                      <View key={`${loc}-${lidx}`} style={styles.locationTag}>
                        <MapPin color={colors.primary} size={10} />
                        <Text style={styles.locationTagText} numberOfLines={1}>{loc}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
            <ChevronRight color={colors.textMuted} size={20} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  stepCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: `${colors.textMuted}15`, ...shadows.sm },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  stepDesc: { fontSize: 13, color: colors.textSecondary, marginBottom: 14, lineHeight: 18 },
  partList: { maxHeight: 320 },
  partItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: `${colors.textMuted}12` },
  partItemLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginRight: 8 },
  partItemBadge: { backgroundColor: `${colors.primary}12`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, minWidth: 60, alignItems: 'center' },
  partItemBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  partItemInfo: { flex: 1 },
  partItemName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  partItemSub: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  partItemLocations: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  locationTag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: `${colors.primary}10`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  locationTagText: { fontSize: 10, color: colors.primary, fontWeight: '500', maxWidth: 100 },
});

export default PartSelectStep;
