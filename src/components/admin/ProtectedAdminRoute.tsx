import React from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { useRole } from '../../hooks/useRole';

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Component to protect admin-only routes
 * Displays an error message if the user is not an admin
 */
export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
    children,
    fallback,
}) => {
    const { canAccessAdmin } = useRole();

    if (!canAccessAdmin()) {
        return (
            fallback || (
                <SafeAreaView style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Text variant="4xl">🔒</Text>
                        </View>
                        <Text variant="xl" weight="bold" color="textPrimary" style={styles.title}>
                            Access Denied
                        </Text>
                        <Text
                            variant="md"
                            color="textSecondary"
                            style={styles.message}
                            textAlign="center"
                        >
                            You don't have permission to access this feature. Only administrators can
                            access admin features.
                        </Text>
                    </View>
                </SafeAreaView>
            )
        );
    }

    return <>{children}</>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        lineHeight: 22,
    },
});
