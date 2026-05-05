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

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validateEmail = (): boolean => {
        if (!email) {
            setError('ইমেইল প্রয়োজন');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('সঠিক ইমেইল ঠিকানা দিন');
            return false;
        }
        return true;
    };

    const handleForgotPassword = async () => {
        if (!validateEmail()) {
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            const trimmedEmail = email.trim();
            await forgotPassword(trimmedEmail);
            Toast.show({
                type: 'success',
                text1: 'ওটিপি পাঠানো হয়েছে',
                text2: 'রিসেট ওটিপি কোডের জন্য আপনার ইমেইল দেখুন',
            });
            navigation.navigate('OTPVerification', {
                email: trimmedEmail,
                purpose: 'password_reset',
            });
        } catch (error: any) {
            console.error('[ForgotPasswordScreen] Forgot password error:', error);
            const message = formatApiError(error);
            setError(message);
            Toast.show({
                type: 'error',
                text1: 'সমস্যা হয়েছে',
                text2: message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    paddingHorizontal: 20,
                    paddingVertical: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {/* Success Icon */}
                <View
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: '#D1FAE5',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 24,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 40,
                            color: '#10B981',
                        }}
                    >
                        ✓
                    </Text>
                </View>

                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: '700',
                        color: '#1F2937',
                        marginBottom: 12,
                        textAlign: 'center',
                    }}
                >
                    আপনার ইমেইল দেখুন
                </Text>

                <Text
                    style={{
                        fontSize: 16,
                        color: '#6B7280',
                        textAlign: 'center',
                        lineHeight: 24,
                        marginBottom: 32,
                    }}
                >
                    আমরা একটি পাসওয়ার্ড রিসেট লিংক পাঠিয়েছি{'\n'}<Text style={{ fontWeight: '600' }}>{email}</Text>
                </Text>

                <Text
                    style={{
                        fontSize: 14,
                        color: '#6B7280',
                        textAlign: 'center',
                        marginBottom: 32,
                    }}
                >
                    পাসওয়ার্ড রিসেট করতে ইমেইলের লিংকে ক্লিক করুন। লিংকটির মেয়াদ ১ ঘণ্টা।
                </Text>

                {/* Back to Login */}
                <TouchableOpacity
                    onPress={() => navigation.replace('Login')}
                    style={{
                        backgroundColor: '#3B82F6',
                        paddingVertical: 14,
                        paddingHorizontal: 24,
                        borderRadius: 8,
                        alignItems: 'center',
                        width: '100%',
                        marginBottom: 12,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#FFFFFF',
                        }}
                    >
                        লগইনে ফিরে যান
                    </Text>
                </TouchableOpacity>

                {/* Didn't receive */}
                <TouchableOpacity
                    onPress={() => setIsSubmitted(false)}
                >
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: '#3B82F6',
                            textAlign: 'center',
                        }}
                    >
                        ইমেইল পাননি? আবার চেষ্টা করুন
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                {/* Header */}
                <View>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ marginBottom: 24 }}
                        disabled={isLoading}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: '#3B82F6',
                            }}
                        >
                            ← ফিরে যান
                        </Text>
                    </TouchableOpacity>

                    <Text
                        style={{
                            fontSize: 32,
                            fontWeight: '700',
                            color: '#1F2937',
                            marginBottom: 8,
                        }}
                    >
                        পাসওয়ার্ড ভুলে গেছেন?
                    </Text>
                    <Text
                        style={{
                            fontSize: 16,
                            color: '#6B7280',
                            marginBottom: 32,
                            lineHeight: 24,
                        }}
                    >
                        আপনার ইমেইল ঠিকানা দিন, আমরা পাসওয়ার্ড রিসেট করার একটি লিংক পাঠিয়ে দেব।
                    </Text>
                </View>

                {/* Form */}
                <View>
                    {/* Email Input */}
                    <View style={{ marginBottom: 24 }}>
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: '#1F2937',
                                marginBottom: 8,
                            }}
                        >
                            ইমেইল ঠিকানা
                        </Text>
                        <TextInput
                            placeholder="আপনার ইমেইল লিখুন"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (error) setError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                            style={{
                                borderWidth: 1,
                                borderColor: error ? '#EF4444' : '#D1D5DB',
                                borderRadius: 8,
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                fontSize: 16,
                                color: '#1F2937',
                                backgroundColor: '#F9FAFB',
                            }}
                            placeholderTextColor="#9CA3AF"
                        />
                        {error && (
                            <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                                {error}
                            </Text>
                        )}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleForgotPassword}
                        disabled={isLoading || !email}
                        style={{
                            backgroundColor: isLoading || !email ? '#D1D5DB' : '#3B82F6',
                            paddingVertical: 14,
                            paddingHorizontal: 24,
                            borderRadius: 8,
                            alignItems: 'center',
                        }}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: '#FFFFFF',
                                }}
                            >
                                রিসেট লিংক পাঠান
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={{ alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                            style={{
                                color: '#6B7280',
                                fontSize: 14,
                            }}
                        >
                            পাসওয়ার্ড মনে আছে?{' '}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.replace('Login')}
                            disabled={isLoading}
                        >
                            <Text
                                style={{
                                    color: '#3B82F6',
                                    fontSize: 14,
                                    fontWeight: '600',
                                }}
                            >
                                সাইন ইন
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
