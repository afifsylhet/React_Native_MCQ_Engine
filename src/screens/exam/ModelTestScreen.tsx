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

type ModelTestScreenProps = ExamStackScreenProps<'ModelTest'>;

export const ModelTestScreen: React.FC<ModelTestScreenProps> = ({
    navigation,
    route,
}) => {
    const { studentType } = route.params;

    const handleStartTest = () => {
        navigation.navigate('ExamConfig', {
            examCategory: 'model_test',
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
                    মডেল টেস্ট
                </Text>
                <Text
                    style={{
                        fontSize: typography.scale.sm.fontSize,
                        fontFamily: typography.fontBody,
                        color: colors.textSecondary,
                        marginTop: spacing.xs,
                    }}
                >
                    প্রকৃত পরীক্ষার পরিবেশ অনুকরণকারী পূর্ণাঙ্গ সময়বদ্ধ মক পরীক্ষা
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
                                    name="clipboard-text"
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
                                    পূর্ণাঙ্গ মডেল টেস্ট
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
                                সব বিষয় থেকে এলোমেলোভাবে তৈরি পরীক্ষা। পরবর্তী স্ক্রিনে প্রশ্নের সংখ্যা, কঠিনতা ও সময়সীমা নির্ধারণ করুন।
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    gap: spacing.lg,
                                }}
                            >
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
                                        এলোমেলো প্রশ্ন
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
                                        name="clock-outline"
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
                                        সময়বদ্ধ
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
                        onPress={handleStartTest}
                        rightIcon="arrow-right"
                    />
                </Animated.View>
            </View>

            <View style={{ height: spacing.lg }} />
        </ScreenWrapper>
    );
};
