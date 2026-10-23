import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import AccountDetailScreen from '../features/profile/screens/AccountDetailScreen';

import {
  AppTabParamList,
  WarehouseStackParamList,
  AreaStackParamList,
  SmtStackParamList,
  QaAssyStackParamList,
  DeliveryStackParamList,
  ProfileStackParamList,
} from '../types';
import { useAuth } from '../hooks/useAuth';
import AreaScreen from '../features/area/screens/AreaScreen';
import AreaWarehouseDashboard from '../features/area/screens/AreaWarehouseDashboard';
import AreaSmtDashboard from '../features/area/screens/AreaSmtDashboard';
import WarehouseScreen from '../features/warehouse/screens/WarehouseScreen';
import StockInScreen from '../features/warehouse/screens/StockInScreen';
import StockOutScreen from '../features/warehouse/screens/StockOutScreen';
import PartAcceptanceScreen from '../features/warehouse/screens/PartAcceptanceScreen';
import PartRegisterScreen from '../features/smt/screens/PartRegisterScreen';
import PartChangingScreen from '../features/smt/screens/PartChangingScreen';
import FinishScreen from '../features/smt/screens/FinishScreen';
import SmtAcceptanceScreen from '../features/smt/screens/SmtAcceptanceScreen';
import QaAssyHomeScreen from '../features/qaAssy/screens/QaAssyHomeScreen';
import QaRegisterScreen from '../features/qaAssy/screens/QaRegisterScreen';
import QaAddPartScreen from '../features/qaAssy/screens/QaAddPartScreen';
import QaFinishScreen from '../features/qaAssy/screens/QaFinishScreen';
import QaAcceptanceScreen from '../features/qaAssy/screens/QaAcceptanceScreen';
import {
  DashboardIcon,
  ProfileIcon,
  AreaIcon,
  WarehouseTabIcon,
  SmtTabIcon,
  QaAssyTabIcon,
  DeliveryTabIcon,
} from '../utils/tabIcons';
import SmtHomeScreen from '../features/smt/screens/SmtHomeScreen';
import DeliveryScreen from '../features/delivery/screens/DeliveryScreen';
import SettingsScreen from '../features/auth/screens/SettingsScreen';
import SettingsHomeScreen from '../features/profile/screens/SettingsHomeScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();
const WarehouseStack = createNativeStackNavigator<WarehouseStackParamList>();
const AreaStack = createNativeStackNavigator<AreaStackParamList>();
const SmtStack = createNativeStackNavigator<SmtStackParamList>();
const QaAssyStack = createNativeStackNavigator<QaAssyStackParamList>();
const DeliveryStack = createNativeStackNavigator<DeliveryStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const HIDDEN_TAB = { tabBarItemStyle: { display: 'none' as const } };

function WarehouseNavigator() {
  return (
    <WarehouseStack.Navigator screenOptions={{ headerShown: false }}>
      <WarehouseStack.Screen name="WarehouseHome" component={WarehouseScreen} />
      <WarehouseStack.Screen name="StockIn" component={StockInScreen} />
      <WarehouseStack.Screen name="StockOut" component={StockOutScreen} />
      <WarehouseStack.Screen name="PartAcceptance" component={PartAcceptanceScreen} />
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
      <AreaStack.Screen name="PartAcceptance" component={PartAcceptanceScreen} />
      <AreaStack.Screen name="SmtDashboard" component={AreaSmtDashboard} />
      <AreaStack.Screen name="SmtHome" component={AreaSmtDashboard} />
      <AreaStack.Screen name="PartRegister" component={PartRegisterScreen} />
      <AreaStack.Screen name="PartChanging" component={PartChangingScreen} />
      <AreaStack.Screen name="Finish" component={FinishScreen} />
      <AreaStack.Screen name="SmtAcceptance" component={SmtAcceptanceScreen} />
      <AreaStack.Screen name="QaAssyHome" component={QaAssyHomeScreen} />
      <AreaStack.Screen name="QaRegister" component={QaRegisterScreen} />
      <AreaStack.Screen name="QaAddPart" component={QaAddPartScreen} />
      <AreaStack.Screen name="QaFinish" component={QaFinishScreen} />
      <AreaStack.Screen name="QaAcceptance" component={QaAcceptanceScreen} />
      <AreaStack.Screen name="DeliveryHome" component={DeliveryScreen} />
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
      <SmtStack.Screen name="SmtAcceptance" component={SmtAcceptanceScreen} />
    </SmtStack.Navigator>
  );
}

function QaAssyNavigator() {
  return (
    <QaAssyStack.Navigator screenOptions={{ headerShown: false }}>
      <QaAssyStack.Screen name="QaAssyHome" component={QaAssyHomeScreen} />
      <QaAssyStack.Screen name="QaRegister" component={QaRegisterScreen} />
      <QaAssyStack.Screen name="QaAddPart" component={QaAddPartScreen} />
      <QaAssyStack.Screen name="QaFinish" component={QaFinishScreen} />
      <QaAssyStack.Screen name="QaAcceptance" component={QaAcceptanceScreen} />
    </QaAssyStack.Navigator>
  );
}

function DeliveryNavigator() {
  return (
    <DeliveryStack.Navigator screenOptions={{ headerShown: false }}>
      <DeliveryStack.Screen name="DeliveryHome" component={DeliveryScreen} />
    </DeliveryStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
      }}
    >
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerShown: true,
        }}
      />
      <ProfileStack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{
          title: 'Detail Akun',
          headerShown: true,
          headerBackTitle: 'Kembali',
        }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsHomeScreen}
        options={{
          title: 'Pengaturan',
          headerShown: true,
        }}
      />
      <ProfileStack.Screen
        name="ChangeIPAddress"
        component={SettingsScreen}
        options={{
          title: 'Change IP Address',
          headerShown: true,
          headerBackTitle: 'Kembali',
        }}
      />
    </ProfileStack.Navigator>
  );
}

const AppNavigator: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role ?? '';
  const roleLower = role.toLowerCase();
  const isSuperadmin = roleLower === 'superadmin';
  const isWarehouse = roleLower === 'wh' || roleLower === 'warehouse';
  const isSmt = roleLower === 'smt';
  const isQaAssy =
    roleLower === 'qa' ||
    roleLower === 'assy' ||
    roleLower === 'qa_assy' ||
    roleLower === 'qa&assy';
  const isDelivery = roleLower === 'delivery';

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

      {/* QA & Assy - stack navigator */}
      <Tab.Screen
        name="QAAssy"
        component={QaAssyNavigator}
        options={{
          title: 'QA & Assy',
          tabBarIcon: QaAssyTabIcon,
          ...(isQaAssy ? {} : HIDDEN_TAB),
        }}
      />

      {/* Delivery - hanya untuk role delivery (bukan di tab superadmin, akses via Area navigator) */}
      {isDelivery && (
        <Tab.Screen
          name="Delivery"
          component={DeliveryNavigator}
          options={{
            title: 'Delivery',
            tabBarIcon: DeliveryTabIcon,
          }}
        />
      )}

      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: ProfileIcon,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
