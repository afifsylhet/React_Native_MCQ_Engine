import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface ExamCategoryCardProps {
    icon: string;
    title: string;
    description: string;
    subtitle?: string;
    onPress: () => void;
    style?: ViewStyle;
}

export const ExamCategoryCard: React.FC<ExamCategoryCardProps> = ({
    icon,
    title,
    description,
    subtitle,
    onPress,
    style,
}) => {
    const scale = useSharedValue(1);

    const handlePress = () => {
        scale.value = withSpring(0.98, { damping: 10, stiffness: 200 });
        setTimeout(() => {
            scale.value = withSpring(1, { damping: 10, stiffness: 200 });
            onPress();
        }, 100);
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
            <Animated.View
                style={[
                    {
                        backgroundColor: colors.surface,
                        borderRadius: spacing.borderRadius.lg,
                        padding: spacing.lg,
                        marginBottom: spacing.lg,
                        shadowColor: colors.textPrimary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 5,
                    },
                    animatedStyle,
                    style,
                ]}
            >
                {/* Icon at top */}
                <View
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: spacing.borderRadius.lg,
                        backgroundColor: colors.primaryLight,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: spacing.md,
                    }}
                >
                    <MaterialCommunityIcons
                        name={icon as any}
                        size={28}
                        color={colors.primary}
                    />
                </View>

                {/* Title and Description */}
                <Text
                    style={{
                        fontSize: typography.scale.lg.fontSize,
                        fontFamily: typography.fontDisplay,
                        fontWeight: typography.weights.bold,
                        color: colors.textPrimary,
                        marginBottom: spacing.sm,
                    }}
                >
                    {title}
                </Text>

                <Text
                    style={{
                        fontSize: typography.scale.base.fontSize,
                        fontFamily: typography.fontBody,
                        color: colors.textSecondary,
                        marginBottom: subtitle ? spacing.md : 0,
                        lineHeight: typography.scale.base.lineHeight,
                    }}
                    numberOfLines={2}
                >
                    {description}
                </Text>

                {subtitle && (
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingTop: spacing.md,
                            borderTopWidth: 1,
                            borderTopColor: colors.border,
                            marginTop: spacing.md,
                        }}
                    >
                        <MaterialCommunityIcons
                            name="information-outline"
                            size={16}
                            color={colors.textTertiary}
                            style={{ marginRight: spacing.sm }}
                        />
                        <Text
                            style={{
                                fontSize: typography.scale.xs.fontSize,
                                fontFamily: typography.fontBody,
                                color: colors.textTertiary,
                            }}
                        >
                            {subtitle}
                        </Text>
                    </View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};
