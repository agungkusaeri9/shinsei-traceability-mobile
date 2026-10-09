import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Button from '../../../components/Button';
import { LoginFormValues, LoginFormErrors } from '../types';
import InputLabel from '../../../components/Input/InputLabel';
import { User, Eye, EyeOff } from 'lucide-react-native';

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <InputLabel
        label="Username"
        placeholder="Enter username"
        value={form.username}
        onChangeText={text => onChange('username', text)}
        error={errors.username}
        leftIcon={<User size={20} color="#94A3B8" />}
      />

      <InputLabel
        label="Password"
        placeholder="Enter password"
        value={form.password}
        onChangeText={text => onChange('password', text)}
        error={errors.password}
        leftIcon={<User size={20} color="#94A3B8" />}
        secureTextEntry={!showPassword}
        rightIcon={
          <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
            {showPassword
              ? <EyeOff size={20} color="#94A3B8" />
              : <Eye size={20} color="#94A3B8" />}
          </TouchableOpacity>
        }
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

