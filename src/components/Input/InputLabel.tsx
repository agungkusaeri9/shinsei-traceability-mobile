import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';

interface InputLabelProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    containerStyle?: ViewStyle;
}

const InputLabel: React.FC<InputLabelProps> = ({
    label,
    error,
    leftIcon,
    containerStyle,
    ...props
}) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.inputWrapper,
                    focused && styles.inputWrapperFocused,
                    error && styles.inputWrapperError,
                ]}>
                {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

                <TextInput
                    {...props}
                    style={[
                        styles.input,
                        leftIcon && styles.inputWithIcon,
                    ]}
                    placeholderTextColor="#94A3B8"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },

    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor: '#FFFFFF',

        borderWidth: 1,
        borderColor: '#E2E8F0',

        borderRadius: 12,

        paddingLeft: 12,
        paddingRight: 16,

        minHeight: 52,
    },

    inputWrapperFocused: {
        borderColor: '#3B82F6',
    },

    inputWrapperError: {
        borderColor: '#EF4444',
    },

    iconContainer: {
        marginRight: 12,
    },

    input: {
        flex: 1,
        fontSize: 15,
        color: '#0F172A',
        paddingVertical: 14,
    },

    inputWithIcon: {
        paddingLeft: 0,
    },

    error: {
        marginTop: 6,
        fontSize: 12,
        color: '#EF4444',
    },
});

export default InputLabel;