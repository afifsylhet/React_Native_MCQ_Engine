import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    withSpring,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface PlanFeature {
    icon: string;
    text: string;
    included: boolean;
}

interface PlanCardProps {
    title: string;
    price: string;
    period: string;
    description: string;
    badge?: string;
    isPopular?: boolean;
    features: PlanFeature[];
    buttonText: string;
    onPress: () => void;
    isSelected?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
    title,
    price,
    period,
    description,
    badge,
    isPopular = false,
    features,
    buttonText,
    onPress,
    isSelected = false,
}) => {
    const scaleValue = useSharedValue(1);

    const handlePressIn = () => {
        scaleValue.value = withSpring(0.98, { damping: 20, stiffness: 300 });
    };

    const handlePressOut = () => {
        scaleValue.value = withSpring(1, { damping: 20, stiffness: 300 });
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scaleValue.value }],
        };
    });

    const borderColor = isSelected ? colors.primary : colors.surfaceAlt;
    const backgroundColor = isPopular ? colors.primaryLight : colors.surface;

    return (
        <Animated.View
            style={[
                {
                    borderWidth: isSelected ? 2 : 1,
                    borderColor,
                    borderRadius: spacing.borderRadius.lg,
                    padding: spacing.lg,
                    backgroundColor,
                    marginBottom: spacing.base,
                },
                animatedStyle,
            ]}
        >
            {/* Badge */}
            {badge && (
                <View
                    style={{
                        position: 'absolute',
                        top: -12,
                        left: spacing.lg,
                        backgroundColor: colors.accent,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.xs,
                        borderRadius: spacing.borderRadius.md,
                        zIndex: 1,
                    }}
                >
                    <Text
                        style={{
                            fontSize: typography.scale.xs.fontSize,
                            fontFamily: typography.fontBody,
                            fontWeight: typography.weights.bold,
                            color: colors.surface,
                        }}
                    >
                        {badge}
                    </Text>
                </View>
            )}

            {/* Header */}
            <View style={{ marginBottom: spacing.lg }}>
                <Text
                    style={{
                        fontSize: typography.scale.lg.fontSize,
                        fontFamily: typography.fontDisplay,
                        fontWeight: typography.weights.bold,
                        color: colors.textPrimary,
                        marginBottom: spacing.xs,
                    }}
                >
                    {title}
                </Text>
                <Text
                    style={{
                        fontSize: typography.scale.sm.fontSize,
                        fontFamily: typography.fontBody,
                        color: colors.textSecondary,
                    }}
                >
                    {description}
                </Text>
            </View>

            {/* Price */}
            <View
                style={{
                    marginBottom: spacing.lg,
                    paddingBottom: spacing.lg,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.surfaceAlt,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text
                        style={{
                            fontSize: typography.scale['2xl'].fontSize,
                            fontFamily: typography.fontDisplay,
                            fontWeight: typography.weights.bold,
                            color: colors.primary,
                        }}
                    >
                        {price}
                    </Text>
                    <Text
                        style={{
                            fontSize: typography.scale.sm.fontSize,
                            fontFamily: typography.fontBody,
                            color: colors.textSecondary,
                            marginLeft: spacing.xs,
                        }}
                    >
                        {period}
                    </Text>
                </View>
            </View>

            {/* Features */}
            <View style={{ marginBottom: spacing.lg, gap: spacing.md }}>
                {features.map((feature, index) => (
                    <View
                        key={index}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing.md,
                            opacity: feature.included ? 1 : 0.5,
                        }}
                    >
                        <MaterialCommunityIcons
                            name={feature.included ? 'check-circle' : 'close-circle'}
                            size={20}
                            color={feature.included ? colors.success : colors.textTertiary}
                        />
                        <Text
                            style={{
                                fontSize: typography.scale.sm.fontSize,
                                fontFamily: typography.fontBody,
                                color: colors.textPrimary,
                                flex: 1,
                            }}
                        >
                            {feature.text}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Button */}
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.7}
                style={{
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.base,
                    backgroundColor: isSelected ? colors.primary : colors.primaryLight,
                    borderRadius: spacing.borderRadius.md,
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        fontSize: typography.scale.sm.fontSize,
                        fontFamily: typography.fontBody,
                        fontWeight: typography.weights.semibold,
                        color: isSelected ? colors.textInverse : colors.primary,
                    }}
                >
                    {buttonText}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};
