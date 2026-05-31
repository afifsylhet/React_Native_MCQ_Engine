import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { adminApi } from '../../api/admin.api';
import { AdminStackScreenProps } from '../../navigation/types';
import Toast from 'react-native-toast-message';

type AdminPlanId = 'quarterly' | 'half_yearly';
const PLAN_LABEL: Record<AdminPlanId, string> = {
    quarterly: '৪ মাস',
    half_yearly: '৪ মাস',
};

const ROLE_LABEL: Record<string, string> = {
    admin: 'অ্যাডমিন',
    instructor: 'ইন্সট্রাক্টর',
    student: 'স্টুডেন্ট',
};

const STUDENT_TYPE_LABEL: Record<string, string> = {
    diploma_midwifery: 'ডিপ্লোমা ইন মিডওয়াইফারি',
    diploma_nursing_midwifery: 'ডিপ্লোমা ইন নার্সিং ও মিডওয়াইফারি',
    bsc_nursing: 'বি.এসসি. ইন নার্সিং',
    post_basic_midwifery: 'পোস্ট বেসিক বি.এসসি. ইন নার্সিং',
    bsc_midwifery: 'পোস্ট বেসিক বি.এসসি. ইন নার্সিং',
};

const EXAM_TYPE_LABEL: Record<string, string> = {
    admission: 'ভর্তি পরীক্ষা',
    license: 'লাইসেন্স পরীক্ষা',
};
const PLAN_PRICE: Record<AdminPlanId, number> = {
    quarterly: 300,
    half_yearly: 500,
};

const INV_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    approved: { label: 'অনুমোদিত', color: '#166534', bg: '#DCFCE7' },
    pending: { label: 'অপেক্ষামাণ', color: '#92400E', bg: '#FEF3C7' },
    rejected: { label: 'প্রত্যাখ্যাত', color: '#991B1B', bg: '#FEE2E2' },
    expired: { label: 'মেয়াদোত্তীর্ণ', color: '#6B7280', bg: '#F3F4F6' },
};

const formatInvDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

interface UserInfo {
    label: string;
    value: string;
}

const InfoRow: React.FC<UserInfo> = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text variant="sm" weight="semibold" color="textSecondary">
            {label}
        </Text>
        <Text variant="md" color="textPrimary" style={styles.infoValue}>
            {value}
        </Text>
    </View>
);

const ActionButton: React.FC<{
    title: string;
    onPress: () => void;
    loading?: boolean;
    variant?: 'danger' | 'success' | 'primary';
}> = ({ title, onPress, loading, variant = 'primary' }) => (
    <TouchableOpacity
        style={[
            styles.actionButton,
            {
                backgroundColor:
                    variant === 'danger'
                        ? colors.danger
                        : variant === 'success'
                            ? colors.success
                            : colors.primary,
            },
        ]}
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.8}
    >
        {loading ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
        ) : (
            <Text variant="md" weight="semibold" color="textInverse">
                {title}
            </Text>
        )}
    </TouchableOpacity>
);

