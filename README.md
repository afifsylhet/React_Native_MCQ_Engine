# 📚 NursPrep - BD Nursing Preparation App

> A comprehensive mobile application for nursing professionals to prepare and ace their exams with interactive MCQs and real-time performance tracking.

[![Expo](https://img.shields.io/badge/Expo-51.0.0-000?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.74.5-61DAFB?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

---

## ✨ Features

- 🧪 **Dynamic MCQ Generation** - Automatically generated exams with randomized questions
- 📊 **Detailed Results Analytics** - Comprehensive exam results with performance metrics
- 🏆 **Real-time Leaderboard** - Compete with other nursing professionals
- 📜 **Exam History** - Track all previous attempts and progress
- 🔔 **Push Notifications** - Stay updated with important announcements
- 🔐 **Secure Authentication** - JWT-based user authentication
- 📱 **Cross-Platform** - Works on iOS, Android, and Web
- 🎨 **Modern UI** - Beautiful, intuitive interface built with React Native
- ⚡ **Offline Support** - Partial offline functionality with local caching

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React Native 0.74.5
- **Development**: Expo 51.0.0
- **Language**: TypeScript 5.0+
- **State Management**: Zustand
- **API Client**: Axios with retry logic
- **Data Fetching**: React Query v5
- **Navigation**: React Navigation v6
- **Styling**: Tailwind CSS + React Native
- **Form Validation**: React Hook Form + Zod
- **Storage**: AsyncStorage & Expo SecureStore
- **UI Components**: React Native with custom components
- **Animations**: Lottie React Native

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **API Version**: v1

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Expo CLI**: `npm install -g expo-cli`
- **Android Studio** (for Android development) or **Xcode** (for iOS)
- **Git** (for version control)

### Optional
- **Android Emulator** or physical Android device
- **iOS Simulator** or physical iOS device

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "MCQ ENGINE/frontend"
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
EXPO_PUBLIC_APP_ENV=development
```

### 4. Start the Development Server

```bash
npm start
```

This launches the Expo development server. You'll see a menu with options:

```
i - open iOS simulator
a - open Android emulator
w - open web
j - open debugger
r - reload app
m - toggle menu
```

### 5. Run on Device

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Web:**
```bash
npm run web
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/                 # API integration & endpoints
│   ├── components/          # Reusable UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   │   └── RootNavigator.tsx
│   ├── screens/            # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── exam/          # Exam-related screens
│   │   └── ...
│   ├── services/          # Business logic & utilities
│   ├── store/             # Zustand state management
│   ├── theme/             # Theme & styling
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── assets/                 # Images, icons, animations
├── App.tsx                # App root component
├── app.json               # Expo configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```

---

## 📝 Available Scripts

```bash
# Start development server
npm start

# Run on Android emulator/device
npm run android

# Run on iOS simulator/device
npm run ios

# Run in web browser
npm run web

# Build APK for Android
npm run android:build

# Build app bundle for Google Play Store
npm run android:bundle
```

---

## 🔐 Authentication

The app uses JWT-based authentication with secure token storage:

- Tokens are stored in `Expo SecureStore` for enhanced security
- Automatic token refresh on expiration
- Logout clears all stored data
- Session persistence across app restarts

---

## 📡 API Integration

### Base Configuration

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
// Default: http://localhost:5000/api/v1
```

### Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/exams/generate` | Generate new exam |
| `POST` | `/exams/{attemptId}/submit` | Submit exam answers |
| `GET` | `/exams/{attemptId}/result` | Fetch exam results |
| `GET` | `/exams/history` | Get exam history |
| `GET` | `/leaderboard/weekly` | Get weekly rankings |

### Error Handling

- Automatic retry logic with exponential backoff
- Graceful error messages displayed to users
- Network error detection and offline mode support

---

## 🎯 Key Features Details

### Exam Generation
- Generates randomized exams with 50 MCQs + 50 True/False questions
- Questions are shuffled for each attempt
- Variants ensure uniqueness across attempts

### Exam Submission
- Real-time answer tracking
- Instant validation before submission
- Detailed answer review before confirmation

### Results Display
- Pass/Fail status with visual indicators
- Score breakdown by question type
- Time tracking and performance metrics

### Leaderboard
- Weekly rankings of top performers
- Personal performance stats
- Competitive scoring system

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "Port 5000 already in use"**
```bash
# Kill process on port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

**Issue: "Metro bundler not starting"**
```bash
npm start -- --clear
```

**Issue: "Module not found errors"**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

**Issue: "Cannot connect to backend"**
- Verify backend is running on port 5000
- Check `.env.local` has correct API URL
- Ensure device/emulator can reach backend IP
- Check firewall settings

---

## 🔄 State Management

The app uses **Zustand** for simple, efficient state management:

```typescript
// Example store
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
}));
```

---

## 📊 Data Fetching

Uses **React Query v5** for efficient server state management:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['exams'],
  queryFn: () => api.getExamHistory(),
});
```

---

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **React Native** components with custom styling
- Consistent color scheme and typography
- Responsive design for all screen sizes

---

## 📦 Building & Deployment

### Build for Production

**Android APK:**
```bash
eas build --platform android --profile preview
```

**Android App Bundle:**
```bash
eas build --platform android --profile production
```

**iOS:**
```bash
eas build --platform ios --profile production
```

### App Store Submission

- Ensure all environment variables are set to production values
- Update version numbers in `app.json` and `package.json`
- Generate necessary certificates and provisioning profiles
- Follow app store guidelines for metadata and screenshots

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit your changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

### Code Standards
- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Test features before submitting PR

---

## 📝 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | `http://localhost:5000/api/v1` | Backend API base URL |
| `EXPO_PUBLIC_APP_ENV` | `development` | Environment (development/production) |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Support

For issues, questions, or suggestions:

1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Contact the development team

---

## 🙏 Acknowledgments

- React Native community
- Expo team for excellent tooling
- All contributors and testers
- MongoDB for reliable database services

---

**Made with ❤️ for nursing professionals**

Last Updated: May 5, 2026
