import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  QrCode,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react-native';
import { colors } from '../theme';
import ScanZone from '../features/qaAssy/components/ScanZone';
import Button from './Button';
import type { useAcceptanceFlow } from '../hooks/useAcceptanceFlow';

type Props = {
  accentColor: string;
  infoText: string;
  submitLabel?: string;
  flow: ReturnType<typeof useAcceptanceFlow>;
};

const AcceptanceContent: React.FC<Props> = ({
  accentColor,
  infoText,
  submitLabel = 'Submit Acceptance',
  flow,
}) => {
  const {
    scannedStk,
    isSubmitting,
    lastError,
    lastSuccess,
    handleSubmit,
    handleReset,
  } = flow;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoRow}>
          <QrCode color={accentColor} size={15} />
          <Text style={styles.infoText}>{infoText}</Text>
        </View>

        <ScanZone
          label="STK Number"
          scannedValue={scannedStk}
          onReset={() => handleReset()}
          accentColor={accentColor}
          placeholder="Arahkan scanner ke barcode STK"
        />

        {lastError ? (
          <View style={styles.errorBox}>
            <View style={styles.errorHeader}>
              <AlertCircle color={colors.danger} size={20} />
              <Text style={styles.errorTitle}>Acceptance Gagal</Text>
            </View>
            <Text style={styles.errorMessage}>{lastError}</Text>
            <View style={styles.errorActions}>
              <Button
                title="Coba Lagi"
                onPress={() => handleSubmit()}
                isLoading={isSubmitting}
                style={styles.retryBtn}
              />
              <TouchableOpacity onPress={() => handleReset()} style={styles.resetBtn}>
                <RotateCcw color={colors.textSecondary} size={16} />
                <Text style={styles.resetBtnText}>Reset Form</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {lastSuccess && !lastError ? (
          <View style={styles.successBox}>
            <View style={styles.successHeader}>
              <CheckCircle2 color={colors.success} size={20} />
              <Text style={styles.successTitle}>Acceptance Berhasil</Text>
            </View>
            <Text style={styles.successStk}>{lastSuccess.stkNumber}</Text>
            <Text style={styles.successMessage}>{lastSuccess.message}</Text>
            <Text style={styles.successSub}>STK siap diproses ke tahap berikutnya.</Text>
          </View>
        ) : null}

        {scannedStk ? (
          <Button
            title={submitLabel}
            onPress={() => handleSubmit()}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            style={[styles.submitBtn, { backgroundColor: accentColor }]}
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
  submitBtn: { marginTop: 20, width: '100%' },
  errorBox: { marginTop: 16, padding: 16, borderRadius: 12, backgroundColor: `${colors.danger}10`, borderWidth: 1, borderColor: `${colors.danger}35` },
  errorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  errorTitle: { fontSize: 15, fontWeight: '700', color: colors.danger },
  errorMessage: { fontSize: 13, color: colors.textPrimary, marginBottom: 14, lineHeight: 18 },
  errorActions: { flexDirection: 'column', gap: 10 },
  retryBtn: { backgroundColor: colors.danger, width: '100%' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  resetBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  successBox: { marginTop: 16, padding: 16, borderRadius: 12, backgroundColor: `${colors.success}12`, borderWidth: 1, borderColor: `${colors.success}40` },
  successHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  successTitle: { fontSize: 14, fontWeight: '700', color: colors.success },
  successStk: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  successMessage: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  successSub: { fontSize: 11, color: colors.textMuted, marginTop: 4, fontWeight: '500' },
});

export default AcceptanceContent;
