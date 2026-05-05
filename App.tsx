import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Sora_400Regular, Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import {
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { queryClient } from './src/api/queryClient';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ui/ErrorBoundary';
import { initializePushNotifications } from './src/services/pushNotificationService';

// Keep the splash screen visible until all fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [fontsLoaded] = useFonts({
        Sora_400Regular,
        Sora_600SemiBold,
        Sora_700Bold,
        Nunito_400Regular,
        Nunito_500Medium,
        Nunito_600SemiBold,
        Nunito_700Bold,
    });

    useEffect(() => {
        (async () => {
            if (fontsLoaded) {
                // Initialize push notifications
                try {
                    await initializePushNotifications();
                } catch (error) {
                    console.error('Failed to initialize push notifications:', error);
                }
                
                await SplashScreen.hideAsync();
            }
        })();
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <RootNavigator />
                </ErrorBoundary>
                <Toast />
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
