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
import { StudentType, ExamType } from '../../types/api.types';
import { formatApiError } from '../../utils/formatters';
import apiClient from '../../api/client';

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

interface ModuleStatus {
    examType: string;
    studentType: string;
    isLocked: boolean;
}

const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PHONE_RE = /^\d{11}$/;
const sanitizePhoneNumber = (value: string) => value.replace(/\D/g, '').slice(0, 11);

const ALL_STUDENT_TYPE_OPTIONS: { value: StudentType; label: string; admissionAllowed: boolean }[] = [
    { value: 'diploma_nursing_midwifery', label: 'Diploma in Nursing Science and Midwifery', admissionAllowed: true },
    { value: 'diploma_midwifery', label: 'Diploma in Midwifery', admissionAllowed: true },
    { value: 'bsc_nursing', label: 'B.Sc. in Nursing', admissionAllowed: true },
    { value: 'post_basic_bsc_nursing', label: 'Post Basic B.Sc. in Nursing', admissionAllowed: true },
    { value: 'post_basic_bsc_midwifery', label: 'Post Basic B.Sc. in Midwifery', admissionAllowed: true },
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
    const [moduleStatuses, setModuleStatuses] = useState<ModuleStatus[]>([]);

    useEffect(() => {
        apiClient
            .get<{ data: ModuleStatus[] }>('/subscriptions/public/module-statuses')
            .then((res) => setModuleStatuses(res.data?.data || []))
            .catch(() => { });
    }, []);

    const isStudentTypeLocked = (studentTypeValue: StudentType, examTypeValue: ExamType | null): boolean => {
        if (!examTypeValue) return false;
        return moduleStatuses.some(
            (s) => s.examType === examTypeValue && s.studentType === studentTypeValue && s.isLocked
        );
    };

    const getVisibleStudentTypes = () => {
        if (!formData.examType) return [];
        return ALL_STUDENT_TYPE_OPTIONS.filter((opt) => {
            // Filter out types not allowed for this exam
            if (formData.examType === 'admission' && !opt.admissionAllowed) return false;
            // Filter out locked types — they should not appear in the dropdown at all
            if (isStudentTypeLocked(opt.value, formData.examType)) return false;
            return true;
        });
    };

    const getLockedStudentTypes = () => {
        if (!formData.examType) return [];
        return ALL_STUDENT_TYPE_OPTIONS.filter(
            (opt) =>
                (formData.examType !== 'admission' || opt.admissionAllowed) &&
                isStudentTypeLocked(opt.value, formData.examType)
        );
    };

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

        if (!formData.examType) next.examType = 'আপনি কিসের প্রস্তুতি নিতে চান তা নির্বাচন করুন';
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

    const visibleStudentTypes = getVisibleStudentTypes();
    const lockedStudentTypes = getLockedStudentTypes();

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

                {/* Exam Type — Radio Buttons */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>
                        আমি প্রস্তুতি নিতে চাই
                    </Text>
                    <View style={{ gap: 10 }}>
                        {[
                            { value: 'admission' as ExamType, label: 'আমি ভর্তি পরীক্ষার প্রস্তুতি নিতে চাই' },
                            { value: 'license' as ExamType, label: 'আমি লাইসেন্স পরীক্ষার প্রস্তুতি নিতে চাই' },
                        ].map((opt) => {
                            const selected = formData.examType === opt.value;
                            return (
                                <TouchableOpacity
                                    key={opt.value}
                                    onPress={() => updateField('examType', opt.value)}
                                    disabled={isLoading}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        borderWidth: 1.5,
                                        borderColor: selected
                                            ? '#3B82F6'
                                            : errors.examType
                                                ? '#EF4444'
                                                : '#D1D5DB',
                                        borderRadius: 10,
                                        paddingVertical: 14,
                                        paddingHorizontal: 16,
                                        backgroundColor: selected ? '#EFF6FF' : '#F9FAFB',
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 10,
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
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: 5,
                                                    backgroundColor: '#3B82F6',
                                                }}
                                            />
                                        )}
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: selected ? '#1D4ED8' : '#1F2937',
                                            fontWeight: selected ? '600' : '400',
                                            flex: 1,
                                        }}
                                    >
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {errors.examType && (
                        <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>
                            {errors.examType}
                        </Text>
                    )}
                </View>

                {/* Student Type — shown after exam type selected */}
                {formData.examType && visibleStudentTypes.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
                            আমার প্রোগ্রাম
                        </Text>
                        <View style={{ gap: 8 }}>
                            {visibleStudentTypes.map((opt) => {
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
                                            backgroundColor: selected
                                                ? '#EFF6FF'
                                                : '#F9FAFB',
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
                                                borderColor: selected
                                                    ? '#3B82F6'
                                                    : '#9CA3AF',
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
                                                flex: 1,
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

                {/* Coming soon — locked types */}
                {lockedStudentTypes.length > 0 && (
                    <View
                        style={{
                            marginBottom: 16,
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            backgroundColor: '#F3F4F6',
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                        }}
                    >
                        <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, fontWeight: '600' }}>
                            শীঘ্রই আসছে
                        </Text>
                        {lockedStudentTypes.map((opt) => (
                            <Text key={opt.value} style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 2 }}>
                                • {opt.label}
                            </Text>
                        ))}
                    </View>
                )}

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
