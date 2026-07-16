import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Search, ChevronDown, CheckCircle2, X } from 'lucide-react-native';
import { colors, shadows } from '../../../theme';
import type { WorkOrderOption } from '../types';

type Props = {
  options: WorkOrderOption[];
  selectedValue: string;
  onSelect: (id: string) => void;
  onClear: () => void;
  label?: string;
  placeholder?: string;
  onBlur?: () => void;
};

const SearchableDropdown: React.FC<Props> = ({
  options,
  selectedValue,
  onSelect,
  onClear,
  label = 'Work Order',
  placeholder = 'Cari atau pilih Work Order...',
  onBlur,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    return options.filter(opt =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, options]);

  const handleSelect = (id: string) => {
    setSearchQuery('');
    setShowDropdown(false);
    onSelect(id);
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.searchDropdown}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Search color={colors.textMuted} size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={
            showDropdown
              ? searchQuery
              : options.find(o => o.id === selectedValue)?.label || ''
          }
          onChangeText={text => {
            setSearchQuery(text);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => {
            // Delay to allow item selection to fire first
            setTimeout(() => {
              setShowDropdown(false);
              onBlur?.();
            }, 200);
          }}
          returnKeyType="search"
        />
        <ChevronDown
          color={colors.textMuted}
          size={20}
          style={{
            transform: [{ rotate: showDropdown ? '180deg' : '0deg' }],
          }}
        />
      </TouchableOpacity>

      {/* Selected indicator */}
      {selectedValue && !showDropdown && (
        <View style={styles.selectedBadge}>
          <CheckCircle2 color={colors.success} size={16} />
          <Text style={styles.selectedText}>
            Dipilih:{' '}
            {options.find(o => o.id === selectedValue)?.label || selectedValue}
          </Text>
          <TouchableOpacity
            onPress={() => {
              onClear();
              setSearchQuery('');
              setShowDropdown(true);
            }}
          >
            <X color={colors.textMuted} size={16} />
          </TouchableOpacity>
        </View>
      )}

      {showDropdown && (
        <View style={styles.dropdownList}>
          {filteredOptions.length === 0 ? (
            <View style={styles.emptyDropdown}>
              <Text style={styles.emptyText}>
                "{searchQuery}" tidak ditemukan
              </Text>
            </View>
          ) : (
            filteredOptions.map(opt => (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.7}
                style={[
                  styles.dropdownItem,
                  selectedValue === opt.id && styles.dropdownItemActive,
                ]}
                onPress={() => handleSelect(opt.id)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedValue === opt.id && styles.dropdownItemTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {selectedValue === opt.id && (
                  <CheckCircle2 color={colors.success} size={18} />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  searchDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${colors.textMuted}30`,
    marginBottom: 8,
    gap: 8,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 12,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${colors.success}12`,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  selectedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
  dropdownList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.textMuted}20`,
    marginBottom: 16,
    maxHeight: 220,
    overflow: 'hidden',
    ...shadows.md,
  },
  emptyDropdown: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textMuted}10`,
  },
  dropdownItemActive: {
    backgroundColor: `${colors.success}10`,
  },
  dropdownItemText: { fontSize: 15, color: colors.textPrimary },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: colors.success,
  },
});

export default SearchableDropdown;
