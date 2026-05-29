import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTabParamList } from './types';
import { HomeNavigator } from './HomeNavigator';
import { ExamNavigator } from './ExamNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { SubscriptionNavigator } from './SubscriptionNavigator';
import { LeaderboardScreen } from '../screens/leaderboard/LeaderboardScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator<AppTabParamList>();

export const AppNavigator = () => {
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(insets.bottom, 8);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textTertiary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 0,
                    elevation: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    height: 60 + bottomPadding,
                    paddingBottom: bottomPadding,
                    paddingTop: 6,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontFamily: 'Nunito_400Regular',
                    marginTop: -4,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeNavigator}
                options={{
                    tabBarLabel: 'হোম',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="home-variant"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Exams"
                component={ExamNavigator}
                options={{
                    tabBarLabel: 'পরীক্ষা',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="book-open-variant"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Leaderboard"
                component={LeaderboardScreen}
                options={{
                    tabBarLabel: 'র‍্যাঙ্ক',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="trophy-variant"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Subscription"
                component={SubscriptionNavigator}
                options={{
                    tabBarLabel: 'সাবস্ক্রিপশন',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="crown"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileNavigator}
                options={{
                    tabBarLabel: 'প্রোফাইল',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="account-circle"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
