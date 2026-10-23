import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { colors, shadows } from '../theme';
import Button from './Button';

type Props = {
  title: string;
  subtitle: string;
  /** Optional summary card content (e.g. DetailRow list). */
  summary?: React.ReactNode;
  /** Extra action buttons rendered below the primary button. */
  actions?: React.ReactNode;
  /** Primary action — e.g. "Scan Berikutnya". */
  onReset?: () => void;
  resetLabel?: string;
};

/**
 * Standard "finished / success" screen view used across workflows.
 * Shows a large check icon, title, subtitle, optional summary card,
 * and action button(s).
 */
const FinishedView: React.FC<Props> = ({
  title,
  subtitle,
  summary,
  actions,
  onReset,
  resetLabel = 'Lanjutkan',
}) => (
  <ScrollView contentContainerStyle={styles.scrollContent}>
    <View style={styles.container}>
      <View style={styles.iconBadge}>
        <CheckCircle2 color={colors.success} size={50} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {summary ? <View style={styles.summary}>{summary}</View> : null}
      {onReset && (
        <Button title={resetLabel} onPress={onReset} style={styles.btn} />
      )}
      {actions}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  container: { alignItems: 'center', padding: 32, paddingBottom: 40 },
  iconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    ...shadows.sm,
  },
  btn: { width: '100%', paddingVertical: 12, marginTop: 8 },
});

export default FinishedView;
