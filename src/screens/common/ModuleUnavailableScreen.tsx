import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ModuleUnavailableScreenProps {
    navigation: any;
    route: {
        params?: {
            moduleLabel?: string;
            message?: string;
        };
    };
}

export const ModuleUnavailableScreen: React.FC<ModuleUnavailableScreenProps> = ({
    navigation,
    route,
}) => {
    const [isRetrying, setIsRetrying] = React.useState(false);
    const moduleLabel = route.params?.moduleLabel || 'This exam preparation module';
    const fallbackMessage = `${moduleLabel} is currently under development. We are working to make it available soon. Please stay with us. You will receive a notification once it becomes available.`;
    const message = route.params?.message || fallbackMessage;

    const handleTryAgain = () => {
        setIsRetrying(true);
        // Navigate back to retry, which will re-fetch module status
        navigation.goBack();
    };

    return (
        <ScreenWrapper scrollable={true} safeTop={true}>
            <View style={{ paddingHorizontal: spacing.base, paddingVertical: spacing.lg, gap: spacing.base }}>
                <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
                    <View
                        style={{
                            width: 92,
                            height: 92,
                            borderRadius: 46,
                            backgroundColor: colors.infoLight,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: spacing.lg,
                        }}
                    >
                        <MaterialCommunityIcons name="progress-clock" size={52} color={colors.info} />
                    </View>

                    <Text variant="xl" weight="bold" color="textPrimary" style={{ textAlign: 'center', marginBottom: spacing.sm }}>
                        Under Development
                    </Text>
                    <Text variant="sm" color="textSecondary" style={{ textAlign: 'center' }}>
                        {message}
                    </Text>
                </View>

                <Card style={{ backgroundColor: colors.primaryLight }}>
                    <Text variant="sm" weight="semibold" color="textPrimary" style={{ marginBottom: spacing.sm }}>
                        Stay connected
                    </Text>
                    <Text variant="sm" color="textSecondary">
                        Keep notifications enabled. We will notify you as soon as this module is unlocked and available.
                    </Text>
                </Card>

                <View style={{ gap: spacing.md }}>
                    <Button
                        label="Try Again"
                        variant="primary"
                        size="large"
                        onPress={handleTryAgain}
                        loading={isRetrying}
                        rightIcon="arrow-right"
                    />
                    <Button
                        label="Go to Notifications"
                        variant="outline"
                        size="large"
                        onPress={() => navigation.navigate('Home', { screen: 'Notifications' })}
                        rightIcon="arrow-right"
                    />
                    <Button
                        label="Go Back"
                        variant="outline"
                        size="large"
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
};
