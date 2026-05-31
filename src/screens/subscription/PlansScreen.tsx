import React, { useState, useEffect } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PlanCard } from '../../components/subscription/PlanCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useMyModuleStatus, useSubscription } from '../../hooks/useSubscription';
import { ProfileStackScreenProps } from '../../navigation/types';
import { supportSettingsApi } from '../../api/supportSettings.api';
import { queryKeys } from '../../api/queryClient';

type PlansScreenProps = ProfileStackScreenProps<'Plans'>;
type PaidPlanId = 'quarterly' | 'half_yearly';

interface SubscriptionPlan {
    id: string;
    title: string;
    price: string;
    priceValue: number;
    period: string;
    description: string;
    badge?: string;
    isPopular?: boolean;
    features: Array<{ icon: string; text: string; included: boolean }>;
}

export const PlansScreen: React.FC<PlansScreenProps> = ({ navigation }) => {
    const { subscribe, isSubscribing, mySubscription } = useSubscription();
    const { data: moduleStatus, isFetching: isModuleStatusFetching } = useMyModuleStatus();
    const [selectedPlan, setSelectedPlan] = useState<string>('quarterly');
    const { data: supportSettings } = useQuery({
        queryKey: queryKeys.settings.support,
        queryFn: () => supportSettingsApi.getSupportSettings(),
        staleTime: 5 * 60 * 1000,
    });
    const bkashSendMoneyNumber = supportSettings?.bkashSendMoneyNumber?.trim() || '—';
    const whatsAppNumber = supportSettings?.whatsAppNumber?.trim() || '—';
    const supportEmail = supportSettings?.supportEmail?.trim() || '—';
    const [transactionId, setTransactionId] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [formErrors, setFormErrors] = useState<{
        transactionId?: string;
        paymentAmount?: string;
    }>({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Check if module is locked and redirect to unavailable screen
    useEffect(() => {
        if (moduleStatus?.isLocked) {
            navigation.replace('ModuleUnavailable', {
                moduleLabel: moduleStatus.label || 'আপনার পরীক্ষার প্রস্তুতি',
                message: moduleStatus.message,
            });
        }
    }, [moduleStatus?.isLocked, navigation, moduleStatus?.label, moduleStatus?.message]);

    const hasTransactionId = transactionId.trim().length > 0;
    const parsedPaymentAmount = Number(paymentAmount);
    const hasValidAmount = Number.isFinite(parsedPaymentAmount) && parsedPaymentAmount > 0;
    const canSubmitForApproval = hasTransactionId && hasValidAmount;

    const hasActiveSubscription = !!mySubscription && mySubscription.status === 'active';
    const isModuleLocked = !!moduleStatus?.isLocked;

    const plans: SubscriptionPlan[] = [
        {
            id: 'free',
            title: 'ফ্রি',
            price: '৳০',
            priceValue: 0,
            period: '/চিরকাল',
            description: 'প্রত্যেক নতুন ব্যবহারকারীর জন্য ডিফল্ট প্ল্যান',
            features: [
                { icon: 'check', text: 'লাইফটাইম ৫০০ প্রশ্নের সীমা', included: true },
                { icon: 'check', text: 'পূর্বের পরীক্ষার প্রশ্ন (সীমিত)', included: true },
                { icon: 'close', text: 'মডেল টেস্ট', included: false },
                { icon: 'close', text: 'বিষয়ভিত্তিক অনুশীলন', included: false },
                { icon: 'close', text: 'প্রাধান্যমূলক সহায়তা', included: false },
            ],
        },
        {
            id: 'quarterly',
            title: '৪ মাস',
            price: '৳৩০০',
            priceValue: 300,
            period: '/৪ মাস',
            description: 'নিয়মিত পড়াশোনার জন্য স্ট্যান্ডার্ড প্ল্যান',
            features: [
                { icon: 'check', text: 'সাপ্তাহিক ১৪০০ প্রশ্নের সীমা', included: true },
                { icon: 'check', text: 'বিস্তারিত বিশ্লেষণ', included: true },
                { icon: 'check', text: '১২০ দিনের অ্যাক্সেস', included: true },
                { icon: 'check', text: 'সাপ্তাহিক লিডারবোর্ড', included: true },
                { icon: 'check', text: 'প্রাধান্যমূলক সহায়তা', included: true },
            ],
        },
        {
            id: 'half_yearly',
            title: '৪ মাস',
            price: '৳৫০০',
            priceValue: 500,
            period: '/৪ মাস',
            description: 'দ্রুত প্রস্তুতির জন্য উচ্চতর সীমা',
            badge: 'জনপ্রিয়',
            isPopular: true,
            features: [
                { icon: 'check', text: 'সাপ্তাহিক ৩০০০ প্রশ্নের সীমা', included: true },
                { icon: 'check', text: 'ছোট প্ল্যানের তুলনায় সাশ্রয়', included: true },
                { icon: 'check', text: '১২০ দিনের অ্যাক্সেস', included: true },
                { icon: 'check', text: 'সাপ্তাহিক লিডারবোর্ড', included: true },
                { icon: 'check', text: 'প্রাধান্যমূলক সহায়তা', included: true },
            ],
        },
    ];

    const getPlanPrice = (planId: PaidPlanId): number => {
        const matchedPlan = plans.find((p) => p.id === planId);
        if (!matchedPlan) return 0;
        return Number.isFinite(matchedPlan.priceValue) ? matchedPlan.priceValue : 0;
    };

    const handlePlanSelect = (planId: PaidPlanId) => {
        setSelectedPlan(planId);
        setPaymentAmount(String(getPlanPrice(planId)));
        setFormErrors((prev) => ({
            ...prev,
            paymentAmount: undefined,
        }));
    };

    useEffect(() => {
        if (selectedPlan !== 'free') {
            setPaymentAmount(String(getPlanPrice(selectedPlan as PaidPlanId)));
        }
    }, [selectedPlan]);

    const handleSubscribe = (planId: PaidPlanId) => {
        if (isProcessing || isSubscribing) return;

        // Block while module lock status hasn't loaded yet — the backend is the source
        // of truth, but without this guard a fast tap could fire subscribe before we
        // know whether the module is locked.
        if (isModuleStatusFetching || !moduleStatus) {
            return;
        }

        if (isModuleLocked) {
            navigation.replace('ModuleUnavailable', {
                moduleLabel: moduleStatus?.label || 'আপনার পরীক্ষার প্রস্তুতি',
                message: moduleStatus?.message,
            });
            return;
        }

        const plan = plans.find((p) => p.id === planId);
        if (!plan) return;

        const trimmedTransactionId = transactionId.trim();
        const amountValue = Number(paymentAmount);
        const errors: { transactionId?: string; paymentAmount?: string } = {};

        if (!trimmedTransactionId) {
            errors.transactionId = 'বিকাশ ট্রানজেকশন আইডি প্রয়োজন';
        }
        if (!paymentAmount.trim()) {
            errors.paymentAmount = 'পেমেন্টের পরিমাণ প্রয়োজন';
        } else if (!Number.isFinite(amountValue) || amountValue <= 0) {
            errors.paymentAmount = 'টাকায় সঠিক পরিমাণ লিখুন';
        }

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        setIsProcessing(true);
        subscribe(
            {
                plan: planId,
                transactionId: trimmedTransactionId,
                paymentAmount: amountValue,
            },
            {
                onSuccess: () => {
                    Toast.show({
                        type: 'success',
                        text1: 'আবেদন জমা হয়েছে',
                        text2: 'পেমেন্টের তথ্য অ্যাডমিন যাচাইয়ের জন্য পাঠানো হয়েছে।',
                    });
                    setTransactionId('');
                    setPaymentAmount('');
                    setFormErrors({});
                    navigation.goBack();
                },
                onError: (error: unknown) => {
                    if (axios.isAxiosError(error) && error.response?.status === 403) {
                        navigation.replace('ModuleUnavailable', {
                            moduleLabel:
                                error.response?.data?.data?.moduleLabel ||
                                error.response?.data?.data?.label ||
                                moduleStatus?.label ||
                                'আপনার পরীক্ষার প্রস্তুতি',
                            message:
                                error.response?.data?.message ||
                                error.response?.data?.error?.message ||
                                moduleStatus?.message,
                        });
                        return;
                    }

                    const errorMessage =
                        error instanceof Error ? error.message : 'আবার চেষ্টা করুন';
                    Toast.show({
                        type: 'error',
                        text1: 'সাবস্ক্রিপশন ব্যর্থ',
                        text2: errorMessage,
                    });
                },
                onSettled: () => setIsProcessing(false),
            }
        );
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
                        আপনার প্ল্যান বেছে নিন
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                            marginTop: spacing.xs,
                        }}
                    >
                        পরীক্ষা প্রস্তুতির জন্য প্রিমিয়াম ফিচার আনলক করুন
                    </Text>
                </Animated.View>

                {/* Billing Toggle */}
                <Animated.View
                    entering={FadeInDown.delay(50)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                    }}
                >
                    {isModuleLocked ? (
                        <Card
                            style={{
                                marginBottom: spacing.base,
                                borderWidth: 1,
                                borderColor: colors.warning,
                                backgroundColor: colors.warningLight,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: typography.scale.sm.fontSize,
                                    fontFamily: typography.fontBody,
                                    fontWeight: typography.weights.semibold,
                                    color: colors.warning,
                                }}
                            >
                                এই মডিউলটি বর্তমানে আনলক নেই
                            </Text>
                            <Text
                                style={{
                                    fontSize: typography.scale.xs.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textSecondary,
                                    marginTop: spacing.xs,
                                }}
                            >
                                {moduleStatus?.message}
                            </Text>
                        </Card>
                    ) : null}

                    <Card>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: spacing.md,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="lightbulb-on"
                                size={20}
                                color={colors.accent}
                            />
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: typography.scale.sm.fontSize,
                                        fontFamily: typography.fontBody,
                                        fontWeight: typography.weights.semibold,
                                        color: colors.textPrimary,
                                    }}
                                >
                                    💡 ২০% সাশ্রয় করুন
                                </Text>
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textSecondary,
                                        marginTop: spacing.xs,
                                    }}
                                >
                                    বার্ষিক বিলিং সুবিধা রয়েছে
                                </Text>
                            </View>
                        </View>
                    </Card>
                </Animated.View>

                {/* Plans */}
                <View
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                    }}
                >
                    {plans.map((plan, index) => {
                        const isFreePlan = plan.id === 'free';
                        const isCurrentFree = isFreePlan && !hasActiveSubscription;
                        const buttonText = isFreePlan
                            ? isCurrentFree
                                ? 'বর্তমান প্ল্যান'
                                : 'ফ্রি টিয়ার'
                            : selectedPlan === plan.id
                                ? 'নির্বাচিত'
                                : 'প্ল্যান বেছে নিন';
                        const effectiveBadge = isCurrentFree ? 'বর্তমান প্ল্যান' : plan.badge;

                        return (
                            <Animated.View key={plan.id} entering={FadeInDown.delay(100 + index * 50)}>
                                <PlanCard
                                    title={plan.title}
                                    price={plan.price}
                                    period={plan.period}
                                    description={plan.description}
                                    badge={effectiveBadge}
                                    isPopular={plan.isPopular}
                                    features={plan.features}
                                    buttonText={buttonText}
                                    onPress={() => {
                                        if (isFreePlan) return;
                                        if (isModuleLocked) {
                                            navigation.replace('ModuleUnavailable', {
                                                moduleLabel: moduleStatus?.label || 'আপনার পরীক্ষার প্রস্তুতি',
                                                message: moduleStatus?.message,
                                            });
                                            return;
                                        }
                                        handlePlanSelect(plan.id as PaidPlanId);
                                    }}
                                    isSelected={!isFreePlan && selectedPlan === plan.id}
                                />
                            </Animated.View>
                        );
                    })}

                    {selectedPlan !== 'free' ? (
                        <Animated.View entering={FadeInDown.delay(260)}>
                            <Card
                                style={{
                                    marginTop: spacing.base,
                                    borderWidth: 1,
                                    borderColor: colors.primary,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: typography.scale.sm.fontSize,
                                        fontFamily: typography.fontBody,
                                        fontWeight: typography.weights.semibold,
                                        color: colors.textPrimary,
                                        marginBottom: spacing.sm,
                                    }}
                                >
                                    পেমেন্ট যাচাইয়ের তথ্য
                                </Text>
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textSecondary,
                                        marginBottom: spacing.base,
                                    }}
                                >
                                    অ্যাডমিন আপনার সাবস্ক্রিপশন যাচাই ও অনুমোদনের জন্য এই তথ্যগুলো জমা দিন।
                                </Text>

                                <Card
                                    style={{
                                        backgroundColor: colors.primaryLight,
                                        borderLeftWidth: 4,
                                        borderLeftColor: colors.primary,
                                        marginBottom: spacing.base,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.textPrimary,
                                            marginBottom: spacing.xs,
                                        }}
                                    >
                                        বিকাশ পেমেন্ট (শুধু Send Money)
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.primary,
                                            marginBottom: spacing.xs,
                                        }}
                                    >
                                        {bkashSendMoneyNumber}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        শুধু Send Money অপশন ব্যবহার করে পেমেন্ট করুন।
                                    </Text>
                                </Card>

                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        fontWeight: typography.weights.semibold,
                                        color: colors.textSecondary,
                                        marginBottom: spacing.sm,
                                    }}
                                >
                                    নির্বাচিত প্ল্যান
                                </Text>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        gap: spacing.sm,
                                        marginBottom: spacing.base,
                                    }}
                                >
                                    {([
                                        { id: 'quarterly', label: '৪ মাস', price: 300 },
                                        { id: 'half_yearly', label: '৪ মাস', price: 500 },
                                    ] as const).map((planOption) => {
                                        const isActive = selectedPlan === planOption.id;

                                        return (
                                            <TouchableOpacity
                                                key={planOption.id}
                                                onPress={() => handlePlanSelect(planOption.id)}
                                                activeOpacity={0.8}
                                                style={{
                                                    flex: 1,
                                                    borderRadius: spacing.borderRadius.md,
                                                    paddingVertical: spacing.sm,
                                                    paddingHorizontal: spacing.sm,
                                                    backgroundColor: isActive
                                                        ? colors.primary
                                                        : colors.surfaceAlt,
                                                    borderWidth: 1,
                                                    borderColor: isActive
                                                        ? colors.primary
                                                        : colors.border,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        textAlign: 'center',
                                                        fontSize: typography.scale.sm.fontSize,
                                                        fontFamily: typography.fontBody,
                                                        fontWeight: typography.weights.semibold,
                                                        color: isActive
                                                            ? colors.textInverse
                                                            : colors.textPrimary,
                                                    }}
                                                >
                                                    {planOption.label}
                                                </Text>
                                                <Text
                                                    style={{
                                                        textAlign: 'center',
                                                        marginTop: spacing.xs,
                                                        fontSize: typography.scale.xs.fontSize,
                                                        fontFamily: typography.fontBody,
                                                        color: isActive
                                                            ? colors.textInverse
                                                            : colors.textSecondary,
                                                    }}
                                                >
                                                    ৳{planOption.price}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <Input
                                    label="বিকাশ ট্রানজেকশন আইডি"
                                    placeholder="বিকাশ ট্রানজেকশন আইডি লিখুন"
                                    value={transactionId}
                                    onChangeText={(text) => {
                                        setTransactionId(text);
                                        if (formErrors.transactionId) {
                                            setFormErrors((prev) => ({ ...prev, transactionId: undefined }));
                                        }
                                    }}
                                    error={formErrors.transactionId}
                                    leftIcon="identifier"
                                    autoCapitalize="none"
                                />

                                <Input
                                    label="পেমেন্টের পরিমাণ (টাকা)"
                                    placeholder="পরিশোধিত পরিমাণ টাকায় লিখুন"
                                    value={paymentAmount}
                                    onChangeText={(text) => {
                                        setPaymentAmount(text);
                                        if (formErrors.paymentAmount) {
                                            setFormErrors((prev) => ({ ...prev, paymentAmount: undefined }));
                                        }
                                    }}
                                    error={formErrors.paymentAmount}
                                    leftIcon="cash"
                                    keyboardType="numeric"
                                    editable={false}
                                />

                                <Button
                                    label={isProcessing || isSubscribing ? 'জমা দেওয়া হচ্ছে...' : 'অনুমোদনের জন্য জমা দিন'}
                                    variant="primary"
                                    size="large"
                                    disabled={
                                        isProcessing ||
                                        isSubscribing ||
                                        !canSubmitForApproval ||
                                        isModuleLocked ||
                                        isModuleStatusFetching ||
                                        !moduleStatus
                                    }
                                    onPress={() => handleSubscribe(selectedPlan as PaidPlanId)}
                                />
                            </Card>
                        </Animated.View>
                    ) : null}
                </View>

                {/* Support */}
                <Animated.View
                    entering={FadeInDown.delay(400)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                        alignItems: 'center',
                        gap: spacing.md,
                    }}
                >
                    <Card style={{ width: '100%', gap: spacing.sm }}>
                        <Text
                            style={{
                                fontSize: typography.scale.sm.fontSize,
                                fontFamily: typography.fontBody,
                                fontWeight: typography.weights.semibold,
                                color: colors.textPrimary,
                            }}
                        >
                            সহায়তা দরকার?
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.scale.sm.fontSize,
                                fontFamily: typography.fontBody,
                                color: colors.textSecondary,
                            }}
                        >
                            WhatsApp: {whatsAppNumber}
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.scale.sm.fontSize,
                                fontFamily: typography.fontBody,
                                color: colors.textSecondary,
                            }}
                        >
                            Email: {supportEmail}
                        </Text>
                    </Card>
                </Animated.View>

                <View style={{ height: spacing.lg }} />
            </ScrollView>
        </ScreenWrapper>
    );
};
