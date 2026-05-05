# Admin Panel - Visual Architecture Guide

## 🏗️ Complete Folder Structure

```
frontend/
└── src/
    ├── api/
    │   ├── admin.api.ts                 ✨ NEW - Admin API calls
    │   ├── auth.api.ts                  (existing)
    │   ├── exam.api.ts                  (existing)
    │   ├── question.api.ts              (existing)
    │   └── ...
    │
    ├── components/
    │   ├── admin/                       ✨ NEW - Admin-specific components
    │   │   └── ProtectedAdminRoute.tsx
    │   ├── auth/                        (existing)
    │   ├── ui/                          (existing)
    │   └── ...
    │
    ├── hooks/
    │   ├── useRole.ts                   ✨ NEW - Role-based access control
    │   ├── useAuth.ts                   (existing)
    │   └── ...
    │
    ├── navigation/
    │   ├── AdminNavigator.tsx           ✨ NEW - Admin navigation stack
    │   ├── AppNavigator.tsx             (existing - student app)
    │   ├── AuthNavigator.tsx            (existing)
    │   ├── RootNavigator.tsx            🔄 UPDATED - Added role routing
    │   └── types.ts                     🔄 UPDATED - Added admin types
    │
    ├── screens/
    │   ├── admin/                       ✨ NEW - Admin screens folder
    │   │   ├── AdminDashboardScreen.tsx
    │   │   ├── UserManagementScreen.tsx
    │   │   ├── UserDetailScreen.tsx
    │   │   ├── QuestionManagementScreen.tsx
    │   │   ├── QuestionDetailScreen.tsx
    │   │   ├── ReportManagementScreen.tsx
    │   │   ├── ReportDetailScreen.tsx
    │   │   └── index.ts
    │   ├── auth/                        (existing)
    │   ├── exam/                        (existing)
    │   └── ...
    │
    └── store/
        ├── auth.store.ts                (existing)
        └── ...

frontend/
└── MDs/
    ├── ADMIN_PANEL_IMPLEMENTATION.md    ✨ NEW - Full documentation
    ├── ADMIN_PANEL_QUICK_SETUP.md       ✨ NEW - Setup checklist
    ├── ADMIN_PANEL_ARCHITECTURE.md      ✨ THIS FILE
    └── ...
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Login                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Email: admin@mcq.com                                           │
│  Password: ••••••••                                             │
│  Role in JWT: "admin"                                           │
│                                                                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  RootNavigator     │
        │  (checks role)     │
        └────────┬───────────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
      ▼          ▼          ▼
   admin    student   instructor
      │          │          │
      ▼          ▼          ▼
┌──────────┐ ┌─────────┐ ┌─────────┐
│  Admin   │ │   App   │ │   App   │
│Navigator │ │Navigator│ │Navigator│
└─────┬────┘ └─────────┘ └─────────┘
      │
      ├─► AdminDashboard ◄── Stats API
      │
      ├─► UserManagement ◄── getAllUsers API
      │       │
      │       └─► UserDetail ◄── Deactivate/Reactivate
      │
      ├─► QuestionManagement ◄── getQuestions API
      │       │
      │       └─► QuestionDetail ◄── Delete Question
      │
      └─► ReportManagement ◄── getReportedQuestions API
              │
              └─► ReportDetail ◄── clearReports API
```

---

## 🎯 Feature Hierarchy

```
ADMIN DASHBOARD
│
├─ 📊 STATISTICS PANEL
│  ├─ Total Users (clickable)
│  ├─ Total Questions (clickable)
│  ├─ Exam Attempts (view only)
│  └─ Reported Items (clickable)
│
├─ 🚀 QUICK ACTIONS
│  ├─ User Management
│  ├─ Question Management
│  └─ Reported Questions
│
└─ ℹ️ ADMIN INFO
   └─ Warning message about responsibilities
```

