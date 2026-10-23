import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  PackagePlus,
  Trash2,
  CheckCircle2,
  ScanBarcode,
  X,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QaAssyStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import QaAssyHeader from '../components/QaAssyHeader';
import ScanZone from '../components/ScanZone';
import Button from '../../../components/Button';
import { useQaAddPartFlow } from '../hooks/useQaAddPartFlow';

type Props = {
  navigation: NativeStackNavigationProp<QaAssyStackParamList, 'QaAddPart'>;
};

const QaAddPartScreen: React.FC<Props> = ({ navigation }) => {
  const {
    scannedLot,
    stkList,
    isCheckingLot,
    isSubmitting,
    handleRemoveStk,
    handleClearStks,
    handleSubmit,
    handleReset,
  } = useQaAddPartFlow();

  return (
    <View style={styles.container}>
      <QaAssyHeader
        title="Add Part (STK)"
        subtitle="Scan Lot & Part STK"
        icon={<PackagePlus color={colors.orange} size={20} />}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1: Lot */}
        <Text style={styles.stepLabel}>1. Scan Lot Number</Text>
        <ScanZone
          label="Lot Number"
          scannedValue={scannedLot}
          onReset={handleReset}
          accentColor={colors.orange}
          placeholder="Arahkan scanner ke barcode lot"
        />

        {isCheckingLot ? (
          <View style={styles.checkingRow}>
            <Text style={styles.checkingText}>Mengecek lot number...</Text>
          </View>
        ) : null}

        {scannedLot ? (
          <View style={styles.stkSection}>
            <View style={styles.stkHeader}>
              <Text style={styles.stepLabel}>2. Scan Part STK</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{stkList.length}</Text>
              </View>
            </View>

            {stkList.length === 0 ? (
              <View style={styles.scanPromptCard}>
                <ScanBarcode color={colors.orange} size={20} />
                <Text style={styles.scanPromptText}>
                  Arahkan scanner ke barcode part STK
                </Text>
              </View>
            ) : (
              <View style={styles.stkListCard}>
                <View style={styles.stkListHeader}>
                  <Text style={styles.stkListTitle}>Part STK Ter-scan</Text>
                  <TouchableOpacity
                    onPress={handleClearStks}
                    style={styles.clearBtn}
                  >
                    <Trash2 color={colors.danger} size={14} />
                    <Text style={styles.clearText}>Hapus Semua</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.chipsWrap}>
                  {stkList.map((stk, i) => (
                    <View key={stk + i} style={styles.chip}>
                      <CheckCircle2 color={colors.success} size={14} />
                      <Text style={styles.chipText}>{stk}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveStk(i)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <X color={colors.textMuted} size={13} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Button
              title={
                stkList.length === 0
                  ? 'Tambahkan Part'
                  : `Kirim ${stkList.length} Part`
              }
              onPress={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting || stkList.length === 0}
              style={styles.submitBtn}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40, gap: 4 },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 16,
  },
  checkingRow: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: `${colors.orange}12`,
    borderWidth: 1,
    borderColor: `${colors.orange}30`,
  },
  checkingText: { fontSize: 13, fontWeight: '600', color: colors.orange },
  stkSection: { gap: 0 },
  stkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: colors.orange,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  scanPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${colors.orange}10`,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: `${colors.orange}50`,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  scanPromptText: { fontSize: 13, fontWeight: '600', color: colors.orange },
  stkListCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    ...shadows.sm,
  },
  stkListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stkListTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearText: { fontSize: 12, fontWeight: '600', color: colors.danger },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${colors.success}12`,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  submitBtn: { marginTop: 16, width: '100%', backgroundColor: colors.orange },
});

export default QaAddPartScreen;
