import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import {
    MainScreen,
    SplashScreen,
    OnboardingScreen,
    LoginScreen,
    RegisterScreen,
    OTPVerificationScreen,
    ForgotPasswordScreen,
    ResetPasswordScreen,
} from '../screens/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
            initialRouteName="Main"
        >
            <Stack.Screen
                name="Main"
                component={MainScreen}
            />
            <Stack.Screen
                name="Splash"
                component={SplashScreen}
            />
            <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
            />
            <Stack.Screen
                name="Login"
                component={LoginScreen}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
            />
            <Stack.Screen
                name="OTPVerification"
                component={OTPVerificationScreen}
            />
            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
            />
            <Stack.Screen
                name="ResetPassword"
                component={ResetPasswordScreen}
            />
        </Stack.Navigator>
    );
};
