# NursePrep — Complete GitHub Copilot Development Guide
### React Native Frontend for BD Nursing Preparation Backend
> **Stack:** React Native (Expo SDK 51+) · React Navigation v6 · Zustand · React Query · Reanimated 3 · NativeWind  
> **App:** Nursing & Midwifery Exam Preparation — Bangladesh  
> **Backend API Version:** 1.0.0 · Base URL: `https://your-api-domain/api/v1`

---

## ⚠️ How to Use This Document

This guide is written so you can **copy any section directly into GitHub Copilot Chat** and generate production-ready code. Every section:

- Tells you exactly **which file to create**
- Provides the **Copilot prompt** to paste
- Gives **context about what the code must do**
- References the **exact API endpoints** from the backend

If you are a complete beginner, work through every phase **in order**. Do not skip phases — each one builds on the previous.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Why Each Tool](#2-tech-stack--why-each-tool)
3. [Environment Setup (Step-by-Step)](#3-environment-setup-step-by-step)
4. [Folder Structure](#4-folder-structure)
5. [Phase 1 — Foundation (Theme, Config, Navigation Skeleton)](#5-phase-1--foundation)
6. [Phase 2 — Authentication Flow](#6-phase-2--authentication-flow)
7. [Phase 3 — Home Screen & Bottom Navigation](#7-phase-3--home-screen--bottom-navigation)
8. [Phase 4 — Exam Hub, Past Exam, Model Test, Practice](#8-phase-4--exam-hub-past-exam-model-test-practice)
9. [Phase 5 — Exam Session (The Core Screen)](#9-phase-5--exam-session)
10. [Phase 6 — Exam Result & Review](#10-phase-6--exam-result--review)
11. [Phase 7 — Leaderboard](#11-phase-7--leaderboard)
12. [Phase 8 — Profile & History](#12-phase-8--profile--history)
13. [Phase 9 — Subscription](#13-phase-9--subscription)
14. [Phase 10 — Notifications](#14-phase-10--notifications)
15. [API Integration Guide (Complete Reference)](#15-api-integration-guide)
16. [State Management Strategy](#16-state-management-strategy)
17. [Authentication Flow (Deep Dive)](#17-authentication-flow-deep-dive)
18. [Error Handling & Edge Cases](#18-error-handling--edge-cases)
19. [Testing & Debugging Tips](#19-testing--debugging-tips)
20. [Production Readiness Checklist](#20-production-readiness-checklist)

---

## 1. Project Overview

**NursePrep** is a mobile exam preparation app for nursing and midwifery students in Bangladesh. Students register with their program type (Diploma/B.Sc Nursing or Midwifery), then access:

- **Past Exam Questions** — real questions from previous license/admission exams
- **Model Tests** — timed 100-question full mock exams
- **Subject-wise Practice** — chapter-by-chapter practice sessions

The backend is a fully-built Node.js/Express REST API with JWT authentication, MongoDB, and 7 modules: Auth, User, Question, Exam, Subscription, Leaderboard, and Notification.

**Your job:** Build the React Native (Expo) frontend that connects to this backend.

---

## 2. Tech Stack & Why Each Tool

| Tool | Purpose | Why |
|---|---|---|
| **Expo SDK 51+** | App framework | Simplifies native module handling; works on Android & iOS |
| **React Navigation v6** | Screen navigation | Industry standard; supports Stack, Tab, and Drawer navigators |
| **Zustand** | Global state (auth, exam session) | Simpler than Redux; perfect for auth state and active exam |
| **@tanstack/react-query v5** | API data fetching & caching | Handles loading/error states, background refetch, pagination |
| **NativeWind v4** | Tailwind CSS for React Native | Rapid UI styling with utility classes |
| **React Native Reanimated 3** | Animations | Spring physics, gesture-driven animations |
| **Axios** | HTTP client | Interceptors for auto-token-refresh |
| **react-hook-form + zod** | Forms & validation | Type-safe validation, clean error handling |
| **expo-secure-store** | Token storage | Secure hardware-backed storage for JWT tokens |
| **expo-haptics** | Haptic feedback | Tactile response on answer selection |
| **lottie-react-native** | Lottie animations | Celebration, loading, empty state animations |
| **react-native-toast-message** | Toast notifications | App-wide success/error/info messages |

---

## 3. Environment Setup (Step-by-Step)

> **Follow every step in order. Do not skip.**

### Step 1: Install Prerequisites

Open your terminal and run:

```bash
# Install Node.js (download from https://nodejs.org — LTS version)
# After installing, verify:
node --version    # Should show v18 or higher
npm --version     # Should show v9 or higher

# Install Expo CLI globally
npm install -g expo-cli eas-cli

# Install Git (from https://git-scm.com if not already installed)
git --version
```

### Step 2: Create the Expo Project

```bash
# Create a new Expo project with TypeScript template
npx create-expo-app@latest nurseprep-app --template expo-template-blank-typescript

# Navigate into the project
cd nurseprep-app

# Open in VS Code (make sure VS Code is installed)
code .
```

### Step 3: Install All Required Dependencies

Copy and paste this entire block into your terminal. Run it from inside the `nurseprep-app` folder:

```bash
# Navigation
npx expo install react-native-screens react-native-safe-area-context
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# Animations & Gestures
npx expo install react-native-reanimated react-native-gesture-handler

# Styling
npm install nativewind
npm install --save-dev tailwindcss@3.3.2

# HTTP Client
npm install axios axios-retry

# State Management
npm install zustand

# Server State
npm install @tanstack/react-query

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Storage
npx expo install expo-secure-store @react-native-async-storage/async-storage

# Icons
npx expo install @expo/vector-icons

# Fonts
npx expo install expo-font @expo-google-fonts/nunito @expo-google-fonts/sora

# Haptics
npx expo install expo-haptics

# Splash Screen
npx expo install expo-splash-screen

# Lottie Animations
npx expo install lottie-react-native

# Toast Messages
npm install react-native-toast-message

# Skeleton Loaders
npm install react-native-skeleton-placeholder

# Circular Progress
npm install react-native-circular-progress-indicator

# Charts (Leaderboard/History)
npm install react-native-gifted-charts react-native-linear-gradient

# Notifications
npx expo install expo-notifications

# Date handling
npm install date-fns
```

### Step 4: Configure NativeWind (Tailwind CSS)

Create the file `tailwind.config.js` in the project root:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Then update `babel.config.js`:

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin',  // MUST be last
    ],
  };
};
```

### Step 5: Configure Environment Variables

Create a file called `.env` in the project root:

```bash
# .env
EXPO_PUBLIC_API_URL=https://your-vps-ip-or-domain/api/v1
EXPO_PUBLIC_APP_NAME=NursePrep
EXPO_PUBLIC_SUPPORT_EMAIL=support@nurseprep.com
```

> **Note:** For local development, use `http://10.0.2.2:3000/api/v1` on Android emulator or `http://localhost:3000/api/v1` on iOS simulator.

### Step 6: Configure app.json

Open `app.json` and replace its content with:

```json
{
  "expo": {
    "name": "NursePrep",
    "slug": "nurseprep-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F7B6C"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourname.nurseprep"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F7B6C"
      },
      "permissions": ["RECEIVE_BOOT_COMPLETED", "VIBRATE"],
      "package": "com.yourname.nurseprep"
    },
    "plugins": [
      ["expo-notifications", { "sounds": [] }],
      "expo-secure-store",
      "expo-font"
    ]
  }
}
```

### Step 7: Start the Development Server

```bash
npx expo start
```

Press `a` for Android emulator or `i` for iOS simulator.

---

## 4. Folder Structure

Create this exact structure inside your project. All your work lives inside the `src/` folder.

```
nurseprep-app/
├── App.tsx                          ← Entry point (keep minimal)
├── app.json
├── babel.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env
├── assets/                          ← Images, fonts, Lottie JSON files
│   ├── animations/                  ← .json Lottie files
│   └── images/
│
└── src/
    ├── api/                         ← All API call functions
    │   ├── client.ts                ← Axios instance + interceptors
    │   ├── queryClient.ts           ← React Query configuration
    │   ├── auth.api.ts              ← Register, Login, OTP, Logout
    │   ├── user.api.ts              ← Profile, Statistics
    │   ├── exam.api.ts              ← Generate, Submit, History, Result
    │   ├── question.api.ts          ← Questions, Subjects, Chapters
    │   ├── subscription.api.ts      ← Plans, Subscribe, My Subscription
    │   ├── leaderboard.api.ts       ← Weekly board, My rank
    │   └── notification.api.ts      ← Get, Mark read, Delete
    │
    ├── store/                       ← Zustand global state
    │   ├── auth.store.ts            ← User info, tokens, isLoggedIn
    │   ├── exam.store.ts            ← Active exam: questions, answers, timer
    │   └── ui.store.ts              ← Theme, locale preferences
    │
    ├── hooks/                       ← Custom React hooks (wrap React Query)
    │   ├── useAuth.ts
    │   ├── useExam.ts
    │   ├── useProfile.ts
    │   ├── useSubscription.ts
    │   ├── useLeaderboard.ts
    │   ├── useNotifications.ts
    │   └── useHaptics.ts
    │
    ├── navigation/                  ← All navigation configuration
    │   ├── RootNavigator.tsx        ← Decides Auth vs App
    │   ├── AuthNavigator.tsx        ← Splash → Onboarding → Login/Register
    │   ├── AppNavigator.tsx         ← Bottom Tab (4 tabs)
    │   ├── HomeNavigator.tsx        ← Stack inside Home tab
    │   ├── ExamNavigator.tsx        ← Stack inside Exam tab
    │   └── types.ts                 ← TypeScript types for navigation params
    │
    ├── screens/                     ← One file per screen
    │   ├── auth/
    │   │   ├── SplashScreen.tsx
    │   │   ├── OnboardingScreen.tsx
    │   │   ├── LoginScreen.tsx
    │   │   ├── RegisterScreen.tsx
    │   │   ├── OTPVerificationScreen.tsx
    │   │   ├── ForgotPasswordScreen.tsx
    │   │   └── ResetPasswordScreen.tsx
    │   │
    │   ├── home/
    │   │   ├── HomeScreen.tsx
    │   │   └── NotificationScreen.tsx
    │   │
    │   ├── exam/
    │   │   ├── ExamHubScreen.tsx
    │   │   ├── PastExamScreen.tsx
    │   │   ├── ModelTestScreen.tsx
    │   │   ├── PracticeScreen.tsx
    │   │   ├── ExamConfigScreen.tsx
    │   │   ├── ExamSessionScreen.tsx
    │   │   ├── ExamResultScreen.tsx
    │   │   └── ExamReviewScreen.tsx
    │   │
    │   ├── leaderboard/
    │   │   └── LeaderboardScreen.tsx
    │   │
    │   └── profile/
    │       ├── ProfileScreen.tsx
    │       ├── HistoryScreen.tsx
    │       ├── HistoryDetailScreen.tsx
    │       ├── ChangePasswordScreen.tsx
    │       └── SubscriptionScreen.tsx
    │
    ├── components/                  ← Reusable UI components
    │   ├── ui/                      ← Atomic / base components
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Avatar.tsx
    │   │   ├── ProgressBar.tsx
    │   │   ├── SkeletonCard.tsx
    │   │   ├── EmptyState.tsx
    │   │   └── ScreenWrapper.tsx
    │   │
    │   ├── auth/
    │   │   ├── OTPInput.tsx
    │   │   └── PasswordStrengthBar.tsx
    │   │
    │   ├── exam/
    │   │   ├── MCQOption.tsx
    │   │   ├── TrueFalseStatement.tsx
    │   │   ├── QuestionCard.tsx
    │   │   ├── ExamTimer.tsx
    │   │   └── QuestionProgress.tsx
    │   │
    │   ├── home/
    │   │   ├── GreetingHeader.tsx
    │   │   ├── QuickActionGrid.tsx
    │   │   └── WeeklyProgressCard.tsx
    │   │
    │   └── leaderboard/
    │       ├── LeaderboardRow.tsx
    │       └── TopThreePodium.tsx
    │
    ├── theme/                       ← Design tokens
    │   ├── colors.ts
    │   ├── typography.ts
    │   ├── spacing.ts
    │   └── index.ts
    │
    ├── utils/                       ← Helper functions
    │   ├── storage.ts               ← Secure token read/write helpers
    │   ├── formatters.ts            ← Format dates, scores, durations
    │   ├── validators.ts            ← Zod schemas for all forms
    │   └── constants.ts             ← App-wide constants
    │
    └── types/                       ← TypeScript type definitions
        ├── auth.types.ts
        ├── exam.types.ts
        ├── question.types.ts
        ├── subscription.types.ts
        └── api.types.ts
```

**Why this structure?** It follows the "feature + layer" hybrid pattern:
- `api/` holds all API call logic — easy to find and update when the backend changes
- `store/` holds only global state that must survive screen navigation (auth, active exam)
- `hooks/` wraps React Query + API calls so screens stay clean
- `screens/` are thin — they just compose components and call hooks
- `components/` are fully reusable and have no screen-specific logic

---

## 5. Phase 1 — Foundation

Build the theme system, API client, navigation skeleton, and React Query setup. This is the base everything else sits on.

---

### 5.1 TypeScript Types

**📋 Copilot Prompt — Create `src/types/api.types.ts`:**

```
Create a TypeScript file at src/types/api.types.ts.

Define the following interfaces based on the backend API response format:

All API responses follow this envelope:
{
  success: boolean,
  data: T | null,
  message: string | null,
  error?: { message: string, code: string, details: Record<string, string> }
}

Define these interfaces:
- ApiResponse<T> — the generic envelope
- PaginatedResponse<T> — adds pagination: { total, page, limit, pages }
- User — { id, email, firstName, lastName, role: 'student'|'admin', studentType, grade, profilePicture, isEmailVerified, isActive, createdAt }
- Question — with questionPattern: 'mcq'|'true_false', options for MCQ, statements for true_false
- QuestionOption — { text: string, orderIndex: number }
- QuestionStatement — { text: string, orderIndex: number }
- ExamAttempt — { attemptId, questions, timeLimitSeconds, startedAt }
- ExamResult — { attemptId, totalMarks, obtainedMarks, percentageScore, isPassed, correctAnswers, wrongAnswers, unansweredQuestions, answers[] }
- SubscriptionPlan — { planId, name, description, price, currency, durationDays, benefits, isActive }
- LeaderboardEntry — { rank, userId, userName, score, examsTaken, accuracy, studentType }
- Notification — { notificationId, type, title, message, icon, isRead, actionUrl, createdAt }

Export all interfaces.
```

---

### 5.2 Theme System

**📋 Copilot Prompt — Create `src/theme/colors.ts`:**

```
Create src/theme/colors.ts with this exact color palette (export as 'colors' const):

Primary: '#0F7B6C' (deep teal), primaryLight: '#E6F4F1', primaryDark: '#085C50'
Accent: '#F59E0B' (amber), accentLight: '#FEF3C7'
Success: '#10B981', successLight: '#D1FAE5'
Danger: '#EF4444', dangerLight: '#FEE2E2'
Warning: '#F59E0B', warningLight: '#FEF3C7'
Info: '#3B82F6', infoLight: '#DBEAFE'
Background: '#F8F7F4' (warm off-white), surface: '#FFFFFF', surfaceAlt: '#F1EFE8'
Border: '#E5E3DC', borderStrong: '#C9C7BF'
TextPrimary: '#1A1A18', textSecondary: '#5C5B56', textTertiary: '#9B9A95', textInverse: '#FFFFFF'
Question states: correct '#10B981', incorrect '#EF4444', unanswered '#9B9A95', selected '#0F7B6C'
```

**📋 Copilot Prompt — Create `src/theme/typography.ts`:**

```
Create src/theme/typography.ts. Export a 'typography' object with:
- fontDisplay: 'Sora' (for headings)
- fontBody: 'Nunito' (for body text)
- Scale: xs (11/16), sm (13/20), base (15/24), md (17/26), lg (20/30), xl (24/34), 2xl (30/40), 3xl (36/46)
  Each scale is { fontSize: number, lineHeight: number }
- Weights: regular '400', medium '500', semibold '600', bold '700', extrabold '800'

Also export a springConfig constant:
{ damping: 20, stiffness: 300, mass: 0.8 }
```

**📋 Copilot Prompt — Create `src/theme/spacing.ts`:**

```
Create src/theme/spacing.ts. Export a 'spacing' object using a 4-point grid:
xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, 2xl: 32, 3xl: 48, 4xl: 64

Also export borderRadius: { sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24, full: 9999 }
```

**📋 Copilot Prompt — Create `src/theme/index.ts`:**

```
Create src/theme/index.ts that re-exports everything from colors.ts, typography.ts, and spacing.ts.
```

---

### 5.3 API Client

**📋 Copilot Prompt — Create `src/api/client.ts`:**

```
Create src/api/client.ts. This is the central axios instance for all API calls.

Requirements:
1. Import axios, axios-retry, and expo-secure-store
2. Create an axios instance with:
   - baseURL from process.env.EXPO_PUBLIC_API_URL (fallback: 'http://10.0.2.2:3000/api/v1')
   - timeout: 15000
   - Content-Type: application/json header
3. Add axios-retry: 3 retries, exponential delay, retry on network errors and 504
4. Request interceptor: read accessToken from SecureStore ('accessToken' key), add as Authorization: Bearer header
5. Response interceptor for token refresh:
   - On 401 error (not a retry): read refreshToken from SecureStore
   - POST to /auth/refresh-token with { refreshToken }
   - Save new accessToken to SecureStore
   - Retry the original request with new token
   - On refresh failure: delete both tokens from SecureStore, then throw the error
6. Export the axios instance as default and named 'apiClient'

Use expo-secure-store (SecureStore.getItemAsync / setItemAsync / deleteItemAsync) for token storage, NOT AsyncStorage.
```

**📋 Copilot Prompt — Create `src/api/queryClient.ts`:**

```
Create src/api/queryClient.ts. Set up React Query's QueryClient with these options:
- queries: staleTime 5 minutes, gcTime 30 minutes, retry 2, refetchOnWindowFocus false
- mutations: retry 1

Also export a 'queryKeys' object with these centralized query key factories:
- auth: { me: ['auth', 'me'] }
- user: { profile: ['user', 'profile'], stats: ['user', 'stats'] }
- exam: {
    history: (page, category?) => ['exam', 'history', page, category],
    detail: (id) => ['exam', 'detail', id],
    result: (id) => ['exam', 'result', id],
  }
- leaderboard: { weekly: ['leaderboard', 'weekly'], myRank: ['leaderboard', 'my-rank'] }
- subscription: { my: ['subscription', 'my'], plans: ['subscription', 'plans'], history: ['subscription', 'history'] }
- notifications: { list: (page) => ['notifications', page] }
- question: { subjects: (studentType, examType) => ['questions', 'subjects', studentType, examType] }

Export QueryClient instance as 'queryClient' and 'queryKeys'.
```

---

### 5.4 Storage Utilities

**📋 Copilot Prompt — Create `src/utils/storage.ts`:**

```
Create src/utils/storage.ts. Use expo-secure-store for tokens and @react-native-async-storage/async-storage for non-sensitive preferences.

Export these functions:
- saveTokens(accessToken: string, refreshToken: string): Promise<void>
  — saves both tokens to SecureStore under keys 'accessToken' and 'refreshToken'
- getAccessToken(): Promise<string | null>
- getRefreshToken(): Promise<string | null>
- clearTokens(): Promise<void> — deletes both keys
- saveUserPrefs(prefs: Record<string, unknown>): Promise<void> — uses AsyncStorage key 'userPrefs'
- getUserPrefs(): Promise<Record<string, unknown> | null>
- saveExamDraft(attemptId: string, draft: unknown): Promise<void>
  — persists active exam answers to AsyncStorage so they survive app background
- getExamDraft(attemptId: string): Promise<unknown | null>
- clearExamDraft(attemptId: string): Promise<void>

Wrap all storage calls in try/catch and log errors without crashing.
```

---

### 5.5 API Modules

**📋 Copilot Prompt — Create `src/api/auth.api.ts`:**

```
Create src/api/auth.api.ts using the apiClient from src/api/client.ts.

The backend base URL is already set in apiClient. All paths below are relative.

Implement and export these functions (all return the data inside response.data.data):

1. register(payload: { fullName, email, password, phoneNumber, studentType }) → POST /auth/register
2. login(email: string, password: string) → POST /auth/login → returns { accessToken, refreshToken, user }
3. sendOtp(email: string) → POST /auth/send-otp with { email }
4. verifyOtp(email: string, otp: string) → POST /auth/verify-otp with { email, otp }
5. resendOtp(email: string) → POST /auth/resend-otp
6. forgotPassword(email: string) → POST /auth/forgot-password
7. resetPassword(email, password, passwordConfirm, resetToken) → POST /auth/reset-password
8. changePassword(currentPassword, password, passwordConfirm) → PATCH /auth/change-password
9. refreshToken(refreshToken: string) → POST /auth/refresh-token → returns { accessToken, refreshToken }
10. getMe() → GET /auth/me → returns User object
11. logout() → POST /auth/logout

All functions should let errors bubble up (don't catch them here — let the caller handle them).
studentType accepted values: 'diploma_midwifery', 'diploma_nursing_midwifery', 'bsc_midwifery', 'bsc_nursing_midwifery'
```

**📋 Copilot Prompt — Create `src/api/user.api.ts`:**

```
Create src/api/user.api.ts using apiClient.

Implement and export:
1. getUserProfile() → GET /users/profile
2. updateProfile(payload: { firstName?, lastName?, phone?, bio?, grade? }) → PATCH /users/profile
3. getUserStatistics() → GET /users/statistics
   Returns: { totalExamsTaken, totalScore, weeklyScore, averageScore, correctAnswers, wrongAnswers, unansweredQuestions, accuracyPercentage, examsPassed, examsFailed, passPercentage, bestScore, worstScore }
```

**📋 Copilot Prompt — Create `src/api/exam.api.ts`:**

```
Create src/api/exam.api.ts using apiClient.

Implement and export:

1. generateExam(payload) → POST /exams/generate
   payload: { examCategory: string, studentType: string, questionCount: number, difficulty?: string, chapterNames?: string[], subjectName?: string, examType?: string }
   Returns: { attemptId, questions[], timeLimitSeconds, startedAt }

2. submitExam(attemptId: string, answers: AnswerPayload[], totalTimeTakenSeconds: number) → POST /exams/{attemptId}/submit
   AnswerPayload is one of:
     - MCQ: { questionId: string, selectedOptionIndex: number }
     - True/False: { questionId: string, statementAnswers: [{ statementIndex: number, selectedValue: boolean }] }
   Returns: { attemptId, totalMarks, obtainedMarks, percentageScore, isPassed, correctAnswers, wrongAnswers, unansweredQuestions }

3. getExamResult(attemptId: string) → GET /exams/{attemptId}/result
   Returns full result with answers array

4. getExamHistory(params: { page: number, limit?: number, status?: string, examCategory?: string }) → GET /exams/history

5. getExamAttemptDetail(attemptId: string) → GET /exams/history/{attemptId}
   Returns detailed attempt with all answers, correct/incorrect info

Export a TypeScript type 'MCQAnswer' and 'TrueFalseAnswer' for the answer payloads.
```

**📋 Copilot Prompt — Create `src/api/question.api.ts`:**

```
Create src/api/question.api.ts using apiClient.

Implement and export:
1. getQuestions(params: { page?, limit?, difficulty?, studentType?, examType?, subjectName?, chapterName?, questionPattern?, year?, search? }) → GET /questions
2. getQuestionById(id: string) → GET /questions/{id}
3. getQuestionStatistics() → GET /questions/statistics (no auth required)
4. reportQuestion(questionId: string, reason: string, description: string) → POST /questions/{questionId}/report
   reason values: 'incorrect_answer' | 'unclear_question' | 'typo_or_grammar' | 'outdated_content' | 'duplicate_question' | 'other'
```

**📋 Copilot Prompt — Create `src/api/subscription.api.ts`:**

```
Create src/api/subscription.api.ts using apiClient.

Implement and export:
1. getSubscriptionPlans() → GET /subscriptions/plans (no auth required)
   Returns array of plans: [{ planId, name, description, price, currency, durationDays, benefits[], isActive }]
2. subscribeToPlan(planId: string, paymentMethod: string, paymentGateway?: string) → POST /subscriptions/subscribe
3. getMySubscription() → GET /subscriptions/my
   Returns: { subscriptionId, planId, planName, status, startDate, endDate, daysRemaining, amount, currency, autoRenew }
4. getSubscriptionHistory(page?: number) → GET /subscriptions/history
```

**📋 Copilot Prompt — Create `src/api/leaderboard.api.ts`:**

```
Create src/api/leaderboard.api.ts using apiClient.

Implement and export:
1. getWeeklyLeaderboard(params: { page?: number, limit?: number, studentType?: string }) → GET /leaderboards/weekly
   Returns array: [{ rank, userId, userName, email, profilePicture, score, examsTaken, accuracy, studentType }]
2. getMyRank() → GET /leaderboards/my-rank (requires auth)
   Returns: { userId, userName, rank, weeklyScore, totalScore, examsTaken, accuracy, percentile, studentType, comparedTo, scoreGainThisWeek }
```

**📋 Copilot Prompt — Create `src/api/notification.api.ts`:**

```
Create src/api/notification.api.ts using apiClient.

Implement and export:
1. getNotifications(params: { page?, limit?, isRead?, type?, order? }) → GET /notifications
   Returns: { notifications[], pagination, unreadCount }
2. markAsRead(notificationId: string) → PATCH /notifications/{notificationId}/read
3. markAllAsRead() → PATCH /notifications/read-all
4. deleteNotification(notificationId: string) → DELETE /notifications/{notificationId}
```

---

### 5.6 Zustand Stores

**📋 Copilot Prompt — Create `src/store/auth.store.ts`:**

```
Create src/store/auth.store.ts using Zustand.

State should contain:
- user: User | null
- accessToken: string | null
- isAuthenticated: boolean
- isEmailVerified: boolean
- isLoading: boolean (for initial auth check on app startup)

Actions:
- setUser(user: User): void — sets user and marks isAuthenticated true
- setTokens(accessToken: string): void — updates in-memory token reference
- logout(): void — clears user and tokens, sets isAuthenticated false
- setLoading(loading: boolean): void
- setEmailVerified(verified: boolean): void

Import User type from src/types/api.types.ts.
Use Zustand's create() with no persistence (tokens are stored in SecureStore separately, not in Zustand).
```

**📋 Copilot Prompt — Create `src/store/exam.store.ts`:**

```
Create src/store/exam.store.ts using Zustand.

This store holds the state for an active exam session.

State:
- attemptId: string | null
- questions: ExamQuestion[] | null  (question objects from the generate endpoint)
- answers: Record<string, MCQAnswer | TrueFalseAnswer>  (keyed by questionId)
- currentQuestionIndex: number
- startedAt: string | null  (ISO date string)
- timeLimitSeconds: number | null
- isSubmitting: boolean
- isSubmitted: boolean

Actions:
- startExam(attemptId, questions, timeLimitSeconds, startedAt): void
- setAnswer(questionId: string, answer: MCQAnswer | TrueFalseAnswer): void
- setCurrentIndex(index: number): void
- setSubmitting(submitting: boolean): void
- clearExam(): void — reset all state to initial values

Import types from src/types.
```

---

### 5.7 Custom Hooks

**📋 Copilot Prompt — Create `src/hooks/useAuth.ts`:**

```
Create src/hooks/useAuth.ts.

This hook provides all authentication actions to screens.

Import: authApi from src/api/auth.api.ts, useAuthStore from src/store/auth.store.ts, saveTokens/clearTokens from src/utils/storage.ts, queryClient from src/api/queryClient.ts

Export a function useAuth() that returns:
- user (from auth store)
- isAuthenticated (from auth store)

- login(email, password): async function that:
    1. Calls authApi.login(email, password)
    2. Saves tokens with saveTokens(accessToken, refreshToken)
    3. Sets user in auth store with setUser()
    4. Returns the user object

- logout(): async function that:
    1. Calls authApi.logout() (ignore errors)
    2. Calls clearTokens()
    3. Calls store.logout()
    4. Calls queryClient.clear()

- register(payload): calls authApi.register(payload)
- sendOtp, verifyOtp, resendOtp, forgotPassword, resetPassword, changePassword:
    — just re-export from authApi (one-liners)

- initializeAuth(): async function for app startup:
    1. Calls authApi.getMe()
    2. If successful, sets user in store
    3. If fails (401), calls clearTokens() and logout()
    4. Always sets store.setLoading(false) in finally block
```

**📋 Copilot Prompt — Create `src/hooks/useHaptics.ts`:**

```
Create src/hooks/useHaptics.ts.

Import expo-haptics. Export a useHaptics() hook that returns these functions:
- onSelect(): calls Haptics.selectionAsync()
- onSuccess(): calls Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
- onWarning(): calls Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
- onError(): calls Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
- onImpact(): calls Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

Wrap each call in try/catch so haptics never crash the app (some devices don't support it).
```

---

### 5.8 Navigation Setup

**📋 Copilot Prompt — Create `src/navigation/types.ts`:**

```
Create src/navigation/types.ts. Define TypeScript navigation param list types.

AuthStackParamList:
- Splash: undefined
- Onboarding: undefined
- Login: undefined
- Register: undefined
- OTPVerification: { email: string; purpose: 'register' | 'forgot-password' }
- ForgotPassword: undefined
- ResetPassword: { email: string }

AppTabParamList:
- Home: undefined
- Exams: undefined
- Leaderboard: undefined
- Profile: undefined

HomeStackParamList:
- HomeMain: undefined
- Notifications: undefined

ExamStackParamList:
- ExamHub: undefined
- PastExam: { studentType: string; examType?: string }
- ModelTest: { studentType: string }
- Practice: { studentType: string }
- ExamConfig: { examCategory: string; studentType: string; subjectName?: string; chapterNames?: string[]; examType?: string }
- ExamSession: { attemptId: string }
- ExamResult: { attemptId: string }
- ExamReview: { attemptId: string }

ProfileStackParamList:
- ProfileMain: undefined
- History: undefined
- HistoryDetail: { attemptId: string }
- ChangePassword: undefined
- Subscription: undefined
- Plans: undefined

Export all param lists and create typed navigation prop helpers using @react-navigation/stack.
```

**📋 Copilot Prompt — Create `src/navigation/AuthNavigator.tsx`:**

```
Create src/navigation/AuthNavigator.tsx.

Create a Stack navigator with these screens (no header by default):
- 'Splash' → SplashScreen
- 'Onboarding' → OnboardingScreen
- 'Login' → LoginScreen
- 'Register' → RegisterScreen
- 'OTPVerification' → OTPVerificationScreen
- 'ForgotPassword' → ForgotPasswordScreen
- 'ResetPassword' → ResetPasswordScreen

All screens: headerShown false, animation: slide_from_right
Import screen components from src/screens/auth/ (create placeholder imports — we'll build screens later).
```

**📋 Copilot Prompt — Create `src/navigation/AppNavigator.tsx`:**

```
Create src/navigation/AppNavigator.tsx.

Create a Bottom Tab navigator with 4 tabs. Style the tab bar with:
- backgroundColor: '#FFFFFF'
- borderTopWidth: 0
- elevation: 20 (Android shadow)
- height: 60
- paddingBottom: 8

Tab 1: 'Home' → HomeNavigator, icon: 'home-variant' (MaterialCommunityIcons), label: 'Home'
Tab 2: 'Exams' → ExamNavigator, icon: 'book-open-variant', label: 'Exams'
Tab 3: 'Leaderboard' → LeaderboardScreen, icon: 'trophy-variant', label: 'Ranks'
Tab 4: 'Profile' → ProfileNavigator, icon: 'account-circle', label: 'Profile'

Active tab color: '#0F7B6C' (primary)
Inactive tab color: '#9B9A95' (textTertiary)
Font: Nunito, size 11

Show unread notification badge on Home tab (read count from notification store or use a badge prop).
```

**📋 Copilot Prompt — Create `src/navigation/RootNavigator.tsx`:**

```
Create src/navigation/RootNavigator.tsx.

This is the root navigator that decides which navigation stack to show.

Logic:
1. On mount, call initializeAuth() from useAuth hook
2. While isLoading (auth check in progress), show a full-screen loading view (teal background, centered ActivityIndicator)
3. If isAuthenticated === true → render AppNavigator
4. If isAuthenticated === false → render AuthNavigator

Wrap the navigator with NavigationContainer from @react-navigation/native.
```

**📋 Copilot Prompt — Update `App.tsx`:**

```
Rewrite App.tsx as the root entry point.

It should:
1. Import QueryClientProvider from @tanstack/react-query and queryClient
2. Import RootNavigator
3. Import Toast from react-native-toast-message
4. Import useFonts from expo-font and load Sora and Nunito font families (all weights: 400, 600, 700, 800)
5. Import SplashScreen from expo-splash-screen and keep the native splash visible until fonts are loaded
6. Wrap everything in: QueryClientProvider > GestureHandlerRootView > RootNavigator > Toast

Use expo-font's useFonts hook. Call SplashScreen.preventAutoHideAsync() at module level, then SplashScreen.hideAsync() once fonts are loaded.
```

---

## 6. Phase 2 — Authentication Flow

Build all auth screens. These are the first screens users see.

### API Endpoints Used in This Phase

| Action | Method | Endpoint |
|---|---|---|
| Register | POST | `/auth/register` |
| Login | POST | `/auth/login` |
| Send OTP | POST | `/auth/send-otp` |
| Verify OTP | POST | `/auth/verify-otp` |
| Resend OTP | POST | `/auth/resend-otp` |
| Forgot Password | POST | `/auth/forgot-password` |
| Reset Password | POST | `/auth/reset-password` |

**Registration `studentType` values accepted by backend:**
- `diploma_midwifery`
- `diploma_nursing_midwifery`
- `bsc_midwifery`
- `bsc_nursing_midwifery`

---

**📋 Copilot Prompt — Create `src/screens/auth/SplashScreen.tsx`:**

```
Create src/screens/auth/SplashScreen.tsx.

This is the initial loading screen shown while checking if user is already logged in.

Visual:
- Full-screen teal gradient background (colors: '#085C50' → '#0F7B6C' → '#1A9E8A') using LinearGradient from expo-linear-gradient
- App logo (use a 80×80 View with rounded corners as placeholder; add "NursePrep" text in white, Sora, 28px bold)
- Tagline text: "Your Path to Nursing Excellence" (Nunito, 16px, white, 80% opacity)
- Logo animates in with spring scale (0.7 → 1.0) using Reanimated withSpring on mount

Behavior:
- After animation (2.5s), call initializeAuth() from useAuth hook
- initializeAuth() determines where to navigate (auth store handles the state, RootNavigator handles the routing)
- Show ActivityIndicator in white at the bottom while auth check runs
```

**📋 Copilot Prompt — Create `src/screens/auth/OnboardingScreen.tsx`:**

```
Create src/screens/auth/OnboardingScreen.tsx.

Three-slide onboarding with horizontal swipe.

Slide data (hard-coded array):
1. { title: 'Master Every Exam', subtitle: 'Practice with thousands of real past exam questions from Diploma and B.Sc programs', lottie: require('../../../assets/animations/study.json') }
2. { title: 'Track Your Progress', subtitle: 'See your improvement, compare with peers on the weekly leaderboard', lottie: require('../../../assets/animations/leaderboard.json') }
3. { title: 'Learn at Your Pace', subtitle: 'Practice by subject, by chapter, whenever and wherever you want', lottie: require('../../../assets/animations/calendar.json') }

(Use placeholder View with teal background for Lottie until animation files are added)

UI:
- FlatList horizontal, pagingEnabled, showsHorizontalScrollIndicator: false
- Each slide: full width, Lottie (top 50% of screen), title (Sora bold 26px), subtitle (Nunito 15px textSecondary)
- Dot indicators row: active dot is 24px wide, inactive is 8px wide, spring width animation
- 'Skip' button (top-right, visible on slides 1 and 2) → navigates to 'Login'
- 'Get Started' primary button (visible only on slide 3) → navigates to 'Register'
- 'Already have an account? Login' link at bottom → navigates to 'Login'
- Auto-advances every 4 seconds using setInterval

State: currentIndex (number), use useRef for FlatList ref to call scrollToIndex programmatically.
```

**📋 Copilot Prompt — Create `src/components/auth/OTPInput.tsx`:**

```
Create src/components/auth/OTPInput.tsx.

This is a 6-box OTP entry component used in OTPVerificationScreen.

Props:
- value: string (the current OTP value, 0-6 chars)
- onChange: (otp: string) => void
- hasError: boolean (triggers shake animation + red border)
- disabled?: boolean

Implementation:
- 6 individual TextInput components in a row
- Each box: 48×56px, border-radius 12, centered text, fontSize 22, fontFamily Nunito bold
- Color states: default border '#E5E3DC', focused border '#0F7B6C', error border '#EF4444', filled border '#0F7B6C'
- Use useRef array of 6 refs for focus control
- On each TextInput onChangeText: extract single digit, update parent via onChange, move focus to next ref
- On KeyPress Backspace with empty value: move focus to previous ref
- Auto-submit: when all 6 digits are filled, call parent onChange immediately
- Shake animation: use Reanimated withSequence (left → right 8px, 4 times) when hasError changes to true
- Support paste: if onChangeText receives 6 characters at once, distribute across all boxes and call onChange

Use React.forwardRef if needed.
```

**📋 Copilot Prompt — Create `src/screens/auth/RegisterScreen.tsx`:**

```
Create src/screens/auth/RegisterScreen.tsx.

Use react-hook-form + zod for validation.

Zod schema (put in src/utils/validators.ts and import here):
- fullName: min 2 chars, required
- email: valid email, required
- password: min 8 chars, must contain uppercase, lowercase, number, and special character (@$!%*?&)
- confirmPassword: must match password
- studentType: one of ['diploma_midwifery', 'diploma_nursing_midwifery', 'bsc_midwifery', 'bsc_nursing_midwifery']

UI (ScrollView):
- Header: "Create Account" (Sora bold 28px) + "Join thousands of nursing students" subtitle
- Inputs (use the Input component from src/components/ui/Input.tsx):
  - Full Name (person icon)
  - Email (email keyboard, email icon)
  - Password (lock icon, eye toggle for visibility)
  - Confirm Password (lock icon, eye toggle)
- Program Type Picker:
  - Shows as a pressable field displaying the selected label
  - Opens a Modal with a list of 4 radio options:
    "Diploma in Midwifery" → 'diploma_midwifery'
    "Diploma in Nursing & Midwifery" → 'diploma_nursing_midwifery'
    "B.Sc in Midwifery" → 'bsc_midwifery'
    "B.Sc in Nursing & Midwifery" → 'bsc_nursing_midwifery'
- PasswordStrengthBar component below password field
- 'Create Account' button (disabled while form is invalid or submitting)
- 'Already have an account? Login' link at bottom

On successful registration (201):
  1. Show success toast: "Account created! Check your email for the OTP."
  2. Call authApi.sendOtp(email) to trigger OTP send
  3. Navigate to 'OTPVerification' screen with params { email, purpose: 'register' }

On error:
  - 409: show 'This email is already registered. Try logging in.'
  - 400: show field-specific error from error.details
  - Other: show generic toast error

Show loading overlay on the button while submitting.
```

**📋 Copilot Prompt — Create `src/screens/auth/OTPVerificationScreen.tsx`:**

```
Create src/screens/auth/OTPVerificationScreen.tsx.

Route params: { email: string, purpose: 'register' | 'forgot-password' }

UI:
- Back button (top left)
- Envelope Lottie animation (placeholder: teal icon) — 120×120px centered
- Title: "Check Your Email"
- Subtitle: "We sent a 6-digit code to {email}" (show email in bold)
- OTPInput component (6 boxes)
- 'Verify' button (primary, full width, disabled until 6 digits entered)
- Resend section: countdown timer from 60 seconds
  - While counting: "Resend in 00:42" (gray text, not pressable)
  - After countdown: "Resend OTP" (teal text, pressable)

On Verify press:
  1. Call authApi.verifyOtp(email, otp)
  2. On success:
     - If purpose === 'register': show success toast, navigate to 'Login'
     - If purpose === 'forgot-password': navigate to 'ResetPassword' with { email }
  3. On error (400): set hasError=true on OTPInput (triggers shake), show toast 'Invalid or expired OTP'

On Resend press:
  1. Call authApi.resendOtp(email)
  2. Reset countdown to 60
  3. Show toast 'OTP resent to your email'

Handle 429 rate limit error: show toast 'Too many attempts. Please wait before requesting another OTP.'
```

**📋 Copilot Prompt — Create `src/screens/auth/LoginScreen.tsx`:**

```
Create src/screens/auth/LoginScreen.tsx.

Use react-hook-form + zod. Zod schema: email (valid email) + password (min 8 chars).

UI:
- Curved teal header (use a View with borderBottomLeftRadius: 32, borderBottomRightRadius: 32, height: 200, backgroundColor primary) containing app logo and name
- White card below with padding 24, borderRadius 20, shadow:
  - "Welcome Back!" title (Sora bold 26px)
  - Email input with focused animation
  - Password input with eye toggle
  - "Forgot Password?" right-aligned link → navigates to ForgotPassword
- Primary button "Login" (full width, disabled while submitting)
- "Don't have an account? Register" link at bottom

On Login:
  1. Call useAuth().login(email, password)
  2. On success: RootNavigator automatically shows AppNavigator (auth store is updated)
  3. On 401: flash input borders red with shake animation, show toast 'Invalid email or password'
  4. On 429: show toast 'Too many login attempts. Please wait 15 minutes.'
  5. On network error: show toast 'No internet connection. Please try again.'
```

**📋 Copilot Prompt — Create `src/screens/auth/ForgotPasswordScreen.tsx`:**

```
Create src/screens/auth/ForgotPasswordScreen.tsx.

Simple screen with:
- Back button
- Title: "Forgot Password?"
- Subtitle: "Enter your email and we'll send you a reset link"
- Email input
- 'Send Reset Link' button

On submit:
  1. Call authApi.forgotPassword(email)
  2. On 200: show toast 'Check your email for the reset link.', navigate to OTPVerification with { email, purpose: 'forgot-password' }
  3. On 404: show 'No account found with this email address'
```

**📋 Copilot Prompt — Create `src/screens/auth/ResetPasswordScreen.tsx`:**

```
Create src/screens/auth/ResetPasswordScreen.tsx.

Route params: { email: string }

The screen also needs a resetToken input (the user gets this token from their email link; for mobile, they'll need to manually copy-paste it OR deep linking can handle this in production).

UI:
- Back button
- Title: "Reset Password"
- Inputs:
  - Reset Token (text input, labeled 'Paste token from email')
  - New Password (with strength bar)
  - Confirm New Password
- 'Reset Password' button

Zod validation: token required, password min 8 chars with complexity, passwords must match.

On submit:
  1. Call authApi.resetPassword(email, password, confirmPassword, resetToken)
  2. On 200: show toast 'Password reset successful! Please login.', navigate to Login and clear stack
  3. On 400/401: show 'Invalid or expired reset token'
```

---

## 7. Phase 3 — Home Screen & Bottom Navigation

### API Endpoints Used

| Data | Method | Endpoint |
|---|---|---|
| User profile | GET | `/users/profile` |
| User statistics | GET | `/users/statistics` |
| Leaderboard (my rank) | GET | `/leaderboards/my-rank` |
| Notifications (unread count) | GET | `/notifications?isRead=false&limit=1` |
| Exam history (recent) | GET | `/exams/history?page=1&limit=3` |

---

**📋 Copilot Prompt — Create `src/components/ui/ScreenWrapper.tsx`:**

```
Create src/components/ui/ScreenWrapper.tsx.

Props: children, style?, backgroundColor? (default: '#F8F7F4'), scrollable?: boolean (default: false), safeTop?: boolean (default: true)

Renders a SafeAreaView with StatusBar (barStyle: dark-content) and optionally a ScrollView. Applies background color.

This component wraps every screen.
```

**📋 Copilot Prompt — Create `src/components/ui/Button.tsx`:**

```
Create src/components/ui/Button.tsx.

Props:
- label: string
- onPress: () => void
- variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' (default: 'primary')
- size: 'sm' | 'md' | 'lg' (default: 'md')
- loading?: boolean (shows spinner, disables press)
- disabled?: boolean
- leftIcon?: React.ReactNode
- fullWidth?: boolean (default: false)
- style?: ViewStyle

Style by variant:
- primary: background '#0F7B6C', text white
- secondary: background '#E6F4F1', text '#0F7B6C'
- outline: border '#0F7B6C' 1.5px, transparent bg, text '#0F7B6C'
- ghost: transparent bg, text '#0F7B6C'
- danger: background '#EF4444', text white

Size mapping: sm (height 36, font 13), md (height 48, font 15), lg (height 56, font 17)

Press animation: scale spring 0.97 on press, 1.0 on release using Reanimated useAnimatedStyle + withSpring.
Border-radius: 12px.
Minimum touch target: ensure padding makes it at least 44×44px.
```

**📋 Copilot Prompt — Create `src/components/ui/Input.tsx`:**

```
Create src/components/ui/Input.tsx.

Props:
- label: string
- value: string
- onChangeText: (text: string) => void
- placeholder?: string
- error?: string (shows below input in red)
- leftIcon?: React.ReactNode
- rightIcon?: React.ReactNode
- secureTextEntry?: boolean
- keyboardType?: KeyboardTypeOptions
- autoCapitalize?: 'none' | 'sentences' | 'words'
- editable?: boolean
- multiline?: boolean
- style?: ViewStyle

Focus animation:
- Border color animates from '#E5E3DC' (unfocused) to '#0F7B6C' (focused) using Reanimated withTiming 200ms
- Label lifts slightly when focused (optional)

Error state: border '#EF4444', error text below in red 12px.
Height: 52px (single line), font Nunito 15px.
```

**📋 Copilot Prompt — Create `src/components/ui/SkeletonCard.tsx`:**

```
Create src/components/ui/SkeletonCard.tsx.

A loading placeholder card. Use react-native-skeleton-placeholder or implement with Reanimated interpolation animation (shimmer effect: opacity pulses between 0.4 and 1.0 in 1s loop).

Props:
- width?: number | string (default: '100%')
- height?: number (default: 80)
- borderRadius?: number (default: 16)
- style?: ViewStyle

Also export SkeletonText (width, height default 14, borderRadius 4) for text line placeholders.
```

**📋 Copilot Prompt — Create `src/screens/home/HomeScreen.tsx`:**

```
Create src/screens/home/HomeScreen.tsx.

This is the main Home tab screen. Use ScrollView (or Animated.ScrollView with pull-to-refresh).

Data to fetch:
- User profile: GET /users/profile (via useQuery with queryKeys.user.profile)
- User statistics: GET /users/statistics (via useQuery with queryKeys.user.stats)
- My rank: GET /leaderboards/my-rank (via useQuery with queryKeys.leaderboard.myRank)
- Recent history: GET /exams/history?page=1&limit=3 (via useQuery)

Show SkeletonCard while loading each section.

Layout (top to bottom):

1. GreetingHeader component:
   - Background: primary color '#0F7B6C'
   - "Good morning, {user.firstName}! 👋" — dynamic greeting based on hour (morning/afternoon/evening)
   - Student type badge: e.g. "Diploma Midwifery" — small white chip
   - Notification bell icon (top right) → navigate to Notifications screen
     Show a red dot badge if unread notifications exist
   - Streak info: "🔥 {stats.streakDays ?? 0} day streak" — amber text

2. WeeklyProgressCard component:
   - White card, shadow, borderRadius 16, padding 16
   - CircularProgress ring (animated, 0 → weeklyScore/500 * 100 percent)
   - "Weekly Score: {stats.weeklyScore} pts"
   - "Your Rank: #{myRank.rank}" (show loading skeleton if loading)
   - "Accuracy: {stats.accuracyPercentage}%"

3. SubscriptionBanner (show only if user has no active subscription — check GET /subscriptions/my returning 404):
   - Amber/teal gradient card
   - "🔓 Unlock All Questions — View Plans" button → navigate to Plans screen

4. QuickActionGrid (2×2 grid of pressable cards with staggered FadeInDown animation):
   - Past Exams → ExamHub screen
   - Model Tests → ExamHub screen
   - Practice → ExamHub screen
   - My History → History screen

5. RecentActivityCard:
   - Title: "Recent Activity"
   - Map last 3 exam history items into rows:
     examCategory + percentageScore + isPassed badge + date
   - "View All" → History screen
   - If empty: show EmptyState component ("No exams taken yet. Start practicing!")
```

---

## 8. Phase 4 — Exam Hub, Past Exam, Model Test, Practice

### API Endpoints Used

| Data | Method | Endpoint | Auth? |
|---|---|---|---|
| Question stats | GET | `/questions/statistics` | No |
| Questions (filtered) | GET | `/questions?studentType=&examType=&subjectName=&year=` | No |
| Subscription (check access) | GET | `/subscriptions/my` | Yes |

---

**📋 Copilot Prompt — Create `src/screens/exam/ExamHubScreen.tsx`:**

```
Create src/screens/exam/ExamHubScreen.tsx.

This is the exam selection hub, accessed from the Exams tab.

State:
- examGoal: 'license' | 'admission' (toggle at top, default: 'license', derived from user profile's examGoal)

Layout (ScrollView):
- Header: "Choose Your Exam" (Sora 24px bold)
- Student type info chip: shows user.studentType label (e.g., "Diploma in Midwifery")
- Toggle row: [License Exam] [Admission Exam] — animated pill slider, updates examGoal state

3 large category cards (vertical list), each with:
- Icon (Lottie or large MaterialCommunityIcons icon)
- Title
- Description
- Subtitle row (e.g., question count)
- Press animation: scale spring to 0.98
- FadeInDown entrance with stagger

Card A: "Past Exam Questions"
- Icon: 'file-document-multiple' (teal)
- Description: "Real questions from previous license & admission exams"
- Tap → navigate to PastExam screen with { studentType: user.studentType, examType: examGoal }

Card B: "Model Tests"
- Icon: 'clipboard-text' (teal)
- Description: "Full 100-question timed mock exams. Simulates real exam conditions."
- Tap → navigate to ModelTest screen with { studentType: user.studentType }

Card C: "Subject-wise Practice"
- Icon: 'bookshelf' (teal)
- Description: "Practice chapter by chapter at your own pace. No time pressure."
- Tap → navigate to Practice screen with { studentType: user.studentType }
```

**📋 Copilot Prompt — Create `src/screens/exam/ExamConfigScreen.tsx`:**

```
Create src/screens/exam/ExamConfigScreen.tsx.

Route params: { examCategory: string, studentType: string, subjectName?: string, chapterNames?: string[], examType?: string }

This screen is shown before starting any exam. It summarizes the exam and lets user configure settings.

UI (ScrollView):
- Header with back button: "Exam Setup"
- Info card:
  - Exam type badge (Past Exam / Model Test / Practice)
  - Subject name (if provided)
  - Chapters selected (if provided, shown as chips)
  - Question count: show preset based on examCategory
    - Past exam: 100 questions (50 MCQ + 50 T/F)
    - Model test: 100 questions
    - Practice: 30 questions (customizable via slider? keep it simple: use 30 as default)
  - Time limit: 90 minutes for model test, 0 (untimed) for practice
- Settings:
  - Toggle: "Enable Timer" (ON by default for past/model, OFF for practice)
  - Difficulty: [Mixed] [Easy] [Medium] [Hard] chips (default: Mixed)
- "Start Exam" button (primary, full width)
  - On press: call generateExam() → navigate to ExamSession

generateExam function:
  1. Show loading on button ("Preparing your exam...")
  2. Call examApi.generateExam({ examCategory, studentType, questionCount, difficulty, chapterNames, subjectName, examType })
  3. If 402 response: show modal "Subscription required" with "View Plans" button
  4. On success: call examStore.startExam(), navigate to ExamSession with { attemptId }
  5. On error: show toast

Save exam draft to AsyncStorage on startExam for crash recovery.
```

---

## 9. Phase 5 — Exam Session

This is the most complex screen. Build it carefully.

### API Endpoints Used

| Action | Method | Endpoint |
|---|---|---|
| Submit exam | POST | `/exams/{attemptId}/submit` |

The exam questions are loaded from the previous generate step (stored in exam.store.ts). No additional API call needed during the session.

---

**📋 Copilot Prompt — Create `src/components/exam/ExamTimer.tsx`:**

```
Create src/components/exam/ExamTimer.tsx.

Props:
- timeLimitSeconds: number
- startedAt: string (ISO date when exam started)
- onTimeUp: () => void

Implementation:
- Calculate elapsed time from startedAt to now using Date.now() arithmetic
- Remaining = timeLimitSeconds - elapsedSeconds
- Update every second using setInterval in useEffect
- Format as MM:SS string

Visual: 
- Row with clock icon + time text
- Color states (use Reanimated withTiming for smooth color transitions):
  - remaining > 5 min: text color '#0F7B6C' (primary)
  - 2–5 min: text color '#F59E0B' (amber warning), pulse animation (scale 1 ↔ 1.05)
  - < 2 min: text color '#EF4444' (red danger), faster pulse + call Haptics.notificationAsync(WARNING) every 30s
- When remaining <= 0: call onTimeUp() once, show "Time's Up!" text

Clean up interval on unmount.
```

**📋 Copilot Prompt — Create `src/components/exam/MCQOption.tsx`:**

```
Create src/components/exam/MCQOption.tsx.

Props:
- option: { text: string, orderIndex: number }
- optionLetter: string ('A', 'B', 'C', 'D')
- isSelected: boolean
- onSelect: (index: number) => void
- disabled?: boolean
- revealState?: 'correct' | 'incorrect' | null (for review mode)

Visual:
- Full-width card, height auto (min 56px), borderRadius 12, padding horizontal 16
- Left: circle (32×32) with option letter, font Sora bold 14px
- Right: option text, Nunito 15px

State-based styling:
- Default: border '#E5E3DC', background white, letter circle outline
- Selected: border '#0F7B6C', background '#E6F4F1', letter circle filled with primary
- correct (review): border '#10B981', background '#D1FAE5', letter circle green
- incorrect (review): border '#EF4444', background '#FEE2E2', letter circle red

Press animation: scale spring 0.97 → 1.0 using Reanimated withSpring
On select (when not disabled): call Haptics.selectionAsync() + onSelect(orderIndex)

Entrance animation: FadeInDown with delay = orderIndex * 60ms
```

**📋 Copilot Prompt — Create `src/components/exam/TrueFalseStatement.tsx`:**

```
Create src/components/exam/TrueFalseStatement.tsx.

Props:
- statement: { text: string, orderIndex: number }
- selectedValue: boolean | null (null = unanswered)
- onSelect: (index: number, value: boolean) => void
- disabled?: boolean

Visual:
- Full-width row card, borderRadius 12, padding 12
- Left: statement number badge + statement text (Nunito 15px), flex 1
- Right: two buttons side by side:
  - [TRUE] button: width 64, height 36, borderRadius 8
    - Unselected: border '#10B981', transparent bg, text '#10B981'
    - Selected: background '#10B981', text white
  - [FALSE] button: same dimensions
    - Unselected: border '#EF4444', transparent bg, text '#EF4444'
    - Selected: background '#EF4444', text white
- On button press: scale spring animation + Haptics.selectionAsync() + call onSelect(index, value)

Entrance animation: FadeInDown with delay = orderIndex * 60ms
```

**📋 Copilot Prompt — Create `src/components/exam/QuestionProgress.tsx`:**

```
Create src/components/exam/QuestionProgress.tsx.

Props:
- totalQuestions: number
- answers: Record<string, unknown> (keyed by questionId)
- questionIds: string[] (in order)
- currentIndex: number
- onJumpTo: (index: number) => void

Visual: A row of small dots (or numbered boxes for ≤ 20 questions, dots for > 20).
- Unanswered: '#E5E3DC' (border color)
- Answered: '#0F7B6C' (filled primary)
- Current: '#F59E0B' (amber) with subtle scale pulse

Display in a horizontally-scrollable ScrollView that auto-scrolls to keep current question visible.

Pressing any dot: calls onJumpTo(index).
```

**📋 Copilot Prompt — Create `src/screens/exam/ExamSessionScreen.tsx`:**

```
Create src/screens/exam/ExamSessionScreen.tsx.

Route params: { attemptId: string }

This is a full-screen exam interface. Disable the system back button during exam.

State (from exam.store.ts):
- questions: array of question objects from generate endpoint
- answers: Record<questionId, answer>
- currentQuestionIndex

Local state:
- isSubmitModalVisible: boolean
- isTimeUp: boolean

Layout:
┌─────────────────────────────┐
│ [ExamTimer]   Q {n} / {total}│
│ [QuestionProgress bar]       │
├─────────────────────────────┤
│ [QuestionCard]               │
│   Question text              │
│   [MCQ options OR T/F rows]  │
├─────────────────────────────┤
│ [PREV] [Question #] [NEXT]   │
│ [Submit button — last Q]     │
└─────────────────────────────┘

Question display logic:
- Get currentQuestion = questions[currentQuestionIndex]
- If questionPattern === 'mcq': render MCQOption components for each option
- If questionPattern === 'true_false': render TrueFalseStatement for each statement

Answer logic:
- MCQ: setAnswer(questionId, { questionId, selectedOptionIndex: orderIndex })
- True/False: setAnswer(questionId, { questionId, statementAnswers: [...] })
  Update individual statement while keeping others (merge into existing answer)

Navigation:
- PREV button: disabled on first question
- NEXT button: disabled on last question
- Swiping left/right (use GestureDetector from Gesture Handler) navigates between questions
- Tapping question number opens a bottom modal with QuestionProgress grid for jumping

Submit flow:
1. Show confirm modal: "Submit Exam? You have {unansweredCount} unanswered questions."
2. On confirm: call examApi.submitExam(attemptId, formatAnswers(), elapsedSeconds)
3. Save to AsyncStorage draft on every answer change (for crash recovery)
4. On success: clear exam store, navigate to ExamResult (replace navigation so back button can't return to session)
5. On error: show toast, allow retry

Time up: auto-trigger submit modal with "Time's Up! Your exam is being submitted." message.

formatAnswers(): convert store.answers object to the array format required by the API.
```

---

## 10. Phase 6 — Exam Result & Review

### API Endpoints Used

| Action | Method | Endpoint |
|---|---|---|
| Get result | GET | `/exams/{attemptId}/result` |
| Get attempt detail | GET | `/exams/history/{attemptId}` |

---

**📋 Copilot Prompt — Create `src/screens/exam/ExamResultScreen.tsx`:**

```
Create src/screens/exam/ExamResultScreen.tsx.

Route params: { attemptId: string }

Fetch: examApi.getExamResult(attemptId)
Response: { attemptId, totalMarks, obtainedMarks, percentageScore, isPassed, correctAnswers, wrongAnswers, unansweredQuestions, timeTakenSeconds, answers[] }

On mount animation:
- If isPassed: trigger Lottie confetti animation (or a green glow if no file)
- If not passed: show motivational Lottie (or orange/amber styling)

Layout (ScrollView):

1. Score Ring (animated circular progress):
   - Animates from 0 → percentageScore over 1.2 seconds using Reanimated withTiming
   - Large circle (160px), ring color green if passed, red if not
   - Center text: "{percentageScore}%" (Sora bold 36px) + "Passed ✓" or "Keep Going!"

2. Stats row (3 cards):
   - ✓ {correctAnswers} Correct (green)
   - ✗ {wrongAnswers} Wrong (red)
   - — {unansweredQuestions} Skipped (gray)
   
3. Score breakdown:
   - Obtained: {obtainedMarks} / {totalMarks}
   - Time: format timeTakenSeconds as HH:MM:SS

4. Action buttons row:
   - "Review Answers" → navigate to ExamReview with { attemptId }
   - "New Exam" → navigate back to ExamHub
   - "Home" → navigate to Home tab

Animate stats cards in with FadeInDown staggered at 100ms each.
```

**📋 Copilot Prompt — Create `src/screens/exam/ExamReviewScreen.tsx`:**

```
Create src/screens/exam/ExamReviewScreen.tsx.

Route params: { attemptId: string }

Fetch: examApi.getExamAttemptDetail(attemptId)
Response includes answers[] with: questionId, questionText, questionPattern, selectedOptionIndex, isCorrect, earnedMarks

Render each answered question as a card:
- Question text
- For MCQ: show all 4 options using MCQOption component with disabled=true and revealState set:
  - The selected option: revealState='correct' if isCorrect, 'incorrect' if not
  - No other options highlighted (only show what the user selected)
- For True/False: show statements with TrueFalseStatement disabled=true showing what was selected
- Below each question: "Earned: {earnedMarks} / {totalMarks}" 

Add a filter row at top: [All] [Correct] [Wrong] [Skipped] — filter which questions to show.

FlatList with keyExtractor = questionId.
```

---

## 11. Phase 7 — Leaderboard

### API Endpoints Used

| Action | Method | Endpoint | Auth? |
|---|---|---|---|
| Weekly leaderboard | GET | `/leaderboards/weekly?limit=100` | No |
| My rank | GET | `/leaderboards/my-rank` | Yes |

---

**📋 Copilot Prompt — Create `src/components/leaderboard/TopThreePodium.tsx`:**

```
Create src/components/leaderboard/TopThreePodium.tsx.

Props: top3: LeaderboardEntry[] (first 3 items from leaderboard data)

Visual: Three animated podium pillars. Layout: [2nd] [1st] [3rd]

Heights: 2nd = 90px, 1st = 120px, 3rd = 70px
Each pillar (a View):
- Background: primary teal
- Rank number on pillar face (white, Sora bold 18px)
- Above pillar: avatar circle (48×48) with initials, ring color gold/silver/bronze
- Name text below avatar (Nunito bold 13px, masked: show first name + last initial)
- Score text above avatar (Nunito semibold 12px, primary color)
- 1st place: crown emoji '👑' floating above (add bounce animation with withRepeat)

Entrance animation: each pillar uses Animated translateY rising from +120px → 0 with staggered spring.
Order: 3rd rises first, then 2nd, then 1st.
```

**📋 Copilot Prompt — Create `src/screens/leaderboard/LeaderboardScreen.tsx`:**

```
Create src/screens/leaderboard/LeaderboardScreen.tsx.

Fetch:
- GET /leaderboards/weekly?limit=100 (queryKeys.leaderboard.weekly)
- GET /leaderboards/my-rank (queryKeys.leaderboard.myRank, requires auth)

Response for weekly: [{ rank, userId, userName, score, examsTaken, accuracy, studentType }]
My rank: { rank, weeklyScore, percentile, comparedTo }

UI:
- Header: "Weekly Leaderboard" + "Resets every Sunday" subtitle
- StudentType filter chips: [All] [Diploma Midwifery] [B.Sc Midwifery] [Diploma Nursing] [B.Sc Nursing]
  - Filtering is done client-side on the fetched data using studentType field

- TopThreePodium component (top 3 entries)

- My Rank sticky banner (if logged in):
  - Shows: "Your rank: #{myRank.rank} | Score: {myRank.weeklyScore} | Top {100 - myRank.percentile}%"
  - Teal background, white text, sticky at bottom using position absolute + bottom: 0

- FlatList of remaining entries (rank 4+):
  LeaderboardRow component:
  - Rank number | Avatar (initials circle) | Name (masked) | Score | Accuracy %
  - Highlight current user's row with primaryLight background

Show SkeletonCard ×5 while loading.
```

---

## 12. Phase 8 — Profile & History

### API Endpoints Used

| Action | Method | Endpoint |
|---|---|---|
| Get profile | GET | `/users/profile` |
| Update profile | PATCH | `/users/profile` |
| Get statistics | GET | `/users/statistics` |
| Change password | PATCH | `/auth/change-password` |
| Exam history (paginated) | GET | `/exams/history?page=&limit=10` |
| Attempt detail | GET | `/exams/history/{attemptId}` |

---

**📋 Copilot Prompt — Create `src/screens/profile/ProfileScreen.tsx`:**

```
Create src/screens/profile/ProfileScreen.tsx.

Fetch: GET /users/profile, GET /users/statistics

UI (ScrollView):
- Profile header card (primary background):
  - Avatar circle (64px) with user initials (or profile picture if URL exists)
  - Full name (Sora bold 20px, white)
  - Student type label (Nunito 13px, white 80%)
  - Edit button (top right corner) → navigate to edit profile form (can be inline toggle or new screen)

- Stats row (4 metrics):
  - Total Exams: {stats.totalExamsTaken}
  - Avg Score: {stats.averageScore}%
  - Accuracy: {stats.accuracyPercentage}%
  - Best Score: {stats.bestScore}%
  - Animate numbers counting up from 0 on mount with Reanimated

- Menu list (vertical, each item is a tappable row with icon + label + right chevron):
  - 📋 My Exam History → HistoryScreen
  - 💳 Subscription → SubscriptionScreen
  - 🔒 Change Password → ChangePasswordScreen
  - 🔔 Notifications → NotificationsScreen
  - 🚪 Logout → show confirm dialog, then useAuth().logout()

- App version at bottom (read from expo-constants)
```

**📋 Copilot Prompt — Create `src/screens/profile/HistoryScreen.tsx`:**

```
Create src/screens/profile/HistoryScreen.tsx.

Paginated list of past exam attempts using React Query's useInfiniteQuery.

Endpoint: GET /exams/history?page=1&limit=10&status=submitted&sortBy=createdAt&order=desc

Response: { attempts[], pagination: { total, page, limit, pages }, statistics: { totalAttempts, passedCount, failedCount, averageScore } }

UI:
- Header stats bar: "{total} exams | Pass rate: {passedCount/total*100}% | Avg: {averageScore}%"
- Filter row: [All] [Passed] [Failed] — client-side filter on status
- FlatList with infinite scroll:
  Each item (AttemptRow):
  - Left: date badge (DD/MM/YY)
  - Center: examCategory label + question count
  - Right: percentageScore % (green if passed, red if failed)
  - isPassed badge chip

- onEndReached: load next page using React Query's fetchNextPage
- ListFooterComponent: ActivityIndicator when loading more

Tap row → navigate to HistoryDetail with { attemptId }
```

**📋 Copilot Prompt — Create `src/screens/profile/ChangePasswordScreen.tsx`:**

```
Create src/screens/profile/ChangePasswordScreen.tsx.

Form with react-hook-form + zod:
- Current Password
- New Password (with strength bar)
- Confirm New Password

Zod: all required, new password min 8 chars with complexity rules (same as registration), passwords must match.

On submit:
  1. Call authApi.changePassword(currentPassword, password, passwordConfirm)
  2. Endpoint: PATCH /auth/change-password
  3. On 200: show toast 'Password changed successfully', navigate back
  4. On 400 (wrong current password): show error below Current Password field

Note: After successful password change, the backend may return a new accessToken. If it does, save it.
```

---

## 13. Phase 9 — Subscription

### API Endpoints Used

| Action | Method | Endpoint | Auth? |
|---|---|---|---|
| Get plans | GET | `/subscriptions/plans` | No |
| Subscribe | POST | `/subscriptions/subscribe` | Yes |
| My subscription | GET | `/subscriptions/my` | Yes |
| Subscription history | GET | `/subscriptions/history` | Yes |

---

**📋 Copilot Prompt — Create `src/screens/profile/SubscriptionScreen.tsx`:**

```
Create src/screens/profile/SubscriptionScreen.tsx.

Fetch: GET /subscriptions/my (returns active subscription or 404 if none)
Also fetch: GET /subscriptions/history

UI:
- If active subscription exists:
  - Status card (teal/amber gradient):
    - Plan name: "Premium Plan"
    - Status: "Active ✓"
    - Expires: format endDate as "Expires in {daysRemaining} days" (red if < 7 days)
    - Amount paid: {currency} {amount}
  - Benefits list (if plan data cached)
  - "Upgrade Plan" button → Plans screen

- If no active subscription:
  - Locked state illustration
  - "Subscribe to unlock all features"
  - "View Plans" button → Plans screen

- Subscription History section:
  - List of past subscriptions with status chips (Active/Expired/Cancelled)
```

**📋 Copilot Prompt — Create a Plans screen at `src/screens/profile/PlansScreen.tsx` (or reachable from Subscription):**

```
Create a PlansScreen that fetches GET /subscriptions/plans.

Response: [{ planId, name, description, price, currency, durationDays, benefits[] }]

UI — 3 plan cards (vertical stack):
- Each card: plan name (Sora bold 18px), price badge (accent amber), duration, benefits list (checkmarks)
- Recommended badge on the middle plan ("Most Popular")
- "Subscribe" button on each

On Subscribe press:
  1. Show confirmation modal: "Subscribe to {planName}? {price} {currency} / {durationDays} days"
  2. On confirm: call subscriptionApi.subscribeToPlan(planId, 'card', 'razorpay')
  3. Note: In production, this integrates with a payment gateway. For now, use mock payment flow.
  4. On 201: show toast 'Subscription activated!', invalidate subscription queries, navigate back
  5. On 409 (already subscribed): show 'You already have an active subscription'
  6. On 401: redirect to login
```

---

## 14. Phase 10 — Notifications

### API Endpoints Used

| Action | Method | Endpoint |
|---|---|---|
| Get notifications | GET | `/notifications?page=1&limit=20&order=desc` |
| Mark single as read | PATCH | `/notifications/{notificationId}/read` |
| Mark all as read | PATCH | `/notifications/read-all` |
| Delete | DELETE | `/notifications/{notificationId}` |

---

**📋 Copilot Prompt — Create `src/screens/home/NotificationScreen.tsx`:**

```
Create src/screens/home/NotificationScreen.tsx.

Paginated notifications list.

Fetch: GET /notifications?page=1&limit=20&sortBy=createdAt&order=desc
Response: { notifications[], pagination, unreadCount }

On mount: also call markAllAsRead() to mark everything as read (fires and forgets).

UI:
- Header with back button: "Notifications" + "Mark all read" text button (top right)
- If unreadCount > 0: show amber banner "You have {unreadCount} unread notifications"

FlatList:
Each NotificationRow:
- Left: icon emoji (use notification.icon field) in colored circle (type-based color)
- Center: notification.title (bold if unread) + notification.message (2 lines) + relative date
- Right: unread dot (small teal circle) if !isRead
- Unread rows: slightly tinted background ('#F0FAF8')

Swipe-to-delete: use GestureDetector or react-native-swipeable for delete gesture.
  On delete: call notificationApi.deleteNotification(notificationId), optimistically remove from list.

Notification types color coding:
- exam: '#0F7B6C' (teal)
- subscription: '#F59E0B' (amber)
- system: '#3B82F6' (blue)
- performance: '#10B981' (green)
- achievement: '#8B5CF6' (purple)

Empty state: EmptyState component with message "You're all caught up! No notifications."
```

---

## 15. API Integration Guide

### Complete Endpoint Reference

All endpoints are prefixed with your base URL: `EXPO_PUBLIC_API_URL` (e.g., `https://your-domain/api/v1`)

#### Authentication Module

```
POST   /auth/register          → { fullName, email, password, phoneNumber, studentType }
POST   /auth/login             → { email, password } → returns { accessToken, refreshToken, user }
POST   /auth/send-otp          → { email }
POST   /auth/verify-otp        → { email, otp }
POST   /auth/resend-otp        → { email }
POST   /auth/forgot-password   → { email }
POST   /auth/reset-password    → { email, password, passwordConfirm, resetToken }
PATCH  /auth/change-password   → { currentPassword, password, passwordConfirm } [AUTH]
POST   /auth/refresh-token     → { refreshToken }
GET    /auth/me                → returns current user [AUTH]
POST   /auth/logout            → [AUTH]
```

#### User Module

```
GET    /users/profile          → [AUTH]
PATCH  /users/profile          → { firstName?, lastName?, phone?, bio?, grade? } [AUTH]
GET    /users/statistics       → [AUTH]
```

#### Question Module

```
GET    /questions              → ?page&limit&difficulty&studentType&examType&subjectName&chapterName&questionPattern&year&search
GET    /questions/statistics   → (public, no auth)
GET    /questions/:id          → (public)
POST   /questions/:id/report   → { reason, description } [AUTH]
```

#### Exam Module

```
POST   /exams/generate         → { examCategory, studentType, questionCount, difficulty?, chapterNames?, subjectName?, examType? } [AUTH]
POST   /exams/:attemptId/submit → { answers[], totalTimeTakenSeconds } [AUTH]
GET    /exams/:attemptId/result → [AUTH]
GET    /exams/history          → ?page&limit&status&examCategory&sortBy&order [AUTH]
GET    /exams/history/:id      → [AUTH]
```

**Generate Exam Payload Examples:**

```typescript
// Past Exam by year
{
  examCategory: "past_exam",
  studentType: "diploma_midwifery",
  examType: "license",
  questionCount: 100,
  difficulty: "mixed",
  year: 2023
}

// Model Test
{
  examCategory: "model_test",
  studentType: "bsc_nursing_midwifery",
  questionCount: 100,
  difficulty: "mixed"
}

// Subject Practice
{
  examCategory: "subject",
  studentType: "diploma_midwifery",
  subjectName: "Anatomy",
  questionCount: 30,
  difficulty: "medium"
}

// Chapter Practice
{
  examCategory: "chapter",
  studentType: "diploma_midwifery",
  chapterNames: ["Bones and Joints", "Muscles"],
  questionCount: 20,
  difficulty: "easy"
}
```

**Submit Exam Payload Format:**

```typescript
// MCQ answer:
{ questionId: "507f...", selectedOptionIndex: 0 }

// True/False answer:
{
  questionId: "507f...",
  statementAnswers: [
    { statementIndex: 0, selectedValue: true },
    { statementIndex: 1, selectedValue: false },
    { statementIndex: 2, selectedValue: true }
  ]
}
```

#### Subscription Module

```
GET    /subscriptions/plans    → (public)
POST   /subscriptions/subscribe → { planId, paymentMethod, paymentGateway? } [AUTH]
GET    /subscriptions/my       → [AUTH]
GET    /subscriptions/history  → ?page&limit&status [AUTH]
```

#### Leaderboard Module

```
GET    /leaderboards/weekly    → ?page&limit&studentType (public)
GET    /leaderboards/my-rank   → [AUTH]
```

#### Notification Module

```
GET    /notifications          → ?page&limit&isRead&type&sortBy&order [AUTH]
PATCH  /notifications/:id/read → [AUTH]
PATCH  /notifications/read-all → [AUTH]
DELETE /notifications/:id      → [AUTH]
```

### HTTP Status Codes to Handle in Every Screen

```typescript
// Always handle these in your catch blocks:
switch (error.response?.status) {
  case 400: // Validation error — show field errors from error.details
  case 401: // Unauthorized — token expired, redirect to login
  case 402: // Payment required — subscription needed, show plans modal
  case 403: // Forbidden — access denied (admin-only endpoint)
  case 404: // Not found — show empty state
  case 409: // Conflict — duplicate (already subscribed, already reported)
  case 422: // Validation error — similar to 400
  case 429: // Rate limited — show cooldown message with retryAfter seconds
  case 500: // Server error — show generic "Something went wrong" message
}
```

---

## 16. State Management Strategy

### Two Sources of Truth

The app has two types of state:

**1. Global State (Zustand) — survives screen navigation:**
- `auth.store.ts` — user object, isAuthenticated, isLoading
- `exam.store.ts` — active exam session (questions, answers, timer state)
- `ui.store.ts` — theme preference, locale

**2. Server State (React Query) — fetched from API, cached:**
- User profile, statistics
- Exam history, results
- Leaderboard data
- Subscription plans and status
- Notifications

**Rule: Never duplicate server state in Zustand.** If data comes from the API, use React Query. If data must persist across screen unmounts without re-fetching, use Zustand.

### React Query Patterns

**📋 Copilot Prompt — Create `src/hooks/useProfile.ts`:**

```
Create src/hooks/useProfile.ts.

Export useProfile() hook that:
1. Fetches profile: useQuery({ queryKey: queryKeys.user.profile, queryFn: () => userApi.getUserProfile() })
2. Fetches stats: useQuery({ queryKey: queryKeys.user.stats, queryFn: () => userApi.getUserStatistics() })
3. Returns useMutation for updateProfile:
   mutationFn: userApi.updateProfile,
   onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.profile })
4. Returns { profile, stats, isLoading, updateProfile, isUpdating }
```

**📋 Copilot Prompt — Create `src/hooks/useExam.ts`:**

```
Create src/hooks/useExam.ts.

Export useExamHistory() hook using useInfiniteQuery:
- queryKey: queryKeys.exam.history
- queryFn: ({ pageParam = 1 }) => examApi.getExamHistory({ page: pageParam, limit: 10 })
- getNextPageParam: (lastPage) => lastPage.pagination.page < lastPage.pagination.pages ? lastPage.pagination.page + 1 : undefined

Export useExamResult(attemptId: string):
- useQuery({ queryKey: queryKeys.exam.result(attemptId), queryFn: () => examApi.getExamResult(attemptId), enabled: !!attemptId })

Export useSubmitExam():
- useMutation that calls examApi.submitExam, then on success invalidates exam history queries
```

**📋 Copilot Prompt — Create `src/hooks/useNotifications.ts`:**

```
Create src/hooks/useNotifications.ts.

Export useNotifications() using useInfiniteQuery:
- queryKey: queryKeys.notifications.list(1)
- queryFn fetches paginated notifications
- Returns { notifications (flattened from all pages), unreadCount, fetchNextPage, hasNextPage, isLoading }

Export useMarkAllRead():
- useMutation that calls notificationApi.markAllAsRead()
- onSuccess: invalidate notification queries

Export useDeleteNotification():
- useMutation that calls notificationApi.deleteNotification(id)
- onSuccess: invalidate notification queries
```

---

## 17. Authentication Flow (Deep Dive)

### Complete Token Lifecycle

```
App starts
    ↓
SplashScreen mounts → initializeAuth() called
    ↓
GET /auth/me (with token from SecureStore)
    ├── 200 OK: user object → setUser() in auth store → AppNavigator shown
    └── 401 Error: clearTokens() → logout() → AuthNavigator shown

User logs in
    ↓
POST /auth/login → { accessToken, refreshToken, user }
    ↓
saveTokens(accessToken, refreshToken) → SecureStore
setUser(user) → Zustand auth store
RootNavigator re-renders → AppNavigator shown

Access token expires (24h)
    ↓
API request returns 401
    ↓
Axios interceptor catches it → GET /auth/refresh-token with refreshToken
    ├── 200 OK: new accessToken → saveTokens → retry original request
    └── 401 Error: clearTokens() → logout() → RootNavigator → AuthNavigator

User logs out
    ↓
POST /auth/logout (fire and forget)
    ↓
clearTokens() → SecureStore
useAuthStore.logout() → Zustand
queryClient.clear() → React Query cache
RootNavigator re-renders → AuthNavigator shown
```

### OTP Flow (Registration)

```
Register form submitted
    ↓
POST /auth/register → 201 (user created, email unverified)
    ↓
POST /auth/send-otp with { email } (trigger OTP email)
    ↓
Navigate to OTPVerificationScreen with { email, purpose: 'register' }
    ↓
User enters 6-digit OTP
    ↓
POST /auth/verify-otp → 200 (email verified)
    ↓
Navigate to Login screen with success toast
```

### OTP Flow (Forgot Password)

```
ForgotPasswordScreen: enter email
    ↓
POST /auth/forgot-password → 200 (sends reset token to email)
    ↓
Navigate to OTPVerificationScreen with { email, purpose: 'forgot-password' }
    ↓
User enters OTP from email
    ↓
POST /auth/verify-otp → 200
    ↓
Navigate to ResetPasswordScreen with { email }
    ↓
User enters: resetToken (from email) + newPassword + confirmPassword
    ↓
POST /auth/reset-password → 200 (password changed)
    ↓
Navigate to Login
```

---

## 18. Error Handling & Edge Cases

### Global Error Handler

**📋 Copilot Prompt — Add error handling utility to `src/utils/formatters.ts`:**

```
Create src/utils/formatters.ts.

Export these functions:
1. formatApiError(error: unknown): string
   - If axios error: return error.response.data.error.message (or error.response.data.message)
   - If network error (no response): return 'No internet connection. Please check your network.'
   - If timeout: return 'Request timed out. Please try again.'
   - Otherwise: return 'Something went wrong. Please try again.'

2. formatDate(dateString: string): string
   - Format as 'DD MMM YYYY' using date-fns format function

3. formatRelativeDate(dateString: string): string
   - Return 'Just now', '2 hours ago', 'Yesterday', '3 days ago' etc.
   - Use date-fns formatDistanceToNow

4. formatDuration(seconds: number): string
   - Convert seconds to MM:SS or H:MM:SS string

5. formatScore(obtained: number, total: number): string
   - Returns '{obtained} / {total}'

6. formatPercentage(value: number): string
   - Returns '{value.toFixed(1)}%'

7. maskName(fullName: string): string
   - "Fatema Khatun" → "Fatema K." (for leaderboard privacy)

8. getStudentTypeLabel(studentType: string): string
   - Maps API values to display labels:
     'diploma_midwifery' → 'Diploma in Midwifery'
     'diploma_nursing_midwifery' → 'Diploma in Nursing & Midwifery'
     'bsc_midwifery' → 'B.Sc in Midwifery'
     'bsc_nursing_midwifery' → 'B.Sc in Nursing & Midwifery'
```

### Rate Limiting Handler

```typescript
// In any screen making auth API calls:
} catch (error) {
  if (error.response?.status === 429) {
    const retryAfter = error.response.data?.error?.retryAfter || 300;
    const minutes = Math.ceil(retryAfter / 60);
    showToast(`Too many attempts. Please wait ${minutes} minute(s).`, 'warning');
  }
}
```

### Subscription Lock Enforcement

**📋 Copilot Prompt — Create subscription guard logic:**

```
In ExamConfigScreen, before calling generateExam():
  1. Check if user has active subscription (GET /subscriptions/my)
  2. If 404 (no subscription) AND examCategory is NOT 'practice':
     Show a bottom modal with:
     - "🔒 Subscription Required"
     - "This feature requires an active subscription"
     - Benefits list
     - "View Plans" button → navigate to Plans screen
     - "Maybe Later" dismiss button
  3. If subscription exists (200): proceed with generateExam()

Store subscription status in React Query cache (queryKeys.subscription.my) so this check is instant after first fetch.
```

### Offline Handling

**📋 Copilot Prompt — Create network status hook:**

```
Create src/hooks/useNetworkStatus.ts.

Use @react-native-community/netinfo or expo-network to detect connectivity.

Export useNetworkStatus() that returns: { isOnline: boolean }

In critical screens (ExamSession, Submit), show a banner: "No internet connection. Your answers are saved locally."

In ExamSession specifically:
- Save answers to AsyncStorage on every answer change (as a draft)
- On submit failure due to network error: show retry button, keep answers in store
- Draft key: 'exam_draft_{attemptId}'
```

### Empty & Loading States

Every data-fetching screen must have three states:

```typescript
// Pattern to follow in every screen:
if (isLoading) {
  return <SkeletonCard height={80} />;  // Show skeleton, never spinner
}

if (error) {
  return (
    <EmptyState
      icon="wifi-off"
      title="Failed to Load"
      subtitle={formatApiError(error)}
      action={{ label: 'Retry', onPress: refetch }}
    />
  );
}

if (!data || data.length === 0) {
  return (
    <EmptyState
      icon="clipboard-text-off"
      title="Nothing Here Yet"
      subtitle="Start taking exams to see your history."
      action={{ label: 'Take an Exam', onPress: () => navigation.navigate('Exams') }}
    />
  );
}
```

**📋 Copilot Prompt — Create `src/components/ui/EmptyState.tsx`:**

```
Create src/components/ui/EmptyState.tsx.

Props:
- icon: string (MaterialCommunityIcons name)
- title: string
- subtitle: string
- action?: { label: string, onPress: () => void }
- lottie?: number (require() Lottie file)

Visual:
- Centered column (full screen)
- Lottie animation (if provided) OR large icon (64px, textTertiary color)
- Title (Sora 18px semibold, textPrimary)
- Subtitle (Nunito 15px, textSecondary, centered)
- Action button (primary outline style, if provided)

All with FadeInDown entrance animation.
```

---

## 19. Testing & Debugging Tips

### Test Account

Use these backend test credentials during development:

```
Student Email: student@example.com
Student Password: Student@123456

Admin Email: admin@example.com
Admin Password: Admin@123456
```

### React Query DevTools

Add to App.tsx during development:

```typescript
// Only in development builds
if (__DEV__) {
  // You can log all queries to console
  queryClient.getQueryCache().subscribe((event) => {
    console.log('[React Query]', event.type, event.query.queryKey);
  });
}
```

### Debugging Token Issues

If you get 401 errors on protected routes:

```typescript
// Add to client.ts temporarily for debugging
API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  console.log('[API Request]', config.method?.toUpperCase(), config.url);
  console.log('[Token exists]', !!token);
  // ... rest of interceptor
});
```

### Testing the Exam Flow

```
1. Login with test credentials
2. GET /subscriptions/plans — view available plans
3. POST /subscriptions/subscribe — activate Basic plan (planId from step 2)
4. POST /exams/generate — generate a test exam
   Body: { examCategory: "chapter", studentType: "diploma_midwifery", questionCount: 5, difficulty: "easy" }
5. Answer questions (track attemptId from generate response)
6. POST /exams/{attemptId}/submit — submit with answers
7. GET /exams/{attemptId}/result — view results
```

### Common Issues and Solutions

**Issue: "Network request failed" on Android emulator**
```bash
# Use this URL for Android emulator (not localhost):
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1
```

**Issue: Fonts not loading**
```typescript
// Ensure useFonts hook is awaited before hiding splash:
const [fontsLoaded] = useFonts({ 'Sora-Bold': Sora_700Bold, ... });
useEffect(() => {
  if (fontsLoaded) SplashScreen.hideAsync();
}, [fontsLoaded]);
```

**Issue: "Text strings must be rendered within a Text component"**
```typescript
// Always wrap conditional text in Text:
// ❌ WRONG:
{isLoading && 'Loading...'}
// ✅ CORRECT:
{isLoading && <Text>Loading...</Text>}
```

**Issue: Exam answers lost on app restart**
```typescript
// Verify exam draft is saved on every answer change:
// In ExamSessionScreen, useEffect on answers:
useEffect(() => {
  storage.saveExamDraft(attemptId, store.answers);
}, [store.answers]);
```

**Issue: 402 when generating exam**
```bash
# User needs an active subscription. Subscribe first:
POST /subscriptions/subscribe
Authorization: Bearer {token}
{ "planId": "{planId from GET /subscriptions/plans}", "paymentMethod": "card" }
```

### Performance Best Practices

**Memoize lists properly:**
```typescript
// ✅ Always use useCallback for FlatList renderItem:
const renderItem = useCallback(({ item }) => (
  <LeaderboardRow entry={item} />
), []);

// ✅ Always provide stable keyExtractor:
const keyExtractor = useCallback((item) => item.attemptId, []);
```

**Prevent unnecessary re-renders:**
```typescript
// ✅ Use React.memo for list items:
export const LeaderboardRow = React.memo(({ entry }) => {
  // ...
});
```

**Large question lists:**
```typescript
// FlatList config for smooth scrolling:
<FlatList
  data={questions}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
/>
```

---

## 20. Production Readiness Checklist

Work through this checklist before releasing the app.

### Security

- [ ] All JWT tokens stored in `expo-secure-store`, never in AsyncStorage
- [ ] No API keys or secrets in client code (all in backend)
- [ ] `.env` file is in `.gitignore`
- [ ] Error messages don't expose backend stack traces
- [ ] Token refresh logic handles concurrent 401 errors (queue pending requests while refreshing)

### Performance

- [ ] All FlatList components have `keyExtractor`, `removeClippedSubviews`, and `maxToRenderPerBatch`
- [ ] Images (profile pictures) are cached using expo-image
- [ ] React Query `staleTime` is set appropriately (5 min for profile, 1 min for notifications)
- [ ] Lottie animations are downloaded locally (not loaded from URL)
- [ ] Heavy screens (ExamSession) use `useMemo` for filtered question data

### User Experience

- [ ] Every data-loading state shows a skeleton, not a blank screen
- [ ] Every error state has a retry button
- [ ] Every empty state has a CTA to get started
- [ ] Form errors show inline (below field), not only in a toast
- [ ] All touch targets are minimum 44×44px
- [ ] Keyboard avoidance works on all form screens (use KeyboardAvoidingView)
- [ ] App works in offline mode with useful messaging

### Exam Session Reliability

- [ ] Answers saved to AsyncStorage on every change
- [ ] Exam timer persists across app background/foreground
- [ ] Submit button shows loading state and prevents double submission
- [ ] Network failure on submit shows retry option (answers preserved)
- [ ] Back gesture disabled during active exam

### Accessibility

- [ ] All icons paired with `accessibilityLabel`
- [ ] Color is never the only indicator (icons + color)
- [ ] Text meets contrast ratio requirements (WCAG AA)
- [ ] Buttons have meaningful `accessibilityHint`

### App Configuration

- [ ] Update `app.json` with real `bundleIdentifier` (iOS) and `package` (Android)
- [ ] Set production API URL in `.env`
- [ ] Configure `expo-notifications` for push notifications
- [ ] Test on both Android and iOS physical devices
- [ ] Run `expo doctor` to check for dependency issues
- [ ] Build with `eas build` before submitting to app stores

### Final Build Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS for your project
eas build:configure

# Build Android APK (for testing)
eas build -p android --profile preview

# Build for production
eas build -p android --profile production
eas build -p ios --profile production

# Submit to stores
eas submit -p android
eas submit -p ios
```

---

## Appendix A: Lottie Animation Files

Download these free animations from [LottieFiles.com](https://lottiefiles.com) and save as `.json` in `assets/animations/`:

| File | Search Term | Used In |
|---|---|---|
| `study.json` | "student studying books" | Onboarding slide 1 |
| `leaderboard.json` | "trophy leaderboard ranking" | Onboarding slide 2 |
| `calendar.json` | "calendar schedule" | Onboarding slide 3 |
| `email.json` | "email envelope open" | OTP Verification |
| `confetti.json` | "confetti burst success" | Exam Result (passed) |
| `tryagain.json` | "try again motivation" | Exam Result (failed) |
| `empty.json` | "empty clipboard" | Empty states |
| `loading.json` | "dots loading pulse" | Loading overlays |
| `unlock.json` | "unlock padlock" | Subscription screen |

---

## Appendix B: Complete Zod Validation Schemas

**📋 Copilot Prompt — Create `src/utils/validators.ts`:**

```
Create src/utils/validators.ts using zod.

Export these schemas:

1. registerSchema: z.object({
     fullName: z.string().min(2, 'Name must be at least 2 characters'),
     email: z.string().email('Please enter a valid email'),
     password: z.string()
       .min(8, 'Password must be at least 8 characters')
       .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
       .regex(/[a-z]/, 'Must contain at least one lowercase letter')
       .regex(/[0-9]/, 'Must contain at least one number')
       .regex(/[@$!%*?&]/, 'Must contain at least one special character'),
     confirmPassword: z.string(),
     studentType: z.enum(['diploma_midwifery', 'diploma_nursing_midwifery', 'bsc_midwifery', 'bsc_nursing_midwifery']),
   }).refine(data => data.password === data.confirmPassword, {
     message: 'Passwords do not match',
     path: ['confirmPassword'],
   })

2. loginSchema: z.object({
     email: z.string().email('Please enter a valid email'),
     password: z.string().min(8, 'Password must be at least 8 characters'),
   })

3. forgotPasswordSchema: z.object({
     email: z.string().email('Please enter a valid email'),
   })

4. resetPasswordSchema: z.object({
     resetToken: z.string().min(1, 'Reset token is required'),
     password: (same regex as registerSchema.password),
     confirmPassword: z.string(),
   }).refine(data => data.password === data.confirmPassword, { ... })

5. changePasswordSchema: z.object({
     currentPassword: z.string().min(1, 'Current password is required'),
     password: (same regex as above),
     confirmPassword: z.string(),
   }).refine(...)

6. updateProfileSchema: z.object({
     firstName: z.string().min(1).optional(),
     lastName: z.string().min(1).optional(),
     phone: z.string().regex(/^\+?[\d\s\-]{7,15}$/).optional(),
     bio: z.string().max(200).optional(),
   })

Export all schemas and their TypeScript types using z.infer<typeof schema>.
```

---

## Appendix C: Constants File

**📋 Copilot Prompt — Create `src/utils/constants.ts`:**

```
Create src/utils/constants.ts.

Export:

STUDENT_TYPES: array of { value: string, label: string } for all 4 studentType options
EXAM_CATEGORIES: array of { value: string, label: string } — 'past_exam', 'model_test', 'subject', 'chapter'
DIFFICULTIES: ['easy', 'medium', 'hard', 'mixed']
QUESTION_PATTERNS: ['mcq', 'true_false', 'mixed']

OPTION_LETTERS: ['A', 'B', 'C', 'D', 'E'] — for MCQ labels

DEFAULT_QUESTION_COUNTS: { past_exam: 100, model_test: 100, subject: 30, chapter: 20 }
DEFAULT_TIME_LIMITS: { past_exam: 5400, model_test: 5400, subject: 1800, chapter: 1200 } // seconds

RATE_LIMIT_MESSAGES: {
  auth: 'Too many attempts. Please wait 15 minutes.',
  otp: 'OTP limit reached. Please wait 1 hour.',
  exam: 'Too many exams generated. Please wait before trying again.',
}

MIN_PASSWORD_LENGTH: 8
OTP_LENGTH: 6
OTP_RESEND_COOLDOWN: 60 // seconds

NOTIFICATION_TYPES: { exam: 'exam', subscription: 'subscription', system: 'system', performance: 'performance', achievement: 'achievement' }
```

---

*This document was generated specifically for the NursePrep BD Nursing Preparation React Native project.*  
*Backend API Version: 1.0.0 | Frontend Stack: Expo SDK 51+ | Last Updated: April 2026*
