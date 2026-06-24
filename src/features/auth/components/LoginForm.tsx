import React from 'react';
import { View, StyleSheet } from 'react-native';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { LoginFormValues, LoginFormErrors } from '../types';

interface LoginFormProps {
  form: LoginFormValues;
  errors: LoginFormErrors;
  isLoading: boolean;
  onChange: (field: keyof LoginFormValues, value: string) => void;
  onSubmit: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  form,
  errors,
  isLoading,
  onChange,
  onSubmit,
}) => {
  return (
    <View style={styles.container}>
      <Input
        label="Username"
        placeholder="Masukkan username Anda"
        value={form.username}
        onChangeText={text => onChange('username', text)}
        error={errors.username}
        autoCapitalize="none"
        autoComplete="username"
      />

      <Input
        label="Password"
        placeholder="Masukkan password Anda"
        value={form.password}
        onChangeText={text => onChange('password', text)}
        error={errors.password}
        isPassword
        autoComplete="password"
      />

      <Button
        title="Masuk"
        onPress={onSubmit}
        isLoading={isLoading}
        style={styles.loginBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loginBtn: {
    marginTop: 4,
  },
});

export default LoginForm;
