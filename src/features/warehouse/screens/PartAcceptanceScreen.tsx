import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ClipboardCheck, ScanBarcode } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { WarehouseStackParamList } from '../../../types';
import { colors } from '../../../theme';
import WarehouseHeader from '../components/WarehouseHeader';
import InfoBanner from '../components/InfoBanner';
import PartStepIndicator from '../components/partAcceptance/PartStepIndicator';
import PartFilterDropdown from '../components/partAcceptance/PartFilterDropdown';
import PartSearchStep from '../components/partAcceptance/PartSearchStep';
import PartSelectStep from '../components/partAcceptance/PartSelectStep';
import PartDetailStep from '../components/partAcceptance/PartDetailStep';
import { usePartAcceptanceFlow } from '../hooks/usePartAcceptanceFlow';

type Props = {
  navigation: NativeStackNavigationProp<
    WarehouseStackParamList,
    'PartAcceptance'
  >;
};

const PartAcceptanceScreen: React.FC<Props> = ({ navigation }) => {
  const flow = usePartAcceptanceFlow();
  const {
    step,
    partNoInput,
    isSearching,
    searchResults,
    selectedPart,
    customers,
    areas,
    selectedCustomerId,
    selectedAreaId,
    showCustomerDropdown,
    setShowCustomerDropdown,
    showAreaDropdown,
    setShowAreaDropdown,
    quantity,
    setQuantity,
    expiredDate,
    setExpiredDate,
    isSubmitting,
    handlePartNoChange,
    handleSelectCustomer,
    handleSelectArea,
    handleManualSearch,
    handleSelectPart,
    handleReset,
    handleSubmit,
  } = flow;

  return (
    <View style={styles.container}>
      <WarehouseHeader
        title="Part Acceptance"
        subtitle="Terima part baru"
        icon={<ClipboardCheck color={colors.orange} size={18} />}
        iconBgColor={`${colors.orange}25`}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <InfoBanner
            icon={<ScanBarcode color={colors.primary} size={20} />}
            text="Scan atau masukkan Part No untuk mencari part, lalu konfirmasi quantity dan expired date."
            bgColor={`${colors.primary}12`}
          />

          <PartStepIndicator
            step={step}
            multi={searchResults.length > 1}
          />

          <View style={styles.filtersSection}>
            <PartFilterDropdown
              label="Customer"
              options={customers}
              selectedId={selectedCustomerId}
              onSelect={handleSelectCustomer}
              placeholder="Semua Customer"
              searchPlaceholder="Cari customer..."
              emptyText="Customer tidak ditemukan"
              open={showCustomerDropdown}
              onToggle={() => {
                setShowCustomerDropdown(!showCustomerDropdown);
                setShowAreaDropdown(false);
              }}
              clearable
            />
            <PartFilterDropdown
              label="Area Warehouse *"
              options={areas}
              selectedId={selectedAreaId}
              onSelect={handleSelectArea}
              placeholder="Pilih Area *"
              searchPlaceholder="Cari area..."
              emptyText="Area tidak ditemukan"
              open={showAreaDropdown}
              onToggle={() => {
                setShowAreaDropdown(!showAreaDropdown);
                setShowCustomerDropdown(false);
              }}
              required
            />
          </View>

          <PartSearchStep
            value={partNoInput}
            onChangeText={handlePartNoChange}
            onSearch={handleManualSearch}
            isSearching={isSearching}
          />

          {step === 'select' && (
            <PartSelectStep
              results={searchResults}
              onSelect={handleSelectPart}
            />
          )}

          {step === 'detail' && selectedPart && (
            <PartDetailStep
              part={selectedPart}
              quantity={quantity}
              onQuantityChange={setQuantity}
              expiredDate={expiredDate}
              onExpiredDateChange={setExpiredDate}
              selectedCustomerId={selectedCustomerId}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onReset={handleReset}
              multi={searchResults.length > 1}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  filtersSection: { marginBottom: 16, gap: 12 },
});

export default PartAcceptanceScreen;
