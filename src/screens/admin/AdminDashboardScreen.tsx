import React from 'react';
import {
    View,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { adminApi } from '../../api/admin.api';
import { AdminStackScreenProps } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { getGreeting } from '../../utils/formatters';
import { queryClient } from '../../api/queryClient';

// --- Stat Card ---

interface StatCardProps {
    title: string;
    value: string | number;
    iconName: string;
    color: string;
    onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, iconName, color, onPress }) => (
    <TouchableOpacity
        style={[styles.statCard, { borderLeftColor: color }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.statRow}>
            <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
                <MaterialCommunityIcons name={iconName as any} size={22} color={color} />
            </View>
            <View style={styles.statTextWrap}>
                <Text variant="sm" color="textSecondary">
                    {title}
                </Text>
                <Text variant="2xl" weight="bold" color="textPrimary">
                    {value}
                </Text>
            </View>
        </View>
    </TouchableOpacity>
);

// --- Quick Action Card ---

interface QuickActionProps {
    title: string;
    description: string;
    iconName: string;
    color: string;
    onPress: () => void;
}

const QuickActionCard: React.FC<QuickActionProps> = ({
    title,
    description,
    iconName,
    color,
    onPress,
}) => (
    <TouchableOpacity
        style={[styles.actionCard, { backgroundColor: color }]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={styles.actionIconWrap}>
            <MaterialCommunityIcons name={iconName as any} size={24} color={colors.textInverse} />
        </View>
        <Text variant="md" weight="semibold" color="textInverse">
            {title}
        </Text>
        <Text variant="xs" color="textInverse" style={{ opacity: 0.8, marginTop: 2 }}>
            {description}
        </Text>
    </TouchableOpacity>
);

// --- Main Screen ---

export const AdminDashboardScreen: React.FC<AdminStackScreenProps<'AdminDashboard'>> = ({
    navigation,
}) => {
    const { user, logout } = useAuth();
    const { data: statsData, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => adminApi.getDashboardStats(),
        retry: 2,
    });
    const [refreshing, setRefreshing] = React.useState(false);

    const handleLogout = React.useCallback(async () => {
        await logout();
    }, [logout]);

    const stats = statsData;
    const firstName = user?.fullName?.split(' ')[0] || 'অ্যাডমিন';

    const handleRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await queryClient.refetchQueries({ queryKey: ['admin-stats'] });
        } finally {
            setRefreshing(false);
        }
    }, []);

    const statCards: StatCardProps[] = [
        {
            title: 'মোট ইউজার',
            value: stats?.totalUsers || 0,
            iconName: 'account-group',
            color: colors.primary,
            onPress: () =>
                (navigation as any).getParent()?.navigate('UsersTab'),
        },
        {
            title: 'মোট প্রশ্ন',
            value: stats?.totalQuestions || 0,
            iconName: 'help-circle-outline',
            color: colors.info,
            onPress: () =>
                (navigation as any).getParent()?.navigate('QuestionsTab'),
        },
        {
            title: 'পরীক্ষার সংখ্যা',
            value: stats?.totalExamAttempts || 0,
            iconName: 'clipboard-text-outline',
            color: colors.success,
        },
        {
            title: 'রিপোর্ট করা আইটেম',
            value: stats?.reportedQuestionsCount || 0,
            iconName: 'flag-outline',
            color: colors.warning,
            onPress: () =>
                (navigation as any).getParent()?.navigate('ReportsTab'),
        },
    ];

    const quickActions: QuickActionProps[] = [
        {
            title: 'ইউজার ব্যবস্থাপনা',
            description: 'স্টুডেন্ট অ্যাকাউন্ট দেখুন ও পরিচালনা করুন',
            iconName: 'account-cog',
            color: colors.primary,
            onPress: () =>
                (navigation as any).getParent()?.navigate('UsersTab'),
        },
        {
            title: 'প্রশ্ন ব্যবস্থাপনা',
            description: 'প্রশ্ন তৈরি, সম্পাদনা ও মুছে ফেলুন',
            iconName: 'book-edit',
            color: colors.info,
            onPress: () =>
                (navigation as any).getParent()?.navigate('QuestionsTab'),
        },
        {
            title: 'রিপোর্ট পর্যালোচনা',
            description: 'রিপোর্ট করা কনটেন্ট পরিচালনা করুন',
            iconName: 'shield-alert',
            color: colors.warning,
            onPress: () =>
                (navigation as any).getParent()?.navigate('ReportsTab'),
        },
    ];

    return (
        <View style={styles.container}>
            {/* Greeting Header — extends full width under notch */}
            <View style={styles.greetingHeader}>
                <SafeAreaView>
                    <View style={styles.greetingRow}>
                        <View style={{ flex: 1 }}>
                            <Text variant="lg" weight="bold" color="textInverse" style={{ marginBottom: 2 }}>
                                {getGreeting()}, {firstName}!
                            </Text>
                            <Text variant="sm" color="textInverse" style={{ opacity: 0.85 }}>
                                অ্যাডমিন ড্যাশবোর্ড
                            </Text>
                        </View>
                        <View style={styles.headerActions}>
                            <View style={styles.adminBadge}>
                                <MaterialCommunityIcons name="shield-crown" size={18} color={colors.primary} />
                                <Text variant="xs" weight="semibold" color="primary" style={{ marginLeft: 4 }}>
                                    অ্যাডমিন
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={handleLogout}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="logout" size={20} color={colors.textInverse} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Statistics Cards */}
                <View style={styles.body}>
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        সারসংক্ষেপ
                    </Text>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : (
                        <View style={styles.statsGrid}>
                            {statCards.map((stat) => (
                                <StatCard key={stat.title} {...stat} />
                            ))}
                        </View>
                    )}

                    {/* Quick Actions */}
                    <Text variant="lg" weight="semibold" color="textPrimary" style={styles.sectionTitle}>
                        দ্রুত অ্যাকশন
                    </Text>
                    <View style={styles.actionsGrid}>
                        {quickActions.map((action) => (
                            <QuickActionCard key={action.title} {...action} />
                        ))}
                    </View>

                    {/* Admin Info Tip */}
                    <View style={styles.infoCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                            <MaterialCommunityIcons name="information" size={18} color={colors.primary} />
                            <Text variant="sm" weight="semibold" color="textPrimary" style={{ marginLeft: 6 }}>
                                অ্যাডমিন নোট
                            </Text>
                        </View>
                        <Text variant="sm" color="textSecondary" style={styles.infoText}>
                            ইউজার অ্যাকাউন্ট ও প্রশ্ন পরিবর্তনের সময় সতর্ক থাকুন। পরিবর্তন সঙ্গে সঙ্গেই কার্যকর হয়।
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
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
        flexGrow: 1,
        paddingTop: spacing.base,
        paddingBottom: spacing.lg,
    },
    // Greeting header
    greetingHeader: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
        paddingTop: spacing.base
    },
    greetingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: spacing.borderRadius.full,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    logoutButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Body content
    body: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.lg,
    },
    sectionTitle: {
        marginBottom: spacing.md,
    },
    loadingContainer: {
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Stat cards
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: spacing.xl,
    },
    statCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 14,
        borderLeftWidth: 4,
        width: '48%' as any,
        flexGrow: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    statTextWrap: {
        flex: 1,
    },
    // Quick action cards
    actionsGrid: {
        gap: 12,
        marginBottom: spacing.xl,
    },
    actionCard: {
        borderRadius: 12,
        padding: 16,
    },
    actionIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    // Info card
    infoCard: {
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        padding: 14,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    infoText: {
        lineHeight: 20,
    },
});


