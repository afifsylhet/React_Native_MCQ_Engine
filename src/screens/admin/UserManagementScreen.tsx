import React, { useState, useCallback } from 'react';
import {
    View,
    ActivityIndicator,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { adminApi, GetUsersFilters } from '../../api/admin.api';
import { AdminStackScreenProps } from '../../navigation/types';

interface UserListItemProps {
    _id?: string;
    email: string;
    fullName: string;
    level: number;
    role: string;
    studentType?: string;
    isActive: boolean;
    activeSubscription?: {
        plan: 'quarterly' | 'half_yearly';
        endDate: string;
    } | null;
    onPress: () => void;
}

const PLAN_SHORT_LABEL: Record<'quarterly' | 'half_yearly', string> = {
    quarterly: '৩ মাস',
    half_yearly: '৬ মাস',
};

const ROLE_LABEL: Record<string, string> = {
    admin: 'অ্যাডমিন',
    instructor: 'ইন্সট্রাক্টর',
    student: 'স্টুডেন্ট',
};

type SubscriptionFilter = 'all' | 'free' | 'quarterly' | 'half_yearly';

const UserListItem: React.FC<UserListItemProps> = ({
    email,
    fullName,
    level,
    role,
    isActive,
    activeSubscription,
    onPress,
}) => {
    const isSubscribed = !!activeSubscription;
    return (
        <TouchableOpacity
            style={[styles.userCard, !isActive && styles.inactiveCard]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                    <View style={styles.titleRow}>
                        <Text variant="md" weight="semibold" color="textPrimary" numberOfLines={1}>
                            {fullName}
                        </Text>
                        <View style={styles.levelBadge}>
                            <Text variant="xs" weight="bold" color="textInverse" style={styles.roleBadgeText}>
                                লেভেল {level}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.badgeRow}>
                        <View
                            style={[
                                styles.subBadge,
                                {
                                    backgroundColor: isSubscribed
                                        ? colors.success
                                        : colors.surfaceAlt,
                                },
                            ]}
                        >
                            <Text
                                variant="xs"
                                weight="bold"
                                color={isSubscribed ? 'textInverse' : 'textTertiary'}
                                style={styles.roleBadgeText}
                            >
                                {isSubscribed
                                    ? `✓ ${PLAN_SHORT_LABEL[activeSubscription!.plan] || 'প্রো'}`
                                    : 'ফ্রি'}
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.roleBadge,
                                {
                                    backgroundColor:
                                        role === 'admin'
                                            ? colors.warning
                                            : role === 'instructor'
                                                ? colors.info
                                                : colors.primary,
                                },
                            ]}
                        >
                            <Text
                                variant="xs"
                                weight="semibold"
                                color="textInverse"
                                style={styles.roleBadgeText}
                            >
                                {ROLE_LABEL[role] || role}
                            </Text>
                        </View>
                    </View>
                </View>
                <Text variant="sm" color="textSecondary" numberOfLines={1}>
                    {email}
                </Text>
                {isSubscribed && (
                    <Text variant="xs" color="success" style={styles.subLine}>
                        সাবস্ক্রিপশনের মেয়াদ{' '}
                        {new Date(activeSubscription!.endDate).toLocaleDateString()} পর্যন্ত
                    </Text>
                )}
                {!isActive && (
                    <Text variant="xs" color="danger" style={styles.deactivatedLabel}>
                        নিষ্ক্রিয়
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

export const UserManagementScreen: React.FC<AdminStackScreenProps<'UserManagement'>> = ({
    navigation,
}) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>('all');
    const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const [filters, setFilters] = useState<GetUsersFilters>({
        page: 1,
        limit: 20,
        search: '',
    });

    const { data: usersData, isLoading, error } = useQuery({
        queryKey: ['admin-users', filters],
        queryFn: () => adminApi.getAllUsers(filters),
        retry: 2,
        placeholderData: (previousData) => previousData,
    });

    React.useEffect(() => {
        return () => {
            // Cleanup: clear timeout on unmount
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const users = usersData?.users || [];
    const pagination = usersData?.pagination;

    const filteredUsers = users.filter((user: UserListItemProps) => {
        // Apply subscription filter
        if (subscriptionFilter === 'all') {
            // Subscription filter allows all
        } else if (subscriptionFilter === 'free') {
            if (user.activeSubscription) return false; // Only free users
        } else {
            if (user.activeSubscription?.plan !== subscriptionFilter) return false; // Only matching plan
        }
        return true;
    });

    const handleSearch = useCallback((text: string) => {
        setSearch(text);

        // Clear existing timeout to prevent multiple API calls
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Debounce: wait 300ms before triggering search
        searchTimeoutRef.current = setTimeout(() => {
            setPage(1);
            // Live search: updates after user stops typing
            setFilters((prev) => ({ ...prev, search: text.trim(), page: 1 }));
        }, 300);
    }, []);

    const handleLoadMore = useCallback(() => {
        if (pagination && page < pagination.pages) {
            const nextPage = page + 1;
            setPage(nextPage);
            setFilters((prev) => ({ ...prev, page: nextPage }));
        }
    }, [page, pagination]);

    const handleUserPress = useCallback(
        (email: string, userId?: string) => {
            navigation.navigate('UserDetail', {
                userId: userId || email,
                email,
            });
        },
        [navigation]
    );

    if (isLoading && users.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text variant="md" color="danger">
                        ত্রুটি: {error instanceof Error ? error.message : 'ইউজার লোড করা যায়নি'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
                    placeholderTextColor={colors.textTertiary}
                    value={search}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <View style={styles.filterRow}>
                    {([
                        { id: 'all', label: 'সব' },
                        { id: 'free', label: 'ফ্রি' },
                        { id: 'quarterly', label: '৩ মাস' },
                        { id: 'half_yearly', label: '৬ মাস' },
                    ] as const).map((option) => {
                        const isActive = subscriptionFilter === option.id;

                        return (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => setSubscriptionFilter(option.id)}
                                activeOpacity={0.8}
                                style={[
                                    styles.filterChip,
                                    isActive && styles.filterChipActive,
                                ]}
                            >
                                <Text
                                    variant="xs"
                                    weight="semibold"
                                    color={isActive ? 'textInverse' : 'textSecondary'}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Users List */}
            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item._id || item.email}
                renderItem={({ item, index }) => (
                    <UserListItem
                        {...item}
                        level={(page - 1) * (filters.limit || 20) + index + 1}
                        onPress={() => handleUserPress(item.email, item._id)}
                    />
                )}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    isLoading && filteredUsers.length > 0 ? (
                        <View style={styles.loadingFooter}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="lg" color="textSecondary" style={styles.emptyText}>
                            কোনো ইউজার পাওয়া যায়নি
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                scrollIndicatorInsets={{ right: 1 }}
            />

            {/* Pagination Info */}
            {pagination && (
                <View style={styles.paginationInfo}>
                    <Text variant="xs" color="textSecondary">
                        পেজ {pagination.page} / {pagination.pages} • মোট {pagination.total} জন ইউজার
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: spacing.base,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: 10,
    },
    searchInput: {
        backgroundColor: colors.background,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
    } as any,
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: spacing.base,
        paddingBottom: 12,
    },
    userCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    inactiveCard: {
        opacity: 0.6,
        borderLeftColor: colors.textTertiary,
    },
    userInfo: {
        flex: 1,
    },
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        marginRight: 8,
    },
    levelBadge: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: colors.info,
    },
    roleBadge: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterChip: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    subBadge: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    subLine: {
        marginTop: 6,
    },
    roleBadgeText: {
        letterSpacing: 0.5,
    },
    deactivatedLabel: {
        marginTop: 6,
        fontStyle: 'italic',
    },
    loadingFooter: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        textAlign: 'center',
    },
    paginationInfo: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
        backgroundColor: colors.surface,
    },
});