### USER MANAGEMENT SECTION
```
USER MANAGEMENT
│
├─ 🔍 Search Bar
│  └─ Search by name or email
│
├─ 📋 USER LIST
│  ├─ User Card 1
│  │  ├─ Name: John Doe
│  │  ├─ Email: john@example.com
│  │  ├─ Role: Student (badge)
│  │  └─ Status: Active/Inactive
│  │     └─ Click → USER DETAIL
│  │
│  └─ User Card N
│
└─ 📄 Pagination
   └─ Page X of Y
```

### USER DETAIL SECTION
```
USER DETAIL
│
├─ 👤 USER PROFILE CARD
│  ├─ Avatar with initial
│  ├─ Full Name: John Doe
│  ├─ Email: john@example.com
│  └─ Status Badge: Active/Inactive
│
├─ ℹ️ ACCOUNT INFO
│  ├─ Role: Student
│  ├─ Student Type: Diploma Nursing
│  └─ Joined: Jan 15, 2024
│
├─ 📊 STATISTICS
│  ├─ Exams Taken: 15
│  └─ Average Score: 72.5%
│
└─ ⚙️ ACTIONS
   ├─ [Deactivate Account] ← (active users)
   └─ [Reactivate Account]  ← (inactive users)
      └─ Confirm dialog before action
```

### QUESTION MANAGEMENT SECTION
```
QUESTION MANAGEMENT
│
├─ [+ Create Question] Button
│
├─ 🏷️ FILTER TABS
│  ├─ All
│  ├─ MCQ
│  └─ True/False
│
├─ 📋 QUESTION LIST
│  ├─ Question Card 1
│  │  ├─ Type Badge: MCQ/T&F
│  │  ├─ Preview
│  │  └─ Click → QUESTION DETAIL
│  │
│  └─ Question Card N
│
└─ 📄 Pagination
```

### QUESTION DETAIL SECTION
```
QUESTION DETAIL
│
├─ ❓ QUESTION TEXT
│  └─ Full question content
│
├─ 📌 DETAILS
│  ├─ Type: MCQ / True-False
│  ├─ Subject: Sample Subject
│  ├─ Difficulty: Medium
│  └─ Created: Jan 20, 2024
│
├─ 🎯 OPTIONS/STATEMENTS (MCQ only)
│  ├─ Option A: Text
│  ├─ Option B: Text (✓ Correct Answer)
│  ├─ Option C: Text
│  └─ Option D: Text
│
└─ ⚙️ ACTIONS
   ├─ [Edit Question]
   └─ [Delete Question]
      └─ Confirm dialog before deletion
```

### REPORT MANAGEMENT SECTION
```
REPORT MANAGEMENT
│
├─ 📊 HEADER
│  └─ X questions reported
│
├─ ⚠️ REPORTED QUESTIONS LIST
│  ├─ Report Card 1
│  │  ├─ Report Count Badge: 2
│  │  ├─ Question ID: abc123...
│  │  └─ Click → REPORT DETAIL
│  │
│  └─ Report Card N
│
└─ 📄 Pagination
```

### REPORT DETAIL SECTION
```
REPORT DETAIL
│
├─ 📊 SUMMARY
│  ├─ Question ID: abc123def456...
│  └─ Total Reports: 3
│
├─ 🔍 INDIVIDUAL REPORTS
│  ├─ Report 1
│  │  ├─ Reporter: student1@example.com
│  │  ├─ Date: Jan 20, 2024
│  │  ├─ Reason: Incorrect Answer
│  │  └─ Details: "The provided answer is..."
│  │
│  ├─ Report 2
│  │  └─ ...
│  │
│  └─ Report N
│
└─ ⚙️ ACTIONS
   ├─ [✓ Resolved]
   │  └─ Clear reports, keep question
   │
   ├─ [⚠️ Delete Question]
   │  └─ Remove question from system
   │
   └─ [- Keep Question]
      └─ Clear reports, don't delete
      
   All actions show confirmation before executing
```

