import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { CheckCircle2, AlertTriangle, MapPin } from 'lucide-react-native';
import { colors, shadows } from '../../../../theme';
import Button from '../../../../components/Button';
import { getPartDisplayLocations } from '../../services/partAcceptanceService';
import type { PartSearchResult } from '../../types';

type Props = {
  part: PartSearchResult;
  quantity: string;
  onQuantityChange: (text: string) => void;
  expiredDate: string;
  onExpiredDateChange: (text: string) => void;
  selectedCustomerId: number | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onReset: () => void;
  /** searchResults.length > 1 — step label becomes "Langkah 3". */
  multi: boolean;
};

/** Part Acceptance final step: review part detail, fill quantity & expired date. */
const PartDetailStep: React.FC<Props> = ({
  part,
  quantity,
  onQuantityChange,
  expiredDate,
  onExpiredDateChange,
  selectedCustomerId,
  isSubmitting,
  onSubmit,
  onReset,
  multi,
}) => {
  const locs = getPartDisplayLocations(part);
  const stepLabel = multi ? 'Langkah 3' : 'Langkah 2';
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <CheckCircle2 color={colors.success} size={18} />
        <Text style={styles.stepTitle}>{stepLabel}: Konfirmasi & Submit</Text>
      </View>
      <Text style={styles.stepDesc}>Periksa detail part, masukkan quantity dan expired date.</Text>

      <View style={styles.partInfoHeader}>
        <Text style={styles.partInfoPartNumber}>{part.partNumber || '-'}</Text>
        <View style={styles.partInfoBadge}><Text style={styles.partInfoBadgeText}>{part.inventoryCode || part.code || '-'}</Text></View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>PDDM</Text><Text style={styles.detailValue} numberOfLines={1}>{part.inventoryCode || part.code || '-'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Part Name</Text><Text style={styles.detailValue} numberOfLines={1}>{part.partName || part.name || '-'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Customer</Text><Text style={styles.detailValue} numberOfLines={1}>{part.customer?.name || '-'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Supplier</Text><Text style={styles.detailValue} numberOfLines={1}>{part.supplier?.name || '-'}</Text></View>
      </View>

      {selectedCustomerId && part.customer?.id !== selectedCustomerId && (
        <View style={styles.warningBox}>
          <AlertTriangle color={colors.warning} size={16} />
          <Text style={styles.warningText}>{part.customer?.id ? `Customer tidak cocok. Part customer: ${part.customer.name}` : 'Part ini tidak memiliki customer.'}</Text>
        </View>
      )}

      <View style={styles.locationsSection}>
        <Text style={styles.sectionLabel}>Lokasi Rak</Text>
        {locs.length > 0 ? (
          <View style={styles.locationTags}>
            {locs.map((loc, idx) => (
              <View key={`${loc}-${idx}`} style={styles.locationBadge}>
                <MapPin color={colors.primary} size={12} />
                <Text style={styles.locationBadgeText}>{loc}</Text>
              </View>
            ))}
          </View>
        ) : <Text style={styles.noLocation}>Belum ada lokasi</Text>}
      </View>

      <View style={styles.formSection}>
        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Quantity *</Text>
            <TextInput style={styles.formInput} placeholder="Qty" placeholderTextColor={colors.textMuted}
              value={quantity} onChangeText={onQuantityChange} keyboardType="numeric" />
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Expired Date *</Text>
            <TextInput style={styles.formInput} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted}
              value={expiredDate} onChangeText={onExpiredDateChange} />
          </View>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Button title="Reset" onPress={onReset} variant="outline" style={styles.resetBtn} />
        <Button title="Submit Part" onPress={onSubmit} isLoading={isSubmitting} disabled={isSubmitting} style={styles.submitBtn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: `${colors.textMuted}15`, ...shadows.sm },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  stepDesc: { fontSize: 13, color: colors.textSecondary, marginBottom: 14, lineHeight: 18 },
  partInfoHeader: { alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: `${colors.textMuted}15`, marginBottom: 16 },
  partInfoPartNumber: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, letterSpacing: 0.5, marginBottom: 8, textAlign: 'center' },
  partInfoBadge: { backgroundColor: `${colors.primary}12`, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  partInfoBadgeText: { fontSize: 13, fontWeight: '700', color: colors.primary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  detailsGrid: { backgroundColor: colors.background, borderRadius: 12, padding: 12, marginBottom: 12, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  detailLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, maxWidth: '60%', textAlign: 'right' },
  warningBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: `${colors.warning}12`, borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: `${colors.warning}30` },
  warningText: { flex: 1, fontSize: 12, color: colors.warning, fontWeight: '500', lineHeight: 18 },
  locationsSection: { marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  locationTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${colors.primary}10`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: `${colors.primary}20` },
  locationBadgeText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  noLocation: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
  formSection: { backgroundColor: colors.background, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: `${colors.textMuted}15` },
  formRow: { flexDirection: 'row', gap: 12 },
  formField: { flex: 1 },
  formLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  formInput: { backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1.5, borderColor: `${colors.textMuted}30`, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.textPrimary },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 10,
  },

  submitBtn: {
    flex: 1.5,
    paddingVertical: 10,
  },
});

export default PartDetailStep;
