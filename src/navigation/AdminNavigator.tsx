import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AdminStackParamList } from './types';
import {
    AdminDashboardScreen,
    UserManagementScreen,
    UserDetailScreen,
    QuestionManagementScreen,
    CreateQuestionScreen,
    EditQuestionScreen,
    QuestionDetailScreen,
    ReportManagementScreen,
    ReportDetailScreen,
    SubscriptionManagementScreen,
    PreparationModuleManagementScreen,
    NoticeManagementScreen,
    CreateNoticeScreen,
} from '../screens/admin';
import { colors } from '../theme/colors';

// --- Typed stack navigators for each admin tab ---

type DashboardStackParamList = Pick<AdminStackParamList, 'AdminDashboard'>;
type UsersStackParamList = Pick<AdminStackParamList, 'UserManagement' | 'UserDetail'>;
type QuestionsStackParamList = Pick<AdminStackParamList, 'QuestionManagement' | 'CreateQuestion' | 'QuestionDetail' | 'EditQuestion'>;
type ReportsStackParamList = Pick<AdminStackParamList, 'ReportManagement' | 'ReportDetail'>;
type SubscriptionsStackParamList = Pick<AdminStackParamList, 'SubscriptionManagement' | 'PreparationModuleManagement'>;
type NoticesStackParamList = Pick<AdminStackParamList, 'NoticeManagement' | 'CreateNotice'>;

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const UsersStack = createNativeStackNavigator<UsersStackParamList>();
const QuestionsStack = createNativeStackNavigator<QuestionsStackParamList>();
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();
const SubscriptionsStack = createNativeStackNavigator<SubscriptionsStackParamList>();
const NoticesStack = createNativeStackNavigator<NoticesStackParamList>();

const stackScreenOptions = {
    headerShown: true,
    headerBackTitle: 'ফিরে যান',
    animation: 'slide_from_right' as const,
    headerTitleStyle: {
        fontFamily: 'Sora_700Bold',
        fontSize: 18,
    },
};

const DashboardStackScreen = () => (
    <DashboardStack.Navigator screenOptions={stackScreenOptions}>
        <DashboardStack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{ headerShown: false }}
        />
    </DashboardStack.Navigator>
);

const UsersStackScreen = () => (
    <UsersStack.Navigator screenOptions={stackScreenOptions}>
        <UsersStack.Screen
            name="UserManagement"
            component={UserManagementScreen}
            options={{ headerTitle: 'ইউজার', headerShown: false }}
        />
        <UsersStack.Screen
            name="UserDetail"
            component={UserDetailScreen}
            options={({ route }) => ({
                headerTitle: route.params.email,
            })}
        />
    </UsersStack.Navigator>
);

const QuestionsStackScreen = () => (
    <QuestionsStack.Navigator screenOptions={stackScreenOptions}>
        <QuestionsStack.Screen
            name="QuestionManagement"
            component={QuestionManagementScreen}
            options={{ headerTitle: 'প্রশ্ন', headerShown: false }}
        />
        <QuestionsStack.Screen
            name="CreateQuestion"
            component={CreateQuestionScreen}
            options={{ headerTitle: 'নতুন প্রশ্ন' }}
        />
        <QuestionsStack.Screen
            name="QuestionDetail"
            component={QuestionDetailScreen}
            options={{ headerTitle: 'প্রশ্নের বিবরণ' }}
        />
        <QuestionsStack.Screen
            name="EditQuestion"
            component={EditQuestionScreen}
            options={{ headerTitle: 'প্রশ্ন সম্পাদনা' }}
        />
    </QuestionsStack.Navigator>
);

const ReportsStackScreen = () => (
    <ReportsStack.Navigator screenOptions={stackScreenOptions}>
        <ReportsStack.Screen
            name="ReportManagement"
            component={ReportManagementScreen}
            options={{ headerTitle: 'রিপোর্ট', headerShown: false }}
        />
        <ReportsStack.Screen
            name="ReportDetail"
            component={ReportDetailScreen}
            options={{ headerTitle: 'রিপোর্টের বিবরণ' }}
        />
    </ReportsStack.Navigator>
);

const SubscriptionsStackScreen = () => (
    <SubscriptionsStack.Navigator screenOptions={stackScreenOptions}>
        <SubscriptionsStack.Screen
            name="SubscriptionManagement"
            component={SubscriptionManagementScreen}
            options={{ headerTitle: 'সাবস্ক্রিপশন', headerShown: false }}
        />
        <SubscriptionsStack.Screen
            name="PreparationModuleManagement"
            component={PreparationModuleManagementScreen}
            options={{ headerTitle: 'প্রস্তুতি মডিউল' }}
        />
    </SubscriptionsStack.Navigator>
);

const NoticesStackScreen = () => (
    <NoticesStack.Navigator screenOptions={stackScreenOptions}>
        <NoticesStack.Screen
            name="NoticeManagement"
            component={NoticeManagementScreen}
            options={{ headerTitle: 'নোটিশ', headerShown: false }}
        />
        <NoticesStack.Screen
            name="CreateNotice"
            component={CreateNoticeScreen}
            options={{ headerTitle: 'নোটিশ পোস্ট করুন' }}
        />
    </NoticesStack.Navigator>
);

// --- Bottom Tab Navigator ---

const Tab = createBottomTabNavigator();

export const AdminNavigator = () => {
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
                name="DashboardTab"
                component={DashboardStackScreen}
                options={{
                    tabBarLabel: 'হোম',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="home-variant" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="UsersTab"
                component={UsersStackScreen}
                options={{
                    tabBarLabel: 'ইউজার',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account-group" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="QuestionsTab"
                component={QuestionsStackScreen}
                options={{
                    tabBarLabel: 'প্রশ্ন',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="help-circle" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="ReportsTab"
                component={ReportsStackScreen}
                options={{
                    tabBarLabel: 'রিপোর্ট',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="flag" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="SubscriptionsTab"
                component={SubscriptionsStackScreen}
                options={{
                    tabBarLabel: 'সাবস্ক্রিপশন',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="crown" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="NoticesTab"
                component={NoticesStackScreen}
                options={{
                    tabBarLabel: 'নোটিশ',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="bullhorn" size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
