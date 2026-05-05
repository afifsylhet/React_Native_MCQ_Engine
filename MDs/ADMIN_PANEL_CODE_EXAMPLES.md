# Admin Panel - Code Examples & Usage

## 📚 How to Use the Admin Features

---

## 1️⃣ Using the `useRole` Hook

### Check if User is Admin

```typescript
import { useRole } from '../hooks/useRole';

export const MyComponent = () => {
    const { isAdmin } = useRole();

    if (!isAdmin()) {
        return <Text>You must be an admin</Text>;
    }

    return <AdminFeature />;
};
```

### Get All Permissions

```typescript
import { useRole } from '../hooks/useRole';

export const Dashboard = () => {
    const { getPermissions } = useRole();
    const permissions = getPermissions();

    return (
        <View>
            {permissions.canManageUsers && (
                <Button title="Manage Users" onPress={() => {}} />
            )}
            {permissions.canManageQuestions && (
                <Button title="Manage Questions" onPress={() => {}} />
            )}
            {permissions.canViewReports && (
                <Button title="View Reports" onPress={() => {}} />
            )}
        </View>
    );
};
```

### Check Multiple Roles

```typescript
import { useRole } from '../hooks/useRole';

export const QuestionEditor = () => {
    const { hasRole } = useRole();

    // Both admins and instructors can edit questions
    if (!hasRole('admin', 'instructor')) {
        return <Text>Access Denied</Text>;
    }

    return <QuestionForm />;
};
```

### Get Current User Role

```typescript
import { useRole } from '../hooks/useRole';

export const RoleDisplay = () => {
    const { getRole } = useRole();
    const role = getRole();

    return <Text>Current role: {role}</Text>;
};
```

---

## 2️⃣ Using the Admin API

### Get All Users with Filters

```typescript
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export const UsersList = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: () =>
            adminApi.getAllUsers({
                page: 1,
                limit: 20,
                search: 'john',
                role: 'student',
                isActive: true,
            }),
    });

    const users = data?.data?.data?.items || [];

    if (isLoading) return <ActivityIndicator />;
    if (error) return <Text>Error loading users</Text>;

    return (
        <FlatList
            data={users}
            renderItem={({ item }) => (
                <Text>{item.fullName} - {item.email}</Text>
            )}
        />
    );
};
```

### Deactivate/Reactivate User

```typescript
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export const UserActions = ({ email }: { email: string }) => {
    const deactivateMutation = useMutation({
        mutationFn: () => adminApi.deactivateUser(email),
        onSuccess: () => {
            console.log('User deactivated');
            // Refresh user list
        },
        onError: (error) => {
            console.error('Failed to deactivate:', error);
        },
    });

    const reactivateMutation = useMutation({
        mutationFn: () => adminApi.reactivateUser(email),
        onSuccess: () => {
            console.log('User reactivated');
        },
    });

    return (
        <View>
            <Button
                title="Deactivate"
                onPress={() => deactivateMutation.mutate()}
                disabled={deactivateMutation.isPending}
            />
            <Button
                title="Reactivate"
                onPress={() => reactivateMutation.mutate()}
                disabled={reactivateMutation.isPending}
            />
        </View>
    );
};
```

### Manage Questions

```typescript
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export const QuestionActions = ({ questionId }: { questionId: string }) => {
    // Create question
    const createMutation = useMutation({
        mutationFn: (data) => adminApi.createQuestion(data),
        onSuccess: () => console.log('Question created'),
    });

    // Update question
    const updateMutation = useMutation({
        mutationFn: (data) => adminApi.updateQuestion(questionId, data),
        onSuccess: () => console.log('Question updated'),
    });

    // Delete question
    const deleteMutation = useMutation({
        mutationFn: () => adminApi.deleteQuestion(questionId),
        onSuccess: () => console.log('Question deleted'),
    });

    return (
        <View>
            <Button
                title="Delete"
                onPress={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
            />
        </View>
    );
};
```

