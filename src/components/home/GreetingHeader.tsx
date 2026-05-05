import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';
import {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Badge } from '../ui/Badge';
import { getGreeting, getStudentTypeLabel } from '../../utils/formatters';

interface GreetingHeaderProps {
    firstName: string;
    studentType: string;
    unreadNotifications?: number;
    onNotificationPress: () => void;
    style?: ViewStyle;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
    firstName,
    studentType,
    unreadNotifications = 0,
    onNotificationPress,
    style,
}) => {
    const bellScale = useSharedValue(1);
    const displayName = firstName?.trim() || '';

    const handleBellPress = () => {
        bellScale.value = withSpring(0.8, { damping: 10, stiffness: 200 });
        setTimeout(() => {
            bellScale.value = withSpring(1, { damping: 10, stiffness: 200 });
        }, 100);
        onNotificationPress();
    };

    const bellAnimated = useAnimatedStyle(() => {
        return {
            transform: [{ scale: bellScale.value }],
        };
    });

    const studentTypeLabel = getStudentTypeLabel(studentType);

    return (
        <LinearGradient
            colors={['#0A5C75', '#0F7B6C', '#157F9A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, style]}
        >
            <View style={styles.topRow}>
                <View style={styles.textWrap}>
                    <Text
                        style={[
                            styles.greetingText,
                            { marginBottom: displayName ? spacing.xs : spacing.md },
                        ]}
                    >
                        {getGreeting()}! 👋
                    </Text>
                    {displayName ? (
                        <Text style={styles.nameText} numberOfLines={1}>
                            {displayName}
                        </Text>
                    ) : null}
                    <View style={styles.metaRow}>
                        <Badge label={studentTypeLabel} variant="primary" />
                        <View style={styles.learningTag}>
                            <MaterialCommunityIcons
                                name="flash-outline"
                                size={13}
                                color={colors.textInverse}
                            />
                            <Text style={styles.learningTagText}>শেখা চালিয়ে যান</Text>
                        </View>
                    </View>
                </View>

                <Animated.View style={bellAnimated}>
                    <TouchableOpacity onPress={handleBellPress} hitSlop={10}>
                        <View style={styles.bellButton}>
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={22}
                                color={colors.textInverse}
                            />
                            {unreadNotifications > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>
                                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <Text style={styles.helperText}>আজ মনোযোগ দিয়ে অনুশীলনের জন্য প্রস্তুত তো?</Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    textWrap: {
        flex: 1,
        paddingRight: spacing.sm,
    },
    greetingText: {
        fontSize: typography.scale.lg.fontSize,
        fontFamily: 'Sora_700Bold',
        color: colors.textInverse,
    },
    nameText: {
        fontSize: typography.scale.md.fontSize,
        fontFamily: 'Sora_600SemiBold',
        color: colors.textInverse,
        marginBottom: spacing.sm,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    learningTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderRadius: spacing.borderRadius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
    },
    learningTagText: {
        color: colors.textInverse,
        fontFamily: 'Nunito_600SemiBold',
        fontSize: typography.scale.xs.fontSize,
    },
    bellButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.16)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.24)',
        marginTop: 2,
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -3,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    notificationBadgeText: {
        fontSize: 11,
        fontWeight: typography.weights.bold,
        color: colors.textInverse,
    },
    helperText: {
        marginTop: spacing.md,
        color: 'rgba(255, 255, 255, 0.92)',
        fontSize: typography.scale.sm.fontSize,
        fontFamily: 'Nunito_500Medium',
    },
});
