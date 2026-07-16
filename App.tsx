import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { BaseToast } from 'react-native-toast-message';

import { RootStackParamList } from './src/types';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppInnerNavigator from './src/navigation/AppNavigator';
import { useAuth } from './src/hooks/useAuth';
import { initializeHttpClient } from './src/services/httpClient';

const RootStack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    initializeHttpClient();
  }, []);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="App" component={AppInnerNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={styles.toastSuccess}
      contentContainerStyle={styles.toastContent}
      text1Style={styles.toastTitle}
      text2Style={styles.toastText}
    />
  ),
  error: (props: any) => (
    <BaseToast
      {...props}
      style={styles.toastError}
      contentContainerStyle={styles.toastContent}
      text1Style={styles.toastTitle}
      text2Style={styles.toastText}
    />
  ),
};

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>

      <Toast
        config={toastConfig}
        position="top"
        topOffset={60}
        visibilityTime={2000}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  toastSuccess: {
    width: '90%',
    maxWidth: 400,
    borderLeftWidth: 0,
    borderRadius: 12,
    backgroundColor: '#22C55E',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  toastError: {
    width: '90%',
    maxWidth: 400,
    borderLeftWidth: 0,
    borderRadius: 12,
    backgroundColor: '#EF4444',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },

  toastContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  toastTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default App;
