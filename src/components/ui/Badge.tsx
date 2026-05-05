import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export type BadgeVariant =
    | 'primary'
    | 'success'
    | 'danger'
    | 'error'
    | 'warning'
    | 'info';

export interface BadgeProps {
    label?: string;
    text?: string;
    variant?: BadgeVariant;
    size?: 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';
    style?: ViewStyle;
}

const getVariantColor = (variant: BadgeVariant) => {
    switch (variant) {
        case 'primary':
            return { bg: colors.primaryLight, text: colors.primary };
        case 'success':
            return { bg: colors.successLight, text: colors.success };
        case 'danger':
        case 'error':
            return { bg: colors.dangerLight, text: colors.danger };
        case 'warning':
            return { bg: colors.warningLight, text: colors.warning };
        case 'info':
            return { bg: colors.infoLight, text: colors.info };
    }
};

export const Badge: React.FC<BadgeProps> = ({
    label,
    text: textProp,
    variant = 'primary',
    style,
}) => {
    const { bg, text } = getVariantColor(variant);
    const content = label ?? textProp ?? '';

    return (
        <View
            style={[
                {
                    backgroundColor: bg,
                    borderRadius: spacing.borderRadius.full,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    alignSelf: 'flex-start',
                },
                style,
            ]}
        >
            <Text
                style={{
                    fontSize: typography.scale.xs.fontSize,
                    fontFamily: typography.fontBody,
                    fontWeight: typography.weights.semibold,
                    color: text,
                }}
            >
                {content}
            </Text>
        </View>
    );
};
