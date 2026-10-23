import React from 'react';
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
import { useSettingsFlow } from '../hooks/useSettingsFlow';

/** Minimal navigation shape — reusable across AuthStack and ProfileStack */
type Props = {
  navigation: { goBack(): void };
};

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    baseUrl,
    isTesting,
    isSaving,
    handleChangeBaseUrl,
    handleTest,
    handleSave,
  } = useSettingsFlow({ onSaved: () => navigation.goBack() });

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
              onChangeText={handleChangeBaseUrl}
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
