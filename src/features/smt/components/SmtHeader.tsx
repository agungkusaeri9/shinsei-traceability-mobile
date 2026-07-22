import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../../../theme';

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconBgColor?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
};

const SmtHeader: React.FC<Props> = ({
  title,
  subtitle,
  icon,
  iconBgColor,
  onBack,
  rightSlot,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.row}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ChevronLeft color={colors.textInverse} size={24} />
          </TouchableOpacity>
        )}
        {icon && (
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: iconBgColor || `${colors.primary}30` },
            ]}
          >
            {icon}
          </View>
        )}
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightSlot && <View style={styles.rightSlot}>{rightSlot}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
    ...shadows.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textInverse,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  rightSlot: {
    marginLeft: 12,
  },
});

export default SmtHeader;
