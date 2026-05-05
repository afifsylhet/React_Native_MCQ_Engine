import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    RefreshControl,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { adminApi, AdminSubscription } from '../../api/admin.api';
import { User } from '../../types/api.types';
import { AdminStackScreenProps } from '../../navigation/types';

type PlanId = 'quarterly' | 'half_yearly';
const PLAN_OPTIONS: { id: PlanId; label: string; priceBdt: number }[] = [
    { id: 'quarterly', label: '৩ মাস', priceBdt: 300 },
    { id: 'half_yearly', label: '৬ মাস', priceBdt: 500 },
];

const PLAN_SHORT_LABEL: Record<string, string> = {
    quarterly: '৩ মাস',
    half_yearly: '৬ মাস',
};

type Tab = 'pending' | 'active';

const PLAN_COLORS: Record<AdminSubscription['plan'], string> = {
    quarterly: colors.primary,
    half_yearly: colors.success,
};

const daysBetween = (fromIso: string, toIso: string) => {
    const from = new Date(fromIso).getTime();
    const to = new Date(toIso).getTime();
    return Math.max(0, Math.ceil((to - from) / (1000 * 60 * 60 * 24)));
};

interface PendingCardProps {
    item: AdminSubscription;
    onApprove: () => void;
    onReject: () => void;
    isProcessing: boolean;
}

const PendingCard: React.FC<PendingCardProps> = ({
    item,
    onApprove,
    onReject,
    isProcessing,
}) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.userInfo}>
                <Text variant="md" weight="bold" color="textPrimary" numberOfLines={1}>
                    {item.user?.fullName || 'অজানা ইউজার'}
                </Text>
                <Text variant="xs" color="textSecondary" numberOfLines={1}>
                    {item.user?.email}
                </Text>
                {item.user?.phoneNumber ? (
                    <Text variant="xs" color="textTertiary" numberOfLines={1}>
                        {item.user.phoneNumber}
                    </Text>
                ) : null}
            </View>
            <View
                style={[
                    styles.planBadge,
                    { backgroundColor: PLAN_COLORS[item.plan] || colors.primary },
                ]}
            >
                <Text variant="xs" weight="bold" color="textInverse">
                    {PLAN_SHORT_LABEL[item.plan] || item.plan}
                </Text>
            </View>
        </View>

        <View style={styles.details}>
            <View style={styles.detailRow}>
                <Text variant="xs" color="textSecondary">
                    প্ল্যানের মূল্য
                </Text>
                <Text variant="sm" weight="semibold" color="textPrimary">
                    {item.currency === 'BDT' ? '৳' : '₹'}
                    {item.price}
                </Text>
            </View>
            <View style={styles.detailRow}>
                <Text variant="xs" color="textSecondary">
                    পরিশোধিত মূল্য
                </Text>
                <Text variant="sm" weight="semibold" color="textPrimary">
                    {item.currency === 'BDT' ? '৳' : '₹'}
                    {item.paymentAmount ?? '-'}
                </Text>
            </View>
            <View style={styles.detailRow}>
                <Text variant="xs" color="textSecondary">
                    বিকাশ ট্রানজেকশন আইডি
                </Text>
                <Text variant="xs" weight="semibold" color="textPrimary" numberOfLines={1}>
                    {item.transactionId || '-'}
                </Text>
            </View>
            <View style={styles.detailRow}>
                <Text variant="xs" color="textSecondary">
                    অনুরোধের তারিখ
                </Text>
                <Text variant="xs" color="textPrimary">
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
        </View>

        <View style={styles.actions}>
            <TouchableOpacity
                onPress={onReject}
                disabled={isProcessing}
                style={[styles.actionBtn, styles.rejectBtn]}
                activeOpacity={0.7}
            >
                <Text variant="sm" weight="semibold" color="textInverse">
                    বাতিল
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onApprove}
                disabled={isProcessing}
                style={[styles.actionBtn, styles.approveBtn]}
                activeOpacity={0.7}
            >
                <Text variant="sm" weight="semibold" color="textInverse">
                    অনুমোদন
                </Text>
            </TouchableOpacity>
        </View>
    </View>
);