### Manage Reports

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export const ReportManagement = ({ questionId }: { questionId: string }) => {
    // Get reported questions
    const { data: reports } = useQuery({
        queryKey: ['reports'],
        queryFn: () => adminApi.getReportedQuestions(1, 20),
    });

    // Clear reports
    const clearMutation = useMutation({
        mutationFn: (action: 'resolve' | 'delete' | 'keep') =>
            adminApi.clearReports(questionId, action, 'Admin action'),
        onSuccess: () => console.log('Reports cleared'),
    });

    return (
        <View>
            <Button
                title="Resolve"
                onPress={() => clearMutation.mutate('resolve')}
            />
            <Button
                title="Delete Question"
                onPress={() => clearMutation.mutate('delete')}
            />
            <Button
                title="Keep Question"
                onPress={() => clearMutation.mutate('keep')}
            />
        </View>
    );
};
```

### Get Dashboard Stats

```typescript
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export const AdminStats = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => adminApi.getDashboardStats(),
    });

    if (isLoading) return <ActivityIndicator />;

    return (
        <View>
            <Text>Total Users: {stats?.data?.totalUsers}</Text>
            <Text>Total Questions: {stats?.data?.totalQuestions}</Text>
            <Text>Exam Attempts: {stats?.data?.totalExamAttempts}</Text>
            <Text>Reported: {stats?.data?.reportedQuestionsCount}</Text>
        </View>
    );
};
```

---

## 3️⃣ Protecting Routes

### Using ProtectedAdminRoute

```typescript
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';

export const AdminFeature = () => (
    <ProtectedAdminRoute>
        <AdminDashboard />
    </ProtectedAdminRoute>
);

// If user is not admin, shows error message
// If user is admin, shows component
```

### Custom Fallback

```typescript
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';

export const AdminFeature = () => (
    <ProtectedAdminRoute
        fallback={
            <View>
                <Text>Only admins can access this</Text>
                <Button title="Go Back" onPress={() => {}} />
            </View>
        }
    >
        <AdminDashboard />
    </ProtectedAdminRoute>
);
```

---

## 4️⃣ Complete Screen Examples

### Example 1: Simple User List

```typescript
import React from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { useRole } from '../hooks/useRole';

export const SimpleUsersList = () => {
    const { canManageUsers } = useRole();

    if (!canManageUsers()) {
        return <Text>Access Denied</Text>;
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: () => adminApi.getAllUsers({ page: 1, limit: 50 }),
    });

    const users = data?.data?.data?.items || [];

    if (isLoading) return <ActivityIndicator />;
    if (error) return <Text>Error: {error.message}</Text>;

    return (
        <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <View style={{ padding: 10, borderBottomWidth: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>{item.fullName}</Text>
                    <Text>{item.email}</Text>
                    <Text>Role: {item.role}</Text>
                    <Text>Status: {item.isActive ? 'Active' : 'Inactive'}</Text>
                </View>
            )}
        />
    );
};
```

### Example 2: User Deactivation

```typescript
import React from 'react';
import { View, Button, Alert, Text } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import Toast from 'react-native-toast-message';

interface UserDeactivateProps {
    userId: string;
    email: string;
    fullName: string;
    isActive: boolean;
}

export const UserDeactivator = ({
    email,
    fullName,
    isActive,
}: UserDeactivateProps) => {
    const deactivateMutation = useMutation({
        mutationFn: () => adminApi.deactivateUser(email),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `${fullName} has been deactivated`,
            });
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.error?.message || 'Failed to deactivate',
            });
        },
    });

    const handleDeactivate = () => {
        Alert.alert(
            'Confirm Deactivation',
            `Are you sure you want to deactivate ${fullName}?`,
            [
                { text: 'Cancel', onPress: () => {} },
                {
                    text: 'Deactivate',
                    onPress: () => deactivateMutation.mutate(),
                    style: 'destructive',
                },
            ]
        );
    };

    if (!isActive) {
        return <Text>Already deactivated</Text>;
    }

    return (
        <Button
            title={deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate User'}
            onPress={handleDeactivate}
            disabled={deactivateMutation.isPending}
        />
    );
};
```

### Example 3: Question Delete

```typescript
import React from 'react';
import { View, Button, Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import Toast from 'react-native-toast-message';

interface QuestionDeleteProps {
    questionId: string;
    onSuccess?: () => void;
}

export const QuestionDelete = ({ questionId, onSuccess }: QuestionDeleteProps) => {
    const deleteMutation = useMutation({
        mutationFn: () => adminApi.deleteQuestion(questionId),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'Question deleted',
            });
            onSuccess?.();
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.error?.message || 'Failed to delete',
            });
        },
    });

    const handleDelete = () => {
        Alert.alert(
            'Delete Question',
            'This action cannot be undone. Are you sure?',
            [
                { text: 'Cancel', onPress: () => {} },
                {
                    text: 'Delete',
                    onPress: () => deleteMutation.mutate(),
                    style: 'destructive',
                },
            ]
        );
    };

    return (
        <Button
            title={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
            color="red"
        />
    );
};
```

### Example 4: Report Handler

```typescript
import React, { useState } from 'react';
import { View, Button, Alert, Text, TextInput } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import Toast from 'react-native-toast-message';

