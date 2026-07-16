import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ClipboardList, ScanBarcode } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { WarehouseStackParamList } from '../../../types';
import { colors } from '../../../theme';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import WarehouseHeader from '../components/WarehouseHeader';
import InfoBanner from '../components/InfoBanner';
import SearchableDropdown from '../components/SearchableDropdown';
import { useRegisterWarehouse } from '../hooks/useRegisterWarehouse';
import { getExpiredDateTwoWeeks } from '../services/warehouseService';

type Props = {
  navigation: NativeStackNavigationProp<WarehouseStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const {
    // Form state
    partNumber,
    setPartNumber,
    lotNumber,
    setLotNumber,
    quantity,
    setQuantity,
    barcode,
    setBarcode,

    // Supplier / Maker
    suppliers,
    makers,
    selectedSupplierId,
    selectedMakerId,
    handleSelectSupplier,
    handleSelectMaker,

    // Loading
    loadingSuppliers,
    loadingMakers,
    submitting,

    // Focused field
    focusedFieldRef,
    handleFocusField,
    handleBlurField,

    // Refs
    barcodeRef,
    partNumberRef,
    lotNumberRef,
    quantityRef,

    // Actions
    parseBarcode,
    handleSubmit,
    resetForm,
    focusScanner,

    // Master data modal
    showMasterDataModal,
    masterDataType,
    masterDataName,
    setMasterDataName,
    setShowMasterDataModal,
    handleCreateMasterData,
  } = useRegisterWarehouse();

  // Build supplier/maker options for SearchableDropdown
  const supplierDropdownOptions = suppliers.map(s => ({
    id: String(s.id),
    label: s.name,
  }));
  const makerDropdownOptions = makers.map(m => ({
    id: String(m.id),
    label: m.name,
  }));

  return (
    <View style={styles.container}>
      <WarehouseHeader
        title="Register"
        subtitle="Daftarkan part masuk"
        icon={<ClipboardList color={colors.primary} size={18} />}
        iconBgColor={`${colors.primary}25`}
        onBack={() => navigation.navigate('WarehouseHome')}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <InfoBanner
            icon={<ScanBarcode color={colors.primary} size={20} />}
            text="Scan barcode: auto-fill semua, atau focus field lalu scan satu per satu"
            bgColor={`${colors.primary}12`}
          />

          {/* Hidden barcode scanner input */}
          <TextInput
            ref={barcodeRef}
            value={barcode}
            onChangeText={setBarcode}
            autoFocus
            showSoftInputOnFocus={false}
            blurOnSubmit={false}
            returnKeyType="done"
            onSubmitEditing={() => parseBarcode(barcode)}
            onBlur={() => {
              // Only refocus scanner if no form field is focused
              if (!focusedFieldRef.current) {
                setTimeout(focusScanner, 100);
              }
            }}
            style={styles.hiddenInput}
          />

          {/* Part Number */}
          <Input
            ref={partNumberRef}
            label="Part Number"
            placeholder="Contoh: PART1"
            value={partNumber}
            onChangeText={setPartNumber}
            returnKeyType="next"
            onFocus={() => handleFocusField('partNumber')}
            onBlur={() => handleBlurField('partNumber')}
            onSubmitEditing={() => lotNumberRef.current?.focus()}
          />

          {/* Lot Number */}
          <Input
            ref={lotNumberRef}
            label="Lot Number"
            placeholder="Contoh: LOT1"
            value={lotNumber}
            onChangeText={setLotNumber}
            returnKeyType="next"
            onFocus={() => handleFocusField('lotNumber')}
            onBlur={() => handleBlurField('lotNumber')}
            onSubmitEditing={() => quantityRef.current?.focus()}
          />

          {/* Quantity */}
          <Input
            ref={quantityRef}
            label="Quantity"
            placeholder="0"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            returnKeyType="next"
            onFocus={() => handleFocusField('quantity')}
            onBlur={() => handleBlurField('quantity')}
            onSubmitEditing={() => focusScanner()}
          />

          {/* Maker */}
          {loadingMakers ? (
            <View style={styles.loadingField}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Memuat maker...</Text>
            </View>
          ) : (
            <View onTouchStart={() => handleFocusField('maker')}>
              <SearchableDropdown
                options={makerDropdownOptions}
                selectedValue={selectedMakerId ? String(selectedMakerId) : ''}
                onSelect={id => {
                  handleSelectMaker(id);
                  handleBlurField('maker');
                }}
                onClear={() => {
                  handleSelectMaker('');
                  handleBlurField('maker');
                }}
                label="Maker"
                placeholder="Cari atau pilih Maker..."
              />
            </View>
          )}

          {/* Supplier */}
          {loadingSuppliers ? (
            <View style={styles.loadingField}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Memuat supplier...</Text>
            </View>
          ) : (
            <View onTouchStart={() => handleFocusField('supplier')}>
              <SearchableDropdown
                options={supplierDropdownOptions}
                selectedValue={
                  selectedSupplierId ? String(selectedSupplierId) : ''
                }
                onSelect={id => {
                  handleSelectSupplier(id);
                  handleBlurField('supplier');
                }}
                onClear={() => {
                  handleSelectSupplier('');
                  handleBlurField('supplier');
                }}
                label="Supplier"
                placeholder="Cari atau pilih Supplier..."
              />
            </View>
          )}

          {/* Expired Date Info */}
          <View style={styles.expiredInfo}>
            <Text style={styles.expiredLabel}>Expired Date:</Text>
            <Text style={styles.expiredValue}>{getExpiredDateTwoWeeks()}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Button
              title="Batal"
              variant="outline"
              onPress={() => navigation.navigate('WarehouseHome')}
              style={styles.halfBtn}
            />
            <Button
              title="Simpan"
              onPress={handleSubmit}
              isLoading={submitting}
              disabled={submitting}
              style={styles.halfBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Master Data Not Found Modal */}
      <Modal
        visible={showMasterDataModal}
        title={`Data ${
          masterDataType === 'supplier' ? 'Supplier' : 'Maker'
        } Tidak Ditemukan`}
        message={
          masterDataName
            ? `${
                masterDataType === 'supplier' ? 'Supplier' : 'Maker'
              } "${masterDataName}" belum terdaftar. Buat data master terlebih dahulu sebelum melakukan register.`
            : `Belum ada data ${
                masterDataType === 'supplier' ? 'supplier' : 'maker'
              } yang terdaftar. Buat data master terlebih dahulu.`
        }
        onClose={() => setShowMasterDataModal(false)}
        onConfirm={handleCreateMasterData}
        confirmText="Buat Sekarang"
        cancelText="Tutup"
      >
        {masterDataName ? (
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>
              Nama {masterDataType === 'supplier' ? 'Supplier' : 'Maker'}:
            </Text>
            <Text style={styles.modalValue}>{masterDataName}</Text>
          </View>
        ) : (
          <Input
            label={`Nama ${
              masterDataType === 'supplier' ? 'Supplier' : 'Maker'
            }`}
            placeholder={`Masukkan nama ${
              masterDataType === 'supplier' ? 'supplier' : 'maker'
            }`}
            value={masterDataName}
            onChangeText={setMasterDataName}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  halfBtn: { flex: 1, paddingVertical: 12 },
  loadingField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyField: {
    paddingVertical: 12,
    backgroundColor: `${colors.warning}10`,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  emptyText: {
    fontSize: 13,
    color: colors.warning,
    fontWeight: '600',
  },
  expiredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}12`,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 8,
  },
  expiredLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  expiredValue: {
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
  },
  modalField: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default RegisterScreen;
