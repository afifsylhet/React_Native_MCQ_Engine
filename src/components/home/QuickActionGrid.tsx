import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    ViewStyle,
    FlatList,
} from 'react-native';
import {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface QuickActionItem {
    id: string;
    icon: string;
    label: string;
    onPress: () => void;
    color: string;
}

interface QuickActionGridProps {
    items: QuickActionItem[];
    style?: ViewStyle;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
    items,
    style,
}) => {
    const renderItem = ({ item, index }: { item: QuickActionItem; index: number }) => (
        <QuickActionCard
            item={item}
            index={index}
            delay={index * 100}
        />
    );

    return (
        <View style={[{ marginHorizontal: -spacing.base }, style]}>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{
                    paddingHorizontal: spacing.base,
                    gap: spacing.md,
                    marginBottom: spacing.md,
                }}
                scrollEnabled={false}
            />
        </View>
    );
};

const QuickActionCard: React.FC<{
    item: QuickActionItem;
    index: number;
    delay: number;
}> = ({ item, index, delay }) => {
    const scale = useSharedValue(1);
    const [pressed, setPressed] = useState(false);

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
                    item.onPress();
                }, 100);
            }}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            activeOpacity={0.7}
            style={{ flex: 1 }}
        >
            <Animated.View
                style={[
                    {
                        backgroundColor: colors.surface,
                        borderRadius: spacing.borderRadius.lg,
                        padding: spacing.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                        aspectRatio: 1,
                        borderWidth: 1.5,
                        borderColor: colors.border,
                        ...(!pressed && {
                            shadowColor: colors.textPrimary,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                        }),
                        opacity: pressed ? 0.7 : 1,
                    },
                    animatedStyle,
                ]}
            >
                <MaterialCommunityIcons
                    name={item.icon as any}
                    size={32}
                    color={item.color}
                    style={{ marginBottom: spacing.sm }}
                />
                <Text
                    style={{
                        fontSize: typography.scale.sm.fontSize,
                        fontFamily: typography.fontBody,
                        fontWeight: typography.weights.semibold,
                        color: colors.textPrimary,
                        textAlign: 'center',
                    }}
                    numberOfLines={2}
                >
                    {item.label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};
