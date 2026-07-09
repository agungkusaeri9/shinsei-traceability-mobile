import React, {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export type ScanInputRef = {
  focus: () => void;
};

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  autoFocus?: boolean;
};

const ScanInput = forwardRef<ScanInputRef, Props>(
  ({ value, onChangeText, onSubmit, autoFocus = true }, ref) => {
    const inputRef = useRef<TextInput>(null);

    const focusScanner = useCallback(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }, []);

    useImperativeHandle(ref, () => ({
      focus: focusScanner,
    }));

    useFocusEffect(
      useCallback(() => {
        if (autoFocus) {
          const timer = setTimeout(() => {
            focusScanner();
          }, 150);
          return () => clearTimeout(timer);
        }
      }, [autoFocus, focusScanner]),
    );

    return (
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        showSoftInputOnFocus={false}
        blurOnSubmit={false}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        onBlur={() => {
          setTimeout(focusScanner, 100);
        }}
        style={styles.hiddenInput}
      />
    );
  },
);

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});

ScanInput.displayName = 'ScanInput';

export default ScanInput;
