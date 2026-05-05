import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export interface PasswordStrengthBarProps {
    password?: string;
    strength?: 'weak' | 'fair' | 'strong';
}

const calculateStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;

    const percent = (score / 6) * 100;

    if (percent < 33) return { score, label: 'দুর্বল', color: colors.danger };
    if (percent < 67) return { score, label: 'মাঝারি', color: colors.warning };
    return { score, label: 'শক্তিশালী', color: colors.success };
};

const strengthToPassword = (strength: 'weak' | 'fair' | 'strong'): string => {
    if (strength === 'weak') return 'a';
    if (strength === 'fair') return 'Ab1cdef';
    return 'Ab1cdef!GHIJ';
};

export const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({
    password,
    strength,
}) => {
    const effectivePassword =
        password ?? (strength ? strengthToPassword(strength) : '');
    const { score, label, color } = useMemo(
        () => calculateStrength(effectivePassword),
        [effectivePassword]
    );

    const width = useSharedValue((score / 6) * 100);

    React.useEffect(() => {
        width.value = withSpring((score / 6) * 100, {
            damping: 20,
            stiffness: 300,
        });
    }, [score]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${width.value}%`,
        };
    });

    return (
        <View style={{ marginVertical: spacing.sm }}>
            <View
                style={{
                    height: 6,
                    backgroundColor: colors.border,
                    borderRadius: spacing.borderRadius.sm,
                    overflow: 'hidden',
                }}
            >
                <Animated.View
                    style={[
                        {
                            height: '100%',
                            backgroundColor: color,
                            borderRadius: spacing.borderRadius.sm,
                        },
                        animatedStyle,
                    ]}
                />
            </View>

            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: spacing.sm,
                }}
            >
                <Text
                    style={{
                        fontSize: typography.scale.xs.fontSize,
                        fontFamily: typography.fontBody,
                        color: colors.textSecondary,
                    }}
                >
                    পাসওয়ার্ডের শক্তি
                </Text>

                <Text
                    style={{
                        fontSize: typography.scale.xs.fontSize,
                        fontFamily: typography.fontBody,
                        fontWeight: typography.weights.semibold,
                        color,
                    }}
                >
                    {label}
                </Text>
            </View>

            {effectivePassword.length > 0 && score < 6 && (
                <Text
                    style={{
                        fontSize: typography.scale.xs.fontSize,
                        fontFamily: typography.fontBody,
                        color: colors.textTertiary,
                        marginTop: spacing.sm,
                    }}
                >
                    {score < 3
                        ? 'বড় হাতের অক্ষর, সংখ্যা ও সিম্বল যোগ করুন'
                        : 'আরও জটিলতা যোগ করুন'}
                </Text>
            )}
        </View>
    );
};
