import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  ArrowLeftRight,
  ScanBarcode,
  CheckCircle2,
  X,
  Package,
  Layers,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SmtStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import Button from '../../../components/Button';
import SmtHeader from '../components/SmtHeader';
import { useSmtPartChangingFlow } from '../hooks/useSmtPartChangingFlow';

type Props = {
  navigation: NativeStackNavigationProp<SmtStackParamList, 'PartChanging'>;
};

const PartChangingScreen: React.FC<Props> = ({ navigation }) => {
  const {
    step,
    lotNumber,
    isLoading,
    isSubmitting,
    availableProducts,
    orderData,
    productSelect,
    partChangeItems,
    selectedItemIndex,
    setSelectedItemIndex,
    selectedItemForModal,
    setSelectedItemForModal,
    headerSubtitle,
    replacedCount,
    handleSelectProduct,
    handleFinish,
    handleReset,
  } = useSmtPartChangingFlow();

  return (
    <View style={styles.container}>
      <SmtHeader
        title="Part Changing"
        subtitle={headerSubtitle}
        icon={<ArrowLeftRight color={colors.orange} size={18} />}
        iconBgColor={`${colors.orange}25`}
        onBack={() =>
          step === 'scan_lot'
            ? navigation.canGoBack()
              ? navigation.goBack()
              : navigation.navigate('SmtDashboard' as any)
            : handleReset()
        }
        rightSlot={
          step !== 'scan_lot' ? (
            <X color={colors.textInverse} size={24} />
          ) : undefined
        }
      />

      <View style={styles.content}>

        {/* ── Step 1: Scan Lot Number ──────────────────────── */}
        {step === 'scan_lot' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotActive]}>
                <Text style={styles.stepDotText}>1</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>2</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>3</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>4</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <ScanBarcode color={colors.orange} size={24} />
              <Text style={styles.infoText}>
                Scan Lot Number untuk memulai proses Part Changing
              </Text>
            </View>

            {isLoading && (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>
                  Mencari data lot number...
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* ── Step 1b: Select Product ───────────────────────── */}
        {step === 'select_product' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.infoCard}>
              <Layers color={colors.orange} size={24} />
              <Text style={styles.infoText}>
                Pilih Product untuk Lot Number: {lotNumber}
              </Text>
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

        {/* ── Step 2: Scan Product Select ───────────────────── */}
        {step === 'scan_product' && orderData && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <CheckCircle2 color={colors.textInverse} size={14} />
              </View>
              <View style={[styles.stepLine, styles.stepLineActive]} />
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <CheckCircle2 color={colors.textInverse} size={14} />
              </View>
              <View style={[styles.stepLine, styles.stepLineActive]} />
              <View style={[styles.stepDot, styles.stepDotActive]}>
                <Text style={styles.stepDotText}>3</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepDot}>
                <Text style={styles.stepDotTextInactive}>4</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <DetailRow label="Lot Number" value={lotNumber} />
              <DetailRow label="Customer" value={orderData.customer?.name || '-'} />
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
              <DetailRow label="Face" value={orderData.pcbModelFace} />
            </View>

            <View style={styles.infoCard}>
              <Layers color={colors.orange} size={24} />
              <Text style={styles.infoText}>
                Scan Product Select (satu kali saja)
              </Text>
            </View>
          </ScrollView>
        )}

        {/* ── Step 3: Scan New STK ──────────────────────────── */}
        {step === 'scan_new_stk' && orderData && (
          <View style={{ flex: 1 }}>
            {/* Progress */}
            <View style={styles.progressBar}>
              <Text style={styles.progressText}>
                Progress: {replacedCount} / {partChangeItems.length} diganti
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${partChangeItems.length > 0
                        ? (replacedCount / partChangeItems.length) * 100
                        : 0
                        }%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Loading indicator */}
            {isLoading && (
              <View style={styles.loadingField}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Mencari data STK...</Text>
              </View>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stkListContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.scanHint}>
                <ScanBarcode color={colors.orange} size={18} />
                <Text style={styles.scanHintText}>
                  Scan STK untuk mengganti part. Hold kartu untuk melihat list STK available.
                </Text>
              </View>

              {partChangeItems.map((item, index) => {
                const isSelected = selectedItemIndex === index;
                return (
                  <TouchableOpacity
                    key={`${item.inventoryCode}-${index}`}
                    activeOpacity={0.8}
                    onPress={() => setSelectedItemIndex(isSelected ? null : index)}
                    onLongPress={() => setSelectedItemForModal(item)}
                    delayLongPress={400}
                    style={[
                      styles.partChangeItem,
                      item.replaced && styles.partChangeItemReplaced,
                      isSelected && styles.partChangeItemSelected,
                    ]}
                  >
                    <View style={styles.partChangeItemLeft}>
                      {item.replaced ? (
                        <CheckCircle2 color={colors.success} size={20} />
                      ) : (
                        <Package color={colors.textMuted} size={20} />
                      )}
                      <View style={styles.partChangeItemInfo}>
                        <Text
                          style={[
                            styles.partChangeItemStk,
                            item.replaced && { color: colors.success },
                          ]}
                        >
                          PDDM: {item.inventoryCode}
                        </Text>
                        <Text style={styles.partChangeItemDetail}>
                          Part No: {item.partNumber}
                          {item.machineName ? ` • ${item.machineName}` : ''}
                        </Text>
                        {item.replaced && item.replacedWithStk && (
                          <Text style={styles.replacedWithText}>
                            STK Baru: {item.replacedWithStk}
                          </Text>
                        )}
                      </View>
                    </View>
                    {isSelected ? (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>Pilihan</Text>
                      </View>
                    ) : item.replaced ? (
                      <View style={styles.replacedBadge}>
                        <Text style={styles.replacedBadgeText}>Diganti</Text>
                      </View>
                    ) : (
                      <View style={styles.holdBadge}>
                        <Text style={styles.holdBadgeText}>Hold info STK</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
              <Button
                title="Batal"
                variant="outline"
                onPress={handleReset}
                style={styles.bottomBtn}
              />
              <Button
                title={`Finish (${replacedCount}/${partChangeItems.length})`}
                onPress={handleFinish}
                disabled={replacedCount === 0 || isSubmitting}
                isLoading={isSubmitting}
                style={styles.bottomBtn}
              />
            </View>
          </View>
        )}

        {/* Modal List Available STKs on Hold */}
        <Modal
          visible={!!selectedItemForModal}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedItemForModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Daftar STK Available</Text>
                  <Text style={styles.modalSubtitle}>
                    PDDM: {selectedItemForModal?.inventoryCode} | Part: {selectedItemForModal?.partNumber || '-'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedItemForModal(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X color={colors.textPrimary} size={20} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {selectedItemForModal?.stkList && selectedItemForModal.stkList.length > 0 ? (
                  selectedItemForModal.stkList.map((stk, idx) => (
                    <View key={`${stk}-${idx}`} style={styles.stkModalItem}>
                      <ScanBarcode color={colors.orange} size={18} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.stkModalItemNumber}>{stk}</Text>
                        <Text style={styles.stkModalItemPart}>Part No: {selectedItemForModal.partNumber || '-'}</Text>
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
                onPress={() => setSelectedItemForModal(null)}
                style={{ marginTop: 16 }}
              />
            </View>
          </View>
        </Modal>

        {/* ── Finished ──────────────────────────────── */}
        {step === 'finished' && orderData && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.finishedScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.finishedContainer}>
              <View style={styles.finishedIconBadge}>
                <CheckCircle2 color={colors.success} size={64} />
              </View>
              <Text style={styles.finishedTitle}>Part Changing Selesai!</Text>
              <Text style={styles.finishedSubtitle}>
                Part berhasil di-ganti
              </Text>

              <View style={styles.finishedSummary}>
                <DetailRow label="Customer" value={orderData.customer?.name || '-'} />
                <DetailRow label="PCB Model" value={orderData.product?.name || '-'} />
                <DetailRow label="Product Select" value={productSelect} />
                <DetailRow
                  label="Total Changed"
                  value={String(replacedCount)}
                />
                <DetailRow
                  label="Total Inventory"
                  value={String(partChangeItems.length)}
                />
              </View>

              <Button
                title="Kembali ke SMT"
                onPress={handleReset}
                style={styles.finishedBtn}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

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

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.textMuted}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.orange,
  },
  stepDotDone: {
    backgroundColor: colors.success,
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textInverse,
  },
  stepDotTextInactive: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: `${colors.textMuted}25`,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: colors.success,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.orange}12`,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },

  // Loading
  loadingField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },

  productOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.orange}30`,
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
    backgroundColor: colors.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  productSelectBadgeText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },

  // Detail Card
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: { fontSize: 13, color: colors.textSecondary },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // Part Item (select_parts step)
  partItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    gap: 12,
    ...shadows.sm,
  },
  partItemInfo: {
    flex: 1,
  },
  partItemStk: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  partItemDetail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Progress Bar
  progressBar: {
    padding: 16,
    paddingBottom: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: `${colors.textMuted}20`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: 4,
  },

  // Scan hint
  scanHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  scanHintText: { flex: 1, fontSize: 12, color: colors.textSecondary },

  // STK List
  stkListContent: { padding: 16, paddingBottom: 100 },
  partChangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    ...shadows.sm,
  },
  partChangeItemReplaced: {
    borderColor: colors.success,
    borderWidth: 1,
  },
  partChangeItemSelected: {
    borderColor: colors.orange,
    borderWidth: 2,
  },
  partChangeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  partChangeItemInfo: {
    flex: 1,
  },
  partChangeItemStk: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  partChangeItemDetail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  replacedWithText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  replacedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  replacedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textInverse,
  },
  selectedBadge: {
    backgroundColor: colors.orange,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textInverse,
  },
  pendingBadge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  holdBadge: {
    backgroundColor: `${colors.orange}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  holdBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.orange,
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

  // Bottom Bar
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

  // Button Row
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },

  scanBtn: {
    flex: 1,
    paddingVertical: 10,
  },

  submitBtn: {
    flex: 2,
    paddingVertical: 10,
  },
  // Finished
  finishedScrollContent: { flexGrow: 1, justifyContent: 'center' },
  finishedContainer: { alignItems: 'center', padding: 32, paddingBottom: 40 },
  finishedIconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  finishedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  finishedSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  finishedSummary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    ...shadows.sm,
  },
  finishedBtn: { width: '100%', paddingVertical: 12 },
});

export default PartChangingScreen;
