import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export interface CardProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    shadow = true,
}) => {
    return (
        <View
            style={[
                {
                    backgroundColor: colors.surface,
                    borderRadius: spacing.borderRadius.lg,
                    padding: spacing.base,
                    ...(shadow && {
                        shadowColor: colors.textPrimary,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }),
                },
                style,
            ]}
        >
            {children}
        </View>
    );
};
