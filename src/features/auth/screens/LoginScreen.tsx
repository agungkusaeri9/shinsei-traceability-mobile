import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../types';
import LoginForm from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';
import { Lock, Settings } from 'lucide-react-native/icons';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { form, errors, isLoading, handleChange, handleLogin } = useLogin();

  const onSubmit = async () => {
    await handleLogin();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header dengan icon setting */}
        <View style={styles.topHeader}>
          <View style={{ width: 40 }} />
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsIcon}>
              <Settings size={18} color="#666" />
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Lock size={48} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>Shinsei Traceability</Text>
            <Text style={styles.tagline}>Sign in to your account</Text>
          </View>

          <View style={styles.formContainer}>

            <LoginForm
              form={form}
              errors={errors}
              isLoading={isLoading}
              onChange={handleChange}
              onSubmit={onSubmit}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    // justifyContent: 'space-between',
    // paddingHorizontal: 16,
    // paddingVertical: 12,
  },

  logoTextSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: -0.5,
  },

  logoContainer: {
    width: 70, // w-24
    height: 70, // h-24
    borderRadius: 48,
    backgroundColor: '#3B82F6', // blue-500
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    lineHeight: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 32,
  },
  footer: {
    alignItems: 'center',
    marginTop: 48,
  },
  footerText: {
    fontSize: 13,
    color: '#94A3B8',
  },
});

export default LoginScreen;
