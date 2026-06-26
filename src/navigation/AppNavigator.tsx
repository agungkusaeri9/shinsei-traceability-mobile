import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';

import { AppTabParamList } from '../types';
import PartAcceptanceListScreen from '../features/partAcceptance/screens/PartAcceptanceListScreen';
import MaterialFeedingListScreen from '../features/materialFeeding/screens/MaterialFeedingListScreen';
import { DashboardIcon, MaterialFeedingIcon, PartAcceptanceIcon, ProfileIcon } from '../utils/tabIcons';

const Tab = createBottomTabNavigator<AppTabParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: DashboardIcon,
        }}
      />

      <Tab.Screen
        name="PartAcceptance"
        component={PartAcceptanceListScreen}
        options={{
          title: 'Acceptance',
          tabBarIcon: PartAcceptanceIcon,
        }}
      />

      <Tab.Screen
        name="MaterialFeeding"
        component={MaterialFeedingListScreen}
        options={{
          title: 'Material Feeding',
          tabBarIcon: MaterialFeedingIcon,
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