interface ActiveCardProps {
    item: AdminSubscription;
    onCancel: () => void;
    isProcessing: boolean;
}

const ActiveCard: React.FC<ActiveCardProps> = ({ item, onCancel, isProcessing }) => {
    const daysRemaining = daysBetween(new Date().toISOString(), item.endDate);
    const expiringSoon = daysRemaining <= 3;

    return (
        <View style={[styles.card, { borderLeftColor: colors.success }]}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text variant="md" weight="bold" color="textPrimary" numberOfLines={1}>
                        {item.user?.fullName || 'অজানা ইউজার'}
                    </Text>
                    <Text variant="xs" color="textSecondary" numberOfLines={1}>
                        {item.user?.email}
                    </Text>
                    {item.user?.phoneNumber ? (
                        <Text variant="xs" color="textTertiary" numberOfLines={1}>
                            {item.user.phoneNumber}
                        </Text>
                    ) : null}
                </View>
                <View
                    style={[
                        styles.planBadge,
                        { backgroundColor: PLAN_COLORS[item.plan] || colors.primary },
                    ]}
                >
                    <Text variant="xs" weight="bold" color="textInverse">
                        {item.plan.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Text variant="xs" color="textSecondary">
                        মেয়াদ শেষ
                    </Text>
                    <Text
                        variant="xs"
                        weight="semibold"
                        color={expiringSoon ? 'error' : 'textPrimary'}
                    >
                        {new Date(item.endDate).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text variant="xs" color="textSecondary">
                        অবশিষ্ট সময়
                    </Text>
                    <Text
                        variant="xs"
                        weight="semibold"
                        color={expiringSoon ? 'error' : 'success'}
                    >
                        {daysRemaining} দিন
                    </Text>
                </View>
                {item.approvedBy ? (
                    <View style={styles.detailRow}>
                        <Text variant="xs" color="textSecondary">
                            অনুমোদন দিয়েছেন
                        </Text>
                        <Text variant="xs" color="textPrimary" numberOfLines={1}>
                            {item.approvedBy.fullName}
                        </Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={onCancel}
                    disabled={isProcessing}
                    style={[styles.actionBtn, styles.rejectBtn]}
                    activeOpacity={0.7}
                >
                    <Text variant="sm" weight="semibold" color="textInverse">
                        আনসাবস্ক্রাইব
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export const SubscriptionManagementScreen: React.FC<
    AdminStackScreenProps<'SubscriptionManagement'>
> = ({ navigation }) => {
    const queryClient = useQueryClient();
    const [tab, setTab] = useState<Tab>('pending');
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Subscribe-user modal state
    const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<PlanId>('quarterly');

    useEffect(() => {
        const t = setTimeout(() => setDebouncedUserSearch(userSearch.trim()), 300);
        return () => clearTimeout(t);
    }, [userSearch]);

    const userSearchQuery = useQuery({
        queryKey: ['admin-user-search', debouncedUserSearch],
        queryFn: () =>
            adminApi.getAllUsers({
                role: 'student',
                isActive: true,
                search: debouncedUserSearch || undefined,
                page: 1,
                limit: 20,
            }),
        enabled: subscribeModalOpen,
        retry: 1,
    });

    const subscribeUserMutation = useMutation({
        mutationFn: ({ userId, plan }: { userId: string; plan: PlanId }) =>
            adminApi.adminSubscribeUser(userId, plan),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'সাবস্ক্রিপশন সক্রিয় হয়েছে',
                text2: 'ইউজারকে জানানো হয়েছে।',
            });
            queryClient.invalidateQueries({ queryKey: ['admin-active-subscriptions'] });
            closeSubscribeModal();
        },
        onError: (error: unknown) => {
            Toast.show({
                type: 'error',
                text1: 'সক্রিয়করণ ব্যর্থ',
                text2: error instanceof Error ? error.message : 'আবার চেষ্টা করুন।',
            });
        },
    });

    const openSubscribeModal = useCallback(() => {
        setSubscribeModalOpen(true);
    }, []);

    const closeSubscribeModal = useCallback(() => {
        setSubscribeModalOpen(false);
        setUserSearch('');
        setDebouncedUserSearch('');
        setSelectedUser(null);
        setSelectedPlan('quarterly');
    }, []);

    const handleConfirmSubscribe = useCallback(() => {
        if (!selectedUser?._id) return;
        const userId = selectedUser._id;
        const userName = selectedUser.fullName;
        const planLabel = PLAN_OPTIONS.find((p) => p.id === selectedPlan)?.label || selectedPlan;
        Alert.alert(
            'সাবস্ক্রিপশন সক্রিয় করুন',
            `${userName}-এর জন্য ${planLabel} প্ল্যান সক্রিয় করবেন?`,
            [
                { text: 'বাতিল', style: 'cancel' },
                {
                    text: 'সক্রিয় করুন',
                    style: 'default',
                    onPress: () => subscribeUserMutation.mutate({ userId, plan: selectedPlan }),
                },
            ]
        );
    }, [selectedUser, selectedPlan, subscribeUserMutation]);

    const pendingQuery = useQuery({
        queryKey: ['admin-pending-subscriptions', page],
        queryFn: () => adminApi.getPendingSubscriptions(page, 20),
        retry: 1,
        enabled: tab === 'pending',
    });

    const activeQuery = useQuery({
        queryKey: ['admin-active-subscriptions', page, search],
        queryFn: () =>
            adminApi.getActiveSubscriptions({ page, limit: 20, search: search.trim() || undefined }),
        retry: 1,
        enabled: tab === 'active',
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => adminApi.approveSubscription(id),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'সাবস্ক্রিপশন অনুমোদিত',
                text2: 'ইউজারকে জানানো হয়েছে।',
            });
            queryClient.invalidateQueries({ queryKey: ['admin-pending-subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['admin-active-subscriptions'] });
        },
        onError: (error: unknown) => {
            Toast.show({
                type: 'error',
                text1: 'অনুমোদন ব্যর্থ',
                text2: error instanceof Error ? error.message : 'আবার চেষ্টা করুন।',
            });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            adminApi.rejectSubscription(id, reason),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'সাবস্ক্রিপশন প্রত্যাখ্যাত',
                text2: 'ইউজারকে জানানো হয়েছে।',
            });
            queryClient.invalidateQueries({ queryKey: ['admin-pending-subscriptions'] });
        },
        onError: (error: unknown) => {
            Toast.show({
                type: 'error',
                text1: 'প্রত্যাখ্যান ব্যর্থ',
                text2: error instanceof Error ? error.message : 'আবার চেষ্টা করুন।',
            });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            adminApi.cancelUserSubscription(id, reason),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'সাবস্ক্রিপশন বাতিল হয়েছে',
                text2: 'ইউজারকে জানানো হয়েছে।',
            });
            queryClient.invalidateQueries({ queryKey: ['admin-active-subscriptions'] });
        },
        onError: (error: unknown) => {
            Toast.show({
                type: 'error',
                text1: 'বাতিলকরণ ব্যর্থ',
                text2: error instanceof Error ? error.message : 'আবার চেষ্টা করুন।',
            });
        },
    });

    const handleApprove = useCallback(
        (item: AdminSubscription) => {
            Alert.alert(
                'সাবস্ক্রিপশন অনুমোদন করুন',
                `${item.user?.fullName || 'এই ইউজার'}-এর জন্য ${PLAN_SHORT_LABEL[item.plan] || item.plan} প্ল্যান সক্রিয় করবেন?\n\nবিকাশ ট্রানজেকশন আইডি: ${item.transactionId || '-'}\nপরিশোধিত মূল্য: ${item.currency === 'BDT' ? '৳' : '₹'}${item.paymentAmount ?? '-'}`,
                [
                    { text: 'বাতিল', style: 'cancel' },
                    {
                        text: 'অনুমোদন',
                        style: 'default',
                        onPress: () => approveMutation.mutate(item._id),
                    },
                ]
            );
        },
        [approveMutation]
    );

    const handleReject = useCallback(
        (item: AdminSubscription) => {
            Alert.alert(
                'সাবস্ক্রিপশন প্রত্যাখ্যান',
                `${item.user?.fullName || 'এই ইউজার'}-এর ${PLAN_SHORT_LABEL[item.plan] || item.plan} প্ল্যানের অনুরোধ প্রত্যাখ্যান করবেন?`,
                [
                    { text: 'বাতিল', style: 'cancel' },
                    {
                        text: 'প্রত্যাখ্যান',
                        style: 'destructive',
                        onPress: () =>
                            rejectMutation.mutate({ id: item._id, reason: 'Rejected by admin' }),
                    },
                ]
            );
        },
        [rejectMutation]
    );

    const handleCancel = useCallback(
        (item: AdminSubscription) => {
            Alert.alert(
                'ইউজার আনসাবস্ক্রাইব করুন',
                `${item.user?.fullName || 'এই ইউজার'}-এর ${PLAN_SHORT_LABEL[item.plan] || item.plan} প্ল্যান বাতিল করবেন? এতে সাথে সাথে অ্যাক্সেস বন্ধ হয়ে যাবে।`,
                [
                    { text: 'সক্রিয় রাখুন', style: 'cancel' },
                    {
                        text: 'আনসাবস্ক্রাইব',
                        style: 'destructive',
                        onPress: () =>
                            cancelMutation.mutate({ id: item._id, reason: 'Cancelled by admin' }),
                    },
                ]
            );
        },
        [cancelMutation]
    );

    const onTabChange = useCallback((next: Tab) => {
        setTab(next);
        setPage(1);
    }, []);

    const onSearchChange = useCallback((value: string) => {
        setSearch(value);
        setPage(1);
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (tab === 'pending') await pendingQuery.refetch();
        else await activeQuery.refetch();
        setRefreshing(false);
    }, [tab, pendingQuery, activeQuery]);

    const activeData = tab === 'pending' ? pendingQuery.data : activeQuery.data;
    const isLoading =
        tab === 'pending' ? pendingQuery.isLoading : activeQuery.isLoading;
    const subscriptions = activeData?.subscriptions || [];
    const pagination = activeData?.pagination;
    const isProcessing =
        approveMutation.isPending || rejectMutation.isPending || cancelMutation.isPending;
    const unsubscribedUsers = (userSearchQuery.data?.users || []).filter(
        (user: any) => !user.activeSubscription
    );

    const pendingTotal = pendingQuery.data?.pagination?.total ?? 0;
    const activeTotal = activeQuery.data?.pagination?.total ?? 0;

    const renderItem = ({ item }: { item: AdminSubscription }) =>
        tab === 'pending' ? (
            <PendingCard
                item={item}
                onApprove={() => handleApprove(item)}
                onReject={() => handleReject(item)}
                isProcessing={isProcessing}
            />
        ) : (
            <ActiveCard
                item={item}
                onCancel={() => handleCancel(item)}
                isProcessing={isProcessing}
            />
        );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.tabs}>
                    <TouchableOpacity
                        onPress={() => onTabChange('pending')}
                        style={[styles.tab, tab === 'pending' && styles.tabActive]}
                        activeOpacity={0.7}
                    >
                        <Text
                            variant="sm"
                            weight="semibold"
                            color={tab === 'pending' ? 'textInverse' : 'textSecondary'}
                        >
                            অপেক্ষমাণ{pendingTotal ? ` (${pendingTotal})` : ''}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onTabChange('active')}
                        style={[styles.tab, tab === 'active' && styles.tabActive]}
                        activeOpacity={0.7}
                    >
                        <Text
                            variant="sm"
                            weight="semibold"
                            color={tab === 'active' ? 'textInverse' : 'textSecondary'}
                        >
                            সক্রিয়{activeTotal ? ` (${activeTotal})` : ''}
                        </Text>
                    </TouchableOpacity>
                </View>

                {tab === 'active' ? (
                    <View style={styles.searchBox}>
                        <MaterialCommunityIcons
                            name="magnify"
                            size={18}
                            color={colors.textTertiary}
                        />
                        <TextInput
                            value={search}
                            onChangeText={onSearchChange}
                            placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন"
                            placeholderTextColor={colors.textTertiary}
                            style={styles.searchInput}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                        />
                        {search ? (
                            <TouchableOpacity onPress={() => onSearchChange('')}>
                                <MaterialCommunityIcons
                                    name="close-circle"
                                    size={18}
                                    color={colors.textTertiary}
                                />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                ) : null}

                <TouchableOpacity
                    onPress={() => navigation.navigate('PreparationModuleManagement')}
                    style={styles.moduleManageBtn}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="tune-variant" size={16} color={colors.primary} />
                    <Text variant="xs" weight="semibold" color="primary">
                        প্রস্তুতি মডিউল লক/আনলক
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading && subscriptions.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={subscriptions}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    onEndReached={() => {
                        if (pagination && page < pagination.pages) setPage((p) => p + 1);
                    }}
                    onEndReachedThreshold={0.3}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text variant="lg" color="textSecondary">
                                {tab === 'pending'
                                    ? '✓ কোনো অপেক্ষমাণ সাবস্ক্রিপশন নেই'
                                    : search
                                        ? 'মিলে যাওয়া সাবস্ক্রাইবার পাওয়া যায়নি'
                                        : 'এখনো কোনো সক্রিয় সাবস্ক্রাইবার নেই'}
                            </Text>
                            <Text variant="sm" color="textTertiary" style={styles.emptySubtext}>
                                {tab === 'pending' ? 'সব কাজ শেষ!' : 'অন্য কিছু লিখে খুঁজে দেখুন।'}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                    scrollIndicatorInsets={{ right: 1 }}
                />
            )}

            {pagination && pagination.pages > 1 ? (
                <View style={styles.paginationInfo}>
                    <Text variant="xs" color="textSecondary">
                        পেজ {pagination.page} / {pagination.pages}
                    </Text>
                </View>
            ) : null}

            <TouchableOpacity
                style={styles.fab}
                onPress={openSubscribeModal}
                activeOpacity={0.85}
            >
                <MaterialCommunityIcons name="account-plus" size={22} color={colors.textInverse} />
                <Text variant="sm" weight="bold" color="textInverse" style={styles.fabLabel}>
                    ইউজার সাবস্ক্রাইব করুন
                </Text>
            </TouchableOpacity>

            <Modal
                visible={subscribeModalOpen}
                animationType="slide"
                transparent
                onRequestClose={closeSubscribeModal}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalBackdrop}
                >
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHeader}>
                            <Text variant="lg" weight="bold" color="textPrimary">
                                ইউজার সাবস্ক্রাইব করুন
                            </Text>
                            <TouchableOpacity onPress={closeSubscribeModal} hitSlop={10}>
                                <MaterialCommunityIcons
                                    name="close"
                                    size={22}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchBox}>
                            <MaterialCommunityIcons
                                name="magnify"
                                size={18}
                                color={colors.textTertiary}
                            />
                            <TextInput
                                value={userSearch}
                                onChangeText={setUserSearch}
                                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন"
                                placeholderTextColor={colors.textTertiary}
                                style={styles.searchInput}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {userSearch ? (
                                <TouchableOpacity onPress={() => setUserSearch('')}>
                                    <MaterialCommunityIcons
                                        name="close-circle"
                                        size={18}
                                        color={colors.textTertiary}
                                    />
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        <View style={styles.userListWrap}>
                            {userSearchQuery.isLoading ? (
                                <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
                            ) : (
                                <FlatList
                                    data={unsubscribedUsers as User[]}
                                    keyExtractor={(u) => (u._id || u.id) as string}
                                    keyboardShouldPersistTaps="handled"
                                    renderItem={({ item }) => {
                                        const id = (item._id || item.id) as string;
                                        const isSelected =
                                            (selectedUser?._id || selectedUser?.id) === id;
                                        return (
                                            <TouchableOpacity
                                                style={[
                                                    styles.userRow,
                                                    isSelected && styles.userRowSelected,
                                                ]}
                                                onPress={() => setSelectedUser(item)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text
                                                        variant="sm"
                                                        weight="semibold"
                                                        color="textPrimary"
                                                        numberOfLines={1}
                                                    >
                                                        {item.fullName}
                                                    </Text>
                                                    <Text
                                                        variant="xs"
                                                        color="textSecondary"
                                                        numberOfLines={1}
                                                    >
                                                        {item.email}
                                                    </Text>
                                                </View>
                                                {isSelected ? (
                                                    <MaterialCommunityIcons
                                                        name="check-circle"
                                                        size={20}
                                                        color={colors.success}
                                                    />
                                                ) : null}
                                            </TouchableOpacity>
                                        );
                                    }}
                                    ListEmptyComponent={
                                        <Text
                                            variant="sm"
                                            color="textTertiary"
                                            style={{ textAlign: 'center', marginTop: 20 }}
                                        >
                                            {debouncedUserSearch
                                                ? 'কোনো সাবস্ক্রিপশনবিহীন ইউজার পাওয়া যায়নি'
                                                : 'ইউজার খুঁজতে টাইপ করুন'}
                                        </Text>
                                    }
                                />
                            )}
                        </View>

                        <Text
                            variant="sm"
                            weight="semibold"
                            color="textPrimary"
                            style={styles.sectionLabel}
                        >
                            প্ল্যান নির্বাচন করুন
                        </Text>
                        <View style={styles.planChips}>
                            {PLAN_OPTIONS.map((p) => {
                                const active = selectedPlan === p.id;
                                return (
                                    <TouchableOpacity
                                        key={p.id}
                                        onPress={() => setSelectedPlan(p.id)}
                                        style={[styles.planChip, active && styles.planChipActive]}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            variant="sm"
                                            weight="semibold"
                                            color={active ? 'textInverse' : 'textPrimary'}
                                        >
                                            {p.label}
                                        </Text>
                                        <Text
                                            variant="xs"
                                            color={active ? 'textInverse' : 'textSecondary'}
                                        >
                                            ৳{p.priceBdt}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            onPress={handleConfirmSubscribe}
                            disabled={!selectedUser || subscribeUserMutation.isPending}
                            style={[
                                styles.confirmBtn,
                                (!selectedUser || subscribeUserMutation.isPending) &&
                                styles.confirmBtnDisabled,
                            ]}
                            activeOpacity={0.85}
                        >
                            {subscribeUserMutation.isPending ? (
                                <ActivityIndicator color={colors.textInverse} />
                            ) : (
                                <Text variant="md" weight="bold" color="textInverse">
                                    {selectedUser
                                        ? `${selectedUser.fullName}-এর জন্য সক্রিয় করুন`
                                        : 'একজন ইউজার নির্বাচন করুন'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: spacing.base,
        paddingBottom: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: 10,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: colors.surfaceAlt,
        borderRadius: 10,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.surfaceAlt,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 2,
        fontSize: 14,
        color: colors.textPrimary,
    },
    moduleManageBtn: {
        marginTop: 10,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primaryLight,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        flexGrow: 1,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    userInfo: {
        flex: 1,
        marginRight: 8,
    },
    planBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    details: {
        gap: 6,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    approveBtn: {
        backgroundColor: colors.success,
    },
    rejectBtn: {
        backgroundColor: colors.error,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptySubtext: {
        marginTop: 8,
    },
    paginationInfo: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
        backgroundColor: colors.surface,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.primary,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 28,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 4,
    },
    fabLabel: {
        marginLeft: 2,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        paddingBottom: 28,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    userListWrap: {
        height: 240,
        marginTop: 10,
        marginBottom: 8,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: colors.surfaceAlt,
        marginBottom: 6,
    },
    userRowSelected: {
        borderWidth: 1.5,
        borderColor: colors.success,
        backgroundColor: colors.surface,
    },
    sectionLabel: {
        marginTop: 10,
        marginBottom: 8,
    },
    planChips: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    planChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        backgroundColor: colors.surfaceAlt,
        gap: 2,
    },
    planChipActive: {
        backgroundColor: colors.primary,
    },
    confirmBtn: {
        backgroundColor: colors.success,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    confirmBtnDisabled: {
        opacity: 0.5,
    },
});


