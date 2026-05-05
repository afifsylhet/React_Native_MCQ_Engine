import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

interface PushNotification {
    title: string;
    body: string;
    data?: Record<string, any>;
}

/**
 * Initialize push notifications
 * Should be called in app initialization
 */
export const initializePushNotifications = async () => {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return null;
        }

        try {
            const token = await Notifications.getExpoPushTokenAsync();
            return token.data;
        } catch (e) {
            console.error('Failed to get Expo push token:', e);
            return null;
        }
    } else {
        console.warn('Must use physical device for Push Notifications');
        return null;
    }
};

/**
 * Handle incoming push notifications
 */
export const handleNotificationResponse = (
    response: Notifications.NotificationResponse,
    onNotificationPress: (data: Record<string, any>) => void
) => {
    const notification = response.notification;
    const data = notification.request.content.data;
    onNotificationPress(data);
};

/**
 * Schedule a local notification
 */
export const scheduleLocalNotification = async (
    notification: PushNotification,
    seconds: number = 5
) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            sound: 'default',
            badge: 1,
        },
        trigger: { seconds },
    });
};

/**
 * Send immediate local notification
 */
export const sendLocalNotification = async (
    notification: PushNotification
) => {
    await scheduleLocalNotification(notification, 1);
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Cancel specific notification
 */
export const cancelNotification = async (id: string) => {
    await Notifications.cancelScheduledNotificationAsync(id);
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async () => {
    return await Notifications.getAllScheduledNotificationsAsync();
};

/**
 * Notification response listener setup
 * Returns unsubscribe function
 */
export const setupNotificationResponseListener = (
    onResponse: (data: Record<string, any>) => void
) => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
            const data = response.notification.request.content.data;
            onResponse(data);
        }
    );

    return () => subscription.remove();
};

/**
 * Notification received listener setup (when app is in foreground)
 * Returns unsubscribe function
 */
export const setupNotificationReceivedListener = (
    onNotification: (notification: Notifications.Notification) => void
) => {
    const subscription = Notifications.addNotificationReceivedListener(
        (notification) => {
            onNotification(notification);
        }
    );

    return () => subscription.remove();
};

/**
 * Set notification handler defaults
 */
export const setNotificationHandler = () => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
};

/**
 * Badge count utilities
 */
export const setBadgeCount = async (count: number) => {
    try {
        await Notifications.setBadgeCountAsync(count);
    } catch (error) {
        console.error('Failed to set badge count:', error);
    }
};

export const getBadgeCount = async () => {
    try {
        return await Notifications.getBadgeCountAsync();
    } catch (error) {
        console.error('Failed to get badge count:', error);
        return 0;
    }
};

/**
 * Clear badge count
 */
export const clearBadgeCount = async () => {
    await setBadgeCount(0);
};
