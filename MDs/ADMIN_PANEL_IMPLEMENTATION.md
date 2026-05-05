# Admin Panel Implementation Guide

## 🎯 Overview

A complete admin panel system has been implemented for your React Native Expo app with role-based access control. Admin users can manage users, questions, and review reported content.

---

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── admin.api.ts                    # Admin API endpoints
│   ├── components/
│   │   └── admin/
│   │       └── ProtectedAdminRoute.tsx     # Access control wrapper
│   ├── hooks/
│   │   └── useRole.ts                      # Role-based access control hook
│   ├── navigation/
│   │   ├── AdminNavigator.tsx              # Admin navigation stack
│   │   ├── RootNavigator.tsx               # Updated for admin routing
│   │   └── types.ts                        # Navigation types (updated)
│   └── screens/
│       └── admin/
│           ├── AdminDashboardScreen.tsx    # Main admin dashboard
│           ├── UserManagementScreen.tsx    # User list & management
│           ├── UserDetailScreen.tsx        # User details & actions
│           ├── QuestionManagementScreen.tsx # Question list & management
│           ├── QuestionDetailScreen.tsx    # Question details & actions
│           ├── ReportManagementScreen.tsx  # Reported questions list
│           ├── ReportDetailScreen.tsx      # Report details & actions
│           └── index.ts                    # Barrel export
```

---

## 🔐 Role-Based Access Control

### User Roles
- **student** - Regular student user
- **instructor** - Question creator (can manage questions)
- **admin** - Full platform administrator

### Automatic Routing

The `RootNavigator` automatically routes users based on their role:

```typescript
// User with role="admin" sees: AdminNavigator
// User with role="student" or "instructor" sees: AppNavigator (regular app)
```

---

## 🔌 API Integration

### Admin API Endpoints

All endpoints are implemented in `src/api/admin.api.ts`:

#### User Management
```typescript
// Get all users with filters
adminApi.getAllUsers({
    studentType?: string;
    role?: 'student' | 'instructor' | 'admin';
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
})

// Deactivate a user account
adminApi.deactivateUser(email: string)

// Reactivate a deactivated user
adminApi.reactivateUser(email: string)
```

#### Question Management
```typescript
// Create a new question
adminApi.createQuestion(questionData: Partial<Question>)

// Update a question
adminApi.updateQuestion(questionId: string, updates: Partial<Question>)

// Delete a question
adminApi.deleteQuestion(questionId: string)

// Get reported questions
adminApi.getReportedQuestions(page?: number, limit?: number)

// Clear reports from a question
adminApi.clearReports(
    questionId: string,
    action: 'resolve' | 'delete' | 'keep',
    adminNotes?: string
)
```

#### Dashboard
```typescript
// Get admin dashboard statistics
adminApi.getDashboardStats()
```

---

## 🎨 Admin Screens

### 1. Admin Dashboard (`AdminDashboardScreen`)
- **Purpose:** Main admin landing page with key statistics
- **Features:**
  - Display total users, questions, exam attempts, reported items
  - Quick action buttons to navigate to management sections
  - Clickable stat cards for quick filtering

```
Dashboard Stats:
├── Total Users (clickable → User Management)
├── Total Questions (clickable → Question Management)
├── Exam Attempts (read-only)
└── Reported Items (clickable → Report Management)
```

### 2. User Management (`UserManagementScreen`)
- **Purpose:** View and search all platform users
- **Features:**
  - Search by name or email
  - Filter by role and active status
  - Pagination support
  - Role badges (Admin, Instructor, Student)
  - Navigate to user details

```
User List:
├── Search Bar
├── User Cards (with role badges)
│   ├── Full Name
│   ├── Email
│   ├── Role (colored badge)
│   └── Active/Inactive status
└── Pagination
```

### 3. User Details (`UserDetailScreen`)
- **Purpose:** View user information and manage account status
- **Features:**
  - User profile summary (avatar, name, email)
  - Account information (role, student type, join date)
  - Statistics (exams taken, average score)
  - Deactivate/Reactivate account with confirmation
  - Warning messages for destructive actions

```
User Profile:
├── User Header (Avatar + Basic Info)
├── Account Information
│   ├── Role
│   ├── Student Type
│   └── Member Since
├── Statistics
│   ├── Exams Taken
│   └── Average Score
└── Actions
    ├── Deactivate Account (active users)
    └── Reactivate Account (inactive users)