export const UserDetailScreen: React.FC<AdminStackScreenProps<'UserDetail'>> = ({
    route,
    navigation,
}) => {
    const { email, userId } = route.params;
    const queryClient = useQueryClient();
    const [userStatus, setUserStatus] = useState<'active' | 'inactive' | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<AdminPlanId>('quarterly');

    // Fetch user data
    const { data: userData, isLoading } = useQuery({
        queryKey: ['admin-user', userId || email],
        queryFn: () => adminApi.getUser(userId || email),
        retry: 2,
    });

    const user = userData;
    const activeSub = user?.activeSubscription;
    const resolvedUserId = user?._id || user?.id || userId;

    const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
        queryKey: ['admin-user-invoices', resolvedUserId],
        queryFn: () => adminApi.getUserInvoices(resolvedUserId!),
        enabled: !!resolvedUserId,
    });

    const invoices = invoicesData?.subscriptions || [];

    const subscribeMutation = useMutation({
        mutationFn: (plan: AdminPlanId) => {
            const id = user?._id || user?.id;
            if (!id) throw new Error('User ID not available');
            return adminApi.adminSubscribeUser(id, plan);
        },
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'সাবস্ক্রিপশন সক্রিয় হয়েছে',
                text2: 'ইউজারকে জানানো হয়েছে।',
            });
            queryClient.invalidateQueries({ queryKey: ['admin-user', userId || email] });
            queryClient.invalidateQueries({ queryKey: ['admin-user-invoices', resolvedUserId] });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-active-subscriptions'] });
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'সক্রিয় করা যায়নি',
                text2:
                    error?.response?.data?.error?.message ||
                    (error instanceof Error ? error.message : 'আবার চেষ্টা করুন।'),
            });
        },
    });

    const unsubscribeMutation = useMutation({
        mutationFn: (subscriptionId: string) =>
            adminApi.cancelUserSubscription(subscriptionId, 'Cancelled by admin'),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'সাবস্ক্রিপশন বাতিল হয়েছে',
                text2: 'ইউজারকে জানানো হয়েছে।',
            });
            queryClient.invalidateQueries({ queryKey: ['admin-user', userId || email] });
            queryClient.invalidateQueries({ queryKey: ['admin-user-invoices', resolvedUserId] });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-active-subscriptions'] });
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'বাতিল করা যায়নি',
                text2:
                    error?.response?.data?.error?.message ||
                    (error instanceof Error ? error.message : 'আবার চেষ্টা করুন।'),
            });
        },
    });

    const handleSubscribe = () => {
        Alert.alert(
            'সাবস্ক্রিপশন সক্রিয় করুন',
            `${user?.fullName}-এর জন্য ${PLAN_LABEL[selectedPlan]} প্ল্যান (৳${PLAN_PRICE[selectedPlan]}) সক্রিয় করবেন?`,
            [
                { text: 'বাতিল', style: 'cancel' },
                {
                    text: 'সক্রিয় করুন',
                    style: 'default',
                    onPress: () => subscribeMutation.mutate(selectedPlan),
                },
            ]
        );
    };

    const handleUnsubscribe = () => {
        if (!activeSub?._id) return;
        Alert.alert(
            'সাবস্ক্রিপশন বাতিল করুন',
            `${user?.fullName}-এর ${PLAN_LABEL[activeSub.plan as AdminPlanId] || activeSub.plan} প্ল্যান বাতিল করবেন? অ্যাক্সেস সঙ্গে সঙ্গেই বন্ধ হয়ে যাবে।`,
            [
                { text: 'চালু রাখুন', style: 'cancel' },
                {
                    text: 'বাতিল করুন',
                    style: 'destructive',
                    onPress: () => unsubscribeMutation.mutate(activeSub._id),
                },
            ]
        );
    };

    const deactivateMutation = useMutation({
        mutationFn: () => adminApi.deactivateUser(email),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'সফল',
                text2: 'ইউজার অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে',
            });
            setUserStatus('inactive');
            setTimeout(() => navigation.goBack(), 1500);
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'ত্রুটি',
                text2: error.response?.data?.error?.message || 'ইউজার নিষ্ক্রিয় করা যায়নি',
            });
        },
    });

    const reactivateMutation = useMutation({
        mutationFn: () => adminApi.reactivateUser(email),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'সফল',
                text2: 'ইউজার অ্যাকাউন্ট পুনরায় সক্রিয় করা হয়েছে',
            });
            setUserStatus('active');
            setTimeout(() => navigation.goBack(), 1500);
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'ত্রুটি',
                text2: error.response?.data?.error?.message || 'ইউজার পুনরায় সক্রিয় করা যায়নি',
            });
        },
    });

    const isActive = user?.isActive && userStatus !== 'inactive';

    const handleDeactivate = () => {
        Alert.alert(
            'ইউজার নিষ্ক্রিয় করুন',
            `আপনি কি নিশ্চিত ${user?.fullName}-কে নিষ্ক্রিয় করতে চান? তিনি অ্যাপে আর প্রবেশ করতে পারবেন না।`,
            [
                { text: 'বাতিল', onPress: () => { }, style: 'cancel' },
                {
                    text: 'নিষ্ক্রিয় করুন',
                    onPress: () => deactivateMutation.mutate(),
                    style: 'destructive',
                },
            ]
        );
    };

    const handleReactivate = () => {
        Alert.alert(
            'ইউজার পুনরায় সক্রিয় করুন',
            `আপনি কি নিশ্চিত ${user?.fullName}-কে পুনরায় সক্রিয় করতে চান?`,
            [
                { text: 'বাতিল', onPress: () => { }, style: 'cancel' },
                {
                    text: 'সক্রিয় করুন',
                    onPress: () => reactivateMutation.mutate(),
                    style: 'default',
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text variant="lg" color="textSecondary">
                        ইউজার পাওয়া যায়নি
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* User Card Header */}
                <View style={styles.userHeader}>
                    <View style={styles.avatarContainer}>
                        <Text variant="3xl" color="textInverse">
                            {user.fullName?.charAt(0) || 'U'}
                        </Text>
                    </View>
                    <View style={styles.userBasicInfo}>
                        <Text variant="xl" weight="bold" color="textPrimary">
                            {user.fullName}
                        </Text>
                        <Text variant="sm" color="textSecondary">
                            {user.email}
                        </Text>
                        <View style={styles.statusBadge}>
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: isActive ? colors.success : colors.danger },
                                ]}
                            />
                            <Text variant="xs" color={isActive ? 'success' : 'danger'}>
                                {isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* User Details */}
                <View style={styles.section}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        অ্যাকাউন্টের তথ্য
                    </Text>
                    <View style={styles.infoCard}>
                        <InfoRow label="ভূমিকা" value={ROLE_LABEL[user.role] || user.role || 'নেই'} />
                        <View style={styles.divider} />
                        <InfoRow label="স্টুডেন্ট টাইপ" value={(user.studentType && STUDENT_TYPE_LABEL[user.studentType]) || user.studentType?.replace(/_/g, ' ') || 'নেই'} />
                        <View style={styles.divider} />
                        <InfoRow label="পরীক্ষার ধরন" value={(user.examType && EXAM_TYPE_LABEL[user.examType]) || user.examType || 'নেই'} />
                        <View style={styles.divider} />
                        <InfoRow label="ফোন নম্বর" value={user.phoneNumber || 'নেই'} />
                        <View style={styles.divider} />
                        <InfoRow label="যোগ দিয়েছেন" value={new Date(user.createdAt).toLocaleDateString()} />
                    </View>
                </View>

                {/* Subscription */}
                <View style={styles.section}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        সাবস্ক্রিপশন
                    </Text>
                    <View style={styles.infoCard}>
                        {activeSub ? (
                            <View style={styles.subCardContent}>
                                <View style={styles.subHeader}>
                                    <View
                                        style={[
                                            styles.subStatusDot,
                                            { backgroundColor: colors.success },
                                        ]}
                                    />
                                    <Text variant="md" weight="bold" color="success">
                                        সক্রিয় · {PLAN_LABEL[activeSub.plan as AdminPlanId] || activeSub.plan}
                                    </Text>
                                </View>
                                <InfoRow
                                    label="মেয়াদ শেষ"
                                    value={new Date(activeSub.endDate).toLocaleDateString()}
                                />
                                <View style={styles.divider} />
                                <InfoRow
                                    label="পরিশোধিত পরিমাণ"
                                    value={`৳${activeSub.price}`}
                                />
                                <View style={{ padding: 12 }}>
                                    <ActionButton
                                        title={
                                            unsubscribeMutation.isPending
                                                ? 'বাতিল হচ্ছে...'
                                                : 'সাবস্ক্রিপশন বাতিল করুন'
                                        }
                                        onPress={handleUnsubscribe}
                                        loading={unsubscribeMutation.isPending}
                                        variant="danger"
                                    />
                                </View>
                            </View>
                        ) : (
                            <View style={styles.subCardContent}>
                                <View style={styles.subHeader}>
                                    <View
                                        style={[
                                            styles.subStatusDot,
                                            { backgroundColor: colors.textTertiary },
                                        ]}
                                    />
                                    <Text variant="md" weight="semibold" color="textSecondary">
                                        কোনো সক্রিয় সাবস্ক্রিপশন নেই
                                    </Text>
                                </View>
                                <Text
                                    variant="sm"
                                    color="textSecondary"
                                    style={{ paddingHorizontal: 16, paddingTop: 4 }}
                                >
                                    এই ইউজারের জন্য একটি প্ল্যান সক্রিয় করুন।
                                </Text>
                                <View style={styles.planPickerRow}>
                                    {(Object.keys(PLAN_LABEL) as AdminPlanId[]).map((p) => {
                                        const active = selectedPlan === p;
                                        return (
                                            <TouchableOpacity
                                                key={p}
                                                onPress={() => setSelectedPlan(p)}
                                                style={[
                                                    styles.planPickerChip,
                                                    active && styles.planPickerChipActive,
                                                ]}
                                                activeOpacity={0.8}
                                            >
                                                <Text
                                                    variant="sm"
                                                    weight="semibold"
                                                    color={active ? 'textInverse' : 'textPrimary'}
                                                >
                                                    {PLAN_LABEL[p]}
                                                </Text>
                                                <Text
                                                    variant="xs"
                                                    color={active ? 'textInverse' : 'textSecondary'}
                                                >
                                                    ৳{PLAN_PRICE[p]}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                <View style={{ padding: 12 }}>
                                    <ActionButton
                                        title={
                                            subscribeMutation.isPending
                                                ? 'সক্রিয় হচ্ছে...'
                                                : `সাবস্ক্রাইব করুন (${PLAN_LABEL[selectedPlan]})`
                                        }
                                        onPress={handleSubscribe}
                                        loading={subscribeMutation.isPending}
                                        variant="success"
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Invoice History */}
                <View style={styles.section}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        ইনভয়েস ইতিহাস
                    </Text>

                    {invoicesLoading && (
                        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    )}

                    {!invoicesLoading && invoices.length === 0 && (
                        <View style={[styles.infoCard, { paddingVertical: 20, alignItems: 'center' }]}>
                            <Text variant="sm" color="textSecondary">কোনো ইনভয়েস পাওয়া যায়নি</Text>
                        </View>
                    )}

                    {invoices.map((inv: any) => {
                        const sc = INV_STATUS_CONFIG[inv.status] || INV_STATUS_CONFIG.pending;
                        const rows = [
                            { label: 'ইনভয়েস আইডি', value: inv._id ? String(inv._id).slice(-10).toUpperCase() : '—' },
                            { label: 'ক্রয়ের তারিখ', value: formatInvDate(inv.createdAt) },
                            { label: 'প্যাকেজের নাম', value: PLAN_LABEL[inv.plan as AdminPlanId] || inv.plan || '—' },
                            { label: 'পরিশোধিত পরিমাণ', value: inv.paymentAmount ? `৳${inv.paymentAmount}` : '—' },
                            { label: 'ট্রানজেকশন আইডি', value: inv.transactionId || '—' },
                            { label: 'সক্রিয়করণের তারিখ', value: formatInvDate(inv.startDate) },
                            { label: 'মেয়াদ শেষের তারিখ', value: formatInvDate(inv.endDate) },
                            { label: 'পেমেন্টের অবস্থা', value: sc.label },
                        ];
                        return (
                            <View
                                key={inv._id}
                                style={[styles.infoCard, { marginBottom: 12 }]}
                            >
                                {/* Card header: plan name + status badge */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                    }}
                                >
                                    <Text variant="md" weight="bold" color="textPrimary">
                                        {PLAN_LABEL[inv.plan as AdminPlanId] || inv.plan}
                                    </Text>
                                    <View
                                        style={{
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            backgroundColor: sc.bg,
                                            borderRadius: 20,
                                        }}
                                    >
                                        <Text variant="xs" weight="semibold" style={{ color: sc.color }}>
                                            {sc.label}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                {rows.map((row, idx) => (
                                    <View key={row.label}>
                                        <InfoRow label={row.label} value={row.value} />
                                        {idx < rows.length - 1 && <View style={styles.divider} />}
                                    </View>
                                ))}
                            </View>
                        );
                    })}
                </View>

                {/* User Statistics */}
                <View style={styles.section}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        পরিসংখ্যান
                    </Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <Text variant="2xl" weight="bold" color="textPrimary">
                                0
                            </Text>
                            <Text variant="sm" color="textSecondary">
                                পরীক্ষা দেওয়া হয়েছে
                            </Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text variant="2xl" weight="bold" color="textPrimary">
                                0%
                            </Text>
                            <Text variant="sm" color="textSecondary">
                                গড় স্কোর
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        অ্যাকশন
                    </Text>
                    <View style={styles.actionsContainer}>
                        {isActive ? (
                            <ActionButton
                                title={deactivateMutation.isPending ? 'নিষ্ক্রিয় হচ্ছে...' : 'অ্যাকাউন্ট নিষ্ক্রিয় করুন'}
                                onPress={handleDeactivate}
                                loading={deactivateMutation.isPending}
                                variant="danger"
                            />
                        ) : (
                            <ActionButton
                                title={reactivateMutation.isPending ? 'সক্রিয় হচ্ছে...' : 'অ্যাকাউন্ট পুনরায় সক্রিয় করুন'}
                                onPress={handleReactivate}
                                loading={reactivateMutation.isPending}
                                variant="success"
                            />
                        )}
                    </View>
                </View>

                {/* Warning Message */}
                <View style={styles.warningBox}>
                    <Text variant="sm" weight="semibold" color="warning">
                        ⚠️ সতর্কতা
                    </Text>
                    <Text variant="xs" color="textSecondary" style={styles.warningText}>
                        ইউজার নিষ্ক্রিয় করলে তিনি অ্যাপে আর প্রবেশ করতে পারবেন না। পরে আবার সক্রিয় করা যাবে।
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: spacing.base,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    userBasicInfo: {
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingVertical: 12,
        overflow: 'hidden',
    },
    infoRow: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    infoValue: {
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    actionsContainer: {
        gap: 12,
    },
    subCardContent: {
        paddingVertical: 4,
    },
    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    subStatusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    planPickerRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 12,
        paddingTop: 12,
    },
    planPickerChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 2,
    },
    planPickerChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    actionButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    warningBox: {
        backgroundColor: colors.warningLight,
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
        marginBottom: 20,
    },
    warningText: {
        marginTop: 6,
        lineHeight: 18,
    },
});


