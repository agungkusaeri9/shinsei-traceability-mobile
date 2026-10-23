import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ChevronDown, CheckCircle2, X } from 'lucide-react-native';
import { colors, shadows } from '../../../../theme';

export type FilterOption = {
  id: number;
  name: string;
};

type Props = {
  label: string;
  options: FilterOption[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  open: boolean;
  onToggle: () => void;
  clearable?: boolean;
  required?: boolean;
};

/**
 * Filter dropdown (Customer / Area Warehouse) of Part Acceptance.
 * The open state is lifted to the parent so both dropdowns can close each other.
 */
const PartFilterDropdown: React.FC<Props> = ({
  label,
  options,
  selectedId,
  onSelect,
  placeholder,
  searchPlaceholder,
  emptyText,
  open,
  onToggle,
  clearable = false,
  required = false,
}) => {
  const [search, setSearch] = useState('');
  const selected = options.find(o => o.id === selectedId);
  const filtered = search.trim()
    ? options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (id: number) => {
    onSelect(id);
    setSearch('');
  };

  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.filterDropdown, required && !selectedId && styles.filterDropdownRequired]}
        onPress={onToggle}>
        <Text
          style={[styles.filterDropdownText, !selectedId && styles.filterPlaceholder]}
          numberOfLines={1}>
          {selected ? selected.name : placeholder}
        </Text>
        {clearable && selectedId != null
          ? <TouchableOpacity onPress={() => onSelect(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><X color={colors.textMuted} size={16} /></TouchableOpacity>
          : <ChevronDown color={colors.textMuted} size={16} />}
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownContainer}>
          <TextInput style={styles.dropdownSearch} placeholder={searchPlaceholder} placeholderTextColor={colors.textMuted}
            value={search} onChangeText={setSearch} />
          <ScrollView style={styles.dropdownList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {filtered.length === 0
              ? <Text style={styles.dropdownEmpty}>{emptyText}</Text>
              : filtered.map(o => (
                <TouchableOpacity key={o.id} activeOpacity={0.7}
                  style={[styles.dropdownItem, selectedId === o.id && styles.dropdownItemActive]}
                  onPress={() => handleSelect(o.id)}>
                  <Text style={[styles.dropdownItemText, selectedId === o.id && styles.dropdownItemTextActive]} numberOfLines={1}>{o.name}</Text>
                  {selectedId === o.id && <CheckCircle2 color={colors.success} size={16} />}
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filterRow: { zIndex: 1 },
  filterLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  filterDropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: `${colors.textMuted}30`, ...shadows.sm },
  filterDropdownRequired: { borderColor: `${colors.warning}60` },
  filterDropdownText: { flex: 1, fontSize: 14, color: colors.textPrimary, marginRight: 8 },
  filterPlaceholder: { color: colors.textMuted },
  dropdownContainer: { marginTop: 4, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: `${colors.textMuted}20`, overflow: 'hidden', ...shadows.md },
  dropdownSearch: { paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: `${colors.textMuted}15` },
  dropdownList: { maxHeight: 180 },
  dropdownEmpty: { padding: 16, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: `${colors.textMuted}10` },
  dropdownItemActive: { backgroundColor: `${colors.success}10` },
  dropdownItemText: { flex: 1, fontSize: 14, color: colors.textPrimary, marginRight: 8 },
  dropdownItemTextActive: { fontWeight: '700', color: colors.success },
});

export default PartFilterDropdown;
