import React, { useEffect } from 'react';
import {
    View,
    ScrollView,
    Text,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ExamCategoryCard } from '../../components/exam/ExamCategoryCard';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAuth } from '../../hooks/useAuth';
import { useQuotaStatus } from '../../hooks/useExam';
import { useMyModuleStatus } from '../../hooks/useSubscription';
import { ExamStackScreenProps } from '../../navigation/types';
import { getStudentTypeLabel } from '../../utils/formatters';

type ExamHubScreenProps = ExamStackScreenProps<'ExamHub'>;

export const ExamHubScreen: React.FC<ExamHubScreenProps> = ({ navigation }) => {
    const { user } = useAuth();
    const { data: quota } = useQuotaStatus();
    const { data: moduleStatus, isFetching: isModuleStatusFetching } = useMyModuleStatus();
    // Goal is fixed at registration (admission or license) — no toggle here.
    const examGoal = user?.examType;

    // Check if module is locked and redirect to unavailable screen
    useEffect(() => {
        if (moduleStatus?.isLocked) {
            navigation.replace('ModuleUnavailable', {
                moduleLabel: moduleStatus.label || 'আপনার পরীক্ষার প্রস্তুতি',
                message: moduleStatus.message,
            });
        }
    }, [moduleStatus?.isLocked, navigation, moduleStatus?.label, moduleStatus?.message]);

    const handleCategoryPress = (examCategory: string) => {
        if (!user || !examGoal) return;

        // Wait for module status before letting the user drill in.
        if (isModuleStatusFetching || !moduleStatus) return;

        if (moduleStatus.isLocked) {
            navigation.navigate('ModuleUnavailable', {
                moduleLabel: moduleStatus.label || 'আপনার পরীক্ষার প্রস্তুতি',
                message: moduleStatus.message,
            });
            return;
        }

        const isFreeUser = quota && !quota.hasActiveSubscription;
        const isLockedCategory =
            examCategory === 'model_test' || examCategory === 'subject';

        // Free users cannot access model_test or practice (subject)
        if (isFreeUser && isLockedCategory) {
            navigation.navigate('SubscriptionRequired', {
                reason: 'category_locked',
            });
            return;
        }

        // Past Exam Questions should go to PastExamScreen first to select year
        if (examCategory === 'past_exam') {
            navigation.navigate('PastExam', {
                studentType: user.studentType,
                examType: examGoal,
            });
        } else {
            navigation.navigate('ExamConfig', {
                examCategory,
                studentType: user.studentType,
                examType: examGoal,
            });
        }
    };

    const isFreeUser = !!quota && !quota.hasActiveSubscription;
    const pastExamSubtitle =
        isFreeUser && quota && quota.remaining !== null
            ? `এই মাসে ${quota.monthlyQuota}টির মধ্যে ${quota.remaining}টি ফ্রি সুযোগ বাকি`
            : undefined;
    const lockedSubtitle = isFreeUser ? 'আনলক করতে সাবস্ক্রাইব করুন' : undefined;

    const categories = [
        {
            id: 'past-exam',
            icon: 'file-document-multiple',
            title: 'পূর্বের পরীক্ষার প্রশ্ন',
            description: 'পূর্বের লাইসেন্স ও ভর্তি পরীক্ষার প্রকৃত প্রশ্ন',
            examCategory: 'past_exam',
            subtitle: pastExamSubtitle,
        },
        {
            id: 'model-test',
            icon: 'clipboard-text',
            title: 'মডেল টেস্ট',
            description:
                '১০০ প্রশ্নের সম্পূর্ণ সময়বদ্ধ মক পরীক্ষা। প্রকৃত পরীক্ষার পরিবেশ অনুকরণ করে।',
            examCategory: 'model_test',
            subtitle: lockedSubtitle,
        },
        {
            id: 'practice',
            icon: 'bookshelf',
            title: 'বিষয়ভিত্তিক অনুশীলন',
            description:
                'নিজের গতিতে অধ্যায় অনুযায়ী অনুশীলন করুন। কোনো সময়সীমা নেই।',
            examCategory: 'subject',
            subtitle: lockedSubtitle,
        },
    ];

    if (!user) {
        return (
            <ScreenWrapper>
                <Text>লোড হচ্ছে...</Text>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scrollable={false} safeTop={true}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.lg,
                    }}
                >
                    <Text
                        style={{
                            fontSize: typography.scale['2xl'].fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                            marginBottom: spacing.md,
                        }}
                    >
                        আপনার পরীক্ষা বেছে নিন
                    </Text>

                    {/* Student Type Info */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.primaryLight,
                            borderRadius: spacing.borderRadius.md,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            marginBottom: spacing.lg,
                            alignSelf: 'flex-start',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: typography.scale.sm.fontSize,
                                fontFamily: typography.fontBody,
                                fontWeight: typography.weights.semibold,
                                color: colors.primary,
                            }}
                        >
                            {getStudentTypeLabel(user.studentType)}
                        </Text>
                    </View>

                    {/* Goal label — fixed at registration */}
                    {examGoal && (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.surfaceAlt,
                                borderRadius: spacing.borderRadius.md,
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.sm,
                                marginBottom: spacing.lg,
                                alignSelf: 'flex-start',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: typography.scale.sm.fontSize,
                                    fontFamily: typography.fontBody,
                                    fontWeight: typography.weights.semibold,
                                    color: colors.textSecondary,
                                }}
                            >
                                {examGoal === 'admission' ? 'ভর্তি পরীক্ষা' : 'লাইসেন্স পরীক্ষা'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Category Cards */}
                <View style={{ paddingHorizontal: spacing.base }}>
                    {categories.map((category, index) => (
                        <Animated.View
                            key={category.id}
                            entering={FadeInDown.delay(index * 100)}
                        >
                            <ExamCategoryCard
                                icon={category.icon}
                                title={category.title}
                                description={category.description}
                                subtitle={category.subtitle}
                                onPress={() => handleCategoryPress(category.examCategory)}
                            />
                        </Animated.View>
                    ))}
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: spacing.lg }} />
            </ScrollView>
        </ScreenWrapper>
    );
};
