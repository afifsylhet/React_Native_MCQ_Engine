import * as Haptics from 'expo-haptics';

export const useHaptics = () => {
    const triggerSelect = async () => {
        try {
            await Haptics.selectionAsync();
        } catch (error) {
            console.error('[Haptics] Selection error:', error);
        }
    };

    const triggerSuccess = async () => {
        try {
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );
        } catch (error) {
            console.error('[Haptics] Success error:', error);
        }
    };

    const triggerWarning = async () => {
        try {
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
            );
        } catch (error) {
            console.error('[Haptics] Warning error:', error);
        }
    };

    const triggerError = async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (error) {
            console.error('[Haptics] Error:', error);
        }
    };

    const triggerImpact = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.error('[Haptics] Impact error:', error);
        }
    };

    return {
        triggerSelect,
        triggerSuccess,
        triggerWarning,
        triggerError,
        triggerImpact,
    };
};
