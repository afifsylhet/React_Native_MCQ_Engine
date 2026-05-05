# Phase 10: Notifications System

This phase implements a comprehensive notification system with detailed handling, action buttons, settings management, and push notification support.

## Overview

The notifications system includes:
- **Notifications List Screen** - View all notifications with filtering and categorization
- **Notification Details Screen** - Detailed view of individual notifications with actions
- **Notification Settings Screen** - Granular control over notification preferences
- **Push Notification Service** - Background notification handling
- **UI Components** - Reusable notification display components
- **Hooks** - React Query integration for notification data management

## File Structure

```
src/
├── screens/
│   ├── home/
│   │   ├── NotificationsScreen.tsx           # Main notifications list
│   │   └── NotificationDetailScreen.tsx      # Individual notification detail
│   └── settings/
│       └── NotificationSettingsScreen.tsx    # Notification preferences
├── components/
│   └── notifications/
│       └── NotificationComponents.tsx         # Reusable UI components
├── services/
│   └── pushNotificationService.ts            # Push notification handling
├── hooks/
│   └── useNotifications.ts                   # React Query hooks (existing)
└── navigation/
    └── types.ts                               # Updated with new screen types
```

## Components

### NotificationsScreen
Main notifications list view. Features:

**Functionality:**
- Infinite scroll loading
- Unread vs. read sections
- Filter by notification type
- Refresh notifications
- Mark as read
- Delete individual notifications

**State Management:**
- Current filter selection
- Refresh loading state
- Filtering logic

**UI Elements:**
- Header with refresh button
- Filter chips (All, Unread, Exam Result, Achievement, Reminder)
- Sectioned list (Unread/Previous)
- Empty state when no notifications

```typescript
interface Notification {
  id: string;
  type: 'exam_result' | 'achievement' | 'reminder' | 'leaderboard' | 'promo';
  title: string;
  subtitle: string;
  date: string;
  read: boolean;
  icon: string;
  color: string;
  actionable?: boolean;
}
```

### NotificationDetailScreen
Detailed view of a single notification. Features:

**Functionality:**
- Display full notification content
- Show related metadata (exam scores, achievement details)
- Action buttons for relevant operations
- Mark as read
- Navigate to related content

**Related Content Display:**
- Exam scores and results
- Achievement details
- Performance summaries

```typescript
interface NotificationData {
  id: string;
  type: 'exam_result' | 'achievement' | 'reminder' | 'leaderboard' | 'promo';
  title: string;
  message: string;
  description: string;
  date: string;
  icon: string;
  color: string;
  read: boolean;
  data?: {
    examId?: string;
    examTitle?: string;
    score?: number;
    achievementTitle?: string;
    promotionCode?: string;
  };
}
```

### NotificationSettingsScreen
Comprehensive settings management. Features:

**Organization:**
- Category-based grouping:
  - Study Notifications (Exam Results, Achievements, Reminders)
  - Community (Leaderboard, Social Updates)
  - Promotions & Updates (Offers, App Updates)

**Multi-Level Control:**
- Toggle entire notification type on/off
- Fine-grained channel control:
  - Push Notifications
  - Email Notifications
  - In-App Notifications

**Productivity Features:**
- Individual toggles per setting
- Sub-setting reveals when expanded
- Mute All / Unmute All actions
- Save settings with API integration

## Reusable Components

### NotificationBadge
Displays unread notification count.
```typescript
<NotificationBadge count={5} visible={true} />
```

### NotificationToast
Toast-style notification messages.
```typescript
<NotificationToast
  title="Exam Completed"
  message="You scored 78%"
  type="success"
  action={{
    label: "View",
    onPress: () => {}
  }}
/>
```

### NotificationItem
Individual notification list item.
```typescript
<NotificationItem
  title="Achievement Unlocked"
  subtitle="Perfect Score"
  icon="medal-outline"
  color={colors.primary}
  read={false}
  timestamp="2 hours ago"
  onPress={() => {}}
/>
```

## Services

### pushNotificationService
Handles all push notification operations:

**Initialization:**
```typescript
// Call during app initialization
await initializePushNotifications();
```

**Features:**
- Permission request handling
- Token management
- Channel setup (Android)
- Foreground notification handling
- Badge count management
- Local notification scheduling

**Key Functions:**
- `initializePushNotifications()` - Setup push notifications
- `sendLocalNotification()` - Send immediate notification
- `scheduleLocalNotification()` - Schedule for future time
- `setupNotificationResponseListener()` - Handle user taps
- `setBadgeCount()` / `clearBadgeCount()` - Manage badge
- `cancelAllNotifications()` - Clear all notifications

## Hooks Integration

### useNotifications
React Query hook for notification data.
```typescript
const { 
  notifications, 
  unreadCount, 
  fetchNextPage,
  hasNextPage,
  isLoading 
} = useNotifications();
```

### useMarkAllRead
Mutation for marking all as read.
```typescript
const { mutate: markAllRead } = useMarkAllRead();
```

### useDeleteNotification
Mutation for deleting notifications.
```typescript
const { mutate: deleteNotification } = useDeleteNotification(notificationId);
```

## Navigation Integration

### Updated Type Definitions

