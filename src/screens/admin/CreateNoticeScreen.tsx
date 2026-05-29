import React, { useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useQuery } from '@tanstack/react-query';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { AdminStackScreenProps } from '../../navigation/types';
import { useCreateNotice } from '../../hooks/useNotices';
import { adminApi } from '../../api/admin.api';

type TargetModule = {
    examType: 'admission' | 'license';
    studentType: string;
    label: string;
};

const TARGET_BLUEPRINT: Array<{ examType: 'admission' | 'license'; studentType: string; label: string }> = [
    { examType: 'admission', studentType: 'diploma_midwifery', label: 'Diploma in Midwifery' },
    { examType: 'admission', studentType: 'diploma_nursing_midwifery', label: 'Diploma in Nursing Science and Midwifery' },
    { examType: 'admission', studentType: 'bsc_nursing', label: 'B.Sc. In Nursing' },
    { examType: 'license', studentType: 'diploma_midwifery', label: 'Diploma in Midwifery' },
    { examType: 'license', studentType: 'diploma_nursing_midwifery', label: 'Diploma in Nursing Science and Midwifery' },
    { examType: 'license', studentType: 'bsc_nursing', label: 'B.Sc. In Nursing' },
    { examType: 'license', studentType: 'post_basic_midwifery', label: 'Post Basic in B.Sc Nursing' },
];

const FALLBACK_TARGET_MODULES: TargetModule[] = TARGET_BLUEPRINT.map((item) => ({
    examType: item.examType,
    studentType: item.studentType,
    label: `${item.examType === 'admission' ? 'Admission' : 'License'} - ${item.label}`,
}));

