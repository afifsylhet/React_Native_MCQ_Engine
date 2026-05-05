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
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useProfile } from '../../hooks/useProfile';
import { ProfileStackScreenProps } from '../../navigation/types';

type EditProfileScreenProps = ProfileStackScreenProps<'EditProfile'>;

interface EditProfileForm {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
    navigation,
}) => {
    const { profile, updateProfile, isUpdating } = useProfile();
    const [isSaving, setIsSaving] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<EditProfileForm>(
        {
            defaultValues: {
                firstName: profile?.firstName || '',
                lastName: profile?.lastName || '',
                email: profile?.email || '',
                phone: profile?.phone || '',
            },
        }
    );

    const onSubmit = async (data: EditProfileForm) => {
        if (isSaving || isUpdating) return;

        setIsSaving(true);
        try {
            await updateProfile({
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
            });

            Toast.show({
                type: 'success',
                text1: 'প্রোফাইল আপডেট হয়েছে',
                text2: 'আপনার প্রোফাইল সফলভাবে আপডেট হয়েছে',
            });

            navigation.goBack();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'আপডেট ব্যর্থ',
                text2: error.message || 'প্রোফাইল আপডেট করা যায়নি',
            });
        } finally {
            setIsSaving(false);
        }
    };

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
                        প্রোফাইল সম্পাদনা
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                            marginTop: spacing.xs,
                        }}
                    >
                        আপনার ব্যক্তিগত তথ্য আপডেট করুন
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
                    {/* Name Section */}
                    <Animated.View entering={FadeInDown.delay(100)}>
                        <Card>
                            <Text
                                style={{
                                    fontSize: typography.scale.sm.fontSize,
                                    fontFamily: typography.fontBody,
                                    fontWeight: typography.weights.semibold,
                                    color: colors.textSecondary,
                                    marginBottom: spacing.md,
                                }}
                            >
                                পূর্ণ নাম
                            </Text>

                            <View style={{ gap: spacing.base, marginBottom: spacing.md }}>
                                <Controller
                                    control={control}
                                    name="firstName"
                                    rules={{
                                        required: 'প্রথম নাম প্রয়োজন',
                                        minLength: {
                                            value: 2,
                                            message: 'প্রথম নাম অন্তত ২ অক্ষরের হতে হবে',
                                        },
                                    }}
                                    render={({ field: { value, onChange } }) => (
                                        <Input
                                            label="প্রথম নাম"
                                            placeholder="আপনার প্রথম নাম লিখুন"
                                            value={value}
                                            onChangeText={onChange}
                                            error={errors.firstName?.message}
                                            leftIcon="account"
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="lastName"
                                    rules={{
                                        required: 'শেষ নাম প্রয়োজন',
                                        minLength: {
                                            value: 2,
                                            message: 'শেষ নাম অন্তত ২ অক্ষরের হতে হবে',
                                        },
                                    }}
                                    render={({ field: { value, onChange } }) => (
                                        <Input
                                            label="শেষ নাম"
                                            placeholder="আপনার শেষ নাম লিখুন"
                                            value={value}
                                            onChangeText={onChange}
                                            error={errors.lastName?.message}
                                            leftIcon="account"
                                        />
                                    )}
                                />
                            </View>
                        </Card>
                    </Animated.View>

                    {/* Contact Section */}
                    <Animated.View entering={FadeInDown.delay(200)}>
                        <Card>
                            <Text
                                style={{
                                    fontSize: typography.scale.sm.fontSize,
                                    fontFamily: typography.fontBody,
                                    fontWeight: typography.weights.semibold,
                                    color: colors.textSecondary,
                                    marginBottom: spacing.md,
                                }}
                            >
                                যোগাযোগের তথ্য
                            </Text>

                            <View style={{ gap: spacing.base }}>
                                <View>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.textPrimary,
                                            marginBottom: spacing.md,
                                        }}
                                    >
                                        ইমেইল
                                    </Text>
                                    <View
                                        style={{
                                            paddingHorizontal: spacing.base,
                                            paddingVertical: spacing.md,
                                            borderRadius: spacing.borderRadius.md,
                                            backgroundColor: colors.surfaceAlt,
                                            borderWidth: 1,
                                            borderColor: colors.surfaceAlt,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: typography.scale.sm.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: colors.textSecondary,
                                            }}
                                        >
                                            {profile?.email}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: typography.fontBody,
                                                color: colors.textSecondary,
                                                marginTop: spacing.xs,
                                            }}
                                        >
                                            ইমেইল পরিবর্তন করা যাবে না
                                        </Text>
                                    </View>
                                </View>

                                <Controller
                                    control={control}
                                    name="phone"
                                    rules={{
                                        pattern: {
                                            value: /^[0-9\-\+\(\)\s]*$/,
                                            message: 'ফোন নম্বরের ফরম্যাট সঠিক নয়',
                                        },
                                    }}
                                    render={({ field: { value, onChange } }) => (
                                        <Input
                                            label="ফোন নম্বর (ঐচ্ছিক)"
                                            placeholder="আপনার ফোন নম্বর লিখুন"
                                            value={value ?? ''}
                                            onChangeText={onChange}
                                            error={errors.phone?.message}
                                            leftIcon="phone"
                                            keyboardType="phone-pad"
                                        />
                                    )}
                                />
                            </View>
                        </Card>
                    </Animated.View>

                    {/* Save Button */}
                    <Animated.View entering={FadeInDown.delay(300)}>
                        <Button
                            label={isSaving ? 'সেভ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
                            variant="primary"
                            size="large"
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSaving || isUpdating}
                            rightIcon={
                                isSaving || isUpdating ? undefined : 'check'
                            }
                        />
                    </Animated.View>
                </View>

                <View style={{ height: spacing.lg }} />
            </ScrollView>
        </ScreenWrapper>
    );
};
