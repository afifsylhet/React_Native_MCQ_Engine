import React from 'react';
import {
    TouchableOpacity,
    Text,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, springConfig } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';

export interface ButtonProps {
    label?: string;
    title?: string;
    onPress: (...args: any[]) => any;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    isLoading?: boolean;
    disabled?: boolean;
    leftIcon?: string | React.ReactNode;
    rightIcon?: string | React.ReactNode;
    fullWidth?: boolean;
    style?: ViewStyle;
}

const normalizeSize = (size: ButtonSize): 'sm' | 'md' | 'lg' => {
    if (size === 'small') return 'sm';
    if (size === 'medium') return 'md';
    if (size === 'large') return 'lg';
    return size;
};

const getVariantStyles = (
    variant: ButtonVariant
): { bgColor: string; textColor: string; borderColor?: string; borderWidth?: number } => {
    switch (variant) {
        case 'primary':
            return { bgColor: colors.primary, textColor: colors.textInverse };
        case 'secondary':
            return { bgColor: colors.primaryLight, textColor: colors.primary };
        case 'outline':
            return {
                bgColor: 'transparent',
                textColor: colors.primary,
                borderColor: colors.primary,
                borderWidth: 1.5,
            };
        case 'ghost':
            return { bgColor: 'transparent', textColor: colors.primary };
        case 'danger':
            return { bgColor: colors.danger, textColor: colors.textInverse };
        default:
            return { bgColor: colors.primary, textColor: colors.textInverse };
    }
};

const getSizeStyles = (
    rawSize: ButtonSize
): { height: number; paddingHorizontal: number; fontSize: number } => {
    const size = normalizeSize(rawSize);
    switch (size) {
        case 'sm':
            return { height: 36, paddingHorizontal: 12, fontSize: 13 };
        case 'md':
            return { height: 48, paddingHorizontal: 16, fontSize: 15 };
        case 'lg':
            return { height: 56, paddingHorizontal: 20, fontSize: 17 };
        default:
            return { height: 48, paddingHorizontal: 16, fontSize: 15 };
    }
};

export const Button: React.FC<ButtonProps> = ({
    label,
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    isLoading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    style,
}) => {
    const scale = useSharedValue(1);
    const variantStyles = getVariantStyles(variant);
    const sizeStyles = getSizeStyles(size);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { ...springConfig, damping: 15 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, springConfig);
    };

    const effectiveLoading = loading || isLoading;
    const isDisabledOrLoading = disabled || effectiveLoading;

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDisabledOrLoading}
            style={[
                {
                    height: sizeStyles.height,
                    paddingHorizontal: sizeStyles.paddingHorizontal,
                    backgroundColor: variantStyles.bgColor,
                    borderColor: variantStyles.borderColor,
                    borderWidth: variantStyles.borderWidth,
                    borderRadius: spacing.borderRadius.md,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    opacity: isDisabledOrLoading ? 0.6 : 1,
                    width: fullWidth ? '100%' : 'auto',
                    minWidth: 44,
                },
                animatedStyle,
                style,
            ]}
        >
            {effectiveLoading ? (
                <ActivityIndicator color={variantStyles.textColor} size="small" />
            ) : (
                <>
                    {leftIcon && (
                        <View style={{ marginRight: spacing.sm }}>
                            {typeof leftIcon === 'string' ? (
                                <MaterialCommunityIcons
                                    name={leftIcon as any}
                                    size={sizeStyles.fontSize}
                                    color={variantStyles.textColor}
                                />
                            ) : (
                                leftIcon
                            )}
                        </View>
                    )}
                    <Text
                        style={{
                            color: variantStyles.textColor,
                            fontSize: sizeStyles.fontSize,
                            fontFamily: typography.fontBody,
                            fontWeight: typography.weights.semibold,
                        }}
                    >
                        {label ?? title ?? ''}
                    </Text>
                    {rightIcon && (
                        <View style={{ marginLeft: spacing.sm }}>
                            {typeof rightIcon === 'string' ? (
                                <MaterialCommunityIcons
                                    name={rightIcon as any}
                                    size={sizeStyles.fontSize}
                                    color={variantStyles.textColor}
                                />
                            ) : (
                                rightIcon
                            )}
                        </View>
                    )}
                </>
            )}
        </AnimatedTouchable>
    );
};
