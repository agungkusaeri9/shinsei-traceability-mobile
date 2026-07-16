import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';

import {
  AppTabParamList,
  WarehouseStackParamList,
  AreaStackParamList,
} from '../types';
import { useAuth } from '../hooks/useAuth';
import AreaScreen from '../features/area/screens/AreaScreen';
import AreaWarehouseDashboard from '../features/area/screens/AreaWarehouseDashboard';
import WarehouseScreen from '../features/warehouse/screens/WarehouseScreen';
import RegisterScreen from '../features/warehouse/screens/RegisterScreen';
import StockInScreen from '../features/warehouse/screens/StockInScreen';
import StockOutScreen from '../features/warehouse/screens/StockOutScreen';
import {
  DashboardIcon,
  ProfileIcon,
  AreaIcon,
  WarehouseTabIcon,
} from '../utils/tabIcons';

const Tab = createBottomTabNavigator<AppTabParamList>();
const WarehouseStack = createNativeStackNavigator<WarehouseStackParamList>();
const AreaStack = createNativeStackNavigator<AreaStackParamList>();

const HIDDEN_TAB = { tabBarItemStyle: { display: 'none' as const } };

function WarehouseNavigator() {
  return (
    <WarehouseStack.Navigator screenOptions={{ headerShown: false }}>
      <WarehouseStack.Screen name="WarehouseHome" component={WarehouseScreen} />
      <WarehouseStack.Screen name="Register" component={RegisterScreen} />
      <WarehouseStack.Screen name="StockIn" component={StockInScreen} />
      <WarehouseStack.Screen name="StockOut" component={StockOutScreen} />
    </WarehouseStack.Navigator>
  );
}

function AreaNavigator() {
  return (
    <AreaStack.Navigator screenOptions={{ headerShown: false }}>
      <AreaStack.Screen name="AreaHome" component={AreaScreen} />
      <AreaStack.Screen
        name="WarehouseDashboard"
        component={AreaWarehouseDashboard}
      />
      <AreaStack.Screen name="Register" component={RegisterScreen} />
      <AreaStack.Screen name="StockIn" component={StockInScreen} />
      <AreaStack.Screen name="StockOut" component={StockOutScreen} />
    </AreaStack.Navigator>
  );
}

const AppNavigator: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role ?? '';
  const isWarehouse = role === 'warehouse';
  const isSuperadmin = role === 'superadmin';

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

      {/* Area - stack navigator, shown for superadmin */}
      <Tab.Screen
        name="Area"
        component={AreaNavigator}
        options={{
          title: 'Area',
          tabBarIcon: AreaIcon,
          ...(isSuperadmin ? {} : HIDDEN_TAB),
        }}
      />

      {/* Warehouse - uses stack navigator, shown for warehouse role */}
      <Tab.Screen
        name="Warehouse"
        component={WarehouseNavigator}
        options={{
          title: 'Warehouse',
          tabBarIcon: WarehouseTabIcon,
          ...(isWarehouse ? {} : HIDDEN_TAB),
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
