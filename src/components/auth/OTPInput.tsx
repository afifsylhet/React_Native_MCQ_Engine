import React, { useRef, useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Animated as RNAnimated,
    Platform,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface OTPInputProps {
    value: string;
    onChange: (otp: string) => void;
    hasError?: boolean;
    disabled?: boolean;
}

const OTP_LENGTH = 6;

export const OTPInput: React.FC<OTPInputProps> = ({
    value,
    onChange,
    hasError = false,
    disabled = false,
}) => {
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const inputRefs = useRef<TextInput[]>([]);
    const shakeAnimation = useSharedValue(0);

    React.useEffect(() => {
        if (hasError) {
            shakeAnimation.value = withSequence(
                withTiming(-8, { duration: 50 }),
                withTiming(8, { duration: 50 }),
                withTiming(-8, { duration: 50 }),
                withTiming(8, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );
        }
    }, [hasError]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: shakeAnimation.value }],
        };
    });

    const handleChangeText = (text: string, index: number) => {
        if (/^[0-9]?$/.test(text)) {
            const newValue =
                value.substring(0, index) +
                text +
                value.substring(index + 1, OTP_LENGTH);
            onChange(newValue.slice(0, OTP_LENGTH));

            if (text && index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (
        e: any,
        index: number
    ) => {
        if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (text: string) => {
        const pastedDigits = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
        if (pastedDigits.length === OTP_LENGTH) {
            onChange(pastedDigits);
        }
    };

    return (
        <Animated.View
            style={[
                {
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: spacing.md,
                },
                animatedStyle,
            ]}
        >
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <TouchableOpacity
                    key={index}
                    activeOpacity={1}
                    onPress={() => inputRefs.current[index]?.focus()}
                    disabled={disabled}
                >
                    <View
                        style={{
                            width: 48,
                            height: 56,
                            borderRadius: spacing.borderRadius.md,
                            borderWidth: 2,
                            borderColor:
                                hasError && value[index]
                                    ? colors.danger
                                    : focusedIndex === index
                                        ? colors.primary
                                        : value[index]
                                            ? colors.primary
                                            : colors.border,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: value[index] ? colors.primaryLight : colors.surface,
                        }}
                    >
                        <TextInput
                            ref={(ref) => {
                                if (ref) inputRefs.current[index] = ref;
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                textAlign: 'center',
                                fontSize: 18,
                                fontWeight: typography.weights.bold,
                                fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
                                color: colors.textPrimary,
                            }}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={value[index] || ''}
                            onChangeText={(text) => handleChangeText(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            onFocus={() => setFocusedIndex(index)}
                            onBlur={() => setFocusedIndex(null)}
                            onTextInput={(e: any) => {
                                if (e.nativeEvent.text.length === OTP_LENGTH) {
                                    handlePaste(e.nativeEvent.text);
                                }
                            }}
                            editable={!disabled}
                        />
                    </View>
                </TouchableOpacity>
            ))}
        </Animated.View>
    );
};
