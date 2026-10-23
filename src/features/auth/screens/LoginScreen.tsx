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
import {
  Lock,
  PackageSearch,
  Settings,
  TriangleAlert,
} from 'lucide-react-native';
import { navigateToCheckStk } from '../../../navigation/navigationHelpers';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { form, errors, isLoading, urlNotSet, handleChange, handleLogin } =
    useLogin();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <View style={styles.topHeader}>
          <TouchableOpacity
            accessibilityLabel="Buka halaman Check STK"
            activeOpacity={0.8}
            style={styles.checkStkButton}
            onPress={() => navigateToCheckStk(navigation)}>
            <PackageSearch size={18} color="#1A73E8" />
            <Text style={styles.checkStkText}>Check STK</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Buka pengaturan server"
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}>
            <Settings size={20} color="#666" />
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
            {urlNotSet && (
              <TouchableOpacity
                style={styles.warningBanner}
                onPress={() => navigation.navigate('Settings')}>
                <TriangleAlert size={16} color="#92400E" />
                <Text style={styles.warningText}>
                  Server URL belum diset. Tap untuk buka Settings.
                </Text>
              </TouchableOpacity>
            )}
            <LoginForm
              form={form}
              errors={errors}
              isLoading={isLoading}
              onChange={handleChange}
              onSubmit={handleLogin}
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: 12,
    borderWidth: 1,
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
    flexWrap: 'wrap',
  },
  checkStkButton: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 40,
    paddingHorizontal: 13,
  },
  checkStkText: {
    color: '#1A73E8',
    fontSize: 13,
    fontWeight: '800',
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
