import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { ExamStackScreenProps } from '../../navigation/types';
import { questionApi } from '../../api/question.api';
import { useQuotaStatus } from '../../hooks/useExam';
import { useMyModuleStatus } from '../../hooks/useSubscription';

type PastExamScreenProps = ExamStackScreenProps<'PastExam'>;

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i);

export const PastExamScreen: React.FC<PastExamScreenProps> = ({
    navigation,
    route,
}) => {
    console.log('[PastExamScreen] COMPONENT RENDERED - route params:', route.params);
    const { studentType, examType } = route.params;
    const { data: quota } = useQuotaStatus();
    const { data: moduleStatus, isFetching: isModuleStatusFetching } = useMyModuleStatus();
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [isLoadingYears, setIsLoadingYears] = useState(true);
    const [yearsError, setYearsError] = useState<string | null>(null);

    // Fetch available years from database
    useEffect(() => {
        const fetchYears = async () => {
            try {
                setIsLoadingYears(true);
                setYearsError(null);
                console.log('[PastExamScreen] useEffect triggered - Fetching available years...');

                const years = await questionApi.getAvailableYears();
                console.log('[PastExamScreen] API Response - years:', years);
                console.log('[PastExamScreen] Years is array?', Array.isArray(years));
                console.log('[PastExamScreen] Years length:', years?.length);

                setAvailableYears(years);

                // Auto-select the most recent year if available
                if (years.length > 0) {
                    console.log('[PastExamScreen] Auto-selecting year:', years[0]);
                    setSelectedYear(years[0]);
                } else {
                    console.log('[PastExamScreen] No years available to auto-select');
                }
            } catch (error) {
                console.error('[PastExamScreen] FULL ERROR OBJECT:', error);
                console.error('[PastExamScreen] Failed to fetch years - Error:', error instanceof Error ? error.message : String(error));
                setYearsError('পরীক্ষার সাল লোড করা যায়নি');
                setAvailableYears([]);
            } finally {
                setIsLoadingYears(false);
                console.log('[PastExamScreen] Loading finished');
            }
        };

        fetchYears();
    }, []);

    const handleStart = () => {
        console.log('[PastExamScreen] handleStart tapped:', {
            selectedYear,
            isModuleStatusFetching,
            moduleStatus,
            quota,
        });
        if (!selectedYear) {
            console.log('[PastExamScreen] blocked: no year selected');
            setYearsError('অনুগ্রহ করে একটি সাল বেছে নিন');
            return;
        }

        if (isModuleStatusFetching || !moduleStatus) {
            console.log('[PastExamScreen] blocked: module status not ready', {
                isModuleStatusFetching,
                hasModuleStatus: !!moduleStatus,
            });
            return;
        }

        if (moduleStatus.isLocked) {
            console.log('[PastExamScreen] blocked: module locked', moduleStatus);
            navigation.navigate('ModuleUnavailable', {
                moduleLabel: moduleStatus.label || 'পূর্বের পরীক্ষার প্রশ্ন',
                message: moduleStatus.message,
            });
            return;
        }

        // Free-tier hard stop when quota is already exhausted
        if (
            quota &&
            !quota.hasActiveSubscription &&
            quota.remaining !== null &&
            quota.remaining <= 0
        ) {
            navigation.navigate('SubscriptionRequired', {
                reason: 'quota_exceeded',
            });
            return;
        }

        navigation.navigate('ExamConfig', {
            examCategory: 'year_exam',
            studentType,
            examType,
            year: selectedYear,
        });
    };

    console.log('[PastExamScreen] STATE:', {
        isLoadingYears,
        availableYears,
        selectedYear,
        yearDropdownOpen,
        yearsError
    });

    return (
        <ScreenWrapper scrollable={true} safeTop={true}>
            <Animated.View
                entering={FadeInDown}
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
                    }}
                >
                    পূর্বের পরীক্ষার প্রশ্ন
                </Text>
                <Text
                    style={{
                        fontSize: typography.scale.sm.fontSize,
                        fontFamily: typography.fontBody,
                        color: colors.textSecondary,
                        marginTop: spacing.xs,
                    }}
                >
                    পূর্বের পরীক্ষার প্রকৃত প্রশ্ন
                </Text>
            </Animated.View>

            <View style={{ paddingHorizontal: spacing.base, gap: spacing.base }}>
                {/* Free-tier quota banner */}
                {quota && !quota.hasActiveSubscription && quota.monthlyQuota !== null && (
                    <Animated.View entering={FadeInDown.delay(50)}>
                        <Card
                            style={{
                                backgroundColor:
                                    quota.remaining === 0
                                        ? colors.dangerLight
                                        : colors.accentLight,
                                borderLeftWidth: 4,
                                borderLeftColor:
                                    quota.remaining === 0 ? colors.danger : colors.accent,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: spacing.md,
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={
                                        quota.remaining === 0
                                            ? 'lock'
                                            : 'information-outline'
                                    }
                                    size={22}
                                    color={
                                        quota.remaining === 0
                                            ? colors.danger
                                            : colors.accent
                                    }
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
                                        {quota.remaining === 0
                                            ? 'এই মাসের ফ্রি কোটা শেষ হয়ে গেছে'
                                            : `এই মাসে ${quota.monthlyQuota}টির মধ্যে ${quota.remaining}টি ফ্রি সুযোগ বাকি`}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                            marginTop: spacing.xs,
                                        }}
                                    >
                                        অসীম পূর্বের পরীক্ষার অনুশীলনের জন্য সাবস্ক্রাইব করুন।
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    </Animated.View>
                )}

                {/* Exam Year Picker */}
                <Animated.View entering={FadeInDown.delay(150)}>
                    <Card>
                        <Text
                            style={{
                                fontSize: typography.scale.sm.fontSize,
                                fontFamily: typography.fontBody,
                                fontWeight: typography.weights.semibold,
                                color: colors.textPrimary,
                                marginBottom: spacing.md,
                            }}
                        >
                            পরীক্ষার সাল
                        </Text>
                        {isLoadingYears ? (
                            <View
                                style={{
                                    paddingVertical: spacing.md,
                                    alignItems: 'center',
                                }}
                            >
                                <ActivityIndicator
                                    size="small"
                                    color={colors.primary}
                                />
                            </View>
                        ) : availableYears.length > 0 ? (
                            <View>
                                <TouchableOpacity
                                    onPress={() => setYearDropdownOpen(!yearDropdownOpen)}
                                    style={{
                                        paddingVertical: spacing.md,
                                        paddingHorizontal: spacing.md,
                                        backgroundColor: colors.surfaceAlt,
                                        borderRadius: spacing.borderRadius.md,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: typography.scale.base.fontSize,
                                            fontFamily: typography.fontBody,
                                            fontWeight: typography.weights.semibold,
                                            color: selectedYear
                                                ? colors.textPrimary
                                                : colors.textSecondary,
                                        }}
                                    >
                                        {selectedYear ? selectedYear.toString() : 'সাল বেছে নিন'}
                                    </Text>
                                    <MaterialCommunityIcons
                                        name={
                                            yearDropdownOpen
                                                ? 'chevron-up'
                                                : 'chevron-down'
                                        }
                                        size={24}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>

                                {yearDropdownOpen && (
                                    <ScrollView
                                        style={{
                                            marginTop: spacing.xs,
                                            backgroundColor: colors.surface,
                                            borderRadius: spacing.borderRadius.md,
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                            maxHeight: 250,
                                        }}
                                        nestedScrollEnabled
                                    >
                                        {availableYears.map((year) => (
                                            <TouchableOpacity
                                                key={year}
                                                onPress={() => {
                                                    setSelectedYear(year);
                                                    setYearDropdownOpen(false);
                                                    setYearsError(null);
                                                }}
                                                style={{
                                                    paddingVertical: spacing.md,
                                                    paddingHorizontal: spacing.md,
                                                    backgroundColor:
                                                        selectedYear === year
                                                            ? colors.primaryLight
                                                            : 'transparent',
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: colors.border,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize:
                                                            typography.scale.base
                                                                .fontSize,
                                                        fontFamily:
                                                            typography.fontBody,
                                                        fontWeight:
                                                            selectedYear === year
                                                                ? typography.weights
                                                                    .semibold
                                                                : typography.weights
                                                                    .normal,
                                                        color:
                                                            selectedYear === year
                                                                ? colors.primary
                                                                : colors.textPrimary,
                                                    }}
                                                >
                                                    {year}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        ) : (
                            <Text
                                style={{
                                    fontSize: typography.scale.sm.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textSecondary,
                                    paddingVertical: spacing.md,
                                }}
                            >
                                কোনো পরীক্ষার সাল নেই
                            </Text>
                        )}
                    </Card>
                </Animated.View>

                {/* Error Message */}
                {yearsError && (
                    <Animated.View entering={FadeInDown.delay(200)}>
                        <Card
                            style={{
                                backgroundColor: colors.errorLight,
                                borderLeftWidth: 4,
                                borderLeftColor: colors.error,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: spacing.md,
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="alert-circle"
                                    size={20}
                                    color={colors.error}
                                />
                                <Text
                                    style={{
                                        flex: 1,
                                        fontSize: typography.scale.sm.fontSize,
                                        fontFamily: typography.fontBody,
                                        color: colors.error,
                                    }}
                                >
                                    {yearsError}
                                </Text>
                            </View>
                        </Card>
                    </Animated.View>
                )}

                <Animated.View entering={FadeInDown.delay(250)}>
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
                                    alignItems: 'center',
                                    gap: spacing.md,
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="file-document-multiple"
                                    size={24}
                                    color={colors.primary}
                                />
                                <Text
                                    style={{
                                        fontSize: typography.scale.base.fontSize,
                                        fontFamily: typography.fontDisplay,
                                        fontWeight: typography.weights.bold,
                                        color: colors.textPrimary,
                                    }}
                                >
                                    পূর্বের পরীক্ষার অনুশীলন
                                </Text>
                            </View>
                            <Text
                                style={{
                                    fontSize: typography.scale.sm.fontSize,
                                    fontFamily: typography.fontBody,
                                    color: colors.textSecondary,
                                    lineHeight: typography.scale.sm.fontSize * 1.5,
                                }}
                            >
                                পূর্বের {examType === 'admission' ? 'ভর্তি' : 'লাইসেন্স'} পরীক্ষার প্রশ্ন দিয়ে অনুশীলন করুন। একটি সাল বেছে নিলে অনুশীলনের জন্য ১০০টি প্রশ্ন পাবেন।
                            </Text>
                        </View>
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300)}>
                    <Button
                        label="কনফিগার করে শুরু করুন"
                        variant="primary"
                        size="large"
                        onPress={handleStart}
                        rightIcon="arrow-right"
                        disabled={
                            isLoadingYears ||
                            availableYears.length === 0 ||
                            isModuleStatusFetching ||
                            !moduleStatus
                        }
                    />
                </Animated.View>
            </View>

            <View style={{ height: spacing.lg }} />
        </ScreenWrapper>
    );
};
