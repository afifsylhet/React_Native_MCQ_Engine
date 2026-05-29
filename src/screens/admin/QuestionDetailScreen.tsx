import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { adminApi } from '../../api/admin.api';
import { AdminStackScreenProps } from '../../navigation/types';
import Toast from 'react-native-toast-message';

const STUDENT_TYPE_LABEL: Record<string, string> = {
    diploma_midwifery: 'ডিপ্লোমা ইন মিডওয়াইফারি',
    diploma_nursing_midwifery: 'ডিপ্লোমা ইন নার্সিং ও মিডওয়াইফারি',
    bsc_nursing: 'বি.এসসি. ইন নার্সিং',
    post_basic_midwifery: 'পোস্ট বেসিক বি.এসসি. ইন নার্সিং',
    bsc_midwifery: 'পোস্ট বেসিক বি.এসসি. ইন নার্সিং',
};

const EXAM_TYPE_LABEL: Record<string, string> = {
    license: 'লাইসেন্স',
    admission: 'অ্যাডমিশন',
    final: 'ফাইনাল',
    midterm: 'মিডটার্ম',
};

const DIFFICULTY_LABEL: Record<string, string> = {
    easy: 'সহজ',
    medium: 'মাঝারি',
    hard: 'কঠিন',
};

const ActionButton: React.FC<{
    title: string;
    onPress: () => void;
    loading?: boolean;
    variant?: 'danger' | 'primary';
}> = ({ title, onPress, loading, variant = 'primary' }) => (
    <TouchableOpacity
        style={[
            styles.actionButton,
            {
                backgroundColor: variant === 'danger' ? colors.danger : colors.primary,
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

export const QuestionDetailScreen: React.FC<AdminStackScreenProps<'QuestionDetail'>> = ({
    route,
    navigation,
}) => {
    const { questionId } = route.params;

    // Fetch question data
    const { data: question, isLoading, error, isError } = useQuery({
        queryKey: ['admin-question', questionId],
        queryFn: () => adminApi.getQuestion(questionId),
        retry: 2,
    });

    const deleteMutation = useMutation({
        mutationFn: () => adminApi.deleteQuestion(questionId),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'সফল',
                text2: 'প্রশ্ন সফলভাবে ডিলিট হয়েছে',
            });
            setTimeout(() => navigation.goBack(), 1500);
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'ত্রুটি',
                text2: error.response?.data?.error?.message || 'প্রশ্ন ডিলিট করা যায়নি',
            });
        },
    });

    const handleDelete = () => {
        Alert.alert(
            'প্রশ্ন ডিলিট করুন',
            'আপনি কি সত্যিই এই প্রশ্নটি ডিলিট করতে চান? এই অ্যাকশনটি ফিরিয়ে আনা যাবে না।',
            [
                { text: 'বাতিল', onPress: () => { }, style: 'cancel' },
                {
                    text: 'ডিলিট করুন',
                    onPress: () => deleteMutation.mutate(),
                    style: 'destructive',
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.section, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (isError || !question) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.section, { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
                    <Text variant="lg" color="danger" weight="semibold" style={{ marginBottom: 10, textAlign: 'center' }}>
                        {isError ? 'প্রশ্ন লোড করা যায়নি' : 'প্রশ্ন পাওয়া যায়নি'}
                    </Text>
                    <Text variant="sm" color="textTertiary" style={{ marginBottom: 15, textAlign: 'center' }}>
                        আইডি: {questionId}
                    </Text>
                    {isError && error && (
                        <Text variant="sm" color="textSecondary" style={{ textAlign: 'center', marginBottom: 20 }}>
                            {(error as any)?.message || 'প্রশ্ন আনার সময় সমস্যা হয়েছে'}
                        </Text>
                    )}
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text variant="md" weight="semibold" color="textInverse">
                            ফিরে যান
                        </Text>
                    </TouchableOpacity>
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
                {/* Question ID */}
                <View style={styles.section}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        প্রশ্নের আইডি
                    </Text>
                    <View style={styles.idBox}>
                        <Text variant="sm" color="textPrimary" style={{ fontFamily: 'monospace' }}>
                            {question?._id || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Question Variants */}
                <View style={styles.section}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        প্রশ্নের ভ্যারিয়েন্ট ({question?.questionVariants?.length || 0})
                    </Text>
                    {question?.questionVariants && question.questionVariants.length > 0 ? (
                        <View>
                            {question.questionVariants.map((variant: string, index: number) => (
                                <View key={index} style={styles.variantBox}>
                                    <View style={styles.variantHeader}>
                                        <View style={styles.variantBadge}>
                                            <Text variant="xs" weight="bold" color="textInverse">
                                                V{index + 1}
                                            </Text>
                                        </View>
                                        <Text variant="xs" color="textTertiary">
                                            ভ্যারিয়েন্ট {index + 1} / {question.questionVariants.length}
                                        </Text>
                                    </View>
                                    <Text variant="md" color="textPrimary" style={styles.variantText}>
                                        {variant}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text variant="sm" color="textSecondary">
                            কোনো ভ্যারিয়েন্ট নেই
                        </Text>
                    )}
                </View>

                {/* Question Details */}
                <View style={styles.section}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        বিবরণ
                    </Text>
                    <View style={styles.detailsBox}>
                        <View style={styles.detailRow}>
                            <Text variant="sm" color="textSecondary">
                                ধরন
                            </Text>
                            <Text variant="sm" weight="semibold" color="textPrimary">
                                {question?.questionPattern === 'mcq' ? 'বহুনির্বাচনী (এমসিকিউ)' : 'সত্য/মিথ্যা'}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text variant="sm" color="textSecondary">
                                স্টুডেন্ট টাইপ
                            </Text>
                            <Text variant="sm" weight="semibold" color="textPrimary">
                                {question?.studentType ? (STUDENT_TYPE_LABEL[question.studentType] || question.studentType) : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text variant="sm" color="textSecondary">
                                পরীক্ষার ধরন
                            </Text>
                            <Text variant="sm" weight="semibold" color="textPrimary">
                                {question?.examType ? (EXAM_TYPE_LABEL[question.examType] || question.examType) : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text variant="sm" color="textSecondary">
                                বিষয়
                            </Text>
                            <Text variant="sm" weight="semibold" color="textPrimary">
                                {question?.subjectName || 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text variant="sm" color="textSecondary">
                                অধ্যায়
                            </Text>
                            <Text variant="sm" weight="semibold" color="textPrimary">
                                {question?.chapterName || 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text variant="sm" color="textSecondary">
                                কঠিনতা
                            </Text>
                            <Text variant="sm" weight="semibold" color="textPrimary">
                                {question?.difficulty ? (DIFFICULTY_LABEL[question.difficulty] || question.difficulty) : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text variant="sm" color="textSecondary">
                                সাল
                            </Text>
                            <Text variant="sm" weight="semibold" color="textPrimary">
                                {question?.year || 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text variant="sm" color="textSecondary">
                                নম্বর
                            </Text>
                            <Text variant="sm" weight="semibold" color="textPrimary">
                                {question?.totalMarkOfTheQuestion || 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text variant="sm" color="textSecondary">
                                স্ট্যাটাস
                            </Text>
                            <Text
                                variant="sm"
                                weight="semibold"
                                color={question?.isActive ? 'success' : 'danger'}
                            >
                                {question?.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text variant="sm" color="textSecondary">
                                তৈরি হয়েছে
                            </Text>
                            <Text variant="sm" weight="semibold" color="textPrimary">
                                {question?.createdAt ? new Date(question.createdAt).toLocaleString() : 'N/A'}
                            </Text>
                        </View>
                        {question?.updatedAt && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.detailRow}>
                                    <Text variant="sm" color="textSecondary">
                                        সর্বশেষ আপডেট
                                    </Text>
                                    <Text variant="sm" weight="semibold" color="textPrimary">
                                        {new Date(question.updatedAt).toLocaleString()}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* MCQ Options */}
                {question?.questionPattern === 'mcq' && question?.options && question.options.length > 0 && (
                    <View style={styles.section}>
                        <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                            অপশন ({question.options.length})
                        </Text>
                        <Text variant="xs" color="textSecondary" style={styles.optionsInfo}>
                            উত্তরের ধরন: {question?.answerPattern === 'multiple' ? 'একাধিক উত্তর' : 'একক উত্তর'}
                        </Text>
                        <View style={styles.optionsList}>
                            {question.options.map((option: any, index: number) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.optionItem,
                                        option.isCorrect && styles.correctOptionItem,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.optionIndex,
                                            option.isCorrect && styles.correctOptionIndex,
                                        ]}
                                    >
                                        <Text
                                            variant="sm"
                                            weight="semibold"
                                            color={option.isCorrect ? 'textInverse' : 'textSecondary'}
                                        >
                                            {String.fromCharCode(65 + index)}
                                        </Text>
                                    </View>
                                    <View style={styles.optionContent}>
                                        <Text
                                            variant="sm"
                                            color={option.isCorrect ? 'success' : 'textPrimary'}
                                        >
                                            {option.text || option}
                                        </Text>
                                        {option.isCorrect && (
                                            <Text variant="xs" color="success" style={styles.correctLabel}>
                                                ✓ সঠিক উত্তর
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* True/False Statements */}
                {question?.questionPattern === 'true_false' && question?.statements && question.statements.length > 0 && (
                    <View style={styles.section}>
                        <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                            স্টেটমেন্ট ({question.statements.length})
                        </Text>
                        <View style={styles.optionsList}>
                            {question.statements.map((statement: any, index: number) => (
                                <View key={index} style={styles.optionItem}>
                                    <View
                                        style={[
                                            styles.optionIndex,
                                            {
                                                backgroundColor: statement.isTrue ? colors.success : colors.danger,
                                            },
                                        ]}
                                    >
                                        <Text
                                            variant="sm"
                                            weight="semibold"
                                            color="textInverse"
                                        >
                                            {statement.isTrue ? 'সত্য' : 'মিথ্যা'}
                                        </Text>
                                    </View>
                                    <View style={styles.optionContent}>
                                        <Text variant="sm" color="textPrimary">
                                            {statement.text || statement}
                                        </Text>
                                        <Text
                                            variant="xs"
                                            color={statement.isTrue ? 'success' : 'danger'}
                                            style={styles.correctLabel}
                                        >
                                            {statement.isTrue ? '→ সত্য' : '→ মিথ্যা'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Hints */}
                {question?.hints && question.hints.length > 0 && (
                    <View style={styles.section}>
                        <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                            হিন্ট ({question.hints.length})
                        </Text>
                        <View style={styles.hintsList}>
                            {question.hints.map((hint: string, index: number) => (
                                <View key={index} style={styles.hintItem}>
                                    <Text variant="sm" color="textPrimary">
                                        {index + 1}. {hint}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Hint Usage — who used the hints on this question */}
                {question?.hintUsage && question.hintUsage.usageCount > 0 && (
                    <View style={styles.section}>
                        <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                            হিন্ট ব্যবহার ({question.hintUsage.usageCount})
                        </Text>
                        <View style={styles.hintsList}>
                            {(question.hintUsage.usedBy || []).map((usage: any, index: number) => {
                                const user = usage?.userId;
                                const name = typeof user === 'object' && user
                                    ? (user.fullName || user.email || 'অজানা ইউজার')
                                    : 'অজানা ইউজার';
                                const email = typeof user === 'object' && user?.email ? user.email : null;
                                return (
                                    <View key={index} style={styles.usageItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text variant="sm" weight="semibold" color="textPrimary">
                                                {name}
                                            </Text>
                                            {email && (
                                                <Text variant="xs" color="textTertiary">
                                                    {email}
                                                </Text>
                                            )}
                                        </View>
                                        <Text variant="xs" color="textTertiary">
                                            {usage?.usedAt ? new Date(usage.usedAt).toLocaleDateString() : ''}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Reports — who reported this question */}
                {question?.report?.reports && question.report.reports.length > 0 && (
                    <View style={styles.section}>
                        <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                            রিপোর্ট ({question.report.reports.length})
                        </Text>
                        <View style={styles.hintsList}>
                            {question.report.reports.map((report: any, index: number) => {
                                const user = report?.reportedBy;
                                const name = typeof user === 'object' && user
                                    ? (user.fullName || user.email || 'অজানা ইউজার')
                                    : 'অজানা ইউজার';
                                return (
                                    <View key={index} style={styles.reportItemBox}>
                                        <View style={styles.reportHeaderRow}>
                                            <Text variant="sm" weight="semibold" color="textPrimary">
                                                {name}
                                            </Text>
                                            <Text variant="xs" color="textTertiary">
                                                {report?.reportedAt ? new Date(report.reportedAt).toLocaleDateString() : ''}
                                            </Text>
                                        </View>
                                        {report?.reason && (
                                            <Text variant="sm" color="warning" style={{ marginTop: 4 }}>
                                                {report.reason}
                                            </Text>
                                        )}
                                        {report?.description && (
                                            <Text variant="xs" color="textSecondary" style={{ marginTop: 4 }}>
                                                {report.description}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Actions */}
                <View style={styles.section}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        অ্যাকশন
                    </Text>
                    <View style={styles.actionsContainer}>
                        <ActionButton
                            title="প্রশ্ন সম্পাদনা করুন"
                            onPress={() => navigation.navigate('EditQuestion', { questionId })}
                        />
                        <ActionButton
                            title={deleteMutation.isPending ? 'ডিলিট হচ্ছে...' : 'প্রশ্ন ডিলিট করুন'}
                            onPress={handleDelete}
                            loading={deleteMutation.isPending}
                            variant="danger"
                        />
                    </View>
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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    questionBox: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: colors.info,
    },
    questionText: {
        lineHeight: 22,
    },
    detailsBox: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingVertical: 12,
        overflow: 'hidden',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 16,
    },
    optionsList: {
        gap: 10,
    },
    optionItem: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: colors.border,
    },
    correctOption: {
        borderLeftColor: colors.success,
        backgroundColor: colors.successLight,
    },
    optionIndex: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    correctOptionIndex: {
        backgroundColor: colors.success,
    },
    optionContent: {
        flex: 1,
        justifyContent: 'center',
    },
    correctLabel: {
        marginTop: 4,
    },
    idBox: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        marginBottom: 12,
    },
    variantBox: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: colors.info,
    },
    variantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    variantBadge: {
        backgroundColor: colors.info,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
    },
    variantText: {
        lineHeight: 20,
    },
    optionsInfo: {
        marginBottom: 10,
    },
    correctOptionItem: {
        backgroundColor: colors.successLight,
        borderLeftColor: colors.success,
    },
    hintsList: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },
    hintItem: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: colors.warning,
    },
    usageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: colors.info,
    },
    reportItemBox: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: colors.danger,
    },
    reportHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionsContainer: {
        gap: 12,
    },
    actionButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
});


