import React, { useEffect } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface SkeletonCardProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
    count?: number;
}

interface SkeletonTextProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
}

// Define _SkeletonPulse first so it can be used by other components
const _SkeletonPulse: React.FC<{
    width: number | string;
    height: number;
    borderRadius: number;
    style?: StyleProp<ViewStyle>;
}> = ({ width, height, borderRadius, style }) => {
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 1000 }),
            -1,
            true
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: colors.border,
                },
                animatedStyle,
                style,
            ]}
        />
    );
};

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
    width = '100%',
    height = 80,
    borderRadius = spacing.borderRadius.lg,
    style,
    count = 1,
}) => {
    return (
        <View>
            {Array.from({ length: count }).map((_, i) => (
                <_SkeletonPulse
                    key={i}
                    width={width}
                    height={height}
                    borderRadius={borderRadius}
                    style={[{ marginBottom: spacing.md }, style]}
                />
            ))}
        </View>
    );
};

export const SkeletonText: React.FC<SkeletonTextProps> = ({
    width = '100%',
    height = 14,
    borderRadius = spacing.borderRadius.sm,
    style,
}) => {
    return (
        <_SkeletonPulse
            width={width}
            height={height}
            borderRadius={borderRadius}
            style={style}
        />
    );
};
