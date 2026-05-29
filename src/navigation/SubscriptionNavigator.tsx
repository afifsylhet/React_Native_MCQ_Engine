import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SubscriptionStackParamList } from './types';
import { SubscriptionScreen } from '../screens/subscription/SubscriptionScreen';
import { PlansScreen } from '../screens/subscription/PlansScreen';
import { SubscriptionInfoScreen } from '../screens/subscription/SubscriptionInfoScreen';
import { InvoiceScreen } from '../screens/subscription/InvoiceScreen';

const Stack = createNativeStackNavigator<SubscriptionStackParamList>();

export const SubscriptionNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MySubscription" component={SubscriptionScreen} />
            <Stack.Screen name="Plans" component={PlansScreen} />
            <Stack.Screen name="SubscriptionInfo" component={SubscriptionInfoScreen} />
            <Stack.Screen name="Invoices" component={InvoiceScreen} />
        </Stack.Navigator>
    );
};
