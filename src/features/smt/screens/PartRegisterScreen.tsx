import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {
  ClipboardList,
  ScanBarcode,
  CheckCircle2,
  Circle,
  X,
  MapPin,
  Cpu,
  Layers,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SmtStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import Button from '../../../components/Button';
import SmtHeader from '../components/SmtHeader';
import StkScanProgress from '../../warehouse/components/StkScanProgress';
import { useSmtPartRegisterFlow } from '../hooks/useSmtPartRegisterFlow';

type Props = {
  navigation: NativeStackNavigationProp<SmtStackParamList, 'PartRegister'>;
};

const PartRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const {
    step,
    lotNumber,
    isLoading,
    isSubmitting,
    availableProducts,
    orderData,
    currentGroupIndex,
    productSelect,
    scannedMap,
    selectedDetailForModal,
    setSelectedDetailForModal,
    machineGroups,
    currentMachineGroup,
    currentGroupDetails,
    totalBatches,
    totalScanned,
    flatListRef,
    headerSubtitle,
    machineGroupLabel,
    handleSelectProduct,
    handleFinish,
    handleReset,
  } = useSmtPartRegisterFlow();

  return (
    <View style={styles.container}>
      <SmtHeader
        title="Part Register"
        subtitle={headerSubtitle}
        icon={<ClipboardList color={colors.primary} size={18} />}
        onBack={() =>
          step === 'scan_lot'
            ? navigation.canGoBack()
              ? navigation.goBack()
              : navigation.navigate('SmtDashboard' as any)
            : handleReset()
        }
        rightSlot={
          step !== 'scan_lot' ? <X color={colors.textInverse} size={24} /> : undefined
        }
      />

      <View style={styles.content}>

        {/* Step 1: Scan Lot */}
        {step === 'scan_lot' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <StepIndicator current={0} total={6} />
            <View style={styles.infoCard}>
              <ScanBarcode color={colors.primary} size={24} />
              <Text style={styles.infoText}>Scan Lot Number untuk memulai proses Part Register</Text>
            </View>
            {isLoading && (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Mencari data lot number...</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Step 1b: Select Product */}
        {step === 'select_product' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <StepIndicator current={1} total={6} />
            <View style={styles.infoCard}>
              <Layers color={colors.primary} size={24} />
              <Text style={styles.infoText}>Pilih Product untuk Lot Number: {lotNumber}</Text>
            </View>

            {isLoading ? (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Memuat detail product...</Text>
              </View>
            ) : (
              <View style={{ gap: 12, marginTop: 12 }}>
                {availableProducts.map((prod) => (
                  <TouchableOpacity
                    key={prod.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectProduct(prod)}
                    style={styles.productOptionCard}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productOptionTitle}>{prod.name}</Text>
                      {prod.code ? <Text style={styles.productOptionSub}>Code: {prod.code}</Text> : null}
                      {prod.customerName ? <Text style={styles.productOptionSub}>Customer: {prod.customerName}</Text> : null}
                    </View>
                    <View style={styles.productSelectBadge}>
                      <Text style={styles.productSelectBadgeText}>Pilih</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* Step 2: Scan Product Select */}
        {step === 'scan_product' && orderData && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <StepIndicator current={2} total={6} />
            <View style={styles.infoCard}>
              <Layers color={colors.primary} size={24} />
              <Text style={styles.infoText}>Scan Product Select</Text>
            </View>
            <View style={styles.detailCard}>
              <DetailRow label="Lot Number" value={lotNumber} />
              <DetailRow label="Customer" value={orderData.customer.name} />
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
              <DetailRow label="Total Detail" value={String(orderData.details.length)} />
            </View>
          </ScrollView>
        )}

        {/* Step 3: Scan Line */}
        {step === 'scan_line' && orderData && currentMachineGroup && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <StepIndicator current={3} total={6} />
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>{machineGroupLabel}</Text>
            </View>
            <View style={styles.infoCard}>
              <MapPin color={colors.primary} size={24} />
              <Text style={styles.infoText}>
                Scan Line untuk Machine {currentMachineGroup.machine?.name || '-'}
              </Text>
            </View>

            <View style={styles.detailCard}>
              <DetailRow label="Customer" value={orderData.customer?.name || '-'} />
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
              <DetailRow label="Product Select" value={productSelect} />
              <DetailRow label="Line Target" value={currentMachineGroup.line?.name || 'No line'} />
              <DetailRow label="Machine" value={currentMachineGroup.machine?.name || 'No machine'} />
            </View>
          </ScrollView>
        )}

        {/* Step 4: Scan Machine */}
        {step === 'scan_machine' && orderData && currentMachineGroup && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <StepIndicator current={4} total={6} />
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>{machineGroupLabel}</Text>
            </View>
            <View style={styles.infoCard}>
              <Cpu color={colors.primary} size={24} />
              <Text style={styles.infoText}>
                Scan Machine: {currentMachineGroup.machine?.name || '-'}
              </Text>
            </View>
            <View style={styles.detailCard}>
              <DetailRow label="Customer" value={orderData.customer?.name || '-'} />
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
              <DetailRow label="Line" value={currentMachineGroup.line?.name || 'No line'} />
              <DetailRow label="Machine Target" value={currentMachineGroup.machine?.name || 'No machine'} />
            </View>
          </ScrollView>
        )}

        {/* Step 5: Scanning Parts */}
        {step === 'scanning_parts' && orderData && currentMachineGroup && (
          <View style={{ flex: 1 }}>
            <StkScanProgress scanned={totalScanned} total={totalBatches} />

            <View style={styles.detailBadgeRow}>
              <Text style={styles.detailBadgeText}>{machineGroupLabel}</Text>
              <Text style={styles.detailBadgeText}>
                {`L: ${currentMachineGroup.line?.name || '-'} | M: ${currentMachineGroup.machine?.name || '-'}`}
              </Text>
            </View>

            {machineGroups.length > 1 && (
              <View style={styles.machineProgressRow}>
                {machineGroups.map((grp, idx) => {
                  const grpScanned = grp.detailIndices.filter(i => scannedMap.has(i)).length;
                  const isComplete = grpScanned === grp.detailIndices.length;
                  const isActive = idx === currentGroupIndex;
                  return (
                    <View
                      key={grp.key}
                      style={[
                        styles.machineProgressDot,
                        isActive && styles.machineProgressDotActive,
                        isComplete && styles.machineProgressDotComplete,
                      ]}
                    >
                      <Text style={styles.machineProgressDotText}>
                        {isComplete ? '✓' : `M${idx + 1}`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            <FlatList
              ref={flatListRef}
              data={currentGroupDetails}
              keyExtractor={(item) => `${item.detail.inventoryCode}-${item.originalIndex}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stkListContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const { detail, originalIndex: idx } = item;
                const scannedStk = scannedMap.get(idx);
                const isScanned = !!scannedStk;
                const partNo = detail.partNumber || '-';

                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onLongPress={() => setSelectedDetailForModal(detail)}
                    delayLongPress={400}
                    style={[styles.detailItemCard, isScanned && styles.detailItemCardScanned]}
                  >
                    <View style={styles.detailItemTop}>
                      <View style={styles.detailItemLeft}>
                        {isScanned ? (
                          <CheckCircle2 color={colors.success} size={20} />
                        ) : (
                          <Circle color={colors.textMuted} size={20} />
                        )}
                        <View style={styles.detailItemTitleGroup}>
                          <Text style={[styles.detailItemPartNo, isScanned && styles.detailItemPartNoScanned]}>
                            Part No: {partNo}
                          </Text>
                          <Text style={styles.detailItemPddm}>
                            PDDM: {detail.inventoryCode}
                          </Text>
                        </View>
                      </View>
                      {isScanned ? (
                        <View style={styles.scannedBadge}>
                          <Text style={styles.scannedBadgeText}>Scanned</Text>
                        </View>
                      ) : (
                        <View style={styles.holdBadge}>
                          <Text style={styles.holdBadgeText}>Hold info STK</Text>
                        </View>
                      )}
                    </View>

                    {isScanned && (
                      <View style={styles.scannedStkRow}>
                        <Text style={styles.scannedStkLabel}>STK Registered:</Text>
                        <Text style={styles.scannedStkValue}>{scannedStk}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListHeaderComponent={
                <View style={styles.scanHint}>
                  <ScanBarcode color={colors.primary} size={18} />
                  <Text style={styles.scanHintText}>
                    {`Scan STK (${currentMachineGroup.machine?.name || '-'}) • ${totalBatches - totalScanned} sisa total`}
                  </Text>
                </View>
              }
            />

            <View style={styles.bottomBar}>
              <Button title="Batal" variant="outline" onPress={handleReset} style={styles.bottomBtn} />
              <Button
                title={`Finish (${totalScanned}/${totalBatches})`}
                onPress={handleFinish}
                disabled={isSubmitting || totalScanned < totalBatches}
                isLoading={isSubmitting}
                style={styles.bottomBtn}
              />
            </View>
          </View>
        )}

        {/* Modal List Available STKs on Hold */}
        <Modal
          visible={!!selectedDetailForModal}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedDetailForModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Daftar STK Available</Text>
                  <Text style={styles.modalSubtitle}>
                    PDDM: {selectedDetailForModal?.inventoryCode} | Part: {selectedDetailForModal?.partNumber || '-'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedDetailForModal(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X color={colors.textPrimary} size={20} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {selectedDetailForModal?.stkList && selectedDetailForModal.stkList.length > 0 ? (
                  selectedDetailForModal.stkList.map((stk, idx) => (
                    <View key={`${stk}-${idx}`} style={styles.stkModalItem}>
                      <ScanBarcode color={colors.primary} size={18} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.stkModalItemNumber}>{stk}</Text>
                        <Text style={styles.stkModalItemPart}>Part No: {selectedDetailForModal.partNumber || '-'}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyStkText}>Tidak ada STK yang tersedia</Text>
                )}
              </ScrollView>

              <Button
                title="Tutup"
                variant="outline"
                onPress={() => setSelectedDetailForModal(null)}
                style={{ marginTop: 16 }}
              />
            </View>
          </View>
        </Modal>

        {/* Finished */}
        {step === 'finished' && orderData && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.finishedScrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.finishedContainer}>
              <View style={styles.finishedIconBadge}>
                <CheckCircle2 color={colors.success} size={64} />
              </View>
              <Text style={styles.finishedTitle}>Part Register Selesai!</Text>
              <Text style={styles.finishedSubtitle}>Semua part batch berhasil di-register</Text>
              <View style={styles.finishedSummary}>
                <DetailRow label="Customer" value={orderData.customer.name} />
                <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
                <DetailRow label="Product Select" value={productSelect} />
                <DetailRow label="Total Detail" value={String(orderData.details.length)} />
                <DetailRow label="Total Part Scanned" value={String(totalScanned)} />
              </View>
              <Button title="Kembali ke SMT" onPress={handleReset} style={styles.finishedBtn} />
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

// ─── StepIndicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ current, total }: { current: number; total: number }) => (
  <View style={styles.stepIndicator}>
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <View
          style={[
            styles.stepDot,
            i < current ? styles.stepDotDone : i === current ? styles.stepDotActive : undefined,
          ]}
        >
          {i < current ? (
            <CheckCircle2 color={colors.textInverse} size={14} />
          ) : (
            <Text style={i === current ? styles.stepDotText : styles.stepDotTextInactive}>
              {i + 1}
            </Text>
          )}
        </View>
        {i < total - 1 && (
          <View style={[styles.stepLine, i < current && styles.stepLineActive]} />
        )}
      </React.Fragment>
    ))}
  </View>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.textMuted}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone: { backgroundColor: colors.success },
  stepDotText: { fontSize: 12, fontWeight: '700', color: colors.textInverse },
  stepDotTextInactive: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: `${colors.textMuted}25`,
    marginHorizontal: 4,
  },
  stepLineActive: { backgroundColor: colors.success },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}12`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  infoText: { flex: 1, fontSize: 14, color: colors.textPrimary, lineHeight: 20 },

  loadingField: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16 },
  loadingText: { fontSize: 13, color: colors.textMuted },

  productOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    ...shadows.sm,
  },
  productOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  productOptionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  productSelectBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  productSelectBadgeText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },

  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.sm,
  },
  detailRow: { flexDirection: 'column', paddingVertical: 6 },
  detailLabel: { fontSize: 13, color: colors.textSecondary },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },

  detailBadge: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    backgroundColor: `${colors.primary}18`,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: `${colors.primary}10`,
  },
  detailBadgeText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  machineProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 2,
    marginBottom: 2,
  },
  machineProgressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: `${colors.textMuted}40`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  machineProgressDotActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  machineProgressDotComplete: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}15`,
  },
  machineProgressDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  scanHint: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  scanHintText: { flex: 1, fontSize: 12, color: colors.textSecondary },

  stkListContent: { padding: 16, paddingBottom: 100 },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: `${colors.textMuted}15`,
    ...shadows.md,
  },
  bottomBtn: { flex: 1, paddingVertical: 12 },

  finishedScrollContent: { flexGrow: 1, justifyContent: 'center' },
  finishedContainer: { alignItems: 'center', padding: 32, paddingBottom: 32 },
  finishedIconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  finishedTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  finishedSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  finishedSummary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    ...shadows.sm,
  },
  finishedBtn: { width: '100%', paddingVertical: 12 },

  // Detail Item Cards
  detailItemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: `${colors.textMuted}20`,
    ...shadows.sm,
  },
  detailItemCardScanned: {
    borderColor: `${colors.success}50`,
  },
  detailItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  detailItemTitleGroup: {
    marginLeft: 10,
    flex: 1,
  },
  detailItemPartNo: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detailItemPartNoScanned: {
    color: colors.success,
  },
  detailItemPddm: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  holdBadge: {
    backgroundColor: `${colors.primary}12`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  holdBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  scannedBadge: {
    backgroundColor: `${colors.success}18`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scannedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  scannedStkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${colors.textMuted}20`,
  },
  scannedStkLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginRight: 6,
  },
  scannedStkValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    ...shadows.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stkModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: `${colors.textMuted}15`,
  },
  stkModalItemNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stkModalItemPart: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  emptyStkText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});

export default PartRegisterScreen;
