import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ChevronDown, CheckCircle2, X } from 'lucide-react-native';
import { colors, shadows } from '../../../theme';

export type DropdownOption = {
  id: string;
  label: string;
};

type Props = {
  label?: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  clearable?: boolean;
  onToggle?: (isOpen: boolean) => void;
};

/**
 * Inline dropdown matching PartAcceptanceScreen UX pattern.
 * Tap trigger → opens inline search + scrollable list below.
 */
const InlineDropdown: React.FC<Props> = ({
  label,
  options,
  selectedValue,
  onSelect,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  required = false,
  clearable = false,
  onToggle,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    return options.filter(o =>
      o.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, options]);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    onToggle?.(next);
    if (!next) setSearch('');
  };

  const handleSelect = (id: string) => {
    setOpen(false);
    setSearch('');
    onToggle?.(false);
    onSelect(id);
  };

  const handleClear = () => {
    onSelect('');
    setSearch('');
  };

  const selectedLabel = options.find(o => o.id === selectedValue)?.label;

  return (
    <View style={styles.row}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.trigger,
          required && !selectedValue && styles.triggerRequired,
        ]}
        onPress={toggleOpen}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedValue && styles.triggerPlaceholder,
          ]}
          numberOfLines={1}
        >
          {selectedValue ? selectedLabel || placeholder : placeholder}
        </Text>
        {clearable && selectedValue ? (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X color={colors.textMuted} size={16} />
          </TouchableOpacity>
        ) : (
          <ChevronDown color={colors.textMuted} size={16} />
        )}
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownContainer}>
          <TextInput
            style={styles.dropdownSearch}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView
            style={styles.dropdownList}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {filtered.length === 0 ? (
              <Text style={styles.dropdownEmpty}>Data tidak ditemukan</Text>
            ) : (
              filtered.map(item => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  style={[
                    styles.dropdownItem,
                    selectedValue === item.id && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleSelect(item.id)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedValue === item.id &&
                      styles.dropdownItemTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  {selectedValue === item.id && (
                    <CheckCircle2 color={colors.success} size={16} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { zIndex: 1 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: `${colors.textMuted}30`,
    ...shadows.sm,
  },
  triggerRequired: {
    borderColor: `${colors.warning}60`,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginRight: 8,
  },
  triggerPlaceholder: {
    color: colors.textMuted,
  },
  dropdownContainer: {
    marginTop: 4,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.textMuted}20`,
    overflow: 'hidden',
    ...shadows.md,
  },
  dropdownSearch: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textMuted}15`,
  },
  dropdownList: { maxHeight: 180 },
  dropdownEmpty: {
    padding: 16,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textMuted}10`,
  },
  dropdownItemActive: {
    backgroundColor: `${colors.success}10`,
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginRight: 8,
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: colors.success,
  },
});

export default InlineDropdown;