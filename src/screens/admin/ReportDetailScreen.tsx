import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { adminApi } from '../../api/admin.api';
import { AdminStackScreenProps } from '../../navigation/types';
import Toast from 'react-native-toast-message';

interface ReportedByUser {
    _id?: string;
    fullName?: string;
    email?: string;
}

interface Report {
    _id?: string;
    reportedBy: string | ReportedByUser;
    reason: string;
    description?: string;
    reportedAt?: string;
    createdAt?: string;
}

const ReportItem: React.FC<Report> = ({ reportedBy, reason, description, reportedAt, createdAt }) => {
    const reporter =
        typeof reportedBy === 'object' && reportedBy
            ? reportedBy.fullName || reportedBy.email || 'অজানা ইউজার'
            : 'অজানা ইউজার';
    const reporterEmail =
        typeof reportedBy === 'object' && reportedBy?.email ? reportedBy.email : null;
    const timestamp = reportedAt || createdAt;

    return (
        <View style={styles.reportItem}>
            <View style={styles.reportHeader}>
                <View style={{ flex: 1 }}>
                    <Text variant="sm" weight="semibold" color="textPrimary">
                        {reporter}
                    </Text>
                    {reporterEmail && (
                        <Text variant="xs" color="textTertiary">
                            {reporterEmail}
                        </Text>
                    )}
                </View>
                <Text variant="xs" color="textTertiary">
                    {timestamp ? new Date(timestamp).toLocaleDateString() : ''}
                </Text>
            </View>
            <Text variant="sm" color="textSecondary" weight="semibold" style={styles.reason}>
                {reason}
            </Text>
            {description && (
                <Text variant="sm" color="textSecondary" style={styles.description}>
                    {description}
                </Text>
            )}
        </View>
    );
};

const ActionButton: React.FC<{
    title: string;
    onPress: () => void;
    loading?: boolean;
    variant?: 'success' | 'danger' | 'primary';
}> = ({ title, onPress, loading, variant = 'primary' }) => {
    const bgColor =
        variant === 'success'
            ? colors.success
            : variant === 'danger'
                ? colors.danger
                : colors.primary;

    return (
        <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: bgColor }]}
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
};

