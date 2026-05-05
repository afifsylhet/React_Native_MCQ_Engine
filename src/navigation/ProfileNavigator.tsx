import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { HistoryScreen } from '../screens/profile/HistoryScreen';
import { HistoryDetailScreen } from '../screens/profile/HistoryDetailScreen';
import { SubscriptionScreen } from '../screens/subscription/SubscriptionScreen';
import { PlansScreen } from '../screens/subscription/PlansScreen';
import { NotificationSettingsScreen } from '../screens/settings/NotificationSettingsScreen';
import { ModuleUnavailableScreen } from '../screens/common/ModuleUnavailableScreen';
import { ModuleMaintenanceScreen } from '../screens/common/ModuleMaintenanceScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="MyProfile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="Plans" component={PlansScreen} />
            <Stack.Screen
                name="NotificationSettings"
                component={NotificationSettingsScreen}
            />
            <Stack.Screen
                name="ModuleUnavailable"
                component={ModuleUnavailableScreen}
            />
            <Stack.Screen
                name="ModuleMaintenance"
                component={ModuleMaintenanceScreen}
            />
        </Stack.Navigator>
    );
};
