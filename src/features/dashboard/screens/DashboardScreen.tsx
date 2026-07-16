import React from 'react';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import WarehouseDashboard from './WarehouseDashboard';

type Props = {
  navigation: BottomTabNavigationProp<AppTabParamList, 'Dashboard'>;
};

/**
 * Role-based dashboard router.
 * Renders the appropriate dashboard according to the authenticated user's role.
 */
const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const role = user?.role ?? '';

  switch (role) {
    case 'superadmin':
      return <SuperAdminDashboard navigation={navigation} />;
    case 'warehouse':
      return <WarehouseDashboard navigation={navigation} />;
    default:
      return <AdminDashboard navigation={navigation} />;
  }
};

export default DashboardScreen;
