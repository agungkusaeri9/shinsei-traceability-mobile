import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  PackageSearch,
  RotateCcw,
  ScanBarcode,
} from 'lucide-react-native';

import type { RootStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import { useCheckStkFlow } from '../hooks/useCheckStkFlow';
import type { StkTimelines } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckStk'>;

const TIMELINE_STAGES: Array<{
  key: keyof StkTimelines;
  label: string;
}> = [
  { key: 'partAcceptance', label: 'Part Acceptance' },
  { key: 'stockIn', label: 'Stock In' },
  { key: 'materialFeeding', label: 'Material Feeding' },
  { key: 'smt', label: 'SMT' },
  { key: 'assembly', label: 'Assembly' },
  { key: 'finishGood', label: 'Finish Good' },
];

const CheckStkScreen: React.FC<Props> = ({ navigation }) => {
  const { scannedStk, timeline, isLoading, errorMessage, handleReset } =
    useCheckStkFlow();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.header} />

      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Kembali"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color={colors.textInverse} size={22} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Check STK</Text>
          <Text style={styles.headerSubtitle}>
            Lacak posisi dan proses terakhir
          </Text>
        </View>
        <PackageSearch color={colors.textInverse} size={24} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scanCard}>
          <View style={styles.scanIcon}>
            <ScanBarcode color={colors.primary} size={30} />
          </View>
          <View style={styles.scanText}>
            <Text style={styles.scanTitle}>
              {scannedStk || 'Scan barcode STK'}
            </Text>
            <Text style={styles.scanDescription}>
              Scan barcode STK untuk melacak posisi dan proses.
            </Text>
          </View>
          {scannedStk ? (
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <RotateCcw color={colors.primary} size={18} />
            </TouchableOpacity>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.stateTitle}>Mengecek STK...</Text>
            <Text style={styles.stateDescription}>
              Mengambil posisi dan timeline terbaru.
            </Text>
          </View>
        ) : null}

        {errorMessage && !isLoading ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Data STK tidak tersedia</Text>
            <Text style={styles.errorDescription}>{errorMessage}</Text>
            <Text style={styles.errorHint}>
              Silakan scan ulang barcode STK.
            </Text>
          </View>
        ) : null}

        {timeline && !isLoading ? (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View>
                  <Text style={styles.eyebrow}>POSISI SAAT INI</Text>
                  <Text style={styles.currentStage}>
                    {timeline.currentStage}
                  </Text>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Aktif</Text>
                </View>
              </View>

              <View style={styles.updatedRow}>
                <Clock3 color={colors.textMuted} size={15} />
                <Text style={styles.updatedText}>
                  Terakhir diproses {timeline.lastUpdated}
                </Text>
              </View>

              <View style={styles.divider} />
              <InfoRow
                label="STK Number"
                value={timeline.stkNumber}
                prominent
              />
              <InfoRow label="Part Code" value={timeline.partCode} />
              <InfoRow label="Part Name" value={timeline.partName} />
              <InfoRow
                label="Quantity"
                value={timeline.quantity.toLocaleString('id-ID')}
              />
              <InfoRow label="Supplier" value={timeline.supplierName || '-'} />
              <InfoRow label="Customer" value={timeline.customerName || '-'} />
            </View>

            <View style={styles.timelineCard}>
              <Text style={styles.sectionTitle}>Riwayat Proses</Text>
              <Text style={styles.sectionSubtitle}>
                Urutan perjalanan STK di setiap area produksi.
              </Text>

              <View style={styles.timelineList}>
                {TIMELINE_STAGES.map((stage, index) => {
                  const timestamp = timeline.timelines[stage.key];
                  const complete = Boolean(timestamp);
                  const isLast = index === TIMELINE_STAGES.length - 1;

                  return (
                    <View key={stage.key} style={styles.timelineItem}>
                      <View style={styles.timelineRail}>
                        {complete ? (
                          <CheckCircle2 color={colors.success} size={22} />
                        ) : (
                          <Circle color={colors.arrowMuted} size={22} />
                        )}
                        {!isLast ? (
                          <View
                            style={[
                              styles.timelineLine,
                              complete && styles.timelineLineComplete,
                            ]}
                          />
                        ) : null}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text
                          style={[
                            styles.timelineLabel,
                            complete && styles.timelineLabelComplete,
                          ]}
                        >
                          {stage.label}
                        </Text>
                        <Text style={styles.timelineDate}>
                          {timestamp || 'Belum diproses'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({
  label,
  value,
  prominent = false,
}: {
  label: string;
  value: string;
  prominent?: boolean;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, prominent && styles.infoValueProminent]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    alignItems: 'center',
    backgroundColor: colors.header,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  headerText: { flex: 1 },
  headerTitle: { color: colors.textInverse, fontSize: 19, fontWeight: '800' },
  headerSubtitle: { color: colors.textHeaderMuted, fontSize: 12, marginTop: 2 },
  content: { padding: 16, paddingBottom: 40 },
  scanCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: `${colors.primary}30`,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 16,
    ...shadows.sm,
  },
  scanIcon: {
    alignItems: 'center',
    backgroundColor: `${colors.primary}12`,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  scanText: { flex: 1, marginLeft: 13 },
  scanTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  scanDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: `${colors.primary}12`,
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    marginLeft: 8,
    width: 38,
  },
  stateCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginTop: 16,
    padding: 28,
    ...shadows.sm,
  },
  stateTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
  },
  stateDescription: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  errorCard: {
    backgroundColor: `${colors.danger}0D`,
    borderColor: `${colors.danger}35`,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    padding: 18,
  },
  errorTitle: { color: colors.danger, fontSize: 15, fontWeight: '800' },
  errorDescription: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  errorHint: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginTop: 16,
    padding: 18,
    ...shadows.sm,
  },
  summaryHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  currentStage: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 5,
  },
  activeBadge: {
    backgroundColor: `${colors.success}15`,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeBadgeText: { color: colors.success, fontSize: 11, fontWeight: '800' },
  updatedRow: { alignItems: 'center', flexDirection: 'row', marginTop: 10 },
  updatedText: { color: colors.textSecondary, fontSize: 12, marginLeft: 6 },
  divider: { backgroundColor: colors.border, height: 1, marginVertical: 16 },
  infoRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: { color: colors.textSecondary, fontSize: 12, width: '34%' },
  infoValue: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  infoValueProminent: { color: colors.primary, fontWeight: '800' },
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginTop: 16,
    padding: 18,
    ...shadows.sm,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  timelineList: { marginTop: 18 },
  timelineItem: { flexDirection: 'row', minHeight: 65 },
  timelineRail: { alignItems: 'center', width: 26 },
  timelineLine: {
    backgroundColor: colors.surfaceVariant,
    flex: 1,
    marginVertical: 3,
    width: 2,
  },
  timelineLineComplete: { backgroundColor: `${colors.success}60` },
  timelineContent: { flex: 1, paddingBottom: 16, paddingLeft: 12 },
  timelineLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  timelineLabelComplete: { color: colors.textPrimary },
  timelineDate: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});

export default CheckStkScreen;
