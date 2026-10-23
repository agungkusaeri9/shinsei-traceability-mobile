import React from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { ArrowUpFromLine, X } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { WarehouseStackParamList } from '../../../types';
import { colors } from '../../../theme';
import FinishedView from '../../../components/FinishedView';
import DetailRow from '../../../components/DetailRow';
import WarehouseHeader from '../components/WarehouseHeader';
import StockOutSelectOrder from '../components/stockout/StockOutSelectOrder';
import StockOutConfirmOrder from '../components/stockout/StockOutConfirmOrder';
import StockOutScanningList from '../components/stockout/StockOutScanningList';
import { useStockOutFlow } from '../hooks/useStockOutFlow';

type Props = {
  navigation: NativeStackNavigationProp<WarehouseStackParamList, 'StockOut'>;
};

const StockOutScreen: React.FC<Props> = ({ navigation }) => {
  const flow = useStockOutFlow({ onExit: () => navigation.goBack() });
  const {
    step,
    loadingOrders,
    selectedOrderId,
    selectedOrder,
    loadingOrderDetail,
    scannedStkNumbers,
    isSubmitting,
    refreshing,
    setDropdownOpen,
    sortedAvailableParts,
    availableCount,
    missingParts,
    orderDropdownOptions,
    headerSubtitle,
    flatListRef,
    onRefresh,
    handleSelectOrder,
    handleFetchOrder,
    handleStartScan,
    handleSubmit,
    handleReset,
    handleBackHeader,
  } = flow;

  return (
    <View style={styles.container}>
      <WarehouseHeader
        title="Stock Out"
        subtitle={headerSubtitle}
        icon={<ArrowUpFromLine color={colors.orange} size={18} />}
        iconBgColor={`${colors.orange}25`}
        onBack={handleBackHeader}
        rightSlot={
          step !== 'select_wo' ? (
            <X color={colors.textInverse} size={24} />
          ) : undefined
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.contentContainer}>
        {/* ── Step 1: Select Order ──────────────────────── */}
        {step === 'select_wo' && (
          <StockOutSelectOrder
            refreshing={refreshing}
            onRefresh={onRefresh}
            loadingOrders={loadingOrders}
            orderOptions={orderDropdownOptions}
            selectedOrderId={selectedOrderId}
            onSelectOrder={handleSelectOrder}
            onToggleDropdown={setDropdownOpen}
            onSearch={handleFetchOrder}
            loadingOrderDetail={loadingOrderDetail}
            onCancel={() => navigation.goBack()}
          />
        )}

        {/* ── Step 2: Confirm Order ─────────────────────── */}
        {step === 'confirm_wo' && selectedOrder && (
          <StockOutConfirmOrder
            order={selectedOrder}
            availableCount={availableCount}
            missingParts={missingParts}
            onBack={handleReset}
            onStartScan={handleStartScan}
          />
        )}

        {/* ── Step 3: Scanning ──────────────────────────── */}
        {step === 'scanning' && selectedOrder && (
          <StockOutScanningList
            listRef={flatListRef}
            parts={sortedAvailableParts}
            scannedStkNumbers={scannedStkNumbers}
            scannedCount={scannedStkNumbers.size}
            availableCount={availableCount}
            missingParts={missingParts}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={handleReset}
          />
        )}

        {/* ── Step 4: Finished ──────────────────────────── */}
        {step === 'finished' && selectedOrder && (
          <FinishedView
            title="Stock Out Selesai!"
            subtitle={`Semua STK Number untuk ${selectedOrder.orderNumber} berhasil di-scan`}
            summary={
              <>
                <DetailRow
                  layout="column"
                  label="Order Number"
                  value={selectedOrder.orderNumber}
                />
                <DetailRow
                  layout="column"
                  label="Customer"
                  value={selectedOrder.customer?.name ?? 'N/A'}
                />
                <DetailRow
                  layout="column"
                  label="Total STK Diproses"
                  value={String(scannedStkNumbers.size)}
                />
              </>
            }
            onReset={handleReset}
            resetLabel="Kembali ke Warehouse"
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { flex: 1 },
});

export default StockOutScreen;
