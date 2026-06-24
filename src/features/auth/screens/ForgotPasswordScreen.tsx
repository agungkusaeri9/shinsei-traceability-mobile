import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../types';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useState } from 'react';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Format email tidak valid');
      return;
    }
    setError('');
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.appName}>Shinsei TMS</Text>
        </View>

        <View style={styles.card}>
          {isSent ? (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Email Terkirim!</Text>
              <Text style={styles.successMsg}>
                Instruksi reset password telah dikirim ke {email}. Silakan cek
                inbox Anda.
              </Text>
              <Button
                title="Kembali ke Login"
                onPress={() => navigation.navigate('Login')}
                style={styles.backBtn}
              />
            </View>
          ) : (
            <>
              <Text style={styles.title}>Lupa Password?</Text>
              <Text style={styles.subtitle}>
                Masukkan email terdaftar Anda dan kami akan mengirim link untuk
                mereset password.
              </Text>
              <Input
                label="Email"
                placeholder="Masukkan email Anda"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  setError('');
                }}
                error={error}
                keyboardType="email-address"
              />
              <Button
                title="Kirim Instruksi"
                onPress={handleSubmit}
                isLoading={isLoading}
                style={styles.submitBtn}
              />
              <TouchableOpacity
                style={styles.backLink}
                onPress={() => navigation.goBack()}>
                <Text style={styles.backLinkText}>← Kembali ke Login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.footer}>
          © 2024 Shinsei Corporation. All rights reserved.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0D1B2A' },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: { alignItems: 'center', marginBottom: 36 },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
  appName: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  submitBtn: { marginTop: 8 },
  backLink: { alignItems: 'center', marginTop: 20 },
  backLinkText: { fontSize: 14, color: '#1A73E8', fontWeight: '500' },
  successContainer: { alignItems: 'center' },
  successIcon: { fontSize: 48, marginBottom: 16 },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  successMsg: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backBtn: { width: '100%' },
  footer: {
    fontSize: 12,
    color: '#4A5568',
    marginTop: 32,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
