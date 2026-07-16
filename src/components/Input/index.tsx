import { Eye, EyeOff } from 'lucide-react-native/icons';
import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  dark?: boolean;
  onSubmitEditing?: () => void;
  onEnterDetected?: () => void;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      isPassword = false,
      containerStyle,
      leftIcon,
      dark = false,
      onSubmitEditing,
      onEnterDetected,
      onKeyPress,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isSecure, setIsSecure] = useState(isPassword);
    const [isFocused, setIsFocused] = useState(false);

    const handleKeyPress = (
      e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    ) => {
      onKeyPress?.(e);
      if (e.nativeEvent.key === 'Enter') {
        onEnterDetected?.();
        onSubmitEditing?.();
      }
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, dark && styles.labelDark]}>{label}</Text>
        )}

        <View
          style={[
            styles.inputWrapper,
            dark && styles.inputWrapperDark,
            isFocused && styles.inputFocused,
            isFocused && dark && styles.inputFocusedDark,
            error ? styles.inputError : null,
            error && dark && styles.inputErrorDark,
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon ? styles.inputWithIcon : undefined,
              dark ? styles.inputDark : undefined,
            ]}
            secureTextEntry={isSecure}
            onFocus={e => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={e => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            placeholderTextColor={dark ? '#9CA3AF' : '#9CA3AF'}
            autoCapitalize="none"
            blurOnSubmit={false}
            {...props}
            onSubmitEditing={onSubmitEditing}
            onKeyPress={handleKeyPress}
          />

          {isPassword && (
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setIsSecure(prev => !prev)}
            >
              <Text style={[styles.eyeText, dark && styles.eyeTextDark]}>
                {isSecure ? (
                  <Eye size={16} color={dark ? '#A5B4FC' : '#6B7280'} />
                ) : (
                  <EyeOff size={16} color={dark ? '#A5B4FC' : '#6B7280'} />
                )}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <Text style={[styles.errorText, dark && styles.errorTextDark]}>
            {error}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  labelDark: {
    color: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 1,
  },
  inputWrapperDark: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputFocused: {
    borderColor: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputFocusedDark: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputErrorDark: {
    borderColor: '#F87171',
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#111827',
  },
  inputDark: {
    color: '#FFFFFF',
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  leftIcon: {
    marginRight: 4,
  },
  eyeButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  eyeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  eyeTextDark: {
    color: '#A5B4FC',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 2,
  },
  errorTextDark: {
    color: '#FCA5A5',
  },
});

export default Input;
