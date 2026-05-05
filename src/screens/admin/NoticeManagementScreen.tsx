import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { AdminStackScreenProps } from '../../navigation/types';
import { Notice } from '../../api/notice.api';
import { useDeleteNotice, useNotices, useUpdateNotice } from '../../hooks/useNotices';
import { formatRelativeDate, getStudentTypeLabel } from '../../utils/formatters';

const getAuthorName = (notice: Notice): string => {
    if (notice.createdBy && typeof notice.createdBy === 'object') {
        return notice.createdBy.fullName || 'অ্যাডমিন';
    }
    return 'অ্যাডমিন';
};

const getExamTypeLabel = (examType: 'admission' | 'license') => {
    return examType === 'admission' ? 'Admission' : 'License';
};

const getNoticeAudienceLabels = (notice: Notice): string[] => {
    if (!notice.targetModules || notice.targetModules.length === 0) {
        return ['সব টাইপ'];
    }

    const labels = notice.targetModules.map((target) => {
        return `${getExamTypeLabel(target.examType)} - ${getStudentTypeLabel(target.studentType)}`;
    });

    return Array.from(new Set(labels));
};

export const NoticeManagementScreen: React.FC<AdminStackScreenProps<'NoticeManagement'>> = ({
    navigation,
}) => {
    const [page, setPage] = useState(1);
    const { data, isLoading, refetch } = useNotices(page, false);
    const updateNotice = useUpdateNotice();
    const deleteNotice = useDeleteNotice();

    const notices = data?.items || [];
    const pagination = data?.pagination;

    const handleToggleActive = (notice: Notice) => {
        updateNotice.mutate(
            { id: notice._id, payload: { isActive: !notice.isActive } },
            {
                onSuccess: () => {
                    Toast.show({
                        type: 'success',
                        text1: notice.isActive ? 'নোটিশ লুকানো হয়েছে' : 'নোটিশ প্রকাশিত হয়েছে',
                    });
                },
                onError: (err: any) => {
                    Toast.show({ type: 'error', text1: 'ত্রুটি', text2: err.message });
                },
            }
        );
    };

    const handleDelete = (notice: Notice) => {
        Alert.alert('নোটিশ ডিলিট করবেন?', `"${notice.subject}" নোটিশটি স্থায়ীভাবে ডিলিট করবেন?`, [
            { text: 'বাতিল', style: 'cancel' },
            {
                text: 'ডিলিট করুন',
                style: 'destructive',
                onPress: () =>
                    deleteNotice.mutate(notice._id, {
                        onSuccess: () => {
                            Toast.show({ type: 'success', text1: 'নোটিশ ডিলিট হয়েছে' });
                        },
                        onError: (err: any) => {
                            Toast.show({ type: 'error', text1: 'ত্রুটি', text2: err.message });
                        },
                    }),
            },
        ]);
    };

    const renderItem = ({ item }: { item: Notice }) => (

        <View
            style={[
                styles.card,
                { borderLeftColor: item.isActive ? colors.primary : colors.textTertiary },
            ]}
        >
            <View style={styles.cardHeader}>
                <Text variant="md" weight="bold" color="textPrimary" numberOfLines={1} style={{ flex: 1 }}>
                    {item.subject}
                </Text>
                <View
                    style={[
                        styles.statusPill,
                        {
                            backgroundColor: item.isActive
                                ? colors.successLight || colors.primaryLight
                                : colors.surfaceAlt,
                        },
                    ]}
                >
                    <Text
                        variant="xs"
                        weight="semibold"
                        color={item.isActive ? 'success' : 'textTertiary'}
                    >
                        {item.isActive ? 'সক্রিয়' : 'লুকানো'}
                    </Text>
                </View>
            </View>

            <Text variant="sm" color="textSecondary" numberOfLines={2} style={styles.message}>
                {item.message}
            </Text>

            <View style={styles.audienceWrap}>
                {getNoticeAudienceLabels(item).map((label) => (
                    <View key={`${item._id}-${label}`} style={styles.audienceBadge}>
                        <MaterialCommunityIcons
                            name={label === 'সব টাইপ' ? 'account-group' : 'target'}
                            size={12}
                            color={colors.primary}
                        />
                        <Text variant="xs" weight="semibold" color="primary">
                            {label}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.metaRow}>
                <MaterialCommunityIcons name="account-tie" size={12} color={colors.textTertiary} />
                <Text variant="xs" color="textTertiary">
                    {getAuthorName(item)}
                </Text>
                <Text variant="xs" color="textTertiary"> • </Text>
                <Text variant="xs" color="textTertiary">
                    {formatRelativeDate(item.createdAt)}
                </Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
                    onPress={() => handleToggleActive(item)}
                    disabled={updateNotice.isPending}
                >
                    <MaterialCommunityIcons
                        name={item.isActive ? 'eye-off-outline' : 'eye-outline'}
                        size={16}
                        color={colors.primary}
                    />
                    <Text variant="xs" weight="semibold" color="primary">
                        {item.isActive ? 'লুকান' : 'প্রকাশ করুন'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.dangerLight || '#fee' }]}
                    onPress={() => handleDelete(item)}
                    disabled={deleteNotice.isPending}
                >
                    <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={16}
                        color={colors.danger}
                    />
                    <Text variant="xs" weight="semibold" color="danger">
                        ডিলিট
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text variant="md" color="textSecondary">
                    {pagination?.total
                        ? `${pagination.total}টি নোটিশ`
                        : 'এখনো কোনো নোটিশ নেই'}
                </Text>
                <TouchableOpacity
                    style={styles.createBtn}
                    onPress={() => navigation.navigate('CreateNotice')}
                    activeOpacity={0.85}
                >
                    <MaterialCommunityIcons name="plus" size={18} color={colors.textInverse} />
                    <Text variant="sm" weight="semibold" color="textInverse">
                        নতুন নোটিশ
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notices}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MaterialCommunityIcons
                                name="bullhorn-outline"
                                size={40}
                                color={colors.textTertiary}
                            />
                            <Text variant="md" color="textSecondary" style={{ marginTop: 12 }}>
                                এখনো কোনো নোটিশ নেই
                            </Text>
                            <Text variant="sm" color="textTertiary">
                                প্রথম নোটিশ পোস্ট করতে "নতুন নোটিশ"-এ ট্যাপ করুন।
                            </Text>
                        </View>
                    }
                />
            )}

            {pagination && pagination.pages > 1 && (
                <View style={styles.pagination}>
                    <TouchableOpacity
                        onPress={() => setPage(Math.max(1, page - 1))}
                        disabled={page <= 1}
                    >
                        <Text variant="sm" color={page <= 1 ? 'textTertiary' : 'primary'}>
                            ‹ পূর্ববর্তী
                        </Text>
                    </TouchableOpacity>
                    <Text variant="sm" color="textSecondary">
                        পেজ {pagination.page} / {pagination.pages}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setPage(Math.min(pagination.pages, page + 1))}
                        disabled={page >= pagination.pages}
                    >
                        <Text
                            variant="sm"
                            color={page >= pagination.pages ? 'textTertiary' : 'primary'}
                        >
                            পরবর্তী ›
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: spacing.base,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, paddingBottom: 24 },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderLeftWidth: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    message: { marginBottom: 8, lineHeight: 18 },
    audienceWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 10,
    },
    audienceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: colors.primaryLight,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 10,
    },
    actionRow: { flexDirection: 'row', gap: 8 },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});