---

## 🔐 Access Control Flow

```
┌─────────────────────────────────┐
│      User Authentication        │
│   JWT Token Retrieved           │
│   role: 'admin|student|admin'   │
└────────────┬────────────────────┘
             │
             ▼
      ┌──────────────────┐
      │   useRole Hook   │
      │                  │
      │ Provides:        │
      │ • isAdmin()      │
      │ • getPermissions│
      │ • canManageUsers│
      │ • canViewReports│
      │ ... etc         │
      └────────┬─────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
     ▼         ▼         ▼
  Allow     Deny      Error
  Access    Access    State
  │         │         │
  ▼         ▼         ▼
Screen   Error      Retry
Loads     Page      Logic
```

---

## 🔌 API Integration Map

```
┌──────────────────────┐
│   Admin Screens      │
└──────────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │  Admin API       │
    │  (admin.api.ts)  │
    └────────┬─────────┘
             │
    ┌────────┼────────────────────────┐
    │        │                        │
    ▼        ▼                        ▼
┌────────┐ ┌────────┐         ┌─────────────┐
│ Users  │ │Ques.   │         │ Dashboard   │
│ API    │ │API     │         │ API         │
└────────┘ └────────┘         └─────────────┘
    │        │                        │
    ▼        ▼                        ▼
 GET/       POST/                GET
 POST       PATCH/               /admin/stats
 DELETE     DELETE
 /users     /questions
```

---

## 🎨 Component Hierarchy

```
RootNavigator
│
├─ AuthNavigator (if not authenticated)
│  └─ LoginScreen, RegisterScreen, etc.
│
├─ AppNavigator (if student/instructor)
│  ├─ HomeNavigator
│  ├─ ExamNavigator
│  ├─ LeaderboardScreen
│  └─ ProfileNavigator
│
└─ AdminNavigator (if admin) ✨ NEW
   │
   ├─ AdminDashboardScreen
   │  └─ StatCard (reusable)
   │  └─ QuickActionButton (reusable)
   │
   ├─ UserManagementScreen
   │  └─ UserListItem (reusable)
   │
   ├─ UserDetailScreen
   │  └─ InfoRow (reusable)
   │  └─ ActionButton (reusable)
   │
   ├─ QuestionManagementScreen
   │  └─ QuestionPreview (reusable)
   │
   ├─ QuestionDetailScreen
   │  └─ ActionButton (reusable)
   │
   ├─ ReportManagementScreen
   │  └─ ReportedQuestionCard (reusable)
   │
   └─ ReportDetailScreen
      ├─ ReportItem (reusable)
      └─ ActionButton (reusable)
```

---

## 📊 State Management

```
┌────────────────────────────────┐
│      Zustand Auth Store        │
├────────────────────────────────┤
│ • user (with role: 'admin')    │
│ • isAuthenticated: true        │
│ • isLoading: false             │
│ • isEmailVerified: true        │
└────────────────────────────────┘
           │
           ▼
    ┌─────────────────┐
    │  useRole Hook   │
    │  (derives from  │
    │   auth store)   │
    └─────────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Provide permissions  │
    │ to components        │
    └──────────────────────┘
```

### React Query Usage
```
┌──────────────────────┐
│  Admin Screens       │
└──────────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │  useQuery {      │
    │   queryKey,      │
    │   queryFn        │
    │  }               │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Query Cache      │
    │ (avoid re-fetches│
    └──────────────────┘
```

---

## 🚀 Permission Model

```
┌─────────────────────────────────────────────────────────┐
│              User Roles                                 │
├──────────────┬──────────────┬──────────────────────────┤
│   STUDENT    │  INSTRUCTOR  │        ADMIN             │
├──────────────┼──────────────┼──────────────────────────┤
│              │              │                          │
│ Take Exams   │ Create Q's   │ ✓ Manage Users           │
│ View Results │ Edit Own Q's │ ✓ Deactivate/Reactivate │
│ View Profile │ Delete Own Q │ ✓ View All Questions     │
│ Report Q's   │ View Reports │ ✓ Delete Questions       │
│              │              │ ✓ Manage Reports         │
│              │              │ ✓ Access Dashboard       │
│              │              │ ✓ View All Users         │
│              │              │ ✓ Admin Only Routes      │
│              │              │                          │
└──────────────┴──────────────┴──────────────────────────┘
```

