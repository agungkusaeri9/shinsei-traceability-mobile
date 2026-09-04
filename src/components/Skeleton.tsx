import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Pulsing skeleton placeholder using React Native's built-in Animated API.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
          opacity,
        },
        style,
      ]}
    />
  );
};

// ─── Composite skeleton layouts ─────────────────────────────────────────────

/** 2×2 stat card skeleton (for WarehouseScreen quick stats) */
export const StatCardsSkeleton: React.FC = () => (
  <View style={sStyles.statsGrid}>
    {[0, 1, 2, 3].map(i => (
      <View key={i} style={sStyles.statCard}>
        <Skeleton width={18} height={18} borderRadius={9} />
        <Skeleton width={48} height={22} borderRadius={6} style={{ marginTop: 6 }} />
        <Skeleton width={56} height={12} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    ))}
  </View>
);

/** Compact activity row skeleton (for WarehouseScreen recent list) */
export const ActivityListSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => (
  <View style={sStyles.activityList}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={sStyles.activityCard}>
        <View style={{ flex: 1 }}>
          <Skeleton width={120} height={13} borderRadius={4} />
          <Skeleton width={90} height={11} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Skeleton width={60} height={14} borderRadius={4} />
          <Skeleton width={40} height={11} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      </View>
    ))}
  </View>
);

/** Summary widget skeleton (for WarehouseDashboard) */
export const SummaryWidgetSkeleton: React.FC = () => (
  <View style={{ marginBottom: 16 }}>
    <Skeleton width={180} height={16} borderRadius={6} style={{ marginBottom: 12 }} />
    <View style={sStyles.mainCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Skeleton width={44} height={44} borderRadius={12} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Skeleton width={100} height={12} borderRadius={4} />
          <Skeleton width={72} height={22} borderRadius={6} style={{ marginTop: 6 }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
        <Skeleton width={100} height={12} borderRadius={4} />
        <Skeleton width={80} height={13} borderRadius={4} />
      </View>
    </View>
    {[0, 1, 2].map(i => (
      <View key={i} style={sStyles.gridCard}>
        <Skeleton width={120} height={13} borderRadius={4} />
        <Skeleton width={64} height={18} borderRadius={6} style={{ marginTop: 8 }} />
        <Skeleton width={90} height={12} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    ))}
  </View>
);

/** Recent acceptance card skeleton (for WarehouseDashboard) */
export const RecentAcceptancesSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => (
  <View style={{ marginBottom: 16 }}>
    <Skeleton width={200} height={16} borderRadius={6} style={{ marginBottom: 12 }} />
    <View style={{ gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={sStyles.acceptanceCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Skeleton width={120} height={22} borderRadius={8} />
            <Skeleton width={50} height={20} borderRadius={6} />
          </View>
          <Skeleton width={140} height={15} borderRadius={4} />
          <Skeleton width={100} height={12} borderRadius={4} style={{ marginTop: 4 }} />
          <View style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 }} />
          <Skeleton width={160} height={12} borderRadius={4} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Skeleton width={100} height={12} borderRadius={4} />
            <Skeleton width={60} height={13} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

const sStyles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    width: '47.5%' as any,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
  },
  activityList: { gap: 8 },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
  },
  mainCard: { backgroundColor: '#D1D5DB', borderRadius: 16, padding: 16, marginBottom: 12 },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
    marginBottom: 10,
  },
  acceptanceCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14 },
});
