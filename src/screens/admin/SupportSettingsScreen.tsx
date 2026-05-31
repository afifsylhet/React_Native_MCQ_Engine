import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useMutation, useQuery } from '@tanstack/react-query';
import Text from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AdminStackScreenProps } from '../../navigation/types';
import { supportSettingsApi } from '../../api/supportSettings.api';
import { queryClient, queryKeys } from '../../api/queryClient';

export const SupportSettingsScreen: React.FC<AdminStackScreenProps<'SupportSettings'>> = () => {
    const { data, isLoading } = useQuery({
        queryKey: queryKeys.settings.support,
        queryFn: () => supportSettingsApi.getSupportSettings(),
    });

    const [bkashSendMoneyNumber, setBkashSendMoneyNumber] = useState('');
    const [whatsAppNumber, setWhatsAppNumber] = useState('');
    const [supportEmail, setSupportEmail] = useState('');

    useEffect(() => {
        if (!data) return;
        setBkashSendMoneyNumber(data.bkashSendMoneyNumber || '');
        setWhatsAppNumber(data.whatsAppNumber || '');
        setSupportEmail(data.supportEmail || '');
    }, [data]);

    const updateMutation = useMutation({
        mutationFn: supportSettingsApi.updateSupportSettings,
        onSuccess: (updated) => {
            queryClient.setQueryData(queryKeys.settings.support, updated);
            Toast.show({
                type: 'success',
                text1: 'Settings updated',
                text2: 'Support contact details saved successfully.',
            });
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Please try again.';
            Toast.show({
                type: 'error',
                text1: 'Update failed',
                text2: message,
            });
        },
    });

    const handleSave = () => {
        updateMutation.mutate({
            bkashSendMoneyNumber: bkashSendMoneyNumber.trim(),
            whatsAppNumber: whatsAppNumber.trim(),
            supportEmail: supportEmail.trim(),
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Card style={styles.card}>
                    <Text variant="md" weight="bold" color="textPrimary">
                        Support Settings
                    </Text>
                    <Text variant="xs" color="textSecondary" style={styles.helperText}>
                        Update payment and support contact details shown to users.
                    </Text>
                </Card>

                {isLoading ? (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <View style={styles.form}>
                        <Input
                            label="Bkash send money number"
                            placeholder="01XXXXXXXXX"
                            value={bkashSendMoneyNumber}
                            onChangeText={setBkashSendMoneyNumber}
                            keyboardType="phone-pad"
                            leftIcon="cellphone"
                        />
                        <Input
                            label="WhatsApp number"
                            placeholder="017XXXXXXXX"
                            value={whatsAppNumber}
                            onChangeText={setWhatsAppNumber}
                            keyboardType="phone-pad"
                            leftIcon="whatsapp"
                        />
                        <Input
                            label="Support email"
                            placeholder="support@example.com"
                            value={supportEmail}
                            onChangeText={setSupportEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="email"
                        />

                        <Button
                            label={updateMutation.isPending ? 'Saving...' : 'Save changes'}
                            variant="primary"
                            size="large"
                            onPress={handleSave}
                            disabled={updateMutation.isPending}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.base,
        paddingBottom: spacing.lg,
        gap: spacing.base,
    },
    card: {
        gap: spacing.xs,
    },
    helperText: {
        marginTop: spacing.xs,
        lineHeight: 18,
    },
    loading: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    form: {
        gap: spacing.base,
    },
});
