import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { getBaseUrl, setBaseUrl, formatUrl } from '../../../utils/baseUrl';
import { updateBaseUrl } from '../../../services/httpClient';
import { useConfig } from '../../../hooks/useConfig';
import { showError, showSuccess } from '../../../services/toastService';

/** Minimal navigation shape — reusable across AuthStack and ProfileStack */
type Props = {
  navigation: { goBack(): void };
};

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [baseUrl, setBaseUrlInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
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
      const formatted = formatUrl(baseUrl);
      setBaseUrlInput(formatted);

      const result = await testPing(formatted);
      if (result.success) {
        showSuccess(result.message || 'Base URL valid & server merespon!');
      } else {
        showError(result.message || 'Base URL tidak dapat dijangkau');
      }
    } catch (error: any) {
      showError('Gagal koneksi: ' + (error?.message || 'Error tidak diketahui'));
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
      const formatted = formatUrl(baseUrl);
      setBaseUrlInput(formatted);
      await setBaseUrl(formatted);
      updateBaseUrl(formatted);
      showSuccess('Base URL berhasil disimpan');
      navigation.goBack();
    } catch (error: any) {
      showError('Terjadi kesalahan saat menyimpan: ' + (error?.message || ''));
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
          <View style={styles.formContainer}>
            <Text style={styles.label}>Base URL API</Text>
            <Input
              placeholder="Contoh: 192.168.1.50:5051"
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
  },
  buttonWrapper: {
    flex: 1,
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
