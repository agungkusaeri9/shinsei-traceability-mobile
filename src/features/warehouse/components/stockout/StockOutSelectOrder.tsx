import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Factory } from 'lucide-react-native';
import { colors } from '../../../../theme';
import Button from '../../../../components/Button';
import InfoBanner from '../InfoBanner';
import InlineDropdown from '../InlineDropdown';
import type { DropdownOption } from '../InlineDropdown';

type Props = {
  refreshing: boolean;
  onRefresh: () => void;
  loadingOrders: boolean;
  orderOptions: DropdownOption[];
  selectedOrderId: number | null;
  onSelectOrder: (id: string) => void;
  onToggleDropdown: (open: boolean) => void;
  onSearch: () => void;
  loadingOrderDetail: boolean;
  onCancel: () => void;
  scrollEnabled?: boolean;
};

/** Stock Out step 1: pick a Work Order and search its detail. */
const StockOutSelectOrder: React.FC<Props> = ({
  refreshing,
  onRefresh,
  loadingOrders,
  orderOptions,
  selectedOrderId,
  onSelectOrder,
  onToggleDropdown,
  onSearch,
  loadingOrderDetail,
  onCancel,
  scrollEnabled = true,
}) => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
    keyboardShouldPersistTaps="handled"
    scrollEnabled={scrollEnabled}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[colors.orange]}
        tintColor={colors.orange}
      />
    }>
    <InfoBanner
      icon={<Factory color={colors.orange} size={20} />}
      text="Pilih Order untuk memulai proses stock out"
      bgColor={`${colors.orange}12`}
    />

    {loadingOrders ? (
      <View style={styles.loadingField}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat data Order...</Text>
      </View>
    ) : (
      <InlineDropdown
        label="Order"
        options={orderOptions}
        selectedValue={selectedOrderId ? String(selectedOrderId) : ''}
        onSelect={onSelectOrder}
        placeholder="Pilih Order..."
        searchPlaceholder="Cari Order..."
        clearable
        onToggle={onToggleDropdown}
      />
    )}

    <View style={styles.buttonRow}>
      <Button
        title="Batal"
        variant="outline"
        onPress={onCancel}
        style={styles.halfBtn}
      />
      <Button
        title="Cari"
        onPress={onSearch}
        isLoading={loadingOrderDetail}
        disabled={!selectedOrderId || loadingOrderDetail}
        style={styles.halfBtn}
      />
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 40 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  halfBtn: { flex: 1, paddingVertical: 12 },
  loadingField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});

export default StockOutSelectOrder;
