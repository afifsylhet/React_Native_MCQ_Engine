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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = 'ইমেইল প্রয়োজন';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'সঠিক ইমেইল ঠিকানা দিন';
        }

        if (!password) {
            newErrors.password = 'পাসওয়ার্ড প্রয়োজন';
        } else if (password.length < 6) {
            newErrors.password = 'পাসওয়ার্ড কমপক্ষে ৬টি অক্ষরের হতে হবে';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            await login(email.trim(), password);
            Toast.show({
                type: 'success',
                text1: 'লগইন সফল হয়েছে',
                text2: 'বিডি নার্সিং প্রিপারেশণে স্বাগতম',
            });
        } catch (error: any) {
            console.error('[LoginScreen] Login error:', error);
            Toast.show({
                type: 'error',
                text1: 'লগইন ব্যর্থ হয়েছে',
                text2: formatApiError(error),
            });
        } finally {
            setIsLoading(false);
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
                        আবার স্বাগতম
                    </Text>
                    <Text
                        style={{
                            fontSize: 16,
                            color: '#6B7280',
                            marginBottom: 32,
                        }}
                    >
                        এগিয়ে যেতে আপনার অ্যাকাউন্টে সাইন ইন করুন
                    </Text>
                </View>

                {/* Form */}
                <View>
                    {/* Email Input */}
                    <View style={{ marginBottom: 20 }}>
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
                                if (errors.email) {
                                    setErrors({ ...errors, email: undefined });
                                }
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                            style={{
                                borderWidth: 1,
                                borderColor: errors.email ? '#EF4444' : '#D1D5DB',
                                borderRadius: 8,
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                fontSize: 16,
                                color: '#1F2937',
                                backgroundColor: '#F9FAFB',
                            }}
                            placeholderTextColor="#9CA3AF"
                        />
                        {errors.email && (
                            <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                                {errors.email}
                            </Text>
                        )}
                    </View>

                    {/* Password Input */}
                    <View style={{ marginBottom: 12 }}>
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: '#1F2937',
                                marginBottom: 8,
                            }}
                        >
                            পাসওয়ার্ড
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: errors.password ? '#EF4444' : '#D1D5DB',
                                borderRadius: 8,
                                backgroundColor: '#F9FAFB',
                                paddingHorizontal: 16,
                            }}
                        >
                            <TextInput
                                placeholder="আপনার পাসওয়ার্ড লিখুন"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (errors.password) {
                                        setErrors({ ...errors, password: undefined });
                                    }
                                }}
                                secureTextEntry={!showPassword}
                                editable={!isLoading}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    fontSize: 16,
                                    color: '#1F2937',
                                }}
                                placeholderTextColor="#9CA3AF"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                <Text
                                    style={{
                                        color: '#6B7280',
                                        fontSize: 16,
                                        fontWeight: '600',
                                    }}
                                >
                                    {showPassword ? 'লুকান' : 'দেখান'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {errors.password && (
                            <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                                {errors.password}
                            </Text>
                        )}
                    </View>

                    {/* Forgot Password Link */}
                    <TouchableOpacity
                        style={{ alignItems: 'flex-end', marginBottom: 32 }}
                        onPress={() => navigation.navigate('ForgotPassword')}
                        disabled={isLoading}
                    >
                        <Text
                            style={{
                                color: '#3B82F6',
                                fontSize: 14,
                                fontWeight: '600',
                            }}
                        >
                            পাসওয়ার্ড ভুলে গেছেন?
                        </Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        onPress={handleLogin}
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
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: '#FFFFFF',
                                }}
                            >
                                সাইন ইন
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={{ alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                        <Text
                            style={{
                                color: '#6B7280',
                                fontSize: 14,
                            }}
                        >
                            অ্যাকাউন্ট নেই?{' '}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Register')}
                            disabled={isLoading}
                        >
                            <Text
                                style={{
                                    color: '#3B82F6',
                                    fontSize: 14,
                                    fontWeight: '600',
                                }}
                            >
                                সাইন আপ
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
