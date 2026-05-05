export const typography = {
    fontDisplay: 'Sora_400Regular',
    fontBody: 'Nunito_400Regular',

    // Font sizes and line heights in points
    scale: {
        xs: { fontSize: 13, lineHeight: 18 },
        sm: { fontSize: 15, lineHeight: 22 },
        base: { fontSize: 17, lineHeight: 26 },
        md: { fontSize: 19, lineHeight: 28 },
        lg: { fontSize: 23, lineHeight: 33 },
        xl: { fontSize: 27, lineHeight: 37 },
        '2xl': { fontSize: 33, lineHeight: 43 },
        '3xl': { fontSize: 40, lineHeight: 50 },
    },

    // Font weights
    weights: {
        normal: '400' as const,
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
    },
};

export const springConfig = {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
};
