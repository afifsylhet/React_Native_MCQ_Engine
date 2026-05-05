import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, Modal, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useNotices } from '../../hooks/useNotices';
import { Notice } from '../../api/notice.api';
import { formatRelativeDate } from '../../utils/formatters';

interface NoticeBoardCardProps {
    style?: ViewStyle;
    limit?: number;
}

const getAuthorName = (notice: Notice): string => {
    if (notice.createdBy && typeof notice.createdBy === 'object') {
        return notice.createdBy.fullName || 'অ্যাডমিন';
    }
    return 'অ্যাডমিন';
};

export const NoticeBoardCard: React.FC<NoticeBoardCardProps> = ({ style, limit = 3 }) => {
    const { data, isLoading } = useNotices(1, true);
    const [selected, setSelected] = useState<Notice | null>(null);

    const notices = (data?.items || []).slice(0, limit);

    return (
        <>
            <Card style={style}>
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <View style={styles.iconWrap}>
                            <MaterialCommunityIcons
                                name="bullhorn-variant"
                                size={18}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={styles.title}>নোটিশ বোর্ড</Text>
                    </View>
                    {data?.pagination?.total ? (
                        <Text style={styles.countBadge}>{data.pagination.total}</Text>
                    ) : null}
                </View>

                {isLoading ? (
                    <Text style={styles.empty}>নোটিশ লোড হচ্ছে…</Text>
                ) : notices.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <MaterialCommunityIcons
                            name="email-off-outline"
                            size={32}
                            color={colors.textTertiary}
                        />
                        <Text style={styles.empty}>এখনো কোনো নোটিশ নেই।</Text>
                    </View>
                ) : (
                    notices.map((notice, index) => (
                        <TouchableOpacity
                            key={notice._id}
                            activeOpacity={0.85}
                            onPress={() => setSelected(notice)}
                            style={[
                                styles.row,
                                index < notices.length - 1 && styles.rowBorder,
                            ]}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.subject} numberOfLines={1}>
                                    {notice.subject}
                                </Text>
                                <Text style={styles.preview} numberOfLines={2}>
                                    {notice.message}
                                </Text>
                                <View style={styles.metaRow}>
                                    <MaterialCommunityIcons
                                        name="account-tie"
                                        size={12}
                                        color={colors.textTertiary}
                                    />
                                    <Text style={styles.meta}>{getAuthorName(notice)}</Text>
                                    <Text style={styles.metaDot}>•</Text>
                                    <Text style={styles.meta}>{formatRelativeDate(notice.createdAt)}</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={20}
                                color={colors.textTertiary}
                            />
                        </TouchableOpacity>
                    ))
                )}
            </Card>

            <Modal
                visible={!!selected}
                transparent
                animationType="fade"
                onRequestClose={() => setSelected(null)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle} numberOfLines={2}>
                                {selected?.subject}
                            </Text>
                            <TouchableOpacity onPress={() => setSelected(null)} hitSlop={8}>
                                <MaterialCommunityIcons
                                    name="close"
                                    size={22}
                                    color={colors.textPrimary}
                                />
                            </TouchableOpacity>
                        </View>
                        {selected && (
                            <>
                                <View style={styles.modalMetaRow}>
                                    <MaterialCommunityIcons
                                        name="account-tie"
                                        size={14}
                                        color={colors.textSecondary}
                                    />
                                    <Text style={styles.modalMeta}>
                                        {getAuthorName(selected)}
                                    </Text>
                                    <Text style={styles.metaDot}>•</Text>
                                    <Text style={styles.modalMeta}>
                                        {new Date(selected.createdAt).toLocaleString()}
                                    </Text>
                                </View>
                                <ScrollView style={{ maxHeight: 320 }}>
                                    <Text style={styles.modalBody}>{selected.message}</Text>
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    iconWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: typography.scale.base.fontSize,
        fontFamily: 'Sora_600SemiBold',
        color: colors.textPrimary,
    },
    countBadge: {
        backgroundColor: colors.primaryLight,
        color: colors.primary,
        fontSize: 13,
        fontFamily: 'Nunito_700Bold',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    subject: {
        fontSize: typography.scale.sm.fontSize,
        fontFamily: 'Nunito_700Bold',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    preview: {
        fontSize: typography.scale.xs.fontSize,
        fontFamily: 'Nunito_400Regular',
        color: colors.textSecondary,
        lineHeight: typography.scale.xs.fontSize * 1.4,
        marginBottom: spacing.xs,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    meta: {
        fontSize: 12,
        fontFamily: 'Nunito_400Regular',
        color: colors.textTertiary,
    },
    metaDot: {
        fontSize: 12,
        color: colors.textTertiary,
        marginHorizontal: 2,
    },
    empty: {
        fontSize: typography.scale.sm.fontSize,
        color: colors.textSecondary,
        fontFamily: 'Nunito_400Regular',
        textAlign: 'center',
    },
    emptyBox: {
        paddingVertical: spacing.md,
        alignItems: 'center',
        gap: spacing.xs,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.base,
    },
    modalCard: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: spacing.borderRadius.lg,
        padding: spacing.base,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    modalTitle: {
        flex: 1,
        fontSize: typography.scale.lg.fontSize,
        fontFamily: 'Sora_700Bold',
        color: colors.textPrimary,
    },
    modalMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: spacing.sm,
    },
    modalMeta: {
        fontSize: typography.scale.xs.fontSize,
        fontFamily: 'Nunito_400Regular',
        color: colors.textSecondary,
    },
    modalBody: {
        fontSize: typography.scale.sm.fontSize,
        fontFamily: 'Nunito_400Regular',
        color: colors.textPrimary,
        lineHeight: typography.scale.sm.fontSize * 1.6,
    },
});
