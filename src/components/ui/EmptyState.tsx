import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button } from './Button';

export interface EmptyStateProps {
    icon: string;
    title: string;
    subtitle?: string;
    description?: string;
    action?: { label: string; onPress: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    subtitle,
    description,
    action,
}) => {
    const body = subtitle ?? description ?? '';
    return (
        <Animated.View
            entering={FadeInDown}
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: spacing.base,
            }}
        >
            <Animated.View entering={ZoomIn.delay(100)}>
                <MaterialCommunityIcons
                    name={icon as any}
                    size={64}
                    color={colors.textTertiary}
                    style={{ marginBottom: spacing.lg }}
                />
            </Animated.View>

            <Text
                style={{
                    fontSize: typography.scale.lg.fontSize,
                    fontFamily: typography.fontDisplay,
                    fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                    marginBottom: spacing.sm,
                    textAlign: 'center',
                }}
            >
                {title}
            </Text>

            <Text
                style={{
                    fontSize: typography.scale.base.fontSize,
                    fontFamily: typography.fontBody,
                    color: colors.textSecondary,
                    marginBottom: spacing.lg,
                    textAlign: 'center',
                }}
            >
                {body}
            </Text>

            {action && (
                <Button
                    label={action.label}
                    onPress={action.onPress}
                    variant="outline"
                />
            )}
        </Animated.View>
    );
};
