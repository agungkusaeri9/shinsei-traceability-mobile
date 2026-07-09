import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { ClipboardList, ScanBarcode } from 'lucide-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppTabParamList } from '../../../types';
import { colors } from '../../../theme';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { showSuccess } from '../../../services/toastService';
import WarehouseHeader from '../components/WarehouseHeader';
import InfoBanner from '../components/InfoBanner';

type Props = {
  navigation: BottomTabNavigationProp<AppTabParamList, 'Register'>;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const barcodeRef = useRef<TextInput>(null);

  const [partNumber, setPartNumber] = useState('');
  const [qty, setQty] = useState('');
  const [supplier, setSupplier] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [barcode, setBarcode] = useState('');

  const qtyRef = useRef<TextInput>(null);
  const supplierRef = useRef<TextInput>(null);
  const lotNumberRef = useRef<TextInput>(null);

  const focusScanner = useCallback(() => {
    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }, []);

  const parseBarcode = (value: string) => {
    const parts = value.trim().split('-');
    if (parts.length !== 4) {
      setBarcode('');
      focusScanner();
      return;
    }
    const [partNo, qtyVal, supplierVal, lotNo] = parts;
    setPartNumber(partNo);
    setQty(qtyVal);
    setSupplier(supplierVal);
    setLotNumber(lotNo);
    setBarcode('');
    focusScanner();
  };

  const handleSubmit = () => {
    showSuccess('Data part berhasil didaftarkan', 'Register Berhasil');
    navigation.navigate('StockIn', {
      registeredData: { partNumber, lotNumber, qty, supplier },
    });
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={() => barcodeRef.current?.focus()}>
      <View style={styles.container}>
        <WarehouseHeader
          title="Register"
          subtitle="Daftarkan part masuk"
          icon={<ClipboardList color={colors.primary} size={18} />}
          iconBgColor={`${colors.primary}25`}
          onBack={() => navigation.navigate('Warehouse')}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <InfoBanner
              icon={<ScanBarcode color={colors.primary} size={20} />}
              text="Scan barcode part untuk mengisi data secara otomatis, atau input manual"
              bgColor={`${colors.primary}12`}
            />

            <TextInput
              ref={barcodeRef}
              value={barcode}
              onChangeText={setBarcode}
              autoFocus
              showSoftInputOnFocus={false}
              blurOnSubmit={false}
              returnKeyType="done"
              onSubmitEditing={() => parseBarcode(barcode)}
              onBlur={() => setTimeout(focusScanner, 100)}
              style={styles.hiddenInput}
            />

            <Input
              label="Part Number"
              placeholder="Contoh: PRT-001"
              value={partNumber}
              onChangeText={setPartNumber}
              returnKeyType="next"
              onSubmitEditing={() => qtyRef.current?.focus()}
            />

            <Input
              ref={qtyRef}
              label="Quantity"
              placeholder="0"
              keyboardType="numeric"
              value={qty}
              onChangeText={setQty}
              returnKeyType="next"
              onSubmitEditing={() => supplierRef.current?.focus()}
            />

            <Input
              ref={supplierRef}
              label="Supplier"
              placeholder="Nama supplier"
              value={supplier}
              onChangeText={setSupplier}
              returnKeyType="next"
              onSubmitEditing={() => lotNumberRef.current?.focus()}
            />

            <Input
              ref={lotNumberRef}
              label="Lot Number"
              placeholder="Lot number"
              value={lotNumber}
              onChangeText={setLotNumber}
              returnKeyType="done"
            />

            <View style={styles.buttonRow}>
              <Button
                title="Batal"
                variant="outline"
                onPress={() => navigation.navigate('Warehouse')}
                style={styles.halfBtn}
              />
              <Button
                title="Simpan"
                onPress={handleSubmit}
                style={styles.halfBtn}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  halfBtn: { flex: 1, paddingVertical: 12 },
});

export default RegisterScreen;