```

### 4. Question Management (`QuestionManagementScreen`)
- **Purpose:** Manage all questions in the system
- **Features:**
  - List all questions with pagination
  - Filter by question type (All, MCQ, True/False)
  - Create new questions (button provided)
  - Navigate to question details
  - Question preview cards

```
Question List:
├── Create Question Button
├── Filter Tabs (All, MCQ, True/False)
├── Question Cards
│   ├── Type Badge
│   ├── Question Preview
│   └── Question ID
└── Pagination
```

### 5. Question Details (`QuestionDetailScreen`)
- **Purpose:** View and edit individual questions
- **Features:**
  - Full question text and details
  - Display question metadata (subject, difficulty, type)
  - Show all options/statements with correct answer highlighted
  - Edit and delete buttons
  - Confirmation dialogs for destructive actions

```
Question Details:
├── Question Text
├── Question Metadata
│   ├── Type (MCQ/True-False)
│   ├── Subject
│   ├── Difficulty
│   └── Created Date
├── Options/Statements (with correct answer highlighted)
└── Actions (Edit, Delete)
```

### 6. Report Management (`ReportManagementScreen`)
- **Purpose:** View all reported questions
- **Features:**
  - List questions with report counts
  - Pagination support
  - Navigate to report details
  - Empty state when no reports exist
  - Shows total reports count

```
Reported Questions:
├── Report Count Stats
├── Reported Question Cards
│   ├── Report Count Badge
│   ├── Question ID
│   └── Report Count Summary
├── Pagination
└── Empty State (when no reports)
```

### 7. Report Details (`ReportDetailScreen`)
- **Purpose:** Review reports and take action
- **Features:**
  - Summary of question and report count
  - List of all individual reports
  - Report details (reporter, reason, description, date)
  - Action buttons:
    - ✓ Resolved - Clear reports without action
    - ⚠️ Delete Question - Remove question from system
    - - Keep Question - Clear reports but keep question
  - Admin notes support

```
Report Details:
├── Report Summary
│   ├── Question ID
│   └── Total Reports
├── Individual Reports
│   ├── Reporter Email
│   ├── Reason
│   ├── Description
│   └── Report Date
└── Admin Actions (Resolved, Delete, Keep)
```

---

## 🎯 Using the Admin Panel

### For Developers

#### 1. Access Control in Components

```typescript
import { useRole } from '../hooks/useRole';

export const MyComponent = () => {
    const {
        isAdmin,
        canManageUsers,
        canManageQuestions,
        canViewReports,
        getPermissions,
    } = useRole();

    if (!canManageUsers()) {
        return <Text>Access Denied</Text>;
    }

    return <AdminPanel />;
};
```

#### 2. Protect Routes with ProtectedAdminRoute

```typescript
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';

export const AdminFeature = () => (
    <ProtectedAdminRoute>
        <AdminDashboard />
    </ProtectedAdminRoute>
);
```

#### 3. Using Admin API

```typescript
import { adminApi } from '../api/admin.api';
import { useQuery, useMutation } from '@tanstack/react-query';

// Get all users
const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => adminApi.getAllUsers({ page: 1, limit: 20 }),
});

// Deactivate a user
const deactivateMutation = useMutation({
    mutationFn: (email: string) => adminApi.deactivateUser(email),
    onSuccess: () => console.log('User deactivated'),
});

deactivateMutation.mutate('user@example.com');
```

### For Admins (End Users)

#### Accessing Admin Panel
1. Log in with admin credentials
2. You'll automatically be routed to Admin Dashboard (instead of regular app)
3. Use bottom tabs or screens to navigate admin features

#### Managing Users
1. Go to **User Management** from dashboard or bottom nav
2. Search for users by name or email
3. Click a user to see details
4. Deactivate/Reactivate account as needed
5. Confirm destructive actions

#### Managing Questions
1. Go to **Question Management** from dashboard
2. Filter by question type (MCQ/True-False) if needed
3. Click a question to view details
4. Edit or delete questions
5. View correct answers highlighted

#### Handling Reports
1. Go to **Reported Questions** from dashboard or bottom nav
2. View list of reported questions sorted by report count
3. Click a report to see all individual reports
4. Review reporter comments and reasons
5. Take action: Resolved / Delete Question / Keep Question

---

## 🔄 Navigation Flow

```
Login (with admin account)
    ↓
RootNavigator (checks role)
    ↓
AdminNavigator (admin flow)
    ├── AdminDashboard (home)
    ├── UserManagement
    │   └── UserDetail
    ├── QuestionManagement
    │   └── QuestionDetail
    ├── ReportManagement
    │   └── ReportDetail
    └── Other admin screens
```

---

## 🚀 Backend Integration Requirements

The backend must provide these endpoints (already implemented in your backend):

### Required Endpoints

```
User Management:
- GET    /api/v1/users                      (Admin only)
- POST   /api/v1/users/deactivate           (Admin only)
- POST   /api/v1/users/reactivate           (Admin only)

Question Management:
- POST   /api/v1/questions                  (Admin only)
- PATCH  /api/v1/questions/:id              (Admin only)
- DELETE /api/v1/questions/:id              (Admin only)
- GET    /api/v1/questions/reports/list     (Admin only)
- PATCH  /api/v1/questions/reports/:id/clear (Admin only)

