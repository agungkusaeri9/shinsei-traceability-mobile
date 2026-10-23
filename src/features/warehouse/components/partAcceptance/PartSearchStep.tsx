import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { colors, shadows } from '../../../../theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  isSearching: boolean;
};

/** Part Acceptance step 1: scan / type Part No and search. */
const PartSearchStep: React.FC<Props> = ({
  value,
  onChangeText,
  onSearch,
  isSearching,
}) => (
  <View style={styles.stepCard}>
    <View style={styles.stepHeader}>
      <Search color={colors.primary} size={18} />
      <Text style={styles.stepTitle}>Langkah 1: Scan / Input Part No</Text>
    </View>
    <Text style={styles.stepDesc}>Scan atau masukkan Part No lalu tekan Enter untuk mencari.</Text>
    <View style={styles.searchRow}>
      <View style={styles.searchInputWrapper}>
        <TextInput style={styles.searchInput} placeholder="Masukkan Part No" placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSearch}
          returnKeyType="search" />
      </View>
      <TouchableOpacity activeOpacity={0.8}
        style={[styles.searchBtn, (isSearching || !value.trim()) && styles.searchBtnDisabled]}
        onPress={onSearch} disabled={isSearching || !value.trim()}>
        {isSearching ? <ActivityIndicator color={colors.textInverse} size="small" /> : <Search color={colors.textInverse} size={18} />}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  stepCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: `${colors.textMuted}15`, ...shadows.sm },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  stepDesc: { fontSize: 13, color: colors.textSecondary, marginBottom: 14, lineHeight: 18 },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchInputWrapper: { flex: 1, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1.5, borderColor: `${colors.textMuted}30`, paddingHorizontal: 14 },
  searchInput: { height: 44, fontSize: 14, color: colors.textPrimary },
  searchBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  searchBtnDisabled: { opacity: 0.5 },
});

export default PartSearchStep;
