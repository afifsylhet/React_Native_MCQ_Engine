import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { NotificationScreen } from '../screens/home/NotificationScreen';
import { NotificationDetailScreen } from '../screens/home/NotificationDetailScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="HomeMain"
                component={HomeScreen}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationScreen}
            />
            <Stack.Screen
                name="NotificationDetail"
                component={NotificationDetailScreen}
            />
        </Stack.Navigator>
    );
};
