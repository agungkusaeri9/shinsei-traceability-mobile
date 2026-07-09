import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../theme';

type Props = {
  icon: React.ReactNode;
  text: string;
  bgColor?: string;
};

const InfoBanner: React.FC<Props> = ({ icon, text, bgColor }) => {
  return (
    <View
      style={[
        styles.banner,
        bgColor ? { backgroundColor: bgColor } : undefined,
      ]}
    >
      {icon}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${colors.primary}12`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  text: { flex: 1, fontSize: 13, color: colors.textSecondary },
});

export default InfoBanner;