export const CreateNoticeScreen: React.FC<AdminStackScreenProps<'CreateNotice'>> = ({
    navigation,
}) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [selectedTargetKeys, setSelectedTargetKeys] = useState<string[]>([]);
    const subjectInputRef = useRef<TextInput>(null);
    const messageInputRef = useRef<TextInput>(null);
    const createNotice = useCreateNotice();

    const modulesQuery = useQuery({
        queryKey: ['admin', 'preparation-modules', 'notice-targeting'],
        queryFn: () => adminApi.getPreparationModules(),
        staleTime: 5 * 60 * 1000,
    });

    const targetModules: TargetModule[] = TARGET_BLUEPRINT.map((item) => ({
        examType: item.examType,
        studentType: item.studentType,
        label: `${item.examType === 'admission' ? 'Admission' : 'License'} - ${item.label}`,
    }));

    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    const canSubmit =
        trimmedSubject.length >= 2 &&
        trimmedMessage.length >= 2 &&
        !createNotice.isPending;

    const isAllTargetsSelected = selectedTargetKeys.length === 0;
    const selectedCount = selectedTargetKeys.length;

    const groupedTargets = {
        admission: targetModules.filter((t) => t.examType === 'admission'),
        license: targetModules.filter((t) => t.examType === 'license'),
    };

    const toggleTarget = (target: TargetModule) => {
        const key = `${target.examType}:${target.studentType}`;
        setSelectedTargetKeys((prev) => {
            if (prev.includes(key)) return prev.filter((k) => k !== key);
            return [...prev, key];
        });
    };

    const handleSubmit = () => {
        if (!canSubmit) return;

        const payloadTargets =
            isAllTargetsSelected
                ? []
                : selectedTargetKeys.map((key) => {
                    const [examType, studentType] = key.split(':');
                    return {
                        examType: examType as 'admission' | 'license',
                        studentType,
                    };
                });

        createNotice.mutate(
            {
                subject: trimmedSubject,
                message: trimmedMessage,
                targetModules: payloadTargets,
            },
            {
                onSuccess: () => {
                    Toast.show({
                        type: 'success',
                        text1: 'নোটিশ পোস্ট হয়েছে',
                        text2: 'নির্বাচিত ইউজাররা পুশ নোটিফিকেশন পাবেন।',
                    });
                    navigation.goBack();
                },
                onError: (err: any) => {
                    Toast.show({
                        type: 'error',
                        text1: 'পোস্ট করা যায়নি',
                        text2: err.message || 'আবার চেষ্টা করুন',
                    });
                },
            }
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="on-drag"
                >
                    <View style={styles.heroCard}>
                        <View style={styles.heroIconWrap}>
                            <MaterialCommunityIcons
                                name="bullhorn-variant"
                                size={20}
                                color={colors.primary}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text variant="md" weight="bold" color="textPrimary">
                                নোটিশ তৈরি করুন
                            </Text>
                            <Text variant="xs" color="textSecondary" style={{ marginTop: 4, lineHeight: 18 }}>
                                এক বা একাধিক টার্গেট নির্বাচন করুন। শুধুমাত্র matching ইউজাররা এই নোটিশ পাবেন।
                            </Text>
                        </View>
                    </View>

                    <View style={styles.sectionCard}>
                        <Text variant="sm" weight="semibold" color="textPrimary" style={styles.label}>
                            বিষয় <Text style={{ color: colors.danger }}>*</Text>
                        </Text>
                        <Pressable onPress={() => subjectInputRef.current?.focus()}>
                            <TextInput
                                ref={subjectInputRef}
                                style={styles.input}
                                value={subject}
                                onChangeText={setSubject}
                                placeholder="যেমন: পরীক্ষার সময়সূচি আপডেট"
                                placeholderTextColor={colors.textTertiary}
                                maxLength={200}
                                editable={!createNotice.isPending}
                                selectTextOnFocus
                                returnKeyType="next"
                                blurOnSubmit={false}
                                onSubmitEditing={() => messageInputRef.current?.focus()}
                            />
                        </Pressable>
                        <Text variant="xs" color="textTertiary" style={styles.counter}>
                            {subject.length}/200
                        </Text>
                    </View>

                    <View style={styles.sectionCard}>
                        <Text variant="sm" weight="semibold" color="textPrimary" style={styles.label}>
                            বার্তা <Text style={{ color: colors.danger }}>*</Text>
                        </Text>
                        <Pressable onPress={() => messageInputRef.current?.focus()}>
                            <TextInput
                                ref={messageInputRef}
                                style={[styles.input, styles.messageInput]}
                                value={message}
                                onChangeText={setMessage}
                                placeholder="ইউজাররা যে বার্তাটি দেখবেন তা লিখুন..."
                                placeholderTextColor={colors.textTertiary}
                                multiline
                                textAlignVertical="top"
                                maxLength={2000}
                                editable={!createNotice.isPending}
                                selectTextOnFocus
                            />
                        </Pressable>
                        <Text variant="xs" color="textTertiary" style={styles.counter}>
                            {message.length}/2000
                        </Text>
                    </View>

                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderRow}>
                            <Text variant="sm" weight="semibold" color="textPrimary">
                                টার্গেট exam preparation টাইপ
                            </Text>
                            <Text variant="xs" color="textSecondary">
                                {isAllTargetsSelected ? 'সব টাইপ নির্বাচিত' : `${selectedCount}টি নির্বাচিত`}
                            </Text>
                        </View>

                        <View style={styles.targetActionRow}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.targetRow, isAllTargetsSelected && styles.targetRowActive]}
                                onPress={() => setSelectedTargetKeys([])}
                                disabled={createNotice.isPending}
                            >
                                <MaterialCommunityIcons
                                    name={isAllTargetsSelected ? 'check-circle' : 'circle-outline'}
                                    size={18}
                                    color={isAllTargetsSelected ? colors.primary : colors.textTertiary}
                                />
                                <Text
                                    variant="sm"
                                    weight="semibold"
                                    color={isAllTargetsSelected ? 'primary' : 'textSecondary'}
                                >
                                    সব টাইপ
                                </Text>
                            </TouchableOpacity>
                            {!isAllTargetsSelected && (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.clearChip}
                                    onPress={() => setSelectedTargetKeys([])}
                                    disabled={createNotice.isPending}
                                >
                                    <Text variant="xs" weight="semibold" color="danger">
                                        Clear Selection
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <Text variant="xs" weight="semibold" color="textTertiary" style={styles.groupTitle}>
                            Admission
                        </Text>
                        <View style={styles.targetList}>
                            {groupedTargets.admission.map((target) => {
                                const key = `${target.examType}:${target.studentType}`;
                                const isSelected = selectedTargetKeys.includes(key);

                                return (
                                    <TouchableOpacity
                                        key={key}
                                        activeOpacity={0.8}
                                        style={[styles.targetRow, isSelected && styles.targetRowActive]}
                                        onPress={() => toggleTarget(target)}
                                        disabled={createNotice.isPending}
                                    >
                                        <MaterialCommunityIcons
                                            name={isSelected ? 'check-circle' : 'circle-outline'}
                                            size={18}
                                            color={isSelected ? colors.primary : colors.textTertiary}
                                        />
                                        <Text
                                            variant="sm"
                                            weight="semibold"
                                            color={isSelected ? 'primary' : 'textSecondary'}
                                        >
                                            {target.label.replace('Admission - ', '')}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text variant="xs" weight="semibold" color="textTertiary" style={styles.groupTitle}>
                            License
                        </Text>
                        <View style={styles.targetList}>
                            {groupedTargets.license.map((target) => {
                                const key = `${target.examType}:${target.studentType}`;
                                const isSelected = selectedTargetKeys.includes(key);

                                return (
                                    <TouchableOpacity
                                        key={key}
                                        activeOpacity={0.8}
                                        style={[styles.targetRow, isSelected && styles.targetRowActive]}
                                        onPress={() => toggleTarget(target)}
                                        disabled={createNotice.isPending}
                                    >
                                        <MaterialCommunityIcons
                                            name={isSelected ? 'check-circle' : 'circle-outline'}
                                            size={18}
                                            color={isSelected ? colors.primary : colors.textTertiary}
                                        />
                                        <Text
                                            variant="sm"
                                            weight="semibold"
                                            color={isSelected ? 'primary' : 'textSecondary'}
                                        >
                                            {target.label.replace('License - ', '')}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.metaCard}>
                        <View style={styles.metaHint}>
                            <MaterialCommunityIcons
                                name="account-tie"
                                size={14}
                                color={colors.textTertiary}
                            />
                            <Text variant="xs" color="textTertiary">
                                আপনার নাম এবং পোস্ট করার সময় স্বয়ংক্রিয়ভাবে যুক্ত হবে।
                            </Text>
                        </View>
                        <View style={styles.metaHint}>
                            <MaterialCommunityIcons
                                name="bell-ring-outline"
                                size={14}
                                color={colors.textTertiary}
                            />
                            <Text variant="xs" color="textTertiary">
                                পোস্ট করার পর নির্বাচিত ইউজাররা পুশ নোটিফিকেশন পাবেন।
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitBtn, !canSubmit && { opacity: 0.5 }]}
                        onPress={handleSubmit}
                        disabled={!canSubmit}
                        activeOpacity={0.85}
                    >
                        {createNotice.isPending ? (
                            <ActivityIndicator color={colors.textInverse} />
                        ) : (
                            <>
                                <MaterialCommunityIcons
                                    name="send"
                                    size={18}
                                    color={colors.textInverse}
                                />
                                <Text variant="md" weight="bold" color="textInverse">
                                    নোটিশ পোস্ট করুন
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    scrollContent: { padding: spacing.base, paddingTop: spacing.sm, paddingBottom: spacing.xl },
    heroCard: {
        flexDirection: 'row',
        gap: 10,
        backgroundColor: colors.primaryLight,
        padding: 12,
        borderRadius: 12,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.primary + '33',
    },
    heroIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },
    sectionCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: { marginBottom: 8 },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.textPrimary,
        fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    },
    messageInput: {
        minHeight: 170,
        paddingTop: 12,
    },
    counter: { textAlign: 'right', marginTop: 6 },
    metaHint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        marginTop: 2,
    },
    metaCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        gap: 8,
    },
    targetActionRow: {
        flexDirection: 'column',
        gap: 10,
        marginBottom: 10,
    },
    clearChip: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.danger,
        backgroundColor: colors.danger + '12',
    },
    groupTitle: {
        marginTop: 6,
        marginBottom: 6,
    },
    targetList: {
        gap: 8,
        marginBottom: spacing.md,
    },
    targetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        backgroundColor: colors.background,
    },
    targetRowActive: {
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
    },
    footer: {
        padding: spacing.base,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
    },
});