---

## 📱 Navigation Stack Tree

```
RootNavigator (checks role)
│
└─ AdminNavigator (for admin=true)
   │
   ├─ Screen: AdminDashboard
   │  (headerShown: false initially)
   │
   ├─ Stack.Screen: UserManagement
   │  ├─ name: "UserManagement"
   │  ├─ component: UserManagementScreen
   │  └─ headerTitle: "User Management"
   │
   ├─ Stack.Screen: UserDetail
   │  ├─ name: "UserDetail"
   │  ├─ component: UserDetailScreen
   │  ├─ params: { userId, email }
   │  └─ headerTitle: Dynamic (route.params.email)
   │
   ├─ Stack.Screen: QuestionManagement
   │  ├─ name: "QuestionManagement"
   │  ├─ component: QuestionManagementScreen
   │  └─ headerTitle: "Question Management"
   │
   ├─ Stack.Screen: QuestionDetail
   │  ├─ name: "QuestionDetail"
   │  ├─ component: QuestionDetailScreen
   │  ├─ params: { questionId }
   │  └─ headerTitle: "Question Details"
   │
   ├─ Stack.Screen: ReportManagement
   │  ├─ name: "ReportManagement"
   │  ├─ component: ReportManagementScreen
   │  └─ headerTitle: "Reported Questions"
   │
   └─ Stack.Screen: ReportDetail
      ├─ name: "ReportDetail"
      ├─ component: ReportDetailScreen
      ├─ params: { questionId, reportCount }
      └─ headerTitle: "Report Details"
```

---

## 💾 Database Schema Relation

```
User Model
├─ _id
├─ email
├─ fullName
├─ role: 'admin'|'student'|'instructor' ◄── Key for routing
├─ isActive
└─ ... other fields

Question Model
├─ _id
├─ questionText
├─ questionPattern: 'mcq'|'truefalse'
├─ options/statements
├─ correctAnswerIndex
└─ ... other fields

Report Model
├─ _id
├─ questionId → Question._id
├─ reportedBy → User._id
├─ reason
├─ description
└─ createdAt

Admin sees all of these
```

---

## 🧪 Test Scenarios Flowchart

```
START TEST
│
├─ ADMIN LOGIN
│  ├─ Verify redirect to AdminNavigator
│  └─ Check dashboard loads
│
├─ USER MANAGEMENT
│  ├─ Search for user
│  ├─ Click user → view details
│  ├─ Click deactivate → confirm → execute
│  └─ Verify user marked inactive
│
├─ QUESTION MANAGEMENT
│  ├─ View question list
│  ├─ Filter by type
│  ├─ Click question → view details
│  └─ Click delete → confirm → execute
│
├─ REPORT MANAGEMENT
│  ├─ View reported questions
│  ├─ Click report → view details
│  ├─ Try resolve action
│  ├─ Try delete action
│  └─ Try keep action
│
└─ END TEST
```

---

## ✅ Implementation Checklist

- [x] API endpoints defined (admin.api.ts)
- [x] Role hook created (useRole.ts)
- [x] Admin navigator built (AdminNavigator.tsx)
- [x] 7 Admin screens created
- [x] Navigation types updated
- [x] RootNavigator updated for role routing
- [x] Access control component (ProtectedAdminRoute)
- [x] Documentation created
- [ ] Test with admin account
- [ ] Replace mock data with APIs
- [ ] Customize styling
- [ ] Add more features

---

**Status: ✅ Ready for deployment and testing!**
