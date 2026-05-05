import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { adminApi, ReportedQuestion } from '../../api/admin.api';
import { AdminStackScreenProps } from '../../navigation/types';

const ReportedQuestionCard: React.FC<
    ReportedQuestion & { onPress: () => void }
> = ({ _id, reportCount = 0, report, reports, onPress }) => {
    const reviewAction = report?.adminReview?.action;
    const isSolved = reviewAction === 'resolved';
    const fallbackReports = reports || [];
    const nestedReports = report?.reports || [];
    const mergedReports = nestedReports.length > 0 ? nestedReports : fallbackReports;
    const latestReportDate = mergedReports
        .map((r: any) => r?.reportedAt || r?.createdAt)
        .filter(Boolean)
        .sort()
        .pop();

    return (
        <TouchableOpacity
            style={styles.reportCard}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.reportHeader}>
                <View style={styles.reportBadge}>
                    <Text variant="sm" weight="bold" color="textInverse">
                        {reportCount}
                    </Text>
                </View>
                <View style={styles.reportInfo}>
                    <Text variant="md" weight="semibold" color="textPrimary" numberOfLines={1}>
                        রিপোর্টকৃত প্রশ্ন
                    </Text>
                    <Text variant="xs" color="textSecondary">
                        {reportCount}টি রিপোর্ট
                    </Text>
                </View>
                <View style={[
                    styles.statusTag,
                    { backgroundColor: isSolved ? colors.successLight : colors.warningLight },
                ]}>
                    <Text variant="xs" weight="semibold" color={isSolved ? 'success' : 'warning'}>
                        {isSolved ? 'Solved' : 'Pending'}
                    </Text>
                </View>
            </View>

            <View style={styles.metaRow}>
                <Text variant="xs" color="textTertiary" style={styles.questionId}>
                    আইডি: {_id?.substring(0, 12)}...
                </Text>
                <Text variant="xs" color="textSecondary">
                    রিপোর্ট তারিখ:{' '}
                    {latestReportDate ? new Date(latestReportDate).toLocaleDateString() : 'N/A'}
                </Text>
            </View>

        </TouchableOpacity>
    );
};

export const ReportManagementScreen: React.FC<AdminStackScreenProps<'ReportManagement'>> = ({
    navigation,
}) => {
    const [page, setPage] = useState(1);

    const { data: reportsData, isLoading, isFetchingNextPage } = useQuery({
        queryKey: ['admin-reports', page],
        queryFn: () => adminApi.getReportedQuestions(page, 20),
        retry: 2,
    });

    const reports = reportsData?.questions || [];
    const pagination = reportsData?.pagination;

    const handleLoadMore = useCallback(() => {
        if (pagination && page < pagination.pages) {
            setPage((prev) => prev + 1);
        }
    }, [page, pagination]);

    const handleReportPress = useCallback(
        (questionId: string, reportCount: number) => {
            navigation.navigate('ReportDetail', {
                questionId,
                reportCount,
            });
        },
        [navigation]
    );

    if (isLoading && reports.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text variant="lg" color="textSecondary">
                    {reports.length > 0
                        ? `${pagination?.total || 0}টি প্রশ্ন রিপোর্ট হয়েছে`
                        : 'কোনো রিপোর্টকৃত প্রশ্ন নেই'}
                </Text>
            </View>

            {/* Reports List */}
            <FlatList
                data={reports}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <ReportedQuestionCard
                        {...item}
                        onPress={() =>
                            handleReportPress(item._id, item.reportCount || 0)
                        }
                    />
                )}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={styles.loadingFooter}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="lg" color="textSecondary">
                            ✓ কোনো রিপোর্টকৃত প্রশ্ন নেই
                        </Text>
                        <Text variant="sm" color="textTertiary" style={styles.emptySubtext}>
                            চমৎকার! সব প্রশ্ন ঠিক আছে।
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
                        পেজ {pagination.page} / {pagination.pages}
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
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: spacing.base,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
    },
    reportCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
    },
    reportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    reportBadge: {
        backgroundColor: colors.warning,
        borderRadius: 8,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    reportInfo: {
        flex: 1,
    },
    statusTag: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginLeft: 8,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    questionId: {
        flex: 1,
    },
    loadingFooter: {
        paddingVertical: 20,
        alignItems: 'center',
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
});


