import React, { useEffect } from 'react';
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
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useSubscription, useMyModuleStatus } from '../../hooks/useSubscription';
import { ProfileStackScreenProps } from '../../navigation/types';
import { formatDate } from '../../utils/formatters';

type SubscriptionScreenProps = ProfileStackScreenProps<'Subscription'>;

const BENEFITS = [
    'সীমাহীন পরীক্ষা',
    'বিস্তারিত বিশ্লেষণ',
    'পারফরম্যান্স ট্র্যাকিং',
    'সাপ্তাহিক লিডারবোর্ড',
    'প্রাধান্যমূলক সহায়তা',
];

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
    navigation,
}) => {
    const { mySubscription, isLoading, cancelSubscription, isCanceling } =
        useSubscription();
    const { data: moduleStatus } = useMyModuleStatus();

    // Check if module is locked and redirect to unavailable screen
    useEffect(() => {
        if (moduleStatus?.isLocked) {
            navigation.replace('ModuleUnavailable', {
                moduleLabel: moduleStatus.label || 'আপনার পরীক্ষার প্রস্তুতি',
                message: moduleStatus.message,
            });
        }
    }, [moduleStatus?.isLocked, navigation, moduleStatus?.label, moduleStatus?.message]);

    const handleUpgrade = () => {
        (navigation as any).navigate('Plans');
    };

    const handleCancelSubscription = () => {
        Toast.show({
            type: 'info',
            text1: 'সাবস্ক্রিপশন বাতিল করবেন?',
            text2:
                'বর্তমান বিলিং পিরিয়ডের শেষে আপনি প্রিমিয়াম ফিচারের অ্যাক্সেস হারাবেন',
            visibilityTime: 3000,
            onPress: async () => {
                try {
                    cancelSubscription();
                    Toast.show({
                        type: 'success',
                        text1: 'সাবস্ক্রিপশন বাতিল হয়েছে',
                        text2: 'বর্তমান পিরিয়ডের শেষে আপনার প্রিমিয়াম অ্যাক্সেস শেষ হবে।',
                    });
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : 'সাবস্ক্রিপশন বাতিল করা যায়নি';
                    Toast.show({
                        type: 'error',
                        text1: 'বাতিল করা যায়নি',
                        text2: errorMessage,
                    });
                }
            },
        });
    };

    if (isLoading) {
        return (
            <ScreenWrapper scrollable={false} safeTop={true}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    if (!mySubscription || mySubscription.status !== 'active') {
        return (
            <ScreenWrapper scrollable={true} safeTop={true}>
                <View
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
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
                    <EmptyState
                        icon="card-account-details-outline"
                        title="কোনো সক্রিয় সাবস্ক্রিপশন নেই"
                        description="সব ফিচার আনলক করতে একটি প্ল্যানে সাবস্ক্রাইব করুন।"
                    />
                    <Button
                        label="প্ল্যানগুলো দেখুন"
                        variant="primary"
                        size="large"
                        onPress={handleUpgrade}
                        rightIcon="arrow-right"
                        style={{ marginTop: spacing.lg }}
                    />
                </View>
            </ScreenWrapper>
        );
    }

    const isExpiringSoon = mySubscription.daysRemaining <= 3;

    return (
        <ScreenWrapper scrollable={false} safeTop={true}>
            <ScrollView showsVerticalScrollIndicator={false}>
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
                        আমার সাবস্ক্রিপশন
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                            marginTop: spacing.xs,
                        }}
                    >
                        আপনার প্রিমিয়াম অ্যাক্সেস পরিচালনা করুন
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(100)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                    }}
                >
                    <Card
                        style={{
                            backgroundColor: colors.primaryLight,
                            borderLeftWidth: 4,
                            borderLeftColor: colors.primary,
                        }}
                    >
                        <View style={{ gap: spacing.md }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: typography.scale.lg.fontSize,
                                        fontFamily: typography.fontDisplay,
                                        fontWeight: typography.weights.bold,
                                        color: colors.textPrimary,
                                    }}
                                >
                                    {mySubscription.planName}
                                </Text>
                                <Badge
                                    variant={isExpiringSoon ? 'error' : 'success'}
                                    text={isExpiringSoon ? 'মেয়াদ শেষের পথে' : 'সক্রিয়'}
                                    size="small"
                                />
                            </View>

                            <View>
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textSecondary,
                                    }}
                                >
                                    মূল্য
                                </Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'baseline',
                                        marginTop: spacing.xs,
                                        gap: spacing.xs,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale['2xl'].fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.primary,
                                        }}
                                    >
                                        {mySubscription.currency === 'BDT' ? '৳' : '₹'}
                                        {mySubscription.amount}
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={{
                                    paddingTop: spacing.md,
                                    borderTopWidth: 1,
                                    borderTopColor: colors.primary,
                                    opacity: 0.7,
                                    gap: spacing.md,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        শুরু হয়েছে
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        {formatDate(mySubscription.startDate)}
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        মেয়াদ শেষ
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: isExpiringSoon
                                                ? colors.error
                                                : colors.success,
                                        }}
                                    >
                                        {formatDate(mySubscription.endDate)}
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        বাকি সময়
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontDisplay,
                                            fontWeight: typography.weights.bold,
                                            color: colors.primary,
                                        }}
                                    >
                                        {mySubscription.daysRemaining} দিন
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: spacing.md,
                                    paddingTop: spacing.md,
                                    borderTopWidth: 1,
                                    borderTopColor: colors.primary,
                                    opacity: 0.7,
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={
                                        mySubscription.autoRenew
                                            ? 'check-circle'
                                            : 'close-circle'
                                    }
                                    size={20}
                                    color={
                                        mySubscription.autoRenew
                                            ? colors.success
                                            : colors.error
                                    }
                                />
                                <Text
                                    style={{
                                        fontSize: typography.scale.xs.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.textPrimary,
                                    }}
                                >
                                    স্বয়ংক্রিয় নবায়ন{' '}
                                    {mySubscription.autoRenew ? 'চালু' : 'বন্ধ'}
                                </Text>
                            </View>
                        </View>
                    </Card>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(200)}
                    style={{
                        paddingHorizontal: spacing.base,
                        marginBottom: spacing.lg,
                    }}
                >
                    <Text
                        style={{
                            fontSize: typography.scale.base.fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                            marginBottom: spacing.md,
                        }}
                    >
                        আপনার সুবিধাগুলো
                    </Text>
                    <View style={{ gap: spacing.md }}>
                        {BENEFITS.map((feature, index) => (
                            <Card key={index}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: spacing.md,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={24}
                                        color={colors.success}
                                    />
                                    <Text
                                        style={{
                                            fontSize: typography.scale.sm.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        {feature}
                                    </Text>
                                </View>
                            </Card>
                        ))}
                    </View>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(300)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                        gap: spacing.base,
                    }}
                >
                    {isExpiringSoon && (
                        <Button
                            label="এখনই নবায়ন করুন"
                            variant="primary"
                            size="large"
                            onPress={handleUpgrade}
                            rightIcon="refresh"
                        />
                    )}
                    <Button
                        label="সাবস্ক্রিপশন বাতিল করুন"
                        variant="danger"
                        size="large"
                        onPress={handleCancelSubscription}
                        disabled={isCanceling}
                        leftIcon="close"
                    />
                </Animated.View>

                <View style={{ height: spacing.lg }} />
            </ScrollView>
        </ScreenWrapper>
    );
};
