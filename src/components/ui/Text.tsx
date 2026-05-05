import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

type TextVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
type TextColor = keyof typeof colors;

interface CustomTextProps extends TextProps {
    variant?: TextVariant;
    weight?: TextWeight;
    color?: TextColor;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

const fontSizeMap: Record<TextVariant, number> = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 21,
    '2xl': 25,
    '3xl': 31,
};

const fontWeightMap: Record<TextWeight, '400' | '500' | '600' | '700'> = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
};

const fontFamilyMap: Record<TextWeight, string> = {
    regular: 'Nunito_400Regular',
    medium: 'Nunito_500Medium',
    semibold: 'Nunito_600SemiBold',
    bold: 'Nunito_700Bold',
};

export const Text: React.FC<CustomTextProps> = ({
    variant = 'md',
    weight = 'regular',
    color = 'textPrimary',
    textAlign,
    style,
    ...props
}) => {
    const fontSize = fontSizeMap[variant];
    const fontWeight = fontWeightMap[weight];
    const fontFamily = fontFamilyMap[weight];
    const textColor = colors[color as TextColor] || colors.textPrimary;

    const textStyle = [
        {
            fontSize,
            fontWeight,
            fontFamily,
            color: textColor,
            textAlign: textAlign as any,
        },
        style,
    ];

    return <RNText {...props} style={textStyle} />;
};

export default Text;
