import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { colors, shadows } from '../theme';

type Props = {
  title: string;
  backgroundColor: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBackgroundColor?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
};

const ProcessHeader: React.FC<Props> = ({
  title,
  backgroundColor,
  subtitle,
  icon,
  iconBackgroundColor = 'rgba(255,255,255,0.2)',
  onBack,
  rightSlot,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor, paddingTop: insets.top + 12 },
      ]}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            accessibilityLabel="Kembali"
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.backButton}>
            <ChevronLeft color={colors.textInverse} size={24} />
          </TouchableOpacity>
        ) : null}
        {icon ? (
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: iconBackgroundColor },
            ]}>
            {icon}
          </View>
        ) : null}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    ...shadows.md,
  },
  row: { alignItems: 'center', flexDirection: 'row' },
  backButton: { marginRight: 8, padding: 4 },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  titleContainer: { flex: 1 },
  title: { color: colors.textInverse, fontSize: 18, fontWeight: '700' },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  rightSlot: { marginLeft: 12 },
});

export default ProcessHeader;
