import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface ModuleMaintenanceScreenProps {
    navigation: any;
    route: {
        params?: {
            moduleName?: string;
            examType?: string;
            studentType?: string;
        };
    };
}

export const ModuleMaintenanceScreen: React.FC<ModuleMaintenanceScreenProps> = ({
    navigation,
    route,
}) => {
    const moduleName = route.params?.moduleName || 'Exam Preparation';
    const examType = route.params?.examType || 'Admission';
    const studentType = route.params?.studentType || 'Student';
    const [days, setDays] = useState(0);

    useEffect(() => {
        // Simulate timer - typically you'd use actual unlock date
        const timer = setInterval(() => {
            setDays((prev) => (prev + 1) % 7);
        }, 86400000); // 24 hours
        return () => clearInterval(timer);
    }, []);

    return (
        <ScreenWrapper scrollable={true} safeTop={true} backgroundColor={colors.background}>
            <View style={{ paddingHorizontal: spacing.base, paddingVertical: spacing.xl, gap: spacing.xl }}>
                {/* Main Icon */}
                <Animated.View entering={FadeInDown} style={{ alignItems: 'center', marginTop: spacing.xl }}>
                    <View
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: 50,
                            backgroundColor: colors.warningLight,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: spacing.xl,
                            borderWidth: 2,
                            borderColor: colors.warning,
                        }}
                    >
                        <MaterialCommunityIcons name="wrench-clock" size={56} color={colors.warning} />
                    </View>

                    <Text
                        variant="2xl"
                        weight="bold"
                        color="textPrimary"
                        style={{ textAlign: 'center', marginBottom: spacing.md }}
                    >
                        Under Maintenance
                    </Text>

                    <Text
                        variant="sm"
                        color="textSecondary"
                        style={{ textAlign: 'center', marginBottom: spacing.lg }}
                    >
                        আমরা {moduleName} আরও ভালো করছি
                    </Text>
                </Animated.View>

                {/* Module Info Card */}
                <Animated.View entering={FadeInDown.delay(100)}>
                    <Card style={{ backgroundColor: colors.primaryLight, borderLeftWidth: 4, borderLeftColor: colors.primary }}>
                        <View style={{ gap: spacing.md }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Text variant="sm" color="textSecondary">
                                    মডিউল
                                </Text>
                                <Text variant="sm" weight="semibold" color="textPrimary">
                                    {moduleName}
                                </Text>
                            </View>
                            <View style={{ height: 1, backgroundColor: colors.border, opacity: 0.3 }} />
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Text variant="sm" color="textSecondary">
                                    পরীক্ষার ধরন
                                </Text>
                                <Text variant="sm" weight="semibold" color="textPrimary">
                                    {examType}
                                </Text>
                            </View>
                        </View>
                    </Card>
                </Animated.View>

                {/* Message Cards */}
                <Animated.View entering={FadeInDown.delay(200)} style={{ gap: spacing.md }}>
                    <Card style={{ backgroundColor: colors.successLight }}>
                        <View style={{ flexDirection: 'row', gap: spacing.md }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: colors.success,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <MaterialCommunityIcons name="clock-check" size={20} color={colors.textInverse} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="sm" weight="semibold" color="textPrimary" style={{ marginBottom: spacing.xs }}>
                                    শীঘ্রই ফিরে আসুন
                                </Text>
                                <Text variant="xs" color="textSecondary">
                                    আমরা শীঘ্রই এটি চালু করব। অনুগ্রহ করে পরে আবার চেষ্টা করুন।
                                </Text>
                            </View>
                        </View>
                    </Card>

                    <Card style={{ backgroundColor: colors.infoLight }}>
                        <View style={{ flexDirection: 'row', gap: spacing.md }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: colors.info,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <MaterialCommunityIcons name="bell-ring" size={20} color={colors.textInverse} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="sm" weight="semibold" color="textPrimary" style={{ marginBottom: spacing.xs }}>
                                    পুশ নোটিফিকেশন পাবেন
                                </Text>
                                <Text variant="xs" color="textSecondary">
                                    এটি খোলা হলে আমরা আপনাকে অবহিত করব। নোটিফিকেশন সক্ষম রাখুন।
                                </Text>
                            </View>
                        </View>
                    </Card>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View entering={FadeInDown.delay(300)} style={{ gap: spacing.md, marginTop: spacing.lg }}>
                    <Button
                        label="নোটিফিকেশন সেটিংস দেখুন"
                        variant="primary"
                        size="large"
                        onPress={() => navigation.navigate('Home', { screen: 'Notifications' })}
                        leftIcon="bell-ring"
                    />

                    <Button
                        label="ফিরে যান"
                        variant="outline"
                        size="large"
                        onPress={() => navigation.goBack()}
                        leftIcon="arrow-left"
                    />
                </Animated.View>

                {/* Footer Info */}
                <Animated.View entering={FadeInDown.delay(400)} style={{ marginTop: spacing.xl }}>
                    <View
                        style={{
                            padding: spacing.md,
                            backgroundColor: colors.surfaceAlt,
                            borderRadius: spacing.borderRadius.md,
                            alignItems: 'center',
                        }}
                    >
                        <Text variant="xs" color="textSecondary" style={{ textAlign: 'center' }}>
                            আপনার প্রতিক্রিয়া আমাদের উন্নতিতে সাহায্য করে। কোনো প্রশ্ন থাকলে যোগাযোগ করুন।
                        </Text>
                    </View>
                </Animated.View>
            </View>
        </ScreenWrapper>
    );
};
