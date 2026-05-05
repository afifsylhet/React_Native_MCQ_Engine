import React, { useState, useEffect } from 'react';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerification'>;

export const OTPVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
    const { email, purpose = 'email_verification' } = route.params;
    const { verifyOtp, resendOtp } = useAuth();

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleVerifyOtp = async () => {
        if (!otp) {
            setError('অনুগ্রহ করে ওটিপি দিন');
            return;
        }

        if (otp.length !== 6) {
            setError('ওটিপি অবশ্যই ৬ ডিজিটের হতে হবে');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            await verifyOtp(email, otp, purpose);
            if (purpose === 'password_reset') {
                Toast.show({
                    type: 'success',
                    text1: 'ওটিপি যাচাই হয়েছে',
                    text2: 'এখন একটি নতুন পাসওয়ার্ড সেট করুন।',
                });
                navigation.replace('ResetPassword', { email, otp });
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'ইমেইল যাচাই হয়েছে',
                    text2: 'আপনার ইমেইল সফলভাবে যাচাই করা হয়েছে',
                });
                navigation.replace('Login');
            }
        } catch (error: any) {
            console.error('[OTPVerificationScreen] Verification error:', error);
            const message = formatApiError(error);
            setError(message);
            Toast.show({
                type: 'error',
                text1: 'যাচাই ব্যর্থ হয়েছে',
                text2: message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        try {
            setIsResending(true);
            await resendOtp(email, purpose);
            setCanResend(false);
            setTimeLeft(60);
            setOtp('');
            setError('');
            Toast.show({
                type: 'success',
                text1: 'ওটিপি পাঠানো হয়েছে',
                text2: 'নতুন ওটিপি কোডের জন্য আপনার ইমেইল দেখুন',
            });

            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error: any) {
            console.error('[OTPVerificationScreen] Resend error:', error);
            Toast.show({
                type: 'error',
                text1: 'পুনরায় পাঠানো যায়নি',
                text2: formatApiError(error),
            });
        } finally {
            setIsResending(false);
        }
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
                {/* Header */}
                <View>
                    <Text
                        style={{
                            fontSize: 32,
                            fontWeight: '700',
                            color: '#1F2937',
                            marginBottom: 8,
                        }}
                    >
                        ইমেইল যাচাই করুন
                    </Text>
                    <Text
                        style={{
                            fontSize: 16,
                            color: '#6B7280',
                            marginBottom: 32,
                            lineHeight: 24,
                        }}
                    >
                        আমরা একটি যাচাইকরণ কোড পাঠিয়েছি{'\n'}<Text style={{ fontWeight: '600' }}>{email}</Text>
                    </Text>
                </View>

                {/* OTP Input */}
                <View>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: '#1F2937',
                            marginBottom: 12,
                        }}
                    >
                        যাচাইকরণ কোড
                    </Text>
                    <TextInput
                        placeholder="000000"
                        value={otp}
                        onChangeText={(text) => {
                            const numericOnly = text.replace(/[^0-9]/g, '');
                            setOtp(numericOnly.slice(0, 6));
                            if (error) setError('');
                        }}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!isLoading}
                        style={{
                            borderWidth: 1,
                            borderColor: error ? '#EF4444' : '#D1D5DB',
                            borderRadius: 8,
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            fontSize: 24,
                            fontWeight: '700',
                            color: '#1F2937',
                            backgroundColor: '#F9FAFB',
                            textAlign: 'center',
                            letterSpacing: 8,
                            marginBottom: 12,
                        }}
                        placeholderTextColor="#D1D5DB"
                    />
                    {error && (
                        <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 16 }}>
                            {error}
                        </Text>
                    )}
                    <Text
                        style={{
                            fontSize: 14,
                            color: '#6B7280',
                            marginBottom: 32,
                        }}
                    >
                        ইনবক্সে না পেলে আপনার স্প্যাম বা জাঙ্ক ফোল্ডার দেখুন।
                    </Text>

                    {/* Verify Button */}
                    <TouchableOpacity
                        onPress={handleVerifyOtp}
                        disabled={isLoading || !otp}
                        style={{
                            backgroundColor: isLoading || !otp ? '#D1D5DB' : '#3B82F6',
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
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: '#FFFFFF',
                                }}
                            >
                                ইমেইল যাচাই করুন
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Resend OTP */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text
                            style={{
                                color: '#6B7280',
                                fontSize: 14,
                            }}
                        >
                            কোড পাননি?{' '}
                        </Text>
                        <TouchableOpacity
                            onPress={handleResendOtp}
                            disabled={!canResend || isResending}
                        >
                            <Text
                                style={{
                                    color: canResend ? '#3B82F6' : '#D1D5DB',
                                    fontSize: 14,
                                    fontWeight: '600',
                                }}
                            >
                                {canResend ? (
                                    isResending ? 'পাঠানো হচ্ছে...' : 'আবার পাঠান'
                                ) : (
                                    `${timeLeft} সেকেন্ড পরে আবার পাঠান`
                                )}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    disabled={isLoading}
                >
                    <Text
                        style={{
                            color: '#3B82F6',
                            fontSize: 14,
                            fontWeight: '600',
                            textAlign: 'center',
                        }}
                    >
                        অন্য ইমেইল ব্যবহার করুন
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
