import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { formatApiError } from '../../utils/formatters';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

interface FormData {
    newPassword: string;
    passwordConfirm: string;
}

interface FormErrors {
    newPassword?: string;
    passwordConfirm?: string;
}

const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const ResetPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
    const { email, otp } = route.params;
    const { resetPassword } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        newPassword: '',
        passwordConfirm: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.newPassword) {
            newErrors.newPassword = 'পাসওয়ার্ড প্রয়োজন';
        } else if (!STRONG_PASSWORD_RE.test(formData.newPassword)) {
            newErrors.newPassword =
                'কমপক্ষে ৮টি অক্ষর, একটি বড় হাতের, একটি ছোট হাতের ও একটি সংখ্যা থাকতে হবে';
        }
        if (!formData.passwordConfirm) {
            newErrors.passwordConfirm = 'অনুগ্রহ করে পাসওয়ার্ড নিশ্চিত করুন';
        } else if (formData.newPassword !== formData.passwordConfirm) {
            newErrors.passwordConfirm = 'পাসওয়ার্ড মিলছে না';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            await resetPassword({ email, otp, newPassword: formData.newPassword });
            Toast.show({
                type: 'success',
                text1: 'পাসওয়ার্ড রিসেট হয়েছে',
                text2: 'অনুগ্রহ করে আপনার নতুন পাসওয়ার্ড দিয়ে লগইন করুন।',
            });
            navigation.replace('Login');
        } catch (error: any) {
            console.error('[ResetPasswordScreen] Reset error:', error);
            Toast.show({
                type: 'error',
                text1: 'রিসেট ব্যর্থ হয়েছে',
                text2: formatApiError(error),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateFormData = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 20,
                    paddingVertical: 40,
                    justifyContent: 'space-between',
                }}
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <Text style={{ fontSize: 32, fontWeight: '700', color: '#1F2937', marginBottom: 8 }}>
                        পাসওয়ার্ড রিসেট
                    </Text>
                    <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 32, lineHeight: 24 }}>
                        আপনার অ্যাকাউন্টের জন্য একটি নতুন পাসওয়ার্ড তৈরি করুন।
                    </Text>
                </View>

                <View>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
                            নতুন পাসওয়ার্ড
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: errors.newPassword ? '#EF4444' : '#D1D5DB',
                                borderRadius: 8,
                                backgroundColor: '#F9FAFB',
                                paddingHorizontal: 16,
                            }}
                        >
                            <TextInput
                                placeholder="কমপক্ষে ৮টি অক্ষর"
                                value={formData.newPassword}
                                onChangeText={(t) => updateFormData('newPassword', t)}
                                secureTextEntry={!showPassword}
                                editable={!isLoading}
                                style={{ flex: 1, paddingVertical: 12, fontSize: 16, color: '#1F2937' }}
                                placeholderTextColor="#9CA3AF"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                                <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '600' }}>
                                    {showPassword ? 'লুকান' : 'দেখান'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {errors.newPassword && (
                            <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                                {errors.newPassword}
                            </Text>
                        )}
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
                            পাসওয়ার্ড নিশ্চিত করুন
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: errors.passwordConfirm ? '#EF4444' : '#D1D5DB',
                                borderRadius: 8,
                                backgroundColor: '#F9FAFB',
                                paddingHorizontal: 16,
                            }}
                        >
                            <TextInput
                                placeholder="আপনার নতুন পাসওয়ার্ড আবার লিখুন"
                                value={formData.passwordConfirm}
                                onChangeText={(t) => updateFormData('passwordConfirm', t)}
                                secureTextEntry={!showConfirmPassword}
                                editable={!isLoading}
                                style={{ flex: 1, paddingVertical: 12, fontSize: 16, color: '#1F2937' }}
                                placeholderTextColor="#9CA3AF"
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                            >
                                <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '600' }}>
                                    {showConfirmPassword ? 'লুকান' : 'দেখান'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {errors.passwordConfirm && (
                            <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                                {errors.passwordConfirm}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={handleResetPassword}
                        disabled={isLoading}
                        style={{
                            backgroundColor: isLoading ? '#93C5FD' : '#3B82F6',
                            paddingVertical: 14,
                            paddingHorizontal: 24,
                            borderRadius: 8,
                            alignItems: 'center',
                            marginBottom: 16,
                        }}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                                পাসওয়ার্ড রিসেট করুন
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.replace('Login')} disabled={isLoading}>
                    <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
                        লগইনে ফিরে যান
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
