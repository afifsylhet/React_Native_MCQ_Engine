# Critical Blocker Fixes - Implementation Guide

## 🔴 BLOCKER 1: Token Refresh Race Condition

**File:** `src/api/client.ts`  
**Problem:** Multiple concurrent 401 errors attempt simultaneous token refresh, causing deadlock  
**Solution:** Implement request queue with single refresh operation

### Current Implementation (BROKEN):
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ❌ BUG: Each 401 triggers independent refresh
    // If 5 requests fail with 401, all 5 try to refresh simultaneously
    if (error.response?.status === 401) {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const response = await apiClient.post('/auth/refresh-token', { refreshToken });
      // Race condition here!
    }
  }
);
```

### Fixed Implementation:
```typescript
// At top of client.ts file, add queue management
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Replace response interceptor:
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is happening
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await apiClient.post('/auth/refresh-token', {
          refreshToken,
        });
        
        const { accessToken } = response.data.data;
        await SecureStore.setItemAsync('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Logout user
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

**Time to Fix:** 30 minutes  
**Testing:** Simulate multiple concurrent 401 errors

---

## 🔴 BLOCKER 2: Phase 2 Auth Screens (7 Screens)

**Files:**  
- `src/screens/auth/SplashScreen.tsx` (MISSING)
- `src/screens/auth/OnboardingScreen.tsx` (MISSING)
- `src/screens/auth/LoginScreen.tsx` (MISSING)
- `src/screens/auth/RegisterScreen.tsx` (MISSING)
- `src/screens/auth/OTPVerificationScreen.tsx` (MISSING)
- `src/screens/auth/ForgotPasswordScreen.tsx` (MISSING)
- `src/screens/auth/ResetPasswordScreen.tsx` (MISSING)

### SplashScreen Template:
```typescript
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';

export const SplashScreen: React.FC = () => {
  const { initializeAuth, isLoading } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    initializeAuth().finally(() => {
      // Navigation will handle redirecting to Home or Auth
    });
  }, []);

  return (
    <Animated.View
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      entering={FadeIn}
    >
      {/* Logo + branding */}
      {/* Loading spinner */}
    </Animated.View>
  );
};
```

### LoginScreen Template:
```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { loginSchema } from '../../utils/validators'; // Zod schema

export const LoginScreen: React.FC<{ navigation }> = ({ navigation }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      // Navigation happens automatically when isAuthenticated changes
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
        Welcome Back
      </Text>

      <Input
        control={control}
        name="email"
        placeholder="Email"
        keyboardType="email-address"
        errorMessage={errors.email?.message}
      />

      <Input
        control={control}
        name="password"
        placeholder="Password"
        secureTextEntry
        errorMessage={errors.password?.message}
      />

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text>Forgot Password?</Text>
      </TouchableOpacity>

      <Button
        title="Login"
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
        style={{ marginTop: 16 }}
      />

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text>Don't have account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};
```

**Time per Screen:** 1-1.5 hours each (7-10 hours total)  
**Dependencies:** useAuth hook (✅ exists), validators (✅ exist), Input component (✅ exists)

---

## 🔴 BLOCKER 3: Fix ExamSessionScreen Mock Data

**File:** `src/screens/exam/ExamSessionScreen.tsx`

### Current Problem:
```typescript
// ❌ WRONG - hardcoded questions
const mockQuestions = [
  {
    id: '1',
    question: 'What is the first step...',
    questionPattern: 'mcq',
    options: [
      { text: 'A) Option 1', orderIndex: 0 },
      // ...
    ]
  }
];

useEffect(() => {
  // Loads mock data instead of fetching real exam
  setQuestions(mockQuestions);
}, []);
```

### Fixed Implementation:
```typescript
import React, { useEffect } from 'react';
import { useExam } from '../../hooks/useExam';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Animated from 'react-native-reanimated';

export const ExamSessionScreen: React.FC<ExamSessionScreenProps> = ({ navigation }) => {
  const route = useRoute<ExamSessionRouteProp>();
  const { attemptId } = route.params;
  // ✅ Use real hook instead of mock data
  const { 
    questions, 
    answers, 
    submitExam, 
    setAnswer, 
    navigateQuestion,
    timeRemaining,
    isSubmitting 
  } = useExam(attemptId);

  useEffect(() => {
    // Fetch actual exam from API
    // examApi.getExamDetail(attemptId) is called automatically by useExam
  }, [attemptId]);

  // If still loading, show skeleton
  if (!questions) {
    return <SkeletonCard count={5} />;
  }

  // If error fetching exam
  if (!questions || questions.length === 0) {
    return (
      <EmptyState
        icon="alert-circle"
        title="Failed to Load Exam"
        description="Please try again"
        action={() => {/* retry */}}
      />
    );
  }

  const handleSubmitExam = async () => {
    try {
      await submitExam();
      navigation.navigate('ExamResult', { attemptId });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.message,
      });
    }
  };

  return (
    <Animated.ScrollView style={{ flex: 1 }}>
      {/* Display real questions from API */}
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          answer={answers[question.id]}
          onAnswerSelect={(answer) => setAnswer(question.id, answer)}
          timeRemaining={timeRemaining}
        />
      ))}
      
      <Button
        title="Submit Exam"
        onPress={handleSubmitExam}
        isLoading={isSubmitting}
      />
    </Animated.ScrollView>
  );
};
```

**Key Changes:**
1. Remove all `mockQuestions` hardcoded data
2. Use `useExam(attemptId)` hook to fetch real exam
3. Add error handling with EmptyState
4. Add loading skeleton
5. Pass real questions to components

**Time to Fix:** 3-4 hours  
**Testing:** Generate real exam, verify questions display

---

## 🔴 BLOCKER 4: Implement Error Boundary

**File:** `src/components/ui/ErrorBoundary.tsx` (NEW)

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service (Sentry)
    console.error('ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.background,
          }}
        >
          <MaterialCommunityIcons
            name="alert-circle"
            size={64}
            color={colors.danger}
            style={{ marginBottom: spacing.lg }}
          />

          <Text
            style={{
              fontSize: typography.scale.lg.fontSize,
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
              marginBottom: spacing.md,
              textAlign: 'center',
            }}
          >
            Oops! Something went wrong
          </Text>

          <Text
            style={{
              fontSize: typography.scale.sm.fontSize,
              color: colors.textSecondary,
              marginBottom: spacing.lg,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>

          <TouchableOpacity
            onPress={this.handleReset}
            style={{
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              backgroundColor: colors.primary,
              borderRadius: spacing.borderRadius.md,
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                color: colors.surface,
                fontWeight: typography.weights.bold,
              }}
            >
              Try Again
            </Text>
          </TouchableOpacity>

          {__DEV__ && (
            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
              Error: {this.state.error?.toString()}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}
```

### Wrap App with ErrorBoundary:
```typescript
// App.tsx
import { ErrorBoundary } from './src/components/ui/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <RootNavigator />
    </ErrorBoundary>
  );
}
```

**Time to Fix:** 2 hours  
**Testing:** Throw error, verify ErrorBoundary catches it

---

## 🔴 BLOCKER 5: Offline Exam Draft Persistence

**File:** `src/utils/storage.ts` (UPDATE)  
**File:** `src/hooks/useExam.ts` (UPDATE)

### Update Storage Utils:
```typescript
// src/utils/storage.ts - ADD these functions:

export const saveExamDraft = async (attemptId: string, draft: {
  answers: Record<string, any>;
  currentIndex: number;
  timestamp: number;
}): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      `exam_draft_${attemptId}`,
      JSON.stringify(draft)
    );
  } catch (error) {
    console.error('Failed to save exam draft:', error);
  }
};