Dashboard:
- GET    /api/v1/admin/stats                (Admin only)
```

### Authentication
- All admin endpoints require valid JWT token
- User must have `role: 'admin'` in their token
- Backend validates `adminOnly` middleware

---

## 🔧 Customization Guide

### Adding New Admin Screens

1. **Create the screen component:**
   ```typescript
   // screens/admin/MyNewScreen.tsx
   import { AdminStackScreenProps } from '../../navigation/types';

   export const MyNewScreen: React.FC<AdminStackScreenProps<'MyNewScreen'>> = ({ navigation }) => {
       return (
           <SafeAreaView>
               {/* Screen content */}
           </SafeAreaView>
       );
   };
   ```

2. **Add route to `AdminStackParamList` in `navigation/types.ts`:**
   ```typescript
   export type AdminStackParamList = {
       // ... existing screens
       MyNewScreen: undefined; // or with params
   };
   ```

3. **Add screen to `AdminNavigator.tsx`:**
   ```typescript
   <Stack.Screen
       name="MyNewScreen"
       component={MyNewScreen}
       options={{ headerTitle: 'My New Screen' }}
   />
   ```

4. **Export from `screens/admin/index.ts`:**
   ```typescript
   export { MyNewScreen } from './MyNewScreen';
   ```

### Customizing Colors and Styling

Colors are centralized in `theme/colors.ts`:
- `colors.primary` - Main admin color
- `colors.warning` - Warning/Reports color
- `colors.success` - Success actions
- `colors.danger` - Destructive actions

### Adding Admin API Methods

```typescript
// In api/admin.api.ts
export const adminApi = {
    // ... existing methods
    
    myNewMethod: async (params) => {
        return client.get('/admin/my-endpoint', { params });
    },
};
```

---

## 📊 Use Cases & Examples

### Example 1: Check if User Can Manage Questions

```typescript
const { canManageQuestions } = useRole();

if (canManageQuestions()) {
    return <QuestionEditor />;
}
```

### Example 2: Conditional Screen Navigation

```typescript
const { isAdmin } = useRole();

useEffect(() => {
    if (isAdmin()) {
        navigation.reset({
            index: 0,
            routes: [{ name: 'AdminDashboard' }],
        });
    }
}, []);
```

### Example 3: Admin-Only Feature Flag

```typescript
const { getPermissions } = useRole();

const permissions = getPermissions();

return (
    <View>
        {permissions.canViewReports && <ReportsWidget />}
        {permissions.canManageUsers && <UserStatsWidget />}
    </View>
);
```

---

## ⚠️ Important Notes

1. **Mock Data**: Some screens use mock data for demo purposes. Replace with actual API calls:
   - `UserDetailScreen` - Currently shows mock user data
   - `QuestionDetailScreen` - Currently shows mock question data
   - `ReportDetailScreen` - Currently shows mock reports

2. **Backend Requirements**: Ensure backend has:
   - `adminOnly` middleware on protected routes
   - User role validation
   - Admin stats endpoint

3. **Authentication**: Admin routes require valid JWT token with `role: 'admin'`

4. **Error Handling**: All mutations include error handling with Toast notifications

5. **Pagination**: All list screens support pagination (20 items per page by default)

---

## 🧪 Testing Admin Features

### Test Scenario 1: Admin Login
1. Login with admin credentials
2. Verify automatic redirect to AdminNavigator
3. Check dashboard loads with stats

### Test Scenario 2: User Management
1. Navigate to User Management
2. Search for a user
3. Click user to see details
4. Try deactivating (should confirm)
5. Try reactivating

### Test Scenario 3: Question Management
1. Navigate to Question Management
2. Filter by question type
3. Click question to see details
4. Verify correct answer is highlighted

### Test Scenario 4: Report Management
1. Navigate to Reported Questions
2. Click a report
3. Review report details
4. Try different actions (Resolve, Delete, Keep)

---

## 📝 File Summary

| File | Purpose | Status |
|------|---------|--------|
| `api/admin.api.ts` | Admin API calls | ✅ Complete |
| `hooks/useRole.ts` | Role-based access control | ✅ Complete |
| `navigation/AdminNavigator.tsx` | Admin navigation stack | ✅ Complete |
| `navigation/types.ts` | Updated navigation types | ✅ Complete |
| `navigation/RootNavigator.tsx` | Updated with role routing | ✅ Complete |
| `screens/admin/*` | All 7 admin screens | ✅ Complete |
| `components/admin/ProtectedAdminRoute.tsx` | Access control wrapper | ✅ Complete |

---

## 🔗 Next Steps

1. **Test the implementation**: Run the app and test with admin credentials
2. **Replace mock data**: Update screens to use real API data
3. **Add more admin features**: Question creation form, bulk operations, etc.
4. **Implement analytics**: Add charts and metrics to dashboard
5. **Add audit logging**: Track admin actions for compliance

---

## 💡 Tips & Best Practices

- Use `useRole()` hook in any component to check permissions
- Always show loading states during API calls
- Include confirmation dialogs for destructive actions
- Display clear error messages from API responses
- Use consistent styling from `theme/colors.ts`
- Keep navigation prop drilling minimal with `useNavigation()`
- Test role transitions (login/logout as different roles)

---

## 📞 Support

For issues or questions about the admin implementation:
1. Check the mock data vs API data discrepancies
2. Verify backend endpoints are accessible
3. Check admin role is correctly set in JWT token
4. Review console logs for API errors
5. Verify authentication headers are being sent

