import React from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { adminApi, AdminPreparationModule } from '../../api/admin.api';
import { getStudentTypeLabel } from '../../utils/formatters';

export const PreparationModuleManagementScreen: React.FC = () => {
    const queryClient = useQueryClient();
    const [pendingKey, setPendingKey] = React.useState<string | null>(null);

    const modulesQuery = useQuery({
        queryKey: ['admin-preparation-modules'],
        queryFn: () => adminApi.getPreparationModules(),
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: {
            examType: 'admission' | 'license';
            studentType: string;
            isLocked: boolean;
        }) => {
            console.log('[PrepModule] PATCH →', payload);
            return adminApi.updatePreparationModule(
                payload.examType,
                payload.studentType,
                payload.isLocked
            );
        },
        onSuccess: (data) => {
            console.log('[PrepModule] success:', data);
            queryClient.invalidateQueries({ queryKey: ['admin-preparation-modules'] });
            Toast.show({
                type: 'success',
                text1: 'মডিউল স্ট্যাটাস আপডেট হয়েছে',
            });
        },
        onError: (error: any) => {
            console.log('[PrepModule] error:', {
                status: error?.response?.status,
                data: error?.response?.data,
                message: error?.message,
            });
            Toast.show({
                type: 'error',
                text1: 'আপডেট করা যায়নি',
                text2:
                    error?.response?.data?.message ||
                    error?.response?.data?.error?.message ||
                    error?.message ||
                    'আবার চেষ্টা করুন',
            });
        },
        onSettled: () => setPendingKey(null),
    });

    const grouped = React.useMemo(() => {
        const modules = modulesQuery.data || [];
        const byStudentType = new Map<string, AdminPreparationModule[]>();

        modules.forEach((module) => {
            const list = byStudentType.get(module.studentType) || [];
            list.push(module);
            byStudentType.set(module.studentType, list);
        });

        return Array.from(byStudentType.entries())
            .map(([studentType, items]) => ({
                studentType,
                studentTypeLabel: getStudentTypeLabel(studentType),
                items: items.sort((a, b) => a.examType.localeCompare(b.examType)),
            }))
            .sort((a, b) => a.studentTypeLabel.localeCompare(b.studentTypeLabel));
    }, [modulesQuery.data]);

    const renderModuleItem = ({ item }: { item: AdminPreparationModule }) => {
        const itemKey = `${item.examType}:${item.studentType}`;
        const disabled = pendingKey === itemKey;
        const label = item.examType === 'admission' ? 'ভর্তি পরীক্ষা' : 'লাইসেন্স পরীক্ষা';

        return (
            <View style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                    <Text variant="sm" weight="semibold" color="textPrimary">
                        {label}
                    </Text>
                    <Text variant="xs" color="textTertiary" style={{ marginTop: 4 }}>
                        {item.isLocked ? 'Locked (under development)' : 'Unlocked (available)'}
                    </Text>
                </View>

                <View style={styles.buttonGroup}>
                    {/* Status Badge */}
                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: item.isLocked
                                    ? colors.dangerLight
                                    : colors.successLight,
                            },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={
                                item.isLocked
                                    ? 'lock-alert-outline'
                                    : 'lock-open-variant-outline'
                            }
                            size={16}
                            color={item.isLocked ? colors.danger : colors.success}
                        />
                        <Text
                            variant="xs"
                            weight="semibold"
                            color={item.isLocked ? 'danger' : 'success'}
                        >
                            {item.isLocked ? 'LOCKED' : 'UNLOCKED'}
                        </Text>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                        disabled={disabled}
                        onPress={() => {
                            console.log(
                                '[PrepModule] tap →',
                                itemKey,
                                'current isLocked:',
                                item.isLocked
                            );
                            setPendingKey(itemKey);
                            toggleMutation.mutate({
                                examType: item.examType,
                                studentType: item.studentType,
                                isLocked: !item.isLocked,
                            });
                        }}
                        activeOpacity={0.7}
                        style={[
                            styles.actionBtn,
                            {
                                backgroundColor: item.isLocked
                                    ? colors.success
                                    : colors.danger,
                                opacity: disabled ? 0.6 : 1,
                            },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={item.isLocked ? 'lock-open' : 'lock'}
                            size={16}
                            color={colors.textInverse}
                        />
                        <Text variant="xs" weight="bold" color="textInverse">
                            {item.isLocked ? 'UNLOCK' : 'LOCK'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (modulesQuery.isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loaderWrap}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={grouped}
                keyExtractor={(item) => item.studentType}
                refreshControl={
                    <RefreshControl
                        refreshing={modulesQuery.isRefetching}
                        onRefresh={modulesQuery.refetch}
                        tintColor={colors.primary}
                    />
                }
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.headerCard}>
                        <Text variant="lg" weight="bold" color="textPrimary">
                            প্রস্তুতি মডিউল লক/আনলক
                        </Text>
                        <Text variant="sm" color="textSecondary" style={{ marginTop: 6 }}>
                            প্রতিটি studentType-এর জন্য ভর্তি ও লাইসেন্স প্রস্তুতি আলাদা করে নিয়ন্ত্রণ করুন।
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.groupCard}>
                        <Text variant="sm" weight="bold" color="textPrimary">
                            {item.studentTypeLabel}
                        </Text>
                        <View style={styles.itemList}>
                            {item.items.map((module) => (
                                <View key={`${module.examType}-${module.studentType}`}>
                                    {renderModuleItem({ item: module })}
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.loaderWrap}>
                        <Text variant="sm" color="textSecondary">
                            প্রস্তুতি মডিউল খুঁজে পাওয়া যায়নি।
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: spacing.base, paddingBottom: spacing.xl, gap: spacing.base },
    headerCard: {
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.base,
        paddingTop: spacing.base,
    },
    groupCard: {
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.base,
        gap: spacing.sm,
    },
    itemList: {
        gap: spacing.sm,
    },
    itemCard: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: 12,
        padding: spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    buttonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    statusBadge: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionBtn: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
});