export const getExamDraft = async (attemptId: string): Promise<any | null> => {
  try {
    const draft = await AsyncStorage.getItem(`exam_draft_${attemptId}`);
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Failed to load exam draft:', error);
    return null;
  }
};

export const clearExamDraft = async (attemptId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`exam_draft_${attemptId}`);
  } catch (error) {
    console.error('Failed to clear exam draft:', error);
  }
};
```

### Update useExam Hook:
```typescript
// src/hooks/useExam.ts - UPDATE:

export const useExam = (attemptId: string) => {
  const [questions, setQuestions] = useState<ExamQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // ✅ Auto-save answers to local storage every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await saveExamDraft(attemptId, {
        answers,
        currentIndex: 0,
        timestamp: Date.now(),
      });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [answers, attemptId]);

  // ✅ On exam start, restore draft if it exists
  useEffect(() => {
    (async () => {
      const draft = await getExamDraft(attemptId);
      if (draft) {
        setAnswers(draft.answers);
        Toast.show({
          type: 'info',
          text1: 'Exam Restored',
          text2: 'Your previous answers have been recovered',
        });
      }
    })();
  }, [attemptId]);

  // ✅ Clear draft on successful submission
  const submitExam = async () => {
    try {
      await examApi.submitExam(attemptId, Object.values(answers), timeTaken);
      await clearExamDraft(attemptId); // ✅ Clear after submission
    } catch (error) {
      // Draft persists if submission fails
      throw error;
    }
  };

  return { questions, answers, submitExam, /* ... */ };
};
```

**Time to Fix:** 4-5 hours  
**Testing:** 
1. Start exam
2. Answer questions
3. Kill app
4. Reopen app
5. Go back to exam - answers should be restored

---

## Summary: Total Time to Fix All 5 Blockers

| Blocker | Time | Priority |
|---------|------|----------|
| Token Refresh Race Condition | 0.5 hrs | 🔴 P0 |
| Phase 2 Auth Screens | 8-10 hrs | 🔴 P0 |
| ExamSession Mock Data | 3-4 hrs | 🔴 P0 |
| Error Boundary | 2 hrs | 🔴 P0 |
| Offline Draft Save | 4-5 hrs | 🔴 P0 |
| **TOTAL** | **~20 hours** | **1 day** |

After these 5 fixes, the app reaches **MVP stage** and can be tested in staging environment.

---

## Next Steps

1. **Start with token refresh** (30 min): Simplest, prevents deadlock
2. **Then auth screens** (10 hrs): Enable login/register flow
3. **Then ExamSession** (4 hrs): Enable exam functionality
4. **Then ErrorBoundary + offline** (6-7 hrs): Stability

Once all 5 are fixed, run full end-to-end test of:
- Register → Login → Take Exam → Submit → View Result → Logout → Login → Review History
