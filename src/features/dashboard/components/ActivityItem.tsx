import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  UserCog,
  Settings,
  Activity,
} from 'lucide-react-native';
import { colors, shadows } from '../../../theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivityType =
  | 'shipment'
  | 'alert'
  | 'order'
  | 'done'
  | 'user'
  | 'config'
  | 'system';

export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: ActivityType;
}

type IconComponent = React.ComponentType<{ color?: string; size?: number }>;

const activityIconConfig: Record<
  ActivityType,
  { Icon: IconComponent; color: string }
> = {
  shipment: { Icon: Package, color: colors.primary },
  alert: { Icon: AlertTriangle, color: colors.warning },
  order: { Icon: ShoppingCart, color: colors.primary },
  done: { Icon: CheckCircle2, color: colors.success },
  user: { Icon: UserCog, color: colors.purple },
  config: { Icon: Settings, color: colors.indigo },
  system: { Icon: Activity, color: colors.success },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ActivityItemProps {
  activity: Activity;
  onPress?: (activity: Activity) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onPress }) => {
  const { Icon, color } = activityIconConfig[activity.type];

  const content = (
    <View style={styles.container}>
      <View style={[styles.icon, { backgroundColor: `${color}20` }]}>
        <Icon color={color} size={20} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {activity.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {activity.description}
        </Text>
      </View>
      <Text style={styles.time}>{activity.time}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(activity)}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    ...shadows.sm,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  description: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  time: { fontSize: 11, color: colors.textMuted, marginLeft: 8 },
});

export default ActivityItem;
