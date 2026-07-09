import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';

import { AppTabParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import PartAcceptanceListScreen from '../features/partAcceptance/screens/PartAcceptanceListScreen';
import MaterialFeedingListScreen from '../features/materialFeeding/screens/MaterialFeedingListScreen';
import AreaScreen from '../features/area/screens/AreaScreen';
import WarehouseScreen from '../features/warehouse/screens/WarehouseScreen';
import RegisterScreen from '../features/warehouse/screens/RegisterScreen';
import StockInScreen from '../features/warehouse/screens/StockInScreen';
import StockOutScreen from '../features/warehouse/screens/StockOutScreen';
import {
  DashboardIcon,
  MaterialFeedingIcon,
  PartAcceptanceIcon,
  ProfileIcon,
  AreaIcon,
  WarehouseTabIcon,
  RegisterIcon,
  StockInIcon,
  StockOutIcon,
} from '../utils/tabIcons';

const Tab = createBottomTabNavigator<AppTabParamList>();

const HIDDEN_TAB = { tabBarItemStyle: { display: 'none' as const } };

const AppNavigator: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role ?? '';
  const isWarehouse = role === 'warehouse';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: DashboardIcon,
        }}
      />

      {/* Warehouse-only screens */}
      <Tab.Screen
        name="Warehouse"
        component={WarehouseScreen}
        options={{
          title: 'Warehouse',
          tabBarIcon: WarehouseTabIcon,
          ...(isWarehouse ? {} : HIDDEN_TAB),
        }}
      />

      <Tab.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Register',
          tabBarIcon: RegisterIcon,
          ...HIDDEN_TAB,
        }}
      />

      <Tab.Screen
        name="StockIn"
        component={StockInScreen}
        options={{
          title: 'Stock In',
          tabBarIcon: StockInIcon,
          ...HIDDEN_TAB,
        }}
      />

      <Tab.Screen
        name="StockOut"
        component={StockOutScreen}
        options={{
          title: 'Stock Out',
          tabBarIcon: StockOutIcon,
          ...HIDDEN_TAB,
        }}
      />

      {/* Non-warehouse screens (hidden for warehouse role) */}
      <Tab.Screen
        name="PartAcceptance"
        component={PartAcceptanceListScreen}
        options={{
          title: 'Acceptance',
          tabBarIcon: PartAcceptanceIcon,
          ...(isWarehouse ? HIDDEN_TAB : {}),
        }}
      />

      <Tab.Screen
        name="MaterialFeeding"
        component={MaterialFeedingListScreen}
        options={{
          title: 'Material Feeding',
          tabBarIcon: MaterialFeedingIcon,
          ...(isWarehouse ? HIDDEN_TAB : {}),
        }}
      />

      <Tab.Screen
        name="Area"
        component={AreaScreen}
        options={{
          title: 'Area',
          tabBarIcon: AreaIcon,
          ...(isWarehouse ? HIDDEN_TAB : {}),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ProfileIcon,
          headerShown: true,
          headerTitle: 'Profile',
          headerTitleAlign: 'center',
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