**HomeStackParamList:**
```typescript
export type HomeStackParamList = {
    HomeMain: undefined;
    Notifications: undefined;
    NotificationDetail: {
        notificationId: string;
        notificationType: 'exam_result' | 'achievement' | 'reminder' | 'leaderboard' | 'promo';
    };
};
```

**SettingsStackParamList (New):**
```typescript
export type SettingsStackParamList = {
    Settings: undefined;
    NotificationSettings: undefined;
    AccountSettings: undefined;
    PrivacySettings: undefined;
};
```

## Implementation Guide

### 1. Register Screens in Navigation

```typescript
// HomeStack.tsx
<HomeStack.Screen
  name="Notifications"
  component={NotificationsScreen}
  options={{ headerShown: false }}
/>
<HomeStack.Screen
  name="NotificationDetail"
  component={NotificationDetailScreen}
  options={{ headerShown: false }}
/>

// SettingsStack.tsx (New)
<SettingsStack.Screen
  name="NotificationSettings"
  component={NotificationSettingsScreen}
  options={{ headerShown: false }}
/>
```

### 2. Initialize Push Notifications

```typescript
// App.tsx or main component
useEffect(() => {
  const initNotifications = async () => {
    await pushNotificationService.initializePushNotifications();
    setNotificationHandler();
    
    // Setup listeners
    const unsubscribeResponse = setupNotificationResponseListener((data) => {
      // Handle notification press
      console.log('Notification pressed with data:', data);
    });
    
    return () => unsubscribeResponse();
  };
  
  initNotifications();
}, []);
```

### 3. Display Notification Badge in Navigation

```typescript
// Use NotificationBadge component in tab bar
<View>
  <BellIcon size={24} />
  <NotificationBadge count={unreadCount} />
</View>
```

### 4. Handle Notification Actions

```typescript
// In screen
const handleNotificationPress = (notification: Notification) => {
  if (notification.type === 'exam_result') {
    navigation.navigate('ExamReview', { attemptId: notification.data.examId });
  } else if (notification.type === 'promo') {
    navigation.navigate('Profile', { screen: 'Subscription' });
  }
  
  // Mark as read
  markAsRead(notification.id);
};
```

## Best Practices

### Notification Design
1. **Clarity** - Each notification should have a clear, actionable title
2. **Brevity** - Keep messages concise (max 2-3 lines)
3. **Rich Data** - Include metadata for contextual display
4. **Action Clarity** - Make next actions obvious and accessible

### Performance
1. **Pagination** - Use infinite query for large notification lists
2. **Caching** - React Query caches notification data
3. **Badge Updates** - Update badge count after marking notifications read
4. **Cleanup** - Remove listeners when components unmount

### User Experience
1. **Permissions** - Request notification permissions gracefully
2. **Granularity** - Allow users fine control over notification types
3. **Feedback** - Provide visual feedback when actions complete
4. **Categorization** - Group related notifications together

## Notification Types

### Exam Results
- Triggered when user completes exam
- Includes: Score, time taken, next actions
- Actions: View detailed results, compare with average

### Achievements
- Triggered on milestone accomplishment
- Includes: Achievement name, description
- Visual: Medal/trophy icon, highlight color

### Study Reminders
- Scheduled daily notifications
- Customizable time
- Include streak information

### Leaderboard Updates
- Triggered when rank changes
- Includes: New rank, improvement amount
- CTA: View leaderboard

### Promotional Offers
- Special deals and discounts
- Includes: Discount percentage, validity
- CTA: View offer, apply code

## Storage & Persistence

Notification state is managed via React Query:
- Automatic caching
- Invalidation on mutations
- Offline support via cache
- No local storage needed (server is source of truth)

## Testing Scenarios

1. **Notification Delivery**
   - Send test notification via admin panel
   - Verify receipt and display

2. **Interaction**
   - Tap notification from list
   - Verify detail screen shows
   - Test action buttons

3. **Filtering**
   - Apply each filter type
   - Verify list updates correctly

4. **Settings**
   - Toggle notification types
   - Verify changes persist
   - Test mute/unmute

5. **Badge Count**
   - Verify updates when notifications received
   - Clears when marked as read
   - Shows correctly in tab bar

## Future Enhancements

1. **Smart Grouping** - Combine similar notifications
2. **Notifications Timeline** - Calendar view of past notifications
3. **Notification Templates** - Admin dashboard for creating notifications
4. **A/B Testing** - Test notification timing and wording
5. **Machine Learning** - Predict best time to send notifications
6. **Rich Media** - Images and videos in notifications
7. **Deep Linking** - Better handling of complex notification data
8. **Notification History** - Archive of all past notifications

## API Integration Points

The following API endpoints are used (implement in your backend):

- `GET /api/notifications` - List notifications with pagination
- `PUT /api/notifications/:id` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/settings` - Get user's notification settings
- `PUT /api/notifications/settings` - Update notification settings
- `POST /api/notifications/send-token` - Register push token

## Troubleshooting

### Notifications Not Showing
1. Check notification permissions granted
2. Verify notification channel setup (Android)
3. Check notification handler is configured
4. Verify app has focus for foreground notifications

### Badge Count Not Updating
1. Ensure `setBadgeCount()` called after marking read
2. Verify notification granted permissions
3. Check device supports badge counts

### Push Token Not Generated
1. Verify device (emulator/physical device)
2. Check Expo services configured
3. Verify network connectivity
