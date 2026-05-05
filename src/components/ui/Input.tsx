import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    KeyboardTypeOptions,
    ViewStyle,
    TouchableOpacity,
    Platform,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface InputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    error?: string;
    leftIcon?: string;
    rightIcon?: string;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    editable?: boolean;
    multiline?: boolean;
    style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    leftIcon,
    rightIcon,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    editable = true,
    multiline = false,
    style,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(!secureTextEntry);
    const borderColorAnim = useSharedValue(0);

    const animatedInputStyle = useAnimatedStyle(() => {
        return {
            borderColor: borderColorAnim.value
                ? colors.primary
                : error
                    ? colors.danger
                    : colors.border,
        };
    });

    const handleFocus = () => {
        setIsFocused(true);
        borderColorAnim.value = withTiming(1, { duration: 200 });
    };

    const handleBlur = () => {
        setIsFocused(false);
        borderColorAnim.value = withTiming(0, { duration: 200 });
    };

    return (
        <View style={[{ marginBottom: spacing.base }, style]}>
            <Text
                style={{
                    fontSize: typography.scale.sm.fontSize,
                    fontFamily: typography.fontBody,
                    fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                    marginBottom: spacing.sm,
                }}
            >
                {label}
            </Text>

            <Animated.View
                style={[
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: multiline ? undefined : 52,
                        borderRadius: spacing.borderRadius.md,
                        borderWidth: error ? 2 : 1.5,
                        borderColor: error ? colors.danger : colors.border,
                        paddingHorizontal: spacing.base,
                        backgroundColor: colors.surface,
                    },
                    animatedInputStyle,
                ]}
            >
                {leftIcon && (
                    <MaterialCommunityIcons
                        name={leftIcon as any}
                        size={20}
                        color={isFocused ? colors.primary : colors.textSecondary}
                        style={{ marginRight: spacing.sm }}
                    />
                )}

                <TextInput
                    style={{
                        flex: 1,
                        fontSize: typography.scale.base.fontSize,
                        fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
                        color: colors.textPrimary,
                        padding: multiline ? spacing.base : 0,
                        minHeight: multiline ? 100 : undefined,
                    }}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textTertiary}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={secureTextEntry && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={editable}
                    multiline={multiline}
                />

                {secureTextEntry && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <MaterialCommunityIcons
                            name={showPassword ? 'eye' : 'eye-off'}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
                {rightIcon && !secureTextEntry && (
                    <MaterialCommunityIcons
                        name={rightIcon as any}
                        size={20}
                        color={colors.textSecondary}
                        style={{ marginLeft: spacing.sm }}
                    />
                )}
            </Animated.View>

            {error && (
                <Text
                    style={{
                        fontSize: typography.scale.xs.fontSize,
                        fontFamily: typography.fontBody,
                        color: colors.danger,
                        marginTop: spacing.sm,
                    }}
                >
                    {error}
                </Text>
            )}
        </View>
    );
};
