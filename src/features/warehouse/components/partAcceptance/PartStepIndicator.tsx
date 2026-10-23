import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../../theme';

type Step = 'search' | 'select' | 'detail';

type Props = {
  step: Step;
  /** searchResults.length > 1 — shows the extra "select" step. */
  multi: boolean;
};

/** Step dots (1-2-3) of the Part Acceptance flow. */
const PartStepIndicator: React.FC<Props> = ({ step, multi }) => {
  const stepDefs = multi
    ? [{ key: 'search', num: 1 }, { key: 'select', num: 2 }, { key: 'detail', num: 3 }]
    : [{ key: 'search', num: 1 }, { key: 'detail', num: 2 }];
  const order: Step[] = multi ? ['search', 'select', 'detail'] : ['search', 'detail'];
  const curIdx = order.indexOf(step);
  return (
    <View style={styles.stepIndicator}>
      {stepDefs.map((s, idx) => {
        const isActive = idx <= curIdx;
        const isCurrent = s.key === step;
        return (
          <React.Fragment key={s.key}>
            {idx > 0 && <View style={[styles.stepLine, isActive && styles.stepLineActive]} />}
            <View style={[styles.stepDot, isActive && styles.stepDotActive, isCurrent && styles.stepDotCurrent]}>
              <Text style={[styles.stepDotText, isActive && styles.stepDotTextActive]}>{s.num}</Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: `${colors.textMuted}20`, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotCurrent: { backgroundColor: colors.orange },
  stepDotText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  stepDotTextActive: { color: colors.textInverse },
  stepLine: { width: 40, height: 2, backgroundColor: `${colors.textMuted}20` },
  stepLineActive: { backgroundColor: colors.primary },
});

export default PartStepIndicator;
