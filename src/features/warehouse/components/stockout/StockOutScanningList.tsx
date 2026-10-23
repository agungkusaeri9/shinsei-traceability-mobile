import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ScanBarcode, AlertCircle } from 'lucide-react-native';
import { colors, shadows } from '../../../../theme';
import Button from '../../../../components/Button';
import StkScanItem from '../../../../components/StkScanItem';
import StkScanProgress from '../StkScanProgress';
import MissingPartsList from './MissingPartsList';
import type { AvailablePart, MissingPart } from '../../types';

type Props = {
  listRef: React.RefObject<FlatList<AvailablePart> | null>;
  parts: AvailablePart[];
  scannedStkNumbers: Set<string>;
  scannedCount: number;
  availableCount: number;
  missingParts: MissingPart[];
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

/** Stock Out step 3: live scanning list of the selected order's parts. */
const StockOutScanningList: React.FC<Props> = ({
  listRef,
  parts,
  scannedStkNumbers,
  scannedCount,
  availableCount,
  missingParts,
  isSubmitting,
  onSubmit,
  onCancel,
}) => (
  <View style={styles.container}>
    <StkScanProgress scanned={scannedCount} total={availableCount} />

    <FlatList
      ref={listRef}
      data={parts}
      keyExtractor={item => item.stkNumber}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.stkListContent}
      renderItem={({ item }) => {
        const isScanned = scannedStkNumbers.has(item.stkNumber);
        return (
          <StkScanItem
            stkNumber={item.stkNumber}
            isScanned={isScanned}
            partNo={item.partNumber}
          />
        );
      }}
      ListHeaderComponent={
        <>
          <View style={styles.scanHint}>
            <ScanBarcode color={colors.primary} size={18} />
            <Text style={styles.scanHintText}>
              Scan barcode STK untuk memproses order
            </Text>
          </View>
          {missingParts.length > 0 && (
            <View style={styles.missingBanner}>
              <AlertCircle color={colors.warning ?? '#F59E0B'} size={16} />
              <Text style={styles.missingBannerText}>
                {missingParts.length} part belum tersedia di gudang
              </Text>
            </View>
          )}
        </>
      }
      ListFooterComponent={<MissingPartsList parts={missingParts} />}
    />

    <View style={styles.bottomBar}>
      <Button
        title="Batal"
        variant="outline"
        onPress={onCancel}
        style={styles.bottomBtn}
      />
      <Button
        title={`Finish (${scannedCount}/${availableCount})`}
        onPress={onSubmit}
        isLoading={isSubmitting}
        disabled={isSubmitting}
        style={styles.bottomBtn}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  stkListContent: { padding: 20, paddingBottom: 100 },

  // Missing parts
  missingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C715',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F59E0B30',
  },
  missingBannerText: { fontSize: 12, color: '#B45309', flex: 1 },

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
});

export default StockOutScanningList;
