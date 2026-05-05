import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { AdminNavigator } from './AdminNavigator';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
    const { isAuthenticated, isLoading, initializeAuth } = useAuth();
    const { isAdmin } = useRole();

    useEffect(() => {
        initializeAuth();
    }, []);

    // Show loading state
    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#007AFF',
                }}
            >
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    isAdmin() ? (
                        <Stack.Screen
                            name="AdminApp"
                            component={AdminNavigator}
                            options={{
                                animation: 'none',
                            }}
                        />
                    ) : (
                        <Stack.Screen
                            name="App"
                            component={AppNavigator}
                            options={{
                                animation: 'none',
                            }}
                        />
                    )
                ) : (
                    <Stack.Screen
                        name="Auth"
                        component={AuthNavigator}
                        options={{
                            animation: 'none',
                        }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
