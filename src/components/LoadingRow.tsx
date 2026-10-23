import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme';

type Props = {
  text: string;
  color?: string;
};

/** Small inline loading indicator: spinner + label. */
const LoadingRow: React.FC<Props> = ({ text, color = colors.primary }) => (
  <View style={styles.row}>
    <ActivityIndicator size="small" color={color} />
    <Text style={styles.text}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  text: {
    fontSize: 13,
    color: colors.textMuted,
  },
});

export default LoadingRow;
