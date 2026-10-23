import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Box as BoxIcon,
  Check,
  CheckCircle2,
  ChevronRight,
  Info,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Send,
  Truck,
} from 'lucide-react-native';

import LoadingRow from '../../../components/LoadingRow';
import { colors, shadows } from '../../../theme';
import QaAssyHeader from '../../qaAssy/components/QaAssyHeader';
import ScanZone from '../../qaAssy/components/ScanZone';
import InlineDropdown from '../../warehouse/components/InlineDropdown';
import { useDeliveryFlow } from '../hooks/useDeliveryFlow';

type Props = {
  navigation: NativeStackNavigationProp<Record<string, object | undefined>>;
};

const DeliveryScreen: React.FC<Props> = ({ navigation }) => {
  const {
    poList,
    isLoadingPoList,
    selectedPo,
    isLoadingPoDetail,
    expectedBoxes,
    scannedBoxes,
    lastScannedBox,
    isSubmitting,
    lastDelivered,
    poDropdownOptions,
    progressPercent,
    canSubmit,
    loadPoList,
    handlePoSelection,
    handleResetPo,
    handleRemoveScannedBox,
    handleSubmitDelivery,
    handleDropdownToggle,
    isBoxScanned,
  } = useDeliveryFlow();

  return (
    <View style={styles.container}>
      <QaAssyHeader
        title="Delivery"
        subtitle={selectedPo ? `PO: ${selectedPo}` : 'Pilih PO & Scan Box'}
        icon={<Truck color={colors.warning} size={20} />}
        onBack={() => navigation.goBack()}
        rightSlot={
          selectedPo ? (
            <TouchableOpacity
              style={styles.headerResetButton}
              onPress={handleResetPo}
              activeOpacity={0.7}>
              <RotateCcw color={colors.textInverse} size={16} />
              <Text style={styles.headerResetText}>Ganti PO</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isLoadingPoList}
            onRefresh={loadPoList}
            colors={[colors.warning]}
          />
        }>
        {!selectedPo ? (
          <View style={styles.poSelectSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Pilih PO Number</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadPoList}
                disabled={isLoadingPoList}>
                <RefreshCw
                  color={colors.textSecondary}
                  size={16}
                  style={isLoadingPoList ? styles.loadingIcon : undefined}
                />
              </TouchableOpacity>
            </View>

            {isLoadingPoList ? (
              <LoadingRow text="Memuat daftar PO..." color={colors.warning} />
            ) : (
              <>
                <InlineDropdown
                  label="Cari & Pilih PO"
                  options={poDropdownOptions}
                  selectedValue=""
                  onSelect={handlePoSelection}
                  placeholder="Pilih PO Number..."
                  searchPlaceholder="Cari PO Number..."
                  clearable
                  onToggle={handleDropdownToggle}
                />

                {poList.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <PackageCheck color={colors.textMuted} size={36} />
                    <Text style={styles.emptyTitle}>Tidak Ada Data PO</Text>
                    <Text style={styles.emptySubtitle}>
                      Belum ada data PO Number dari endpoint /api/orderpos.
                    </Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={loadPoList}>
                      <Text style={styles.retryButtonText}>Muat Ulang Data</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.poListSection}>
                    <Text style={styles.poGridTitle}>Daftar PO Terbaru</Text>
                    <View style={styles.poGrid}>
                      {poList.map(po => (
                        <TouchableOpacity
                          key={po.id || po.poNumber}
                          style={styles.poCard}
                          onPress={() => handlePoSelection(po.poNumber)}
                          activeOpacity={0.7}>
                          <View style={styles.poCardLeft}>
                            <View style={styles.poIconBadge}>
                              <BoxIcon color={colors.indigo} size={18} />
                            </View>
                            <View style={styles.flex}>
                              <Text style={styles.poNumberText}>
                                {po.poNumber}
                              </Text>
                              <Text style={styles.poSubtitle}>
                                Tap untuk pilih PO
                              </Text>
                            </View>
                          </View>
                          <ChevronRight color={colors.arrowMuted} size={20} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        ) : (
          <View style={styles.activePoSection}>
            <View style={styles.poSummaryCard}>
              <View style={styles.poSummaryHeader}>
                <View style={styles.flex}>
                  <Text style={styles.poSummaryLabel}>PO Number Terpilih</Text>
                  <Text style={styles.poSummaryValue}>{selectedPo}</Text>
                </View>
                <View style={styles.boxCountBadge}>
                  <Text style={styles.boxCountBadgeText}>
                    {scannedBoxes.length} / {expectedBoxes.length} Box
                  </Text>
                </View>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor:
                        progressPercent === 100
                          ? colors.success
                          : colors.warning,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.infoRow}>
              <Info color={colors.indigo} size={15} />
              <Text style={styles.infoText}>
                Scan box menggunakan trigger fisik KEYENCE. Tap box yang sudah
                ter-scan untuk menghapusnya.
              </Text>
            </View>

            <ScanZone
              label="KEYENCE Box Scanner"
              scannedValue={lastScannedBox}
              accentColor={colors.warning}
              placeholder="Tekan trigger dan scan barcode box..."
            />

            {isLoadingPoDetail ? (
              <LoadingRow text="Memuat detail PO..." color={colors.warning} />
            ) : (
              <View style={styles.boxListSection}>
                <Text style={styles.sectionTitle}>
                  Daftar Box ({scannedBoxes.length}/{expectedBoxes.length})
                </Text>

                {expectedBoxes.length === 0 ? (
                  <View style={styles.emptyBoxNotice}>
                    <Info color={colors.warning} size={16} />
                    <Text style={styles.emptyBoxText}>
                      Tidak ada daftar box terdaftar untuk PO ini.
                    </Text>
                  </View>
                ) : (
                  expectedBoxes.map(boxItem => {
                    const isScanned = isBoxScanned(boxItem.name);
                    return isScanned ? (
                      <TouchableOpacity
                        key={boxItem.id || boxItem.name}
                        style={[styles.boxItemCard, styles.boxItemCardScanned]}
                        onPress={() => handleRemoveScannedBox(boxItem.name)}
                        activeOpacity={0.7}>
                        <View
                          style={[
                            styles.boxCheckCircle,
                            styles.boxCheckCircleActive,
                          ]}>
                          <Check color={colors.textInverse} size={14} />
                        </View>
                        <View style={styles.flex}>
                          <Text
                            style={[
                              styles.boxNameText,
                              styles.boxNameTextScanned,
                            ]}>
                            {boxItem.name}
                          </Text>
                          <Text style={styles.boxStatusText}>
                            Ter-scan • tap untuk hapus
                          </Text>
                        </View>
                        <View style={styles.scannedBadge}>
                          <Text style={styles.scannedBadgeText}>OK</Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View
                        key={boxItem.id || boxItem.name}
                        style={styles.boxItemCard}>
                        <View style={styles.boxCheckCircle} />
                        <View style={styles.flex}>
                          <Text style={styles.boxNameText}>{boxItem.name}</Text>
                          <Text style={styles.boxStatusText}>Belum di-scan</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitDelivery}
              disabled={!canSubmit}
              activeOpacity={0.8}>
              <View style={styles.submitButtonRow}>
                {isSubmitting ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Send color={colors.textInverse} size={18} />
                )}
                <Text style={styles.submitButtonText}>
                  {isSubmitting
                    ? 'Mengirim Delivery...'
                    : `Submit Delivery (${scannedBoxes.length} Box)`}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {lastDelivered && !isSubmitting ? (
          <View style={styles.lastCard}>
            <CheckCircle2 color={colors.success} size={20} />
            <View style={styles.flex}>
              <Text style={styles.lastLabel}>
                Delivery Terakhir ({lastDelivered.timestamp})
              </Text>
              <Text style={styles.lastValue}>PO: {lastDelivered.poNumber}</Text>
              <Text style={styles.lastSubValue}>
                Box: {lastDelivered.boxes.join(', ')}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  headerResetButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerResetText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },
  poSelectSection: { flex: 1 },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  refreshButton: { padding: 6 },
  loadingIcon: { opacity: 0.5 },
  emptyContainer: { alignItems: 'center', marginTop: 16, padding: 32 },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: `${colors.warning}15`,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: { color: colors.warning, fontSize: 13, fontWeight: '600' },
  poListSection: { marginTop: 16 },
  poGridTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  poGrid: { gap: 10 },
  poCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    ...shadows.sm,
  },
  poCardLeft: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12 },
  poIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.iconBadge,
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  poNumberText: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  poSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  activePoSection: { gap: 14 },
  poSummaryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    ...shadows.sm,
  },
  poSummaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  poSummaryLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  poSummaryValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  boxCountBadge: {
    backgroundColor: `${colors.warning}20`,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  boxCountBadgeText: { color: colors.warning, fontSize: 12, fontWeight: '700' },
  progressBackground: {
    backgroundColor: `${colors.warning}15`,
    borderRadius: 3,
    height: 6,
    overflow: 'hidden',
  },
  progressFill: { borderRadius: 3, height: '100%' },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  infoText: { color: colors.textSecondary, flex: 1, fontSize: 13 },
  boxListSection: { gap: 8, marginTop: 8 },
  emptyBoxNotice: {
    alignItems: 'center',
    backgroundColor: `${colors.warning}10`,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  emptyBoxText: { color: colors.textSecondary, flex: 1, fontSize: 13 },
  boxItemCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  boxItemCardScanned: {
    backgroundColor: `${colors.success}08`,
    borderColor: `${colors.success}40`,
  },
  boxCheckCircle: {
    alignItems: 'center',
    borderColor: colors.textMuted,
    borderRadius: 11,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  boxCheckCircleActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  boxNameText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  boxNameTextScanned: { color: colors.textPrimary },
  boxStatusText: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  scannedBadge: {
    backgroundColor: colors.success,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  scannedBadgeText: { color: colors.textInverse, fontSize: 10, fontWeight: '800' },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.warning,
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 14,
    ...shadows.md,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  submitButtonText: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
  lastCard: {
    alignItems: 'center',
    backgroundColor: `${colors.success}10`,
    borderColor: `${colors.success}30`,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    padding: 14,
  },
  lastLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  lastValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  lastSubValue: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});

export default DeliveryScreen;
