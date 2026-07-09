import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { ArrowDownToLine, ScanBarcode } from 'lucide-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

import { AppTabParamList } from '../../../types';
import { colors } from '../../../theme';
import Button from '../../../components/Button';
import { showSuccess, showError } from '../../../services/toastService';
import type { RegisteredPart } from '../types';
import WarehouseHeader from '../components/WarehouseHeader';
import InfoBanner from '../components/InfoBanner';
import RegisteredPartSummary from '../components/RegisteredPartSummary';
import ScanResultCard, { ScanPlaceholder } from '../components/ScanResultCard';

type Props = {
  navigation: BottomTabNavigationProp<AppTabParamList, 'StockIn'>;
  route: RouteProp<AppTabParamList, 'StockIn'>;
};

const StockInScreen: React.FC<Props> = ({ navigation, route }) => {
  const barcodeRef = useRef<TextInput>(null);
  const registeredData = route.params?.registeredData;
  const [stkNumber, setStkNumber] = useState('');
  const [scannedStk, setScannedStk] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const focusScanner = useCallback(() => {
    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }, []);

  const handleScan = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      setScannedStk(trimmed);
      setStkNumber('');
    }
    focusScanner();
  };

  const handleSubmit = () => {
    if (!scannedStk) {
      showError('Silakan scan STK Number terlebih dahulu');
      return;
    }
    showSuccess(`STK ${scannedStk} berhasil di-stock in`, 'Stock In Berhasil');
    setIsSubmitted(true);
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={() => barcodeRef.current?.focus()}>
      <View style={styles.container}>
        <WarehouseHeader
          title="Stock In"
          subtitle="Scan STK Number"
          icon={<ArrowDownToLine color={colors.success} size={18} />}
          iconBgColor={`${colors.success}25`}
          onBack={() => navigation.navigate('Register')}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {registeredData && <RegisteredPartSummary data={registeredData} />}

            <InfoBanner
              icon={<ScanBarcode color={colors.success} size={20} />}
              text="Scan barcode STK Number untuk melakukan stock in"
              bgColor={`${colors.success}12`}
            />

            <TextInput
              ref={barcodeRef}
              value={stkNumber}
              onChangeText={setStkNumber}
              autoFocus
              showSoftInputOnFocus={false}
              blurOnSubmit={false}
              returnKeyType="done"
              onSubmitEditing={() => handleScan(stkNumber)}
              onBlur={() => setTimeout(focusScanner, 100)}
              style={styles.hiddenInput}
            />

            {scannedStk ? (
              <ScanResultCard
                scannedValue={scannedStk}
                isSubmitted={isSubmitted}
              />
            ) : (
              <ScanPlaceholder />
            )}

            <View style={styles.buttonRow}>
              {!isSubmitted ? (
                <>
                  <Button
                    title="Batal"
                    variant="outline"
                    onPress={() => navigation.navigate('Register')}
                    style={styles.halfBtn}
                  />
                  <Button
                    title="Submit"
                    onPress={handleSubmit}
                    disabled={!scannedStk}
                    style={styles.halfBtn}
                  />
                </>
              ) : (
                <Button
                  title="Selesai"
                  onPress={() => navigation.navigate('Warehouse')}
                  style={styles.fullBtn}
                />
              )}
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
  fullBtn: { flex: 1, paddingVertical: 12 },
});

export default StockInScreen;
