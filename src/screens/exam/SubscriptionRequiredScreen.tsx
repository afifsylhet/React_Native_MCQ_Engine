import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { ExamStackScreenProps } from '../../navigation/types';

type Props = ExamStackScreenProps<'SubscriptionRequired'>;

export const SubscriptionRequiredScreen: React.FC<Props> = ({
    route,
    navigation,
}) => {
    const { reason = 'category_locked', message } = route.params || {};
    const tabNav = useNavigation<any>();

    const title =
        reason === 'quota_exceeded'
            ? 'ফ্রি প্রশ্ন সীমা শেষ'
            : 'সাবস্ক্রিপশন প্রয়োজন';

    const subtitle =
        message ||
        (reason === 'quota_exceeded'
            ? 'ফ্রি প্ল্যানে সর্বোচ্চ ৫০০টি প্রশ্ন ব্যবহার হয়েছে। সীমাহীনভাবে অনুশীলন চালিয়ে যেতে সাবস্ক্রাইব করুন।'
            : 'মডেল টেস্ট ও অনুশীলন পরীক্ষা শুধুমাত্র সাবস্ক্রাইব করা ব্যবহারকারীদের জন্য। সম্পূর্ণ নার্সিং প্রস্তুতির অভিজ্ঞতা পেতে এখনই সাবস্ক্রাইব করুন।');

    const handleSubscribe = () => {
        // Navigate to Profile tab → Subscription screen
        tabNav.navigate('Profile', { screen: 'Subscription' });
    };

    return (
        <ScreenWrapper scrollable={true} safeTop={true}>
            <View style={{ paddingHorizontal: spacing.base, paddingVertical: spacing.lg, gap: spacing.base }}>
                <Animated.View entering={FadeInDown}>
                    <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
                        <View
                            style={{
                                width: 96,
                                height: 96,
                                borderRadius: 48,
                                backgroundColor: colors.primaryLight,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: spacing.lg,
                            }}
                        >
                            <MaterialCommunityIcons
                                name={reason === 'quota_exceeded' ? 'timer-sand-complete' : 'crown'}
                                size={56}
                                color={colors.primary}
                            />
                        </View>
                        <Text variant="2xl" weight="bold" color="textPrimary" style={{ textAlign: 'center', marginBottom: spacing.sm }}>
                            {title}
                        </Text>
                        <Text variant="sm" color="textSecondary" style={{ textAlign: 'center', paddingHorizontal: spacing.md }}>
                            {subtitle}
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(100)}>
                    <Card
                        style={{
                            backgroundColor: colors.primaryLight,
                            borderLeftWidth: 4,
                            borderLeftColor: colors.primary,
                        }}
                    >
                        <Text variant="md" weight="bold" color="textPrimary" style={{ marginBottom: spacing.md }}>
                            সাবস্ক্রিপশনে যা আনলক হবে
                        </Text>
                        {[
                            'সীমাহীন পূর্বের পরীক্ষার সুযোগ',
                            'মডেল টেস্টে সম্পূর্ণ অ্যাক্সেস',
                            'বিষয়ভিত্তিক অনুশীলন মোড',
                            'পূর্বের সব সালের প্রশ্ন',
                        ].map((item) => (
                            <View
                                key={item}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: spacing.md,
                                    marginBottom: spacing.sm,
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={20}
                                    color={colors.success}
                                />
                                <Text variant="sm" color="textPrimary">
                                    {item}
                                </Text>
                            </View>
                        ))}
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200)}>
                    <Card>
                        <Text variant="sm" weight="semibold" color="textPrimary" style={{ marginBottom: spacing.sm }}>
                            প্ল্যান শুরু মাত্র ৩০০ টাকা থেকে
                        </Text>
                        <View style={{ gap: spacing.sm }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text variant="sm" color="textSecondary">৪ মাস</Text>
                                <Text variant="sm" weight="semibold" color="textPrimary">৩০০ টাকা</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text variant="sm" color="textSecondary">৪ মাস</Text>
                                <Text variant="sm" weight="semibold" color="textPrimary">৫০০ টাকা</Text>
                            </View>
                        </View>
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300)} style={{ gap: spacing.md }}>
                    <Button
                        label="এখনই সাবস্ক্রাইব করুন"
                        variant="primary"
                        size="large"
                        onPress={handleSubscribe}
                        rightIcon="arrow-right"
                    />
                    <Button
                        label="ফিরে যান"
                        variant="outline"
                        size="large"
                        onPress={() => navigation.goBack()}
                    />
                </Animated.View>
            </View>
        </ScreenWrapper>
    );
};
