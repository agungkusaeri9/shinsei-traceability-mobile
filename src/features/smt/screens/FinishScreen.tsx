import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { CheckCircle2, Factory } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SmtStackParamList } from '../../../types';
import { colors, shadows } from '../../../theme';
import SmtHeader from '../components/SmtHeader';
import Button from '../../../components/Button';
import InlineDropdown from '../../warehouse/components/InlineDropdown';
import InfoBanner from '../../warehouse/components/InfoBanner';
import DetailRow from '../../../components/DetailRow';
import LoadingRow from '../../../components/LoadingRow';
import FinishedView from '../../../components/FinishedView';
import { useSmtFinishFlow } from '../hooks/useSmtFinishFlow';

type Props = {
  navigation: NativeStackNavigationProp<SmtStackParamList, 'Finish'>;
};

const FinishScreen: React.FC<Props> = ({ navigation }) => {
  const {
    loadingLots,
    refreshing,
    selectedLotNumber,
    availableProducts,
    selectedProduct,
    loadingOrderDetail,
    isSubmitting,
    isSuccess,
    lotOptions,
    productOptions,
    onRefresh,
    handleLotSelection,
    handleProductSelection,
    handleSubmitFinish,
    handleReset,
  } = useSmtFinishFlow();

  return (
    <View style={styles.container}>
      <SmtHeader
        title="SMT Finish"
        subtitle="Konfirmasi & Selesaikan Proses SMT"
        icon={<CheckCircle2 color={colors.success} size={18} />}
        iconBgColor={`${colors.success}25`}
        onBack={() =>
          navigation.canGoBack()
            ? navigation.goBack()
            : navigation.navigate('SmtHome')
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {isSuccess ? (
          <FinishedView
            title="SMT Finish Selesai!"
            subtitle={`Lot Number ${selectedLotNumber} berhasil di-finish`}
            resetLabel="Proses Order Lain"
            onReset={handleReset}
            scrollable={false}
          />
        ) : (
          <>
            <InfoBanner
              icon={<Factory color={colors.primary} size={20} />}
              text="Cari / pilih Lot Number untuk melakukan konfirmasi & finish SMT"
              bgColor={`${colors.primary}12`}
            />

            {loadingLots ? (
              <LoadingRow text="Memuat data Order Lot..." />
            ) : (
              <InlineDropdown
                label="Lot Number"
                options={lotOptions}
                selectedValue={selectedLotNumber || ''}
                onSelect={handleLotSelection}
                placeholder="Pilih Lot Number..."
                searchPlaceholder="Cari Lot Number..."
                clearable
              />
            )}

            {loadingOrderDetail && (
              <LoadingRow text="Memuat detail Order Lot..." />
            )}

            {selectedProduct && !loadingOrderDetail && selectedLotNumber && (
              <>
                {availableProducts.length > 1 && (
                  <InlineDropdown
                    label="Pilih Product"
                    options={productOptions}
                    selectedValue={String(selectedProduct.id)}
                    onSelect={handleProductSelection}
                    placeholder="Pilih Product..."
                  />
                )}

                <View style={styles.confirmationCard}>
                  <Text style={styles.cardTitle}>Konfirmasi Data Order Lot</Text>

                  <DetailRow label="Lot Number" value={selectedLotNumber} />
                  <DetailRow label="Customer" value={selectedProduct.customerName ?? '-'} />
                  <DetailRow label="Model" value={selectedProduct.name ?? '-'} />
                  <DetailRow label="Product Code" value={selectedProduct.code ?? '-'} />
                  {selectedProduct.description ? (
                    <DetailRow label="Description" value={selectedProduct.description} />
                  ) : null}
                </View>

                <Button
                  title="Submit Finish SMT"
                  onPress={handleSubmitFinish}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                />
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  confirmationCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textMuted}20`,
    paddingBottom: 8,
  },
  submitBtn: {
    marginTop: 20,
    paddingVertical: 12,
  },
});

export default FinishScreen;