export const ReportDetailScreen: React.FC<AdminStackScreenProps<'ReportDetail'>> = ({
    route,
    navigation,
}) => {
    const { questionId, reportCount } = route.params;
    const [adminNotes, setAdminNotes] = useState('');

    // Fetch question and reports
    const { data: questionData, isLoading } = useQuery({
        queryKey: ['admin-question-reports', questionId],
        queryFn: () => adminApi.getQuestionReports(questionId),
        retry: 2,
    });

    const reports = questionData?.report?.reports || [];

    const resolveMutation = useMutation({
        mutationFn: (action: 'resolved' | 'dismissed' | 'deleted') =>
            adminApi.clearReports(questionId, action, adminNotes),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'সফল',
                text2: 'রিপোর্ট প্রসেস করা হয়েছে',
            });
            setTimeout(() => navigation.goBack(), 1500);
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'ত্রুটি',
                text2: error.response?.data?.error?.message || 'রিপোর্ট প্রসেস করা যায়নি',
            });
        },
    });

    const handleResolve = (action: 'resolved' | 'dismissed' | 'deleted') => {
        const messages = {
            resolved: 'এটিকে সমাধান হিসেবে চিহ্নিত করবেন?',
            deleted: 'এই প্রশ্নটি ডিলিট করবেন? এই অ্যাকশনটি ফিরিয়ে আনা যাবে না।',
            dismissed: 'এই প্রশ্নটি যেমন আছে তেমনই রাখবেন?',
        };

        Alert.alert('অ্যাকশন নিশ্চিত করুন', messages[action], [
            { text: 'বাতিল', onPress: () => { }, style: 'cancel' },
            {
                text: 'চালিয়ে যান',
                onPress: () => resolveMutation.mutate(action),
                style: action === 'deleted' ? 'destructive' : 'default',
            },
        ]);
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

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Report Summary */}
                <View style={styles.section}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        রিপোর্ট সারসংক্ষেপ
                    </Text>
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryItem}>
                            <Text variant="sm" color="textSecondary">
                                প্রশ্নের আইডি
                            </Text>
                            <Text variant="md" weight="semibold" color="textPrimary">
                                {questionId.substring(0, 12)}...
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryItem}>
                            <Text variant="sm" color="textSecondary">
                                মোট রিপোর্ট
                            </Text>
                            <Text variant="2xl" weight="bold" color="warning">
                                {reportCount}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Reports List */}
                <View style={styles.section}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        রিপোর্ট ({reports.length})
                    </Text>
                    <View style={styles.reportsList}>
                        {reports.length > 0 ? (
                            reports.map((report: any, index: number) => (
                                <View key={report._id || `report-${index}`}>
                                    <ReportItem {...report} />
                                    {index < reports.length - 1 && <View style={styles.divider} />}
                                </View>
                            ))
                        ) : (
                            <Text variant="sm" color="textSecondary">
                                কোনো রিপোর্ট পাওয়া যায়নি
                            </Text>
                        )}
                    </View>
                </View>

                {/* Admin Actions */}
                <View style={styles.section}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        অ্যাকশন
                    </Text>

                    <View style={styles.quickActionsRow}>
                        <TouchableOpacity
                            style={styles.quickActionBtn}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('EditQuestion', { questionId })}
                        >
                            <Text variant="sm" weight="semibold" color="primary">
                                ✏️ প্রশ্ন সম্পাদনা করুন
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.notesWrap}>
                        <Text variant="sm" color="textSecondary" style={{ marginBottom: 8 }}>
                            অ্যাডমিন নোট (ঐচ্ছিক)
                        </Text>
                        <TextInput
                            style={styles.notesInput}
                            placeholder="রিপোর্ট প্রসেস করার আগে নোট লিখুন..."
                            placeholderTextColor={colors.textTertiary}
                            value={adminNotes}
                            onChangeText={setAdminNotes}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            editable={!resolveMutation.isPending}
                        />
                    </View>

                    <View style={styles.actionsContainer}>
                        <ActionButton
                            title={resolveMutation.isPending ? 'প্রসেস হচ্ছে...' : '✓ সমাধান হয়েছে'}
                            onPress={() => handleResolve('resolved')}
                            loading={resolveMutation.isPending}
                            variant="success"
                        />
                        <ActionButton
                            title={resolveMutation.isPending ? 'প্রসেস হচ্ছে...' : '⚠️ প্রশ্ন ডিলিট করুন'}
                            onPress={() => handleResolve('deleted')}
                            loading={resolveMutation.isPending}
                            variant="danger"
                        />
                        <ActionButton
                            title={resolveMutation.isPending ? 'প্রসেস হচ্ছে...' : '- প্রশ্ন রেখে দিন'}
                            onPress={() => handleResolve('dismissed')}
                            loading={resolveMutation.isPending}
                            variant="primary"
                        />
                    </View>
                </View>

                {/* Info Message */}
                <View style={styles.infoBox}>
                    <Text variant="sm" weight="semibold" color="info">
                        ℹ️ নোট
                    </Text>
                    <Text variant="xs" color="textSecondary" style={styles.infoText}>
                        • সমাধান হয়েছে: কোনো অ্যাকশন ছাড়াই সব রিপোর্ট মুছে দেয়
                        {'\n'}• ডিলিট: সিস্টেম থেকে প্রশ্নটি সরিয়ে দেয়
                        {'\n'}• রেখে দিন: রিপোর্ট মুছে দেয় কিন্তু প্রশ্নটি রেখে দেয়
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
        paddingTop: spacing.sm,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    summaryBox: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingVertical: 12,
        overflow: 'hidden',
    },
    summaryItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 16,
    },
    reportsList: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        overflow: 'hidden',
    },
    reportItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    reason: {
        marginTop: 4,
        color: colors.warning,
    },
    description: {
        marginTop: 8,
        lineHeight: 18,
        fontStyle: 'italic',
    },
    actionsContainer: {
        gap: 12,
    },
    quickActionsRow: {
        marginBottom: 10,
    },
    quickActionBtn: {
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notesWrap: {
        marginBottom: 12,
    },
    notesInput: {
        backgroundColor: colors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 86,
        color: colors.textPrimary,
        fontSize: 14,
    },
    actionButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoBox: {
        backgroundColor: colors.infoLight,
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.info,
        marginBottom: 20,
    },
    infoText: {
        marginTop: 8,
        lineHeight: 20,
    },
});


