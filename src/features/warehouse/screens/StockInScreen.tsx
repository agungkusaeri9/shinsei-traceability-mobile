import React from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { ArrowDownToLine, ScanBarcode } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { WarehouseStackParamList } from '../../../types';
import { colors } from '../../../theme';
import Button from '../../../components/Button';
import LoadingRow from '../../../components/LoadingRow';
import WarehouseHeader from '../components/WarehouseHeader';
import InfoBanner from '../components/InfoBanner';
import StkInfoCard from '../components/stockin/StkInfoCard';
import StkLocationsList from '../components/stockin/StkLocationsList';
import StkLocationCard from '../components/stockin/StkLocationCard';
import StockInPhotoSection from '../components/stockin/StockInPhotoSection';
import { useStockInFlow } from '../hooks/useStockInFlow';

type Props = {
  navigation: NativeStackNavigationProp<WarehouseStackParamList, 'StockIn'>;
};

const StockInScreen: React.FC<Props> = ({ navigation }) => {
  const flow = useStockInFlow({ onExit: () => navigation.goBack() });
  const {
    step,
    setStep,
    stkData,
    scannedLocation,
    photo,
    isLoadingStk,
    isCheckingRack,
    isSubmitting,
    refreshing,
    locationsList,
    headerSubtitle,
    handleBackHeader,
    handleTakePhoto,
    handleRemovePhoto,
    handleSubmit,
    handleReset,
    onRefresh,
  } = flow;

  return (
    <View style={styles.container}>
      <WarehouseHeader
        title="Stock In"
        subtitle={headerSubtitle}
        icon={<ArrowDownToLine color={colors.success} size={18} />}
        iconBgColor={`${colors.success}25`}
        onBack={handleBackHeader}
      />

      <View style={styles.contentContainer}>
        {/* Step 1: Scan STK */}
        {step === 'scan-stk' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.success]}
                tintColor={colors.success}
              />
            }
          >
            <InfoBanner
              icon={<ScanBarcode color={colors.success} size={20} />}
              text="Scan barcode STK Number untuk memulai proses stock in"
              bgColor={`${colors.success}12`}
            />

            {isLoadingStk && <LoadingRow text="Mencari data STK..." />}
          </ScrollView>
        )}

        {/* Step 2: Scan Rack */}
        {step === 'scan-rack' && stkData && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <InfoBanner
              icon={<ScanBarcode color={colors.primary} size={20} />}
              text="Scan barcode Rack (Format: Rack-Shelf-Bin)"
              bgColor={`${colors.primary}12`}
            />

            {isCheckingRack && (
              <LoadingRow text="Mengecek keesuaian lokasi Rack..." />
            )}

            <StkInfoCard stkData={stkData} />
            <StkLocationsList locations={locationsList} />

            <Button
              title="Batal / Scan STK Lain"
              variant="outline"
              onPress={handleReset}
            />
          </ScrollView>
        )}

        {/* Step 3: Confirm & Photo */}
        {step === 'confirm' && stkData && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <StkInfoCard stkData={stkData} />

            {scannedLocation && (
              <StkLocationCard
                variant="verified"
                title="Lokasi Terverifikasi (Match)"
                rack={scannedLocation.rack}
                shelf={scannedLocation.shelf}
                bin={scannedLocation.bin}
              />
            )}

            <StockInPhotoSection
              photo={photo}
              onTakePhoto={handleTakePhoto}
              onRemovePhoto={handleRemovePhoto}
            />

            <View style={styles.buttonRow}>
              <Button
                title="Scan Ulang Rack"
                variant="outline"
                onPress={() => setStep('scan-rack')}
                style={styles.scanBtn}
              />
              <Button
                title="Submit"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                style={styles.submitBtn}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },

  scanBtn: {
    flex: 1.3,
    paddingVertical: 10,
  },

  submitBtn: {
    flex: 1,
    paddingVertical: 10,
  },
});

export default StockInScreen;
