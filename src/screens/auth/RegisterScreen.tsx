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
import { StudentType, ExamType } from '../../types/api.types';
import { formatApiError } from '../../utils/formatters';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormData {
    fullName: string;
    email: string;
    phoneNumber: string;
    examType: ExamType | null;
    studentType: StudentType | null;
    password: string;
    passwordConfirm: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PHONE_RE = /^\d{11}$/;
const sanitizePhoneNumber = (value: string) => value.replace(/\D/g, '').slice(0, 11);

const EXAM_TYPE_OPTIONS: { value: ExamType; label: string; hint: string }[] = [
    { value: 'admission', label: 'ভর্তি পরীক্ষা', hint: 'ভর্তির প্রস্তুতি' },
    { value: 'license', label: 'লাইসেন্স পরীক্ষা', hint: 'লাইসেন্সিং-এর প্রস্তুতি' },
];

const STUDENT_TYPE_OPTIONS: { value: StudentType; label: string }[] = [
    { value: 'diploma_nursing_midwifery', label: 'ডিপ্লোমা ইন নার্সিং ও মিডওয়াইফারি' },
    { value: 'diploma_midwifery', label: 'ডিপ্লোমা ইন মিডওয়াইফারি' },
    { value: 'bsc_nursing', label: 'বি.এসসি. ইন নার্সিং' },
    { value: 'post_basic_midwifery', label: 'পোস্ট বেসিক বি.এসসি. ইন মিডওয়াইফারি' },
];

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        phoneNumber: '',
        examType: null,
        studentType: null,
        password: '',
        passwordConfirm: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const next: FormErrors = {};

        if (!formData.fullName.trim()) next.fullName = 'পূর্ণ নাম প্রয়োজন';
        else if (formData.fullName.trim().length < 2) next.fullName = 'কমপক্ষে ২টি অক্ষর দিন';

        if (!formData.email.trim()) next.email = 'ইমেইল প্রয়োজন';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
            next.email = 'সঠিক ইমেইল ঠিকানা দিন';

        if (!formData.phoneNumber.trim()) next.phoneNumber = 'ফোন নম্বর প্রয়োজন';
        else if (!PHONE_RE.test(formData.phoneNumber.trim()))
            next.phoneNumber = 'মোবাইল নম্বর অবশ্যই ১১ সংখ্যার হতে হবে এবং শুধুমাত্র সংখ্যা ব্যবহার করুন';

        if (!formData.examType) next.examType = 'আপনি কিসের প্রস্তুতি নিচ্ছেন তা নির্বাচন করুন';
        if (!formData.studentType) next.studentType = 'আপনার প্রোগ্রাম নির্বাচন করুন';

        if (!formData.password) next.password = 'পাসওয়ার্ড প্রয়োজন';
        else if (!STRONG_PASSWORD_RE.test(formData.password))
            next.password = 'কমপক্ষে ৮টি অক্ষর, একটি বড় হাতের, একটি ছোট হাতের ও একটি সংখ্যা থাকতে হবে';

        if (!formData.passwordConfirm) next.passwordConfirm = 'অনুগ্রহ করে পাসওয়ার্ড নিশ্চিত করুন';
        else if (formData.password !== formData.passwordConfirm)
            next.passwordConfirm = 'পাসওয়ার্ড মিলছে না';

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            await register({
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                examType: formData.examType!,
                studentType: formData.studentType!,
                password: formData.password,
                passwordConfirm: formData.passwordConfirm,
            });
            Toast.show({
                type: 'success',
                text1: 'রেজিস্ট্রেশন সফল হয়েছে',
                text2: 'আপনার ইমেইলে পাঠানো ওটিপি যাচাই করুন।',
            });
            navigation.replace('OTPVerification', {
                email: formData.email.trim(),
                purpose: 'email_verification',
            });
        } catch (error: any) {
            const message = formatApiError(error);
            Toast.show({
                type: 'error',
                text1: 'রেজিস্ট্রেশন ব্যর্থ হয়েছে',
                text2: message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData((prev) => {
            if (field === 'examType' && prev.examType !== value) {
                return { ...prev, examType: value as ExamType, studentType: null };
            }
            return { ...prev, [field]: value };
        });
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
        if (field === 'examType' && errors.studentType) {
            setErrors((prev) => ({ ...prev, studentType: undefined }));
        }
    };

    const renderTextField = (
        label: string,
        field: keyof Pick<FormData, 'fullName' | 'email' | 'phoneNumber'>,
        placeholder: string,
        keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
        autoCapitalize: 'none' | 'words' = 'none',
        options?: { maxLength?: number; sanitize?: (text: string) => string }
    ) => (
        <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
                {label}
            </Text>
            <TextInput
                placeholder={placeholder}
                value={formData[field] as string}
                onChangeText={(t) => updateField(field, (options?.sanitize ? options.sanitize(t) : t) as any)}
                editable={!isLoading}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                maxLength={options?.maxLength}
                style={{
                    borderWidth: 1,
                    borderColor: errors[field] ? '#EF4444' : '#D1D5DB',
                    borderRadius: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    fontSize: 16,
                    color: '#1F2937',
                    backgroundColor: '#F9FAFB',
                }}
                placeholderTextColor="#9CA3AF"
            />
            {errors[field] && (
                <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                    {errors[field]}
                </Text>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View>
                    <Text style={{ fontSize: 32, fontWeight: '700', color: '#1F2937', marginBottom: 8 }}>
                        অ্যাকাউন্ট তৈরি করুন
                    </Text>
                    <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 32 }}>
                        আপনার প্রস্তুতির যাত্রা শুরু করতে আজই বিডি নার্সিং প্রিপারেশণে যোগ দিন
                    </Text>
                </View>

                {renderTextField('পূর্ণ নাম', 'fullName', 'আপনার পূর্ণ নাম লিখুন', 'default', 'words')}
                {renderTextField('ইমেইল ঠিকানা', 'email', 'আপনার ইমেইল লিখুন', 'email-address')}
                {renderTextField(
                    'ফোন নম্বর',
                    'phoneNumber',
                    '১১ সংখ্যার মোবাইল নম্বর লিখুন',
                    'number-pad',
                    'none',
                    {
                        maxLength: 11,
                        sanitize: sanitizePhoneNumber,
                    }
                )}

                {/* Step 1: Goal (segmented control) */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
                        আমি প্রস্তুতি নিচ্ছি
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            borderWidth: 1,
                            borderColor: errors.examType ? '#EF4444' : '#D1D5DB',
                            borderRadius: 8,
                            overflow: 'hidden',
                            backgroundColor: '#F9FAFB',
                        }}
                    >
                        {EXAM_TYPE_OPTIONS.map((opt, idx) => {
                            const selected = formData.examType === opt.value;
                            return (
                                <TouchableOpacity
                                    key={opt.value}
                                    onPress={() => updateField('examType', opt.value)}
                                    disabled={isLoading}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected }}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 12,
                                        alignItems: 'center',
                                        backgroundColor: selected ? '#3B82F6' : 'transparent',
                                        borderLeftWidth: idx === 0 ? 0 : 1,
                                        borderLeftColor: '#D1D5DB',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            color: selected ? '#FFFFFF' : '#1F2937',
                                        }}
                                    >
                                        {opt.label}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            marginTop: 2,
                                            color: selected ? '#DBEAFE' : '#6B7280',
                                        }}
                                    >
                                        {opt.hint}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {errors.examType && (
                        <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                            {errors.examType}
                        </Text>
                    )}
                </View>

                {/* Step 2: Program (revealed after goal is chosen) */}
                {formData.examType && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
                            আমার প্রোগ্রাম
                        </Text>
                        <View style={{ gap: 8 }}>
                            {STUDENT_TYPE_OPTIONS.map((opt) => {
                                const selected = formData.studentType === opt.value;
                                return (
                                    <TouchableOpacity
                                        key={opt.value}
                                        onPress={() => updateField('studentType', opt.value)}
                                        disabled={isLoading}
                                        accessibilityRole="radio"
                                        accessibilityState={{ selected }}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: selected
                                                ? '#3B82F6'
                                                : errors.studentType
                                                    ? '#EF4444'
                                                    : '#D1D5DB',
                                            borderRadius: 8,
                                            paddingVertical: 12,
                                            paddingHorizontal: 16,
                                            backgroundColor: selected ? '#EFF6FF' : '#F9FAFB',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: 9,
                                                borderWidth: 2,
                                                borderColor: selected ? '#3B82F6' : '#9CA3AF',
                                                marginRight: 12,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {selected && (
                                                <View
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: '#3B82F6',
                                                    }}
                                                />
                                            )}
                                        </View>
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                color: '#1F2937',
                                                fontWeight: selected ? '600' : '400',
                                            }}
                                        >
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        {errors.studentType && (
                            <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                                {errors.studentType}
                            </Text>
                        )}
                    </View>
                )}

                {/* Password */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
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
                            placeholder="কমপক্ষে ৮টি অক্ষর"
                            value={formData.password}
                            onChangeText={(t) => updateField('password', t)}
                            secureTextEntry={!showPassword}
                            editable={!isLoading}
                            style={{ flex: 1, paddingVertical: 12, fontSize: 16, color: '#1F2937' }}
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                        >
                            <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600' }}>
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

                {/* Confirm Password */}
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
                            placeholder="আপনার পাসওয়ার্ড আবার লিখুন"
                            value={formData.passwordConfirm}
                            onChangeText={(t) => updateField('passwordConfirm', t)}
                            secureTextEntry={!showConfirmPassword}
                            editable={!isLoading}
                            style={{ flex: 1, paddingVertical: 12, fontSize: 16, color: '#1F2937' }}
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                        >
                            <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600' }}>
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
                    onPress={handleRegister}
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
                            অ্যাকাউন্ট তৈরি করুন
                        </Text>
                    )}
                </TouchableOpacity>

                <View
                    style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                >
                    <Text style={{ color: '#6B7280', fontSize: 14 }}>ইতিমধ্যে অ্যাকাউন্ট আছে? </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                        disabled={isLoading}
                    >
                        <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600' }}>
                            সাইন ইন
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
