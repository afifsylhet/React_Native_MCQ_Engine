import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { ExamStackScreenProps } from '../../navigation/types';

type PracticeScreenProps = ExamStackScreenProps<'Practice'>;

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
    navigation,
    route,
}) => {
    const { studentType } = route.params;

    const handleStart = () => {
        navigation.navigate('ExamConfig', {
            examCategory: 'subject',
            studentType,
            examType: 'license',
        });
    };

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
                    বিষয়ভিত্তিক অনুশীলন
                </Text>
                <Text
                    style={{
                        fontSize: typography.scale.sm.fontSize,
                        fontFamily: typography.fontBody,
                        color: colors.textSecondary,
                        marginTop: spacing.xs,
                    }}
                >
                    সময়সীমা ছাড়াই নিজের গতিতে অনুশীলন করুন
                </Text>
            </Animated.View>

            <View style={{ paddingHorizontal: spacing.base, gap: spacing.base }}>
                <Animated.View entering={FadeInDown.delay(100)}>
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
                                    name="bookshelf"
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
                                    অনুশীলন সেশন
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
                                সব বিষয় থেকে এলোমেলোভাবে তৈরি অনুশীলন প্রশ্ন। পরবর্তী স্ক্রিনে প্রশ্নের সংখ্যা ও কঠিনতা নির্ধারণ করুন।
                            </Text>
                            <View style={{ flexDirection: 'row', gap: spacing.lg }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: spacing.xs,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="infinity"
                                        size={16}
                                        color={colors.textSecondary}
                                    />
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        সময়ের চাপ নেই
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: spacing.xs,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="shuffle-variant"
                                        size={16}
                                        color={colors.textSecondary}
                                    />
                                    <Text
                                        style={{
                                            fontSize: typography.scale.xs.fontSize,
                                            fontFamily: typography.fontBody,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        সব বিষয়
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200)}>
                    <Button
                        label="কনফিগার করে শুরু করুন"
                        variant="primary"
                        size="large"
                        onPress={handleStart}
                        rightIcon="arrow-right"
                    />
                </Animated.View>
            </View>

            <View style={{ height: spacing.lg }} />
        </ScreenWrapper>
    );
};