interface ReportHandlerProps {
    questionId: string;
    reportCount: number;
}

export const ReportHandler = ({ questionId, reportCount }: ReportHandlerProps) => {
    const [adminNotes, setAdminNotes] = useState('');

    const resolveMutation = useMutation({
        mutationFn: (action: 'resolve' | 'delete' | 'keep') =>
            adminApi.clearReports(questionId, action, adminNotes),
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'Report processed',
            });
            setAdminNotes('');
        },
    });

    const handleResolve = (action: 'resolve' | 'delete' | 'keep') => {
        const messages = {
            resolve: 'Mark as resolved?',
            delete: 'Delete this question?',
            keep: 'Keep question and clear reports?',
        };

        Alert.alert('Confirm', messages[action], [
            { text: 'Cancel' },
            {
                text: 'Confirm',
                onPress: () => resolveMutation.mutate(action),
            },
        ]);
    };

    return (
        <View>
            <Text>Reports: {reportCount}</Text>
            <TextInput
                placeholder="Admin notes..."
                value={adminNotes}
                onChangeText={setAdminNotes}
                style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
            />
            <Button
                title="✓ Resolve"
                onPress={() => handleResolve('resolve')}
                disabled={resolveMutation.isPending}
            />
            <Button
                title="⚠️ Delete"
                onPress={() => handleResolve('delete')}
                disabled={resolveMutation.isPending}
                color="red"
            />
            <Button
                title="- Keep"
                onPress={() => handleResolve('keep')}
                disabled={resolveMutation.isPending}
            />
        </View>
    );
};
```

---

## 5️⃣ Common Patterns

### Pattern 1: Search with Debounce

```typescript
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export const SearchUsers = () => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { data: results } = useQuery({
        queryKey: ['users', debouncedSearch],
        queryFn: () =>
            adminApi.getAllUsers({
                search: debouncedSearch,
                page: 1,
            }),
        enabled: debouncedSearch.length > 0,
    });

    useCallback(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    return (
        <View>
            <TextInput
                placeholder="Search..."
                value={search}
                onChangeText={setSearch}
            />
            {/* Display results */}
        </View>
    );
};
```

### Pattern 2: Pagination

```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export const PaginatedUsers = () => {
    const [page, setPage] = useState(1);

    const { data, isFetchingNextPage } = useQuery({
        queryKey: ['users', page],
        queryFn: () => adminApi.getAllUsers({ page, limit: 20 }),
    });

    const pagination = data?.data?.data;

    return (
        <View>
            {/* List items */}
            <Button
                title="Load More"
                onPress={() => setPage(page + 1)}
                disabled={page >= (pagination?.pages || 0) || isFetchingNextPage}
            />
        </View>
    );
};
```

### Pattern 3: Optimistic Updates

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export const OptimisticDeactivate = ({ email, userId }: any) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => adminApi.deactivateUser(email),
        onMutate: async () => {
            // Cancel pending requests
            await queryClient.cancelQueries({ queryKey: ['users'] });

            // Save old data
            const oldData = queryClient.getQueryData(['users']);

            // Update optimistically
            queryClient.setQueryData(['users'], (old: any) => ({
                ...old,
                data: {
                    ...old.data,
                    items: old.data.items.map((u: any) =>
                        u._id === userId ? { ...u, isActive: false } : u
                    ),
                },
            }));

            return { oldData };
        },
        onError: (err, newUser, context) => {
            // Rollback on error
            queryClient.setQueryData(['users'], context?.oldData);
        },
    });

    return (
        <Button
            title="Deactivate"
            onPress={() => mutation.mutate()}
        />
    );
};
```

---

## 📋 Tips & Best Practices

1. **Always handle loading states**: Show spinner while API calls
2. **Show error messages**: Use Toast for user feedback
3. **Confirm destructive actions**: Alert before delete/deactivate
4. **Debounce search inputs**: Reduce API calls
5. **Use pagination**: Handle large datasets
6. **Optimistic updates**: Better UX for mutations
7. **Error boundaries**: Catch and handle errors gracefully
8. **Access control**: Always check permissions first

---

**These examples provide templates for building your admin features!**
