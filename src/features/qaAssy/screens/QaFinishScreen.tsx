import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { CheckCircle2, Zap, Info } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QaAssyStackParamList } from '../../../types';
import { colors } from '../../../theme';
import QaAssyHeader from '../components/QaAssyHeader';
import ScanZone from '../components/ScanZone';
import LotInfoCard from '../components/LotInfoCard';
import { useQaFinishFlow } from '../hooks/useQaFinishFlow';

type Props = {
  navigation: NativeStackNavigationProp<QaAssyStackParamList, 'QaFinish'>;
};

const QaFinishScreen: React.FC<Props> = ({ navigation }) => {
  const {
    scannedLot,
    lotProducts,
    isCheckingLot,
    scannedBox,
    isSubmitting,
    lastSubmitted,
    handleReset,
  } = useQaFinishFlow();

  return (
    <View style={styles.container}>
      <QaAssyHeader
        title="Finish QA"
        subtitle="Scan Lot & Box"
        icon={<Zap color={colors.indigo} size={20} />}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoRow}>
          <Info color={colors.indigo} size={15} />
          <Text style={styles.infoText}>
            Scan Lot untuk verifikasi, lalu scan Box.{'\n'}Pengiriman dilakukan secara otomatis.
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
          <View style={styles.boxWrap}>
            <ScanZone
              label="Box"
              scannedValue={scannedBox}
              accentColor={colors.success}
              placeholder="Arahkan scanner ke barcode box"
            />
          </View>
        ) : null}

        {isSubmitting && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.success} size="small" />
            <Text style={styles.loadingText}>Mengirim data...</Text>
          </View>
        )}

        {lastSubmitted && !isSubmitting && (
          <View style={styles.lastCard}>
            <CheckCircle2 color={colors.success} size={18} />
            <View style={styles.lastCardContent}>
              <Text style={styles.lastLabel}>Terakhir Dikirim</Text>
              <Text style={styles.lastValue}>
                {lastSubmitted.lotRaw} / {lastSubmitted.boxRaw}
              </Text>
            </View>
          </View>
        )}
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
  boxWrap: { marginTop: 12 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, padding: 14, backgroundColor: `${colors.success}10`, borderRadius: 12 },
  loadingText: { fontSize: 14, fontWeight: '600', color: colors.success },
  lastCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, padding: 14, backgroundColor: `${colors.success}10`, borderRadius: 12, borderWidth: 1, borderColor: `${colors.success}30` },
  lastCardContent: { flex: 1 },
  lastLabel: { fontSize: 11, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },
  lastValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
});

export default QaFinishScreen;
