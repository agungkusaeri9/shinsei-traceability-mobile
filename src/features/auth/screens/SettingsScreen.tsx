import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../types';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { getBaseUrl, setBaseUrl } from '../../../utils/baseUrl';
import { updateBaseUrl } from '../../../services/httpClient';
import { useConfig } from '../../../hooks/useConfig';
import { showError, showSuccess } from '../../../services/toastService';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Settings'>;
};

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [baseUrl, setBaseUrlInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingSuccess, setIsTestingSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { testPing } = useConfig();
  useEffect(() => {
    const loadBaseUrl = async () => {
      const url = await getBaseUrl();
      setBaseUrlInput(url);
    };
    loadBaseUrl();
  }, []);

  const handleTest = async () => {
    if (!baseUrl.trim()) {
      showError('Base URL tidak boleh kosong');
      return;
    }

    setIsTesting(true);
    try {
      const isValid = await testPing(baseUrl);
      if (isValid) {
        setIsTestingSuccess(false);
        showSuccess('Base URL valid');
      } else {
        showError('Base URL tidak valid');
        setIsTestingSuccess(true);
      }
    } catch (error: any) {
      showError('Terjadi kesalahan saat mengetes Base URL' + (error?.message || ''));
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!baseUrl.trim()) {
      showError('Base URL tidak boleh kosong');
      return;
    }

    setIsSaving(true);
    try {
      await setBaseUrl(baseUrl);
      updateBaseUrl(baseUrl);
      showSuccess('Base URL berhasil disimpan');
      navigation.goBack();
    } catch (error: any) {
      showError('Terjadi kesalahan saat menyimpan Base URL' + (error?.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* <View style={styles.header}>
            <Text style={styles.title}>Pengaturan</Text>
          </View> */}

          <View style={styles.formContainer}>
            <Text style={styles.label}>Base URL</Text>
            <Input
              placeholder="Masukkan base URL API"
              value={baseUrl}
              onChangeText={setBaseUrlInput}
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.buttonContainer}>
              <View style={styles.buttonWrapper}>
                <Button
                  title="Test"
                  onPress={handleTest}
                  isLoading={isTesting}
                  style={styles.testButton}
                />
              </View>

              <View style={styles.buttonWrapper}>
                <Button
                  title="Simpan"
                  onPress={handleSave}
                  isLoading={isSaving}
                  disabled={isTestingSuccess}
                  style={styles.saveButton}
                />
              </View>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    // backgroundColor: 'red',
  },
  buttonWrapper: {
    flex: 1,
  },

  button: {
    flex: 1,
    backgroundColor: 'yellow',
  },
  saveButton: {
    marginTop: 0,
    backgroundColor: '#10B981',
  },
  testButton: {
    marginTop: 0,
    backgroundColor: '#1A73E8',
  },
});

export default SettingsScreen;
