import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
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
import DetailRow from '../../../components/DetailRow';
import FinishedView from '../../../components/FinishedView';
import FlowStepIndicator from '../../../components/FlowStepIndicator';
import AvailableStkModal from '../components/AvailableStkModal';
import ProductSelectionList from '../components/ProductSelectionList';

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
              : navigation.navigate('SmtHome')
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
            <FlowStepIndicator current={0} total={6} />
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
            <FlowStepIndicator current={1} total={6} />
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
              <ProductSelectionList
                products={availableProducts}
                accentColor={colors.primary}
                onSelect={handleSelectProduct}
              />
            )}
          </ScrollView>
        )}

        {/* Step 2: Scan Product Select */}
        {step === 'scan_product' && orderData && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <FlowStepIndicator current={2} total={6} />
            <View style={styles.infoCard}>
              <Layers color={colors.primary} size={24} />
              <Text style={styles.infoText}>Scan Product Select</Text>
            </View>
            <View style={styles.detailCard}>
              <DetailRow label="Lot Number" value={lotNumber} layout="column" />
              <DetailRow label="Customer" value={orderData.customer.name} layout="column" />
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} layout="column" />
              <DetailRow label="Face" value={orderData.pcbModelFace} layout="column" />
              <DetailRow label="Total Detail" value={String(orderData.details.length)} layout="column" />
            </View>
          </ScrollView>
        )}

        {/* Step 3: Scan Line */}
        {step === 'scan_line' && orderData && currentMachineGroup && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <FlowStepIndicator current={3} total={6} />
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
              <DetailRow label="Customer" value={orderData.customer?.name || '-'} layout="column" />
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} layout="column" />
              <DetailRow label="Face" value={orderData.pcbModelFace} layout="column" />
              <DetailRow label="Product Select" value={productSelect} layout="column" />
              <DetailRow label="Line Target" value={currentMachineGroup.line?.name || 'No line'} layout="column" />
              <DetailRow label="Machine" value={currentMachineGroup.machine?.name || 'No machine'} layout="column" />
            </View>
          </ScrollView>
        )}

        {/* Step 4: Scan Machine */}
        {step === 'scan_machine' && orderData && currentMachineGroup && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <FlowStepIndicator current={4} total={6} />
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
              <DetailRow label="Customer" value={orderData.customer?.name || '-'} layout="column" />
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} layout="column" />
              <DetailRow label="Face" value={orderData.pcbModelFace} layout="column" />
              <DetailRow label="Line" value={currentMachineGroup.line?.name || 'No line'} layout="column" />
              <DetailRow label="Machine Target" value={currentMachineGroup.machine?.name || 'No machine'} layout="column" />
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

        <AvailableStkModal
          detail={selectedDetailForModal}
          accentColor={colors.primary}
          onClose={() => setSelectedDetailForModal(null)}
        />

        {/* Finished */}
        {step === 'finished' && orderData && (
          <FinishedView
            title="Part Register Selesai!"
            subtitle="Semua part batch berhasil di-register"
            resetLabel="Kembali ke SMT"
            onReset={handleReset}
            summary={
              <>
                <DetailRow label="Customer" value={orderData.customer.name} layout="column" />
                <DetailRow label="PCB Model" value={orderData.product?.name || '-'} layout="column" />
                <DetailRow label="Product Select" value={productSelect} layout="column" />
                <DetailRow label="Total Detail" value={String(orderData.details.length)} layout="column" />
                <DetailRow label="Total Part Scanned" value={String(totalScanned)} layout="column" />
              </>
            }
          />
        )}
      </View>
    </View>
  );
};

// ─── StepIndicator ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

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

  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.sm,
  },
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

});

export default PartRegisterScreen;
