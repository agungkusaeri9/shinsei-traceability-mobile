import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface AreaCardProps {
  area: {
    id: string;
    name: string;
    code: string;
    status: 'active' | 'maintenance' | 'inactive';
    capacity: number;
    currentUsage: number;
    manager: string;
    lastUpdate: string;
  };
  onPress?: () => void;
}

const AreaCard: React.FC<AreaCardProps> = ({ area, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'maintenance':
        return '#F59E0B';
      case 'inactive':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'maintenance':
        return 'Maintenance';
      case 'inactive':
        return 'Non Aktif';
      default:
        return 'Unknown';
    }
  };

  const getUsagePercentage = (current: number, capacity: number) => {
    return capacity > 0 ? Math.round((current / capacity) * 100) : 0;
  };

  const usagePercentage = getUsagePercentage(area.currentUsage, area.capacity);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View>
          <Text style={styles.areaName}>{area.name}</Text>
          <Text style={styles.areaCode}>{area.code}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(area.status) }]}>
          <Text style={styles.statusText}>{getStatusText(area.status)}</Text>
        </View>
      </View>

      <View style={styles.usageSection}>
        <View style={styles.usageInfo}>
          <Text style={styles.usageLabel}>Penggunaan</Text>
          <Text style={styles.usageText}>
            {area.currentUsage}/{area.capacity} unit
          </Text>
        </View>
        <Text style={styles.usagePercentage}>{usagePercentage}%</Text>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${usagePercentage}%`, backgroundColor: getStatusColor(area.status) }
          ]} 
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.managerInfo}>
          <Text style={styles.managerLabel}>Manager:</Text>
          <Text style={styles.managerName}>{area.manager}</Text>
        </View>
        <Text style={styles.lastUpdate}>Update: {area.lastUpdate}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  areaCode: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  usageSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageInfo: {
    flex: 1,
  },
  usageLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  usageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  usagePercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  managerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  managerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  managerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  lastUpdate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default AreaCard;