import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

type Props = {
  label: string;
  value: string;
  /** 'row' = label left / value right (default). 'column' = label top / value below. */
  layout?: 'row' | 'column';
  /** Render the label in uppercase with tighter styling. */
  uppercaseLabel?: boolean;
};

const DetailRow: React.FC<Props> = ({
  label,
  value,
  layout = 'row',
  uppercaseLabel = false,
}) => (
  <View style={[styles.row, layout === 'column' && styles.rowColumn]}>
    <Text style={[styles.label, uppercaseLabel && styles.labelUppercase]}>
      {label}
    </Text>
    <Text style={[styles.value, layout === 'column' && styles.valueColumn]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  labelUppercase: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  valueColumn: {
    maxWidth: '100%',
    textAlign: 'left',
    marginTop: 2,
  },
});

export default DetailRow;
