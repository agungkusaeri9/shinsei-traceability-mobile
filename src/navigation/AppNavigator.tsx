import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';

import {
  AppTabParamList,
  WarehouseStackParamList,
  AreaStackParamList,
  SmtStackParamList,
} from '../types';
import { useAuth } from '../hooks/useAuth';
import AreaScreen from '../features/area/screens/AreaScreen';
import AreaWarehouseDashboard from '../features/area/screens/AreaWarehouseDashboard';
import AreaSmtDashboard from '../features/area/screens/AreaSmtDashboard';
import WarehouseScreen from '../features/warehouse/screens/WarehouseScreen';
import StockInScreen from '../features/warehouse/screens/StockInScreen';
import StockOutScreen from '../features/warehouse/screens/StockOutScreen';
import PartRegisterScreen from '../features/smt/screens/PartRegisterScreen';
import PartChangingScreen from '../features/smt/screens/PartChangingScreen';
import FinishScreen from '../features/smt/screens/FinishScreen';
import {
  DashboardIcon,
  ProfileIcon,
  AreaIcon,
  WarehouseTabIcon,
  SmtTabIcon,
} from '../utils/tabIcons';
import SmtDashboard from '../features/dashboard/screens/SmtDashboard';
import SmtHomeScreen from '../features/smt/screens/SmtHomeScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();
const WarehouseStack = createNativeStackNavigator<WarehouseStackParamList>();
const AreaStack = createNativeStackNavigator<AreaStackParamList>();
const SmtStack = createNativeStackNavigator<SmtStackParamList>();

const HIDDEN_TAB = { tabBarItemStyle: { display: 'none' as const } };

function WarehouseNavigator() {
  return (
    <WarehouseStack.Navigator screenOptions={{ headerShown: false }}>
      <WarehouseStack.Screen name="WarehouseHome" component={WarehouseScreen} />
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
      {/* Register - disabled, moved to SMT Part Register */}
      {/* <AreaStack.Screen name="Register" component={RegisterScreen} /> */}
      <AreaStack.Screen name="StockIn" component={StockInScreen} />
      <AreaStack.Screen name="StockOut" component={StockOutScreen} />
      <AreaStack.Screen name="SmtDashboard" component={AreaSmtDashboard} />
      <AreaStack.Screen name="SmtHome" component={AreaSmtDashboard} />
      <AreaStack.Screen name="PartRegister" component={PartRegisterScreen} />
      <AreaStack.Screen name="PartChanging" component={PartChangingScreen} />
      <AreaStack.Screen name="Finish" component={FinishScreen} />
    </AreaStack.Navigator>
  );
}

function SmtNavigator() {
  return (
    <SmtStack.Navigator screenOptions={{ headerShown: false }}>
      <SmtStack.Screen name="SmtHome" component={SmtHomeScreen} />
      <SmtStack.Screen name="PartRegister" component={PartRegisterScreen} />
      <SmtStack.Screen name="PartChanging" component={PartChangingScreen} />
      <SmtStack.Screen name="Finish" component={FinishScreen} />
    </SmtStack.Navigator>
  );
}

const AppNavigator: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role ?? '';
  const isSuperadmin = role.toLowerCase() === 'superadmin';
  const isWarehouse = role.toLowerCase() === 'wh';
  const isSmt = role.toLowerCase() === 'smt';

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

      {/* SMT - uses stack navigator, shown for smt role */}
      <Tab.Screen
        name="SMT"
        component={SmtNavigator}
        options={{
          title: 'SMT',
          tabBarIcon: SmtTabIcon,
          ...(isSmt ? {} : HIDDEN_TAB),
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
