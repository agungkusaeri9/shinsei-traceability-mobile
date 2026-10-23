import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ClipboardCheck, QrCode } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QaAssyStackParamList } from '../../../types';
import { colors } from '../../../theme';
import QaAssyHeader from '../components/QaAssyHeader';
import ScanZone from '../components/ScanZone';
import LotInfoCard from '../components/LotInfoCard';
import Button from '../../../components/Button';
import { useQaRegisterFlow } from '../hooks/useQaRegisterFlow';

type Props = {
  navigation: NativeStackNavigationProp<QaAssyStackParamList, 'QaRegister'>;
};

const QaRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const {
    scannedLot,
    lotProducts,
    isCheckingLot,
    isSubmitting,
    handleReset,
    handleSubmit,
  } = useQaRegisterFlow();

  return (
    <View style={styles.container}>
      <QaAssyHeader
        title="QA Register"
        subtitle="Scan & Daftarkan Lot"
        icon={<ClipboardCheck color={colors.indigo} size={20} />}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoRow}>
          <QrCode color={colors.indigo} size={15} />
          <Text style={styles.infoText}>
            Arahkan scanner ke barcode Lot, lalu tekan Register.
          </Text>
        </View>

        <ScanZone
          label="Lot Number"
          scannedValue={scannedLot}
          onReset={handleReset}
          placeholder="Arahkan scanner ke barcode lot"
        />

        {isCheckingLot ? (
          <View style={styles.checkingRow}>
            <Text style={styles.checkingText}>Mengecek lot number...</Text>
          </View>
        ) : null}

        {scannedLot && lotProducts.length > 0 ? (
          <LotInfoCard lotProducts={lotProducts} />
        ) : null}

        {scannedLot ? (
          <Button
            title="Register"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitBtn}
          />
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  infoText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  checkingRow: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: `${colors.indigo}12`, borderWidth: 1, borderColor: `${colors.indigo}30` },
  checkingText: { fontSize: 13, fontWeight: '600', color: colors.indigo },
  submitBtn: { marginTop: 16, width: '100%', backgroundColor: colors.indigo },
});

export default QaRegisterScreen;
