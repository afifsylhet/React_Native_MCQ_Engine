import React from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface DifficultyOption {
    value: string;
    label: string;
}

interface DifficultySelectorProps {
    options: DifficultyOption[];
    selected: string;
    onSelect: (value: string) => void;
    style?: ViewStyle;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
    options,
    selected,
    onSelect,
    style,
}) => {
    return (
        <View style={[{ marginVertical: spacing.md }, style]}>
            <Text
                style={{
                    fontSize: typography.scale.sm.fontSize,
                    fontFamily: typography.fontBody,
                    fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                    marginBottom: spacing.md,
                }}
            >
                কঠিনতা
            </Text>

            <View
                style={{
                    flexDirection: 'row',
                    gap: spacing.sm,
                    flexWrap: 'wrap',
                }}
            >
                {options.map((option) => (
                    <DifficultySelectorItem
                        key={option.value}
                        label={option.label}
                        isSelected={selected === option.value}
                        onPress={() => onSelect(option.value)}
                    />
                ))}
            </View>
        </View>
    );
};

const DifficultySelectorItem: React.FC<{
    label: string;
    isSelected: boolean;
    onPress: () => void;
}> = ({ label, isSelected, onPress }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <TouchableOpacity
            onPress={() => {
                scale.value = withSpring(0.95, { damping: 10, stiffness: 200 });
                setTimeout(() => {
                    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
                    onPress();
                }, 100);
            }}
        >
            <Animated.View
                style={[
                    {
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: spacing.borderRadius.full,
                        borderWidth: 2,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                        borderColor: isSelected ? colors.primary : colors.border,
                    },
                    animatedStyle,
                ]}
            >
                <Text
                    style={{
                        fontSize: typography.scale.sm.fontSize,
                        fontFamily: typography.fontBody,
                        fontWeight: typography.weights.semibold,
                        color: isSelected ? colors.textInverse : colors.textPrimary,
                    }}
                >
                    {label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};
