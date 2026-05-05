import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExamStackParamList } from './types';
import { ExamHubScreen } from '../screens/exam/ExamHubScreen';
import { PastExamScreen } from '../screens/exam/PastExamScreen';
import { ModelTestScreen } from '../screens/exam/ModelTestScreen';
import { PracticeScreen } from '../screens/exam/PracticeScreen';
import { ExamConfigScreen } from '../screens/exam/ExamConfigScreen';
import { ExamSessionScreen } from '../screens/exam/ExamSessionScreen';
import { ExamResultScreen } from '../screens/exam/ExamResultScreen';
import { ExamReviewScreen } from '../screens/exam/ExamReviewScreen';
import { SubscriptionRequiredScreen } from '../screens/exam/SubscriptionRequiredScreen';
import { ModuleUnavailableScreen } from '../screens/common/ModuleUnavailableScreen';
import { ModuleMaintenanceScreen } from '../screens/common/ModuleMaintenanceScreen';

const Stack = createNativeStackNavigator<ExamStackParamList>();

export const ExamNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="ExamHub" component={ExamHubScreen} />
            <Stack.Screen name="PastExam" component={PastExamScreen} />
            <Stack.Screen name="ModelTest" component={ModelTestScreen} />
            <Stack.Screen name="Practice" component={PracticeScreen} />
            <Stack.Screen name="ExamConfig" component={ExamConfigScreen} />
            <Stack.Screen
                name="ExamSession"
                component={ExamSessionScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen name="ExamResult" component={ExamResultScreen} />
            <Stack.Screen name="ExamReview" component={ExamReviewScreen} />
            <Stack.Screen
                name="SubscriptionRequired"
                component={SubscriptionRequiredScreen}
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
