import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../../../theme';

type Props = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
};

const WarehouseHeader: React.FC<Props> = ({
  title,
  subtitle,
  icon,
  iconBgColor,
  onBack,
  rightSlot,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.headerWarehouse}
      />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.backBtn}
          >
            <ChevronLeft color={colors.textInverse} size={24} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View
              style={[styles.headerIconBadge, { backgroundColor: iconBgColor }]}
            >
              {icon}
            </View>
            <View>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
          </View>

          {rightSlot ?? <View style={styles.backBtn} />}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.headerWarehouse,
    paddingBottom: 20,
    paddingHorizontal: 16,
    ...shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.textInverse },
  headerSubtitle: { fontSize: 12, color: colors.textHeaderMuted },
});

export default WarehouseHeader;
