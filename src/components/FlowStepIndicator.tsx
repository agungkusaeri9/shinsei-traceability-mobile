import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

import { colors } from '../theme';

type Props = {
  current: number;
  total: number;
  activeColor?: string;
};

const FlowStepIndicator: React.FC<Props> = ({
  current,
  total,
  activeColor = colors.primary,
}) => (
  <View style={styles.container}>
    {Array.from({ length: total }, (_, index) => {
      const stepNumber = index + 1;
      const isCompleted = index < current;
      const isCurrent = index === current;

      return (
        <React.Fragment key={stepNumber}>
          <View
            style={[
              styles.dot,
              isCompleted && styles.completedDot,
              isCurrent && { backgroundColor: activeColor },
            ]}>
            {isCompleted ? (
              <CheckCircle2 color={colors.textInverse} size={14} />
            ) : (
              <Text
                style={[
                  styles.dotText,
                  isCurrent && styles.currentDotText,
                ]}>
                {stepNumber}
              </Text>
            )}
          </View>
          {index < total - 1 ? (
            <View
              style={[
                styles.line,
                isCompleted && styles.completedLine,
              ]}
            />
          ) : null}
        </React.Fragment>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  dot: {
    alignItems: 'center',
    backgroundColor: `${colors.textMuted}25`,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  completedDot: { backgroundColor: colors.success },
  dotText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  currentDotText: { color: colors.textInverse },
  line: {
    backgroundColor: `${colors.textMuted}25`,
    height: 2,
    width: 36,
  },
  completedLine: { backgroundColor: colors.success },
});

export default FlowStepIndicator;
