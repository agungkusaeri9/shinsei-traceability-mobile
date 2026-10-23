import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../../hooks/useAuth';
import { showError } from '../../../services/toastService';
import type { WarehouseStackParamList } from '../../../types';
import { getErrorMessage } from '../../../utils/errorMessage';
import {
  getRecentAcceptances,
  getWarehouseSummary,
} from '../../dashboard/services/dashboardService';
import type {
  RecentAcceptanceItem,
  WarehouseSummaryData,
} from '../../dashboard/types';

type Options = {
  navigation: NativeStackNavigationProp<
    WarehouseStackParamList,
    'WarehouseHome'
  >;
};

type TabPressEvent = {
  preventDefault: () => void;
};

type TabParentNavigation = {
  addListener: (
    eventName: 'tabPress',
    listener: (event: TabPressEvent) => void,
  ) => () => void;
};

const formatTime = (dateValue: string): string => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const useWarehouseHomeFlow = ({ navigation }: Options) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [warehouseSummary, setWarehouseSummary] =
    useState<WarehouseSummaryData | null>(null);
  const [recentAcceptances, setRecentAcceptances] = useState<
    RecentAcceptanceItem[]
  >([]);

  useEffect(() => {
    const parent = navigation.getParent() as unknown as
      | TabParentNavigation
      | undefined;
    if (!parent) {
      return undefined;
    }

    return parent.addListener('tabPress', event => {
      if (navigation.isFocused()) {
        event.preventDefault();
      }
    });
  }, [navigation]);

  const loadData = useCallback(async () => {
    try {
      const [summary, acceptances] = await Promise.all([
        getWarehouseSummary(),
        getRecentAcceptances(),
      ]);
      setWarehouseSummary(summary);
      setRecentAcceptances(acceptances);
    } catch (error) {
      showError(getErrorMessage(error, 'Gagal memuat dashboard Warehouse'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData().catch(() => undefined);
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const recentActivities = useMemo(
    () =>
      recentAcceptances.map(item => ({
        ...item,
        receivedTime: formatTime(item.receivedDate),
      })),
    [recentAcceptances],
  );

  return {
    user,
    refreshing,
    loading,
    warehouseSummary,
    recentActivities,
    onRefresh,
  };
};
