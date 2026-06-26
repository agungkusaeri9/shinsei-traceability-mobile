import React from 'react';
import { View, StyleSheet } from 'react-native';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { LoginFormValues, LoginFormErrors } from '../types';
import InputLabel from '../../../components/Input/InputLabel';
import { User } from 'lucide-react-native/icons';

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
      <InputLabel
        label="Username"
        placeholder="Enter username"
        value={form.username}
        onChangeText={text => onChange('username', text)}
        leftIcon={<User size={20} color="#94A3B8" />}
      />

      <InputLabel
        label="Password"
        placeholder="Enter password"
        value={form.password}
        onChangeText={text => onChange('password', text)}
        leftIcon={<User size={20} color="#94A3B8" />}
        secureTextEntry
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
