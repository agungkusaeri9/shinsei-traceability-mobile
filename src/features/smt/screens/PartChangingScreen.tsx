import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
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
import DetailRow from '../../../components/DetailRow';
import FinishedView from '../../../components/FinishedView';
import FlowStepIndicator from '../../../components/FlowStepIndicator';
import AvailableStkModal from '../components/AvailableStkModal';
import ProductSelectionList from '../components/ProductSelectionList';

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
              : navigation.navigate('SmtHome')
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
            <FlowStepIndicator current={0} total={4} activeColor={colors.orange} />

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
              <ProductSelectionList
                products={availableProducts}
                accentColor={colors.orange}
                onSelect={handleSelectProduct}
              />
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
            <FlowStepIndicator current={2} total={4} activeColor={colors.orange} />

            <View style={styles.detailCard}>
              <DetailRow label="Lot Number" value={lotNumber} layout="column" />
              <DetailRow label="Customer" value={orderData.customer?.name || '-'} layout="column" />
              <DetailRow label="PCB Model" value={orderData.product?.name || '-'} layout="column" />
              <DetailRow label="Face" value={orderData.pcbModelFace} layout="column" />
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

        <AvailableStkModal
          detail={selectedItemForModal}
          accentColor={colors.orange}
          onClose={() => setSelectedItemForModal(null)}
        />

        {/* ── Finished ──────────────────────────────── */}
        {step === 'finished' && orderData && (
          <FinishedView
            title="Part Changing Selesai!"
            subtitle="Part berhasil di-ganti"
            resetLabel="Kembali ke SMT"
            onReset={handleReset}
            summary={
              <>
                <DetailRow label="Customer" value={orderData.customer?.name || '-'} layout="column" />
                <DetailRow label="PCB Model" value={orderData.product?.name || '-'} layout="column" />
                <DetailRow label="Product Select" value={productSelect} layout="column" />
                <DetailRow label="Total Changed" value={String(replacedCount)} layout="column" />
                <DetailRow label="Total Inventory" value={String(partChangeItems.length)} layout="column" />
              </>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

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

  // Detail Card
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...shadows.sm,
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
});

export default PartChangingScreen;
