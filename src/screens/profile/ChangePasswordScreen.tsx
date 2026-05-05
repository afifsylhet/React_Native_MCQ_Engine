import React, { useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useForm, Controller } from 'react-hook-form';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PasswordStrengthBar } from '../../components/auth/PasswordStrengthBar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAuth } from '../../hooks/useAuth';
import { ProfileStackScreenProps } from '../../navigation/types';

type ChangePasswordScreenProps = ProfileStackScreenProps<'ChangePassword'>;

interface ChangePasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
    navigation,
}) => {
    const { changePassword, isChangingPassword } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [newPasswordStrength, setNewPasswordStrength] = useState<
        'weak' | 'fair' | 'strong'
    >('weak');

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ChangePasswordForm>({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const newPassword = watch('newPassword');
    const confirmPassword = watch('confirmPassword');

    const calculatePasswordStrength = (password: string): 'weak' | 'fair' | 'strong' => {
        let strength = 0;

        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'fair';
        return 'strong';
    };

    const onSubmit = async (data: ChangePasswordForm) => {
        if (isSaving || isChangingPassword) return;

        if (data.newPassword !== data.confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'পাসওয়ার্ড মিলছে না',
                text2: 'নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড একই হতে হবে',
            });
            return;
        }

        if (data.currentPassword === data.newPassword) {
            Toast.show({
                type: 'error',
                text1: 'একই পাসওয়ার্ড',
                text2: 'নতুন পাসওয়ার্ড বর্তমান পাসওয়ার্ড থেকে ভিন্ন হতে হবে',
            });
            return;
        }

        setIsSaving(true);
        try {
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });

            Toast.show({
                type: 'success',
                text1: 'পাসওয়ার্ড পরিবর্তিত হয়েছে',
                text2: 'আপনার পাসওয়ার্ড সফলভাবে আপডেট হয়েছে',
            });

            navigation.goBack();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'পরিবর্তন ব্যর্থ',
                text2:
                    error.message ||
                    'পাসওয়ার্ড পরিবর্তন করা যায়নি। বর্তমান পাসওয়ার্ড ভুল হতে পারে।',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const isPasswordsMatch = newPassword === confirmPassword && newPassword.length > 0;

    return (
        <ScreenWrapper scrollable={false} safeTop={true}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View
                    entering={FadeInDown}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.surfaceAlt,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ marginBottom: spacing.md }}
                    >
                        <MaterialCommunityIcons
                            name="chevron-left"
                            size={24}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>

                    <Text
                        style={{
                            fontSize: typography.scale['2xl'].fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                        }}
                    >
                        পাসওয়ার্ড পরিবর্তন
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                            marginTop: spacing.xs,
                        }}
                    >
                        আপনার অ্যাকাউন্টের পাসওয়ার্ড আপডেট করুন
                    </Text>
                </Animated.View>

                {/* Form */}
                <View
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                        gap: spacing.lg,
                    }}
                >
                    {/* Current Password */}
                    <Animated.View entering={FadeInDown.delay(100)}>
                        <Controller
                            control={control}
                            name="currentPassword"
                            rules={{
                                required: 'বর্তমান পাসওয়ার্ড প্রয়োজন',
                                minLength: {
                                    value: 6,
                                    message: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে',
                                },
                            }}
                            render={({ field: { value, onChange } }) => (
                                <Input
                                    label="বর্তমান পাসওয়ার্ড"
                                    placeholder="আপনার বর্তমান পাসওয়ার্ড লিখুন"
                                    value={value}
                                    onChangeText={onChange}
                                    error={errors.currentPassword?.message}
                                    leftIcon="lock"
                                    secureTextEntry
                                />
                            )}
                        />
                    </Animated.View>

                    {/* Password Requirements */}
                    <Animated.View entering={FadeInDown.delay(200)}>
                        <Card
                            style={{
                                backgroundColor: colors.primaryLight,
                                borderLeftWidth: 4,
                                borderLeftColor: colors.primary,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    fontWeight: typography.weights.semibold,
                                    color: colors.primary,
                                    marginBottom: spacing.base,
                                }}
                            >
                                📋 পাসওয়ার্ডের শর্ত
                            </Text>

                            <View style={{ gap: spacing.sm }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: spacing.md,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={16}
                                        color={colors.success}
                                    />
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        কমপক্ষে ৮টি অক্ষর
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: spacing.md,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={16}
                                        color={colors.success}
                                    />
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        বড় ও ছোট হাতের অক্ষরের মিশ্রণ
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: spacing.md,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={16}
                                        color={colors.success}
                                    />
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        সংখ্যা ও বিশেষ অক্ষর
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    </Animated.View>

                    {/* New Password */}
                    <Animated.View entering={FadeInDown.delay(250)}>
                        <Controller
                            control={control}
                            name="newPassword"
                            rules={{
                                required: 'নতুন পাসওয়ার্ড প্রয়োজন',
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                                    message:
                                        'কমপক্ষে ৮টি অক্ষর, বড় হাতের, ছোট হাতের ও একটি সংখ্যা সহ',
                                },
                            }}
                            render={({ field: { value, onChange } }) => (
                                <>
                                    <Input
                                        label="নতুন পাসওয়ার্ড"
                                        placeholder="আপনার নতুন পাসওয়ার্ড লিখুন"
                                        value={value}
                                        onChangeText={(text) => {
                                            onChange(text);
                                            setNewPasswordStrength(calculatePasswordStrength(text));
                                        }}
                                        error={errors.newPassword?.message}
                                        leftIcon="lock"
                                        secureTextEntry
                                    />
                                    {value && (
                                        <View style={{ marginTop: spacing.md }}>
                                            <PasswordStrengthBar strength={newPasswordStrength} />
                                        </View>
                                    )}
                                </>
                            )}
                        />
                    </Animated.View>

                    {/* Confirm Password */}
                    <Animated.View entering={FadeInDown.delay(300)}>
                        <Controller
                            control={control}
                            name="confirmPassword"
                            rules={{
                                required: 'অনুগ্রহ করে পাসওয়ার্ড নিশ্চিত করুন',
                            }}
                            render={({ field: { value, onChange } }) => (
                                <Input
                                    label="নতুন পাসওয়ার্ড নিশ্চিত করুন"
                                    placeholder="আপনার নতুন পাসওয়ার্ড পুনরায় লিখুন"
                                    value={value}
                                    onChangeText={onChange}
                                    error={
                                        errors.confirmPassword?.message ||
                                        (confirmPassword && !isPasswordsMatch
                                            ? 'পাসওয়ার্ড মিলছে না'
                                            : undefined)
                                    }
                                    leftIcon="lock"
                                    secureTextEntry
                                    rightIcon={
                                        isPasswordsMatch
                                            ? 'check-circle'
                                            : undefined
                                    }
                                />
                            )}
                        />
                    </Animated.View>

                    {/* Save Button */}
                    <Animated.View entering={FadeInDown.delay(350)}>
                        <Button
                            title={isSaving ? 'পাসওয়ার্ড আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
                            variant="primary"
                            size="large"
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSaving || isChangingPassword}
                            rightIcon={
                                isSaving || isChangingPassword ? undefined : 'check'
                            }
                        />
                    </Animated.View>
                </View>

                <View style={{ height: spacing.lg }} />
            </ScrollView>
        </ScreenWrapper>
    );
};
