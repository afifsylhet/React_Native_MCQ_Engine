import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { ProfileStackScreenProps } from '../../navigation/types';

type NotificationSettingsScreenProps = ProfileStackScreenProps<'NotificationSettings'>;

const banglaFont = Platform.OS === 'android' ? 'sans-serif' : 'System';

interface NotificationItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    enabled: boolean;
}

const DEFAULT_ITEMS: NotificationItem[] = [
    {
        id: 'exam_results',
        title: 'পরীক্ষার ফলাফল',
        description: 'পরীক্ষা শেষ করলে নোটিফিকেশন পান',
        icon: 'checkbox-marked-circle-outline',
        enabled: true,
    },
    {
        id: 'achievements',
        title: 'অর্জন',
        description: 'নতুন ব্যাজ ও মাইলফলক উদযাপন করুন',
        icon: 'medal-outline',
        enabled: true,
    },
    {
        id: 'study_reminders',
        title: 'পড়ার রিমাইন্ডার',
        description: 'স্ট্রিক ধরে রাখতে দৈনিক রিমাইন্ডার',
        icon: 'bell-ring-outline',
        enabled: true,
    },
    {
        id: 'leaderboard_updates',
        title: 'লিডারবোর্ড আপডেট',
        description: 'র‍্যাঙ্ক পরিবর্তন ও মাইলফলকের ঘোষণা',
        icon: 'trophy-outline',
        enabled: true,
    },
    {
        id: 'app_updates',
        title: 'অ্যাপ আপডেট',
        description: 'নতুন ফিচার, নোটিশ ও গুরুত্বপূর্ণ ঘোষণা',
        icon: 'information-outline',
        enabled: true,
    },
];

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({
    navigation,
}) => {
    const [items, setItems] = useState<NotificationItem[]>(DEFAULT_ITEMS);

    const toggleItem = (id: string) => {
        setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, enabled: !it.enabled } : it))
        );
    };

    const muteAll = () => {
        setItems((prev) => prev.map((it) => ({ ...it, enabled: false })));
    };

    const handleSave = () => {
        // TODO: persist preferences to backend when the preferences endpoint is ready
        navigation.goBack();
    };

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
                            fontFamily: banglaFont,
                            fontWeight: typography.weights.bold,
                            color: colors.textPrimary,
                            marginBottom: spacing.md,
                        }}
                    >
                        নোটিফিকেশন সেটিংস
                    </Text>

                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: banglaFont,
                            color: colors.textSecondary,
                        }}
                    >
                        কোন অ্যালার্ট পেতে চান তা বেছে নিন।
                    </Text>
                </Animated.View>

                <View style={{ paddingHorizontal: spacing.base, paddingVertical: spacing.lg }}>
                    {items.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            entering={FadeInDown.delay(index * 40)}
                            style={{ marginBottom: spacing.md }}
                        >
                            <Card>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: spacing.base,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: spacing.borderRadius.md,
                                            backgroundColor: colors.primaryLight,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name={item.icon as any}
                                            size={20}
                                            color={colors.primary}
                                        />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={{
                                                fontSize: typography.scale.sm.fontSize,
                                                fontFamily: banglaFont,
                                                fontWeight: typography.weights.bold,
                                                color: colors.textPrimary,
                                            }}
                                        >
                                            {item.title}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: typography.scale.xs.fontSize,
                                                fontFamily: banglaFont,
                                                color: colors.textSecondary,
                                                marginTop: spacing.xs,
                                            }}
                                            numberOfLines={2}
                                        >
                                            {item.description}
                                        </Text>
                                    </View>

                                    <Switch
                                        value={item.enabled}
                                        onValueChange={() => toggleItem(item.id)}
                                        trackColor={{
                                            false: colors.surfaceAlt,
                                            true: colors.primaryLight,
                                        }}
                                        thumbColor={item.enabled ? colors.primary : colors.textTertiary}
                                    />
                                </View>
                            </Card>
                        </Animated.View>
                    ))}
                </View>

                <Animated.View
                    entering={FadeInDown.delay(240)}
                    style={{
                        paddingHorizontal: spacing.base,
                        paddingBottom: spacing.lg,
                        gap: spacing.base,
                    }}
                >
                    <Button
                        title="সেটিংস সেভ করুন"
                        variant="primary"
                        size="large"
                        onPress={handleSave}
                        rightIcon="check"
                    />
                    <Button
                        title="সব নিঃশব্দ করুন"
                        variant="secondary"
                        size="large"
                        onPress={muteAll}
                        leftIcon="bell-off-outline"
                    />
                </Animated.View>

                <View style={{ height: spacing.lg }} />
            </ScrollView>
        </ScreenWrapper>
    );
};
