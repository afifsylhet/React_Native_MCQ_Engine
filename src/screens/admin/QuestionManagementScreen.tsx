import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { questionApi } from '../../api/question.api';
import { AdminStackScreenProps } from '../../navigation/types';
import { Question } from '../../types/api.types';

type QuestionPreviewItem = Question & {
    onPress: () => void;
    questionVariants?: string[];
};

const QuestionPreview: React.FC<QuestionPreviewItem> = ({
    _id,
    questionPattern,
    questionVariants,
    question,
    text,
    onPress,
}) => {
    const isMultipleChoice = questionPattern === 'mcq';
    const previewText =
        questionVariants?.[0]?.trim() || question?.trim() || text?.trim() || 'প্রশ্নের টেক্সট পাওয়া যায়নি';

    return (
        <TouchableOpacity
            style={styles.questionCard}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.questionHeader}>
                <View
                    style={[
                        styles.typeBadge,
                        {
                            backgroundColor: isMultipleChoice
                                ? colors.info
                                : colors.success,
                        },
                    ]}
                >
                    <Text variant="xs" weight="semibold" color="textInverse">
                        {isMultipleChoice ? 'এমসিকিউ' : 'সত্য/মিথ্যা'}
                    </Text>
                </View>
                <Text variant="xs" color="textTertiary">
                    ID: {_id?.substring(0, 8)}...
                </Text>
            </View>

            <Text variant="sm" color="textPrimary" numberOfLines={2} style={styles.questionText}>
                {previewText}
            </Text>

            <View style={styles.questionFooter}>
                <Text variant="xs" color="textSecondary">
                    {isMultipleChoice ? 'বহুনির্বাচনী' : 'সত্য/মিথ্যা'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export const QuestionManagementScreen: React.FC<AdminStackScreenProps<'QuestionManagement'>> = ({
    navigation,
}) => {
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        questionPattern: undefined as string | undefined,
    });

    const { data: questionsData, isLoading, isFetching } = useQuery({
        queryKey: ['admin-questions', filters],
        queryFn: () =>
            questionApi.getQuestions({
                ...filters,
                page: filters.page,
                limit: filters.limit,
            }),
        retry: 2,
    });

    const questions = questionsData?.items || [];
    const pagination = questionsData?.pagination;

    const handleLoadMore = useCallback(() => {
        if (pagination && filters.page < pagination.pages) {
            setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
        }
    }, [pagination, filters.page]);

    const handleQuestionPress = useCallback(
        (questionId: string) => {
            navigation.navigate('QuestionDetail', { questionId });
        },
        [navigation]
    );

    if (isLoading && questions.length === 0) {
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
            {/* Header with Add Button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.createButton}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('CreateQuestion')}
                >
                    <Text variant="md" weight="semibold" color="textInverse">
                        + নতুন প্রশ্ন তৈরি করুন
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterTab,
                        !filters.questionPattern && styles.filterTabActive,
                    ]}
                    onPress={() =>
                        setFilters((prev) => ({
                            ...prev,
                            questionPattern: undefined,
                            page: 1,
                        }))
                    }
                >
                    <Text
                        variant="sm"
                        weight="semibold"
                        color={!filters.questionPattern ? 'textInverse' : 'textSecondary'}
                    >
                        সব
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterTab,
                        filters.questionPattern === 'mcq' && styles.filterTabActive,
                    ]}
                    onPress={() =>
                        setFilters((prev) => ({
                            ...prev,
                            questionPattern: 'mcq',
                            page: 1,
                        }))
                    }
                >
                    <Text
                        variant="sm"
                        weight="semibold"
                        color={filters.questionPattern === 'mcq' ? 'textInverse' : 'textSecondary'}
                    >
                        এমসিকিউ
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterTab,
                        filters.questionPattern === 'true_false' && styles.filterTabActive,
                    ]}
                    onPress={() =>
                        setFilters((prev) => ({
                            ...prev,
                            questionPattern: 'true_false',
                            page: 1,
                        }))
                    }
                >
                    <Text
                        variant="sm"
                        weight="semibold"
                        color={
                            filters.questionPattern === 'true_false'
                                ? 'textInverse'
                                : 'textSecondary'
                        }
                    >
                        সত্য/মিথ্যা
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Questions List */}
            <FlatList
                data={questions}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <QuestionPreview
                        {...item}
                        onPress={() => handleQuestionPress(item._id)}
                    />
                )}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    isFetching ? (
                        <View style={styles.loadingFooter}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="lg" color="textSecondary">
                            কোনো প্রশ্ন পাওয়া যায়নি
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />

            {/* Pagination Info */}
            {pagination && (
                <View style={styles.paginationInfo}>
                    <Text variant="xs" color="textSecondary">
                        পেজ {pagination.page} / {pagination.pages} •{' '}
                        মোট {pagination.total}
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
        paddingTop: spacing.base,
        paddingBottom: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    createButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: colors.background,
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: colors.primary,
    },
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
    questionCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeBadge: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    questionText: {
        marginVertical: 8,
        minHeight: 20,
    },
    questionFooter: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingVertical: 8,
        marginTop: 8,
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
    paginationInfo: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
        backgroundColor: colors.surface,
    },
});


