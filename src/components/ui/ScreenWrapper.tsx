import React from 'react';
import {
    View,
    SafeAreaView,
    ScrollView,
    ViewStyle,
    StatusBar,
} from 'react-native';
import { colors } from '../../theme/colors';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    backgroundColor?: string;
    scrollable?: boolean;
    safeTop?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
    backgroundColor = colors.background,
    scrollable = false,
    safeTop = true,
}) => {
    const content = scrollable ? (
        <ScrollView
            style={{ flex: 1, backgroundColor }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    ) : (
        <View style={{ flex: 1, backgroundColor, ...style }}>{children}</View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
            <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
            {content}
        </SafeAreaView>
    );
};
