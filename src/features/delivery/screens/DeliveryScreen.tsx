import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Truck,
  CheckCircle2,
  Info,
  RefreshCw,
  Box as BoxIcon,
  ChevronRight,
  Send,
  Check,
  PackageCheck,
  RotateCcw,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { colors, shadows } from '../../../theme';
import QaAssyHeader from '../../qaAssy/components/QaAssyHeader';
import ScanZone from '../../qaAssy/components/ScanZone';
import SearchableDropdown from '../../warehouse/components/SearchableDropdown';
import {
  getPoNumbers,
  getBoxesByPo,
  submitDelivery,
  OrderPoItem,
  BoxItem,
} from '../services/deliveryService';
import { showSuccess, showError, showInfo } from '../../../services/toastService';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

const DeliveryScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);
  const [scanBuffer, setScanBuffer] = useState('');

  // PO List state
  const [poList, setPoList] = useState<OrderPoItem[]>([]);
  const [isLoadingPoList, setIsLoadingPoList] = useState(false);

  // Selected PO state
  const [selectedPo, setSelectedPo] = useState<string | null>(null);
  const [isLoadingPoDetail, setIsLoadingPoDetail] = useState(false);
  const [expectedBoxes, setExpectedBoxes] = useState<BoxItem[]>([]);
  const [scannedBoxes, setScannedBoxes] = useState<string[]>([]);

  // Delivery Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastDelivered, setLastDelivered] = useState<{
    poNumber: string;
    boxes: string[];
    timestamp: string;
  } | null>(null);

  const focusScanner = useCallback(() => {
    requestAnimationFrame(() => barcodeRef.current?.focus());
  }, []);

  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => focusScanner(), 200);
      return () => clearTimeout(t);
    }, [focusScanner]),
  );

  // Fetch PO List on mount (/api/orderpos)
  const fetchPoList = async () => {
    setIsLoadingPoList(true);
    try {
      const data = await getPoNumbers();
      setPoList(data);
    } catch (error: any) {
      showError(error?.message || 'Gagal mengambil daftar PO Number');
    } finally {
      setIsLoadingPoList(false);
    }
  };

  useEffect(() => {
    fetchPoList();
  }, []);

  // Dropdown options for PO Selection
  const poDropdownOptions = useMemo(
    () =>
      poList.map((po) => ({
        id: po.poNumber,
        label: po.poNumber,
      })),
    [poList]
  );

  // Handle selecting a PO Number
  const handleSelectPo = async (poNumber: string) => {
    if (!poNumber) return;
    setSelectedPo(poNumber);
    setIsLoadingPoDetail(true);
    setExpectedBoxes([]);
    setScannedBoxes([]);
    try {
      const boxes = await getBoxesByPo(poNumber);
      setExpectedBoxes(boxes);
      showSuccess(`PO ${poNumber} dipilih. ${boxes.length} box didapatkan.`, 'PO Terpilih');
    } catch (error: any) {
      showError(error?.message || `Gagal mengambil detail box PO ${poNumber}`);
    } finally {
      setIsLoadingPoDetail(false);
      focusScanner();
    }
  };

  // Reset PO Selection
  const handleResetPo = () => {
    setSelectedPo(null);
    setExpectedBoxes([]);
    setScannedBoxes([]);
    setScanBuffer('');
    focusScanner();
  };

  // Process barcode scan
  const handleScanSubmit = () => {
    const raw = scanBuffer.trim();
    setScanBuffer('');
    if (!raw) return;

    // If no PO selected yet, try auto-match PO Number
    if (!selectedPo) {
      const matchedPo = poList.find(
        (po) => po.poNumber.toLowerCase() === raw.toLowerCase()
      );
      if (matchedPo) {
        handleSelectPo(matchedPo.poNumber);
      } else {
        showInfo(`Barcode "${raw}" di-scan. Silakan pilih PO Number terlebih dahulu.`);
      }
      return;
    }

    // Process box scan for active PO
    if (scannedBoxes.includes(raw)) {
      showInfo(`Box "${raw}" sudah di-scan.`);
      focusScanner();
      return;
    }

    // Add box to scanned state
    setScannedBoxes((prev) => [...prev, raw]);

    const isExpected = expectedBoxes.some(
      (b) => b.name.toLowerCase() === raw.toLowerCase()
    );

    if (isExpected) {
      showSuccess(`Box "${raw}" terverifikasi!`, 'Box Ter-scan');
    } else {
      showSuccess(`Box "${raw}" berhasil di-scan.`, 'Box Ter-scan');
    }

    focusScanner();
  };

  // Manual box scan toggle
  const handleToggleBoxScan = (boxName: string) => {
    if (scannedBoxes.includes(boxName)) {
      setScannedBoxes((prev) => prev.filter((b) => b !== boxName));
      showInfo(`Scan box "${boxName}" dibatalkan.`);
    } else {
      setScannedBoxes((prev) => [...prev, boxName]);
      showSuccess(`Box "${boxName}" ditandai ter-scan.`, 'Box Ter-scan');
    }
  };

  // Submit Delivery
  const handleSubmitDelivery = async () => {
    if (!selectedPo) {
      showError('Pilih PO Number terlebih dahulu');
      return;
    }

    if (scannedBoxes.length === 0) {
      showError('Scan minimal 1 box sebelum submit delivery');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitDelivery({
        poNumber: selectedPo,
        boxes: scannedBoxes,
      });

      showSuccess(res.message || 'Delivery berhasil disubmit!', 'Delivery Berhasil');
      setLastDelivered({
        poNumber: selectedPo,
        boxes: scannedBoxes,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      });

      // Clear selection after submit
      handleResetPo();
      fetchPoList();
    } catch (error: any) {
      showError(error?.message || 'Gagal mengirim data delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  const expectedBoxNames = expectedBoxes.map((b) => b.name);
  const extraScannedBoxes = scannedBoxes.filter((b) => !expectedBoxNames.includes(b));

  const progressPercent =
    expectedBoxes.length > 0
      ? Math.min(100, Math.round((scannedBoxes.length / expectedBoxes.length) * 100))
      : scannedBoxes.length > 0
        ? 100
        : 0;

  return (
    <View style={styles.container} onTouchStart={focusScanner}>
      <TextInput
        ref={barcodeRef}
        style={styles.hiddenInput}
        value={scanBuffer}
        onChangeText={setScanBuffer}
        onSubmitEditing={handleScanSubmit}
        autoFocus
        showSoftInputOnFocus={false}
        blurOnSubmit={false}
        caretHidden
      />

      <QaAssyHeader
        title="Delivery"
        subtitle={selectedPo ? `PO: ${selectedPo}` : 'Pilih PO & Scan Box'}
        icon={<Truck color={colors.warning} size={20} />}
        onBack={() => navigation.goBack()}
        rightSlot={
          selectedPo ? (
            <TouchableOpacity
              style={styles.headerResetBtn}
              onPress={handleResetPo}
              activeOpacity={0.7}
            >
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
            onRefresh={fetchPoList}
            colors={[colors.warning]}
          />
        }
      >
        {/* Step 1: PO Selection View with SearchableDropdown */}
        {!selectedPo ? (
          <View style={styles.poSelectSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Pilih PO Number</Text>
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={fetchPoList}
                disabled={isLoadingPoList}
              >
                <RefreshCw
                  color={colors.textSecondary}
                  size={16}
                  style={isLoadingPoList ? styles.spinIcon : undefined}
                />
              </TouchableOpacity>
            </View>

            {isLoadingPoList ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.warning} size="small" />
                <Text style={styles.loadingLabel}>Memuat data PO Number...</Text>
              </View>
            ) : (
              <>
                <SearchableDropdown
                  options={poDropdownOptions}
                  selectedValue={selectedPo || ''}
                  onSelect={handleSelectPo}
                  onClear={handleResetPo}
                  label="Cari & Pilih PO"
                  placeholder="Ketik atau pilih PO Number..."
                />

                {poList.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <PackageCheck color={colors.textMuted} size={36} />
                    <Text style={styles.emptyTitle}>Tidak Ada Data PO</Text>
                    <Text style={styles.emptySub}>
                      Belum ada data PO Number dari endpoint /api/orderpos.
                    </Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={fetchPoList}>
                      <Text style={styles.retryBtnText}>Muat Ulang Data</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.poGridTitle}>Daftar PO Terbaru</Text>
                    <View style={styles.poGrid}>
                      {poList.map((po) => (
                        <TouchableOpacity
                          key={po.id || po.poNumber}
                          style={styles.poCard}
                          onPress={() => handleSelectPo(po.poNumber)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.poCardLeft}>
                            <View style={styles.poIconBadge}>
                              <BoxIcon color={colors.indigo} size={18} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.poNumberText}>{po.poNumber}</Text>
                              <Text style={styles.poSubtitle}>Klik untuk pilih PO</Text>
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
          /* Step 2 & 3: Active PO Detail, Box Scanning & Submission View */
          <View style={styles.activePoSection}>
            {/* Selected PO Summary Card */}
            <View style={styles.poSummaryCard}>
              <View style={styles.poSummaryHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.poSummaryLabel}>PO Number Terpilih</Text>
                  <Text style={styles.poSummaryValue}>{selectedPo}</Text>
                </View>
                <View style={styles.badgeBoxCount}>
                  <Text style={styles.badgeBoxCountText}>
                    {scannedBoxes.length} / {expectedBoxes.length} Box
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor:
                        progressPercent === 100 ? colors.success : colors.warning,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Instruction Banner */}
            <View style={styles.infoRow}>
              <Info color={colors.indigo} size={15} />
              <Text style={styles.infoText}>
                Scan semua box terdaftar pada PO ini.{'\n'}
                Tekan item box untuk tandai/batal scan secara manual.
              </Text>
            </View>

            {/* Scanner Zone */}
            <ScanZone
              label="Box Barcode Scanner"
              scannedValue={null}
              onPress={focusScanner}
              accentColor={colors.warning}
              placeholder="Arahkan scanner ke barcode box..."
            />

            {isLoadingPoDetail ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.warning} size="small" />
                <Text style={styles.loadingLabel}>Mengambil daftar box PO dari server...</Text>
              </View>
            ) : (
              /* Box Checklist */
              <View style={styles.boxListSection}>
                <Text style={styles.sectionTitle}>
                  Daftar Box ({scannedBoxes.length}/{expectedBoxes.length})
                </Text>

                {expectedBoxes.length === 0 ? (
                  <View style={styles.emptyBoxNotice}>
                    <Info color={colors.warning} size={16} />
                    <Text style={styles.emptyBoxText}>
                      Tidak ada daftar box terdaftar untuk PO ini. Silakan scan box secara langsung.
                    </Text>
                  </View>
                ) : (
                  expectedBoxes.map((boxItem) => {
                    const isScanned = scannedBoxes.includes(boxItem.name);
                    return (
                      <TouchableOpacity
                        key={boxItem.id || boxItem.name}
                        style={[
                          styles.boxItemCard,
                          isScanned && styles.boxItemCardScanned,
                        ]}
                        onPress={() => handleToggleBoxScan(boxItem.name)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.boxCheckCircle,
                            isScanned && styles.boxCheckCircleActive,
                          ]}
                        >
                          {isScanned ? (
                            <Check color={colors.textInverse} size={14} />
                          ) : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.boxNameText,
                              isScanned && styles.boxNameTextScanned,
                            ]}
                          >
                            {boxItem.name}
                          </Text>
                          <Text style={styles.boxStatusText}>
                            {isScanned ? 'Ter-scan' : 'Belum di-scan'}
                          </Text>
                        </View>
                        {isScanned ? (
                          <View style={styles.scannedBadge}>
                            <Text style={styles.scannedBadgeText}>OK</Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })
                )}

                {/* Extra scanned boxes if any */}
                {extraScannedBoxes.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.extraBoxSectionTitle}>Box Tambahan Di-scan</Text>
                    {extraScannedBoxes.map((boxName, idx) => (
                      <TouchableOpacity
                        key={`extra-${idx}`}
                        style={[styles.boxItemCard, styles.boxItemCardScanned]}
                        onPress={() => handleToggleBoxScan(boxName)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.boxCheckCircle, styles.boxCheckCircleActive]}>
                          <Check color={colors.textInverse} size={14} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.boxNameText, styles.boxNameTextScanned]}>
                            {boxName}
                          </Text>
                          <Text style={styles.boxStatusText}>Ter-scan (Tambahan)</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (scannedBoxes.length === 0 || isSubmitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmitDelivery}
              disabled={scannedBoxes.length === 0 || isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <View style={styles.submitBtnRow}>
                  <ActivityIndicator color={colors.textInverse} size="small" />
                  <Text style={styles.submitBtnText}>Mengirim Delivery...</Text>
                </View>
              ) : (
                <View style={styles.submitBtnRow}>
                  <Send color={colors.textInverse} size={18} />
                  <Text style={styles.submitBtnText}>
                    Submit Delivery ({scannedBoxes.length} Box)
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Last Delivered Card */}
        {lastDelivered && !isSubmitting && (
          <View style={styles.lastCard}>
            <CheckCircle2 color={colors.success} size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lastLabel}>Delivery Terakhir ({lastDelivered.timestamp})</Text>
              <Text style={styles.lastValue}>PO: {lastDelivered.poNumber}</Text>
              <Text style={styles.lastSubValue}>
                Box: {lastDelivered.boxes.join(', ')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  hiddenInput: { position: 'absolute', top: -1000, left: -1000, width: 1, height: 1, opacity: 0 },

  // Header button
  headerResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerResetText: { fontSize: 12, fontWeight: '600', color: colors.textInverse },

  // Section Header
  poSelectSection: { flex: 1 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  refreshBtn: { padding: 6 },
  spinIcon: { opacity: 0.5 },

  // Loading & Empty state
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  loadingLabel: { fontSize: 13, color: colors.textSecondary },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 12 },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  retryBtn: {
    marginTop: 16,
    backgroundColor: `${colors.warning}15`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: { fontSize: 13, fontWeight: '600', color: colors.warning },

  // PO Grid / Cards
  poGridTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 },
  poGrid: { gap: 10 },
  poCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  poCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  poIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.iconBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poNumberText: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  poSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  // Active PO Section
  activePoSection: { gap: 14 },
  poSummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  poSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  poSummaryLabel: { fontSize: 11, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },
  poSummaryValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  badgeBoxCount: {
    backgroundColor: `${colors.warning}20`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeBoxCountText: { fontSize: 12, fontWeight: '700', color: colors.warning },
  progressBg: {
    height: 6,
    backgroundColor: `${colors.warning}15`,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  infoText: { fontSize: 13, color: colors.textSecondary, flex: 1 },

  // Box Checklist
  boxListSection: { marginTop: 8, gap: 8 },
  emptyBoxNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${colors.warning}10`,
    padding: 12,
    borderRadius: 10,
  },
  emptyBoxText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  boxItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  boxItemCardScanned: {
    backgroundColor: `${colors.success}08`,
    borderColor: `${colors.success}40`,
  },
  boxCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxCheckCircleActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  boxNameText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  boxNameTextScanned: { color: colors.textPrimary },
  boxStatusText: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  scannedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scannedBadgeText: { fontSize: 10, fontWeight: '800', color: colors.textInverse },
  extraBoxSectionTitle: { fontSize: 13, fontWeight: '700', color: colors.orange, marginBottom: 8 },

  // Submit Button
  submitBtn: {
    backgroundColor: colors.warning,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...shadows.md,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: colors.textInverse },

  // Last Delivered
  lastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    padding: 14,
    backgroundColor: `${colors.success}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
  },
  lastLabel: { fontSize: 11, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },
  lastValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  lastSubValue: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});

export default DeliveryScreen;
