# AI Learning Coach - Complete Implementation Documentation

**Last Updated**: 2025-11-28  
**Status**: ✅ Frontend Implementation Complete - Ready for Backend Integration

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components Reference](#components-reference)
4. [API Endpoints](#api-endpoints)
5. [Implementation Details](#implementation-details)
6. [Dashboard Integration](#dashboard-integration)
7. [Tracking System](#tracking-system)
8. [Testing Checklist](#testing-checklist)
9. [Future Enhancements](#future-enhancements)

---

## Overview

The AI Learning Coach is a comprehensive feature that provides personalized AI-powered coaching for both students and parents. It analyzes student performance data, provides insights, and offers recommendations based on neuroscience principles and spaced repetition algorithms.

### Key Features

- **Student Coach**: Personalized learning insights, neuroscience tips, and study recommendations
- **Parent Coach**: Progress summaries, action items, and multi-child support
- **Spaced Repetition**: Automated review recommendations based on retention algorithms
- **Performance Tracking**: Comprehensive tracking of question attempts and lesson reviews
- **Dashboard Widgets**: Quick access to coaching features from dashboards

---

## Architecture

### State Management (Pinia)

**Store**: `src/stores/coachStore.js`

```javascript
{
  state: {
    messages: [],              // Chat message history
    currentConversationId: null,
    currentInsights: null,     // Student insights
    currentSummary: null,      // Parent summary
    isLoading: false
  },
  actions: {
    sendMessage(),
    loadHistory(),
    getQuickInsights(),
    getReviewRecommendations()
  }
}
```

### Service Layer

**Service**: `src/services/coachService.js`

Handles all API communication using the `apiPost` and `apiGet` utilities from `@/utils/apiClient`.

---

## Components Reference

### Chat Components (`src/components/coach/`)

#### 1. MessageBubble.vue

**Purpose**: Display individual chat messages with rich content

**Props**:

- `message` (Object): Message data including role, content, insights/summary
- `userType` (String): 'student' or 'parent'

**Features**:

- Role-based styling (user/coach/system)
- Markdown formatting support
- Insights display for students
- Summary display for parents
- Timestamp formatting

#### 2. QuickActions.vue

**Purpose**: Suggested conversation starters

**Props**:

- `userType` (String): 'student' or 'parent'

**Emits**:

- `select` (String): Selected question text

**Features**:

- Context-aware suggestions
- Different questions for students vs parents
- One-click message sending

#### 3. InsightCard.vue

**Purpose**: Display learning insights and statistics

**Props**:

- `insights` (Object): Performance data and recommendations

**Features**:

- Average score and trend display
- Neuroscience tips
- Personalized recommendations
- Visual trend indicators

#### 4. ChatInterface.vue

**Purpose**: Main chat interface component

**Props**:

- `userType` (String): 'student' or 'parent'
- `userId` (Number): Current user ID
- `childId` (Number, optional): For parent viewing specific child

**Features**:

- Message history with auto-scroll
- Real-time message input
- Loading states
- Quick actions integration
- New conversation functionality

### Dashboard Widgets (`src/components/dashboard/`)

#### 1. CoachWidget.vue

**Purpose**: Quick access to AI Coach from dashboard

**Props**:

- `userType` (String): 'student' or 'parent'
- `userId` (Number): Current user ID

**Features**:

- Latest insights preview
- Weekly statistics (students)
- Children summary (parents)
- Navigation to full coach interface

#### 2. ReviewWidget.vue

**Purpose**: Spaced repetition review reminders

**Props**:

- `studentId` (Number): Student ID

**Features**:

- Overdue lesson tracking
- Urgency indicators
- Direct navigation to review mode
- Badge showing number of reviews due

### Views (`src/views/`)

#### 1. StudentCoachView.vue

**Route**: `/student/coach`  
**Auth**: Requires student authentication

Simple wrapper that renders `ChatInterface` with student context.

#### 2. ParentCoachView.vue

**Route**: `/parent/coach`  
**Auth**: Requires parent authentication

**Features**:

- Child selector dropdown (if multiple children)
- Renders `ChatInterface` with parent context
- Supports viewing all children or specific child

---

## API Endpoints

All endpoints use the `/api` prefix (configured in `apiClient.js`).

### Student Coach Endpoints

#### POST /students/{id}/coach/chat

Send a message to the student coach.

**Request**:

```json
{
  "message": "How am I doing overall?",
  "conversation_id": "uuid-string" // optional
}
```

**Response**:

```json
{
  "response": "You're doing great! Your average score...",
  "conversation_id": "uuid-string",
  "insights": {
    "performance_summary": {
      "avg_score": 85,
      "trend": "improving"
    },
    "neuroscience_tip": "Taking breaks helps consolidate memory...",
    "recommendations": [
      "Review lesson 3.2 (overdue by 2 days)",
      "Practice more multiplication problems"
    ]
  }
}
```

#### GET /students/{id}/coach/history

Retrieve conversation history.

**Response**:

```json
{
  "messages": [...],
  "conversation_id": "uuid-string"
}
```

#### GET /students/{id}/coach/insights

Get quick insights for dashboard widget.

**Response**:

```json
{
  "recommendations": [...],
  "weekly_stats": {
    "lessons": 5,
    "average": 87
  }
}
```

#### GET /students/{id}/reviews/recommended

Get spaced repetition recommendations.

**Response**:

```json
[
  {
    "lesson_id": "math_3_2",
    "days_overdue": 2,
    "urgency": 15
  }
]
```

### Parent Coach Endpoints

#### POST /parents/{id}/coach/chat

Send a message to the parent coach.

**Request**:

```json
{
  "message": "How is my child doing?",
  "child_id": 123, // optional
  "conversation_id": "uuid-string" // optional
}
```

**Response**:

```json
{
  "response": "Your child is making good progress...",
  "conversation_id": "uuid-string",
  "summary": {
    "overall_status": "improving",
    "key_strengths": ["multiplication", "problem solving"],
    "areas_to_support": ["division"],
    "action_items": ["Encourage daily practice", "Review division concepts together"]
  }
}
```

#### GET /parents/{id}/coach/history

Retrieve conversation history.

**Query Params**:

- `child_id` (optional): Filter by specific child

#### GET /parents/{id}/children/summary

Get summary of all children for dashboard widget.

**Response**:

```json
[
  {
    "id": 123,
    "name": "Alice",
    "status": "improving"
  }
]
```

### Tracking Endpoints

#### POST /students/{id}/tracking/question

Track a question attempt.

**Request**:

```json
{
  "lesson_id": "math_3_2",
  "question_id": "q0",
  "selected_answer": 2,
  "is_correct": true,
  "time_spent_seconds": 15
}
```

#### POST /students/{id}/tracking/review

Track a lesson review.

**Request**:

```json
{
  "lesson_id": "math_3_2",
  "reviewed_at": "2025-11-28T06:00:00Z"
}
```

---

## Implementation Details

### Routing Configuration

**File**: `src/router/index.js`

Added routes:

```javascript
{
  path: '/student/coach',
  name: 'student-coach',
  component: () => import('../views/StudentCoachView.vue'),
  meta: { requiresStudent: true }
},
{
  path: '/parent/coach',
  name: 'parent-coach',
  component: () => import('../views/ParentCoachView.vue'),
  meta: { requiresParent: true }
}
```

### Tracking Integration

**File**: `src/views/LessonView.vue`

**Question Attempt Tracking** (Lines ~308-323):

- Tracks every practice question answer
- Records: lesson ID, question ID, selected answer, correctness, time spent
- Automatic timing from question display to answer selection
- Error handling with console logging

**Lesson Review Tracking** (Lines ~208-220):

- Detects review mode via query parameter (`?mode=review`)
- Tracks when students revisit lessons
- Feeds data to AI Coach for retention analysis

**Implementation**:

```javascript
// Question timing
const questionStartTime = ref(null)

// Start timer when entering practice phase
const startPractice = () => {
  questionStartTime.value = Date.now()
  // ...
}

// Track on answer
const handlePracticeAnswer = async (answerIndex) => {
  const timeSpent = questionStartTime.value
    ? Math.floor((Date.now() - questionStartTime.value) / 1000)
    : 0

  await coachService.trackQuestionAttempt({
    studentId: authStore.user?.id,
    lessonId: route.params.lessonId,
    questionId: `q${currentQuestionIndex.value}`,
    selectedAnswer: answerIndex,
    isCorrect,
    timeSpent,
  })
}
```

---

## Dashboard Integration

### Student Dashboard

**File**: `src/views/StudentDashboardView.vue`  
**Section**: Lines 67-74

Added "🤖 Your AI Learning Coach" section:

```vue
<div class="coach-section">
  <h3 class="section-title">🤖 Your AI Learning Coach</h3>
  <CoachWidget user-type="student" :user-id="authStore.user?.id" />
  <ReviewWidget :student-id="authStore.user?.id" />
</div>
```

**Styling**:

- Cyberpunk theme with cyan glow
- Positioned between stats grid and coming soon section
- Responsive design

### Parent Dashboard

**File**: `src/views/ParentDashboardView.vue`  
**Section**: Lines 84-90

Added "📊 Progress Insights" section:

```vue
<div v-if="studentsStore.children.length > 0" class="insights-section">
  <h3 class="section-title">📊 Progress Insights</h3>
  <CoachWidget user-type="parent" :user-id="authStore.user?.id" />
</div>
```

**Features**:

- Only displays when children are present
- Positioned after children grid
- Consistent styling with dashboard theme

---

## Testing Checklist

### Frontend Testing

- [ ] **Student Chat Flow**

  - [ ] Send message and receive response
  - [ ] View insights in chat
  - [ ] Quick actions work correctly
  - [ ] Conversation history loads
  - [ ] New conversation clears state

- [ ] **Parent Chat Flow**

  - [ ] Send message and receive response
  - [ ] View summary in chat
  - [ ] Child selector works (if multiple children)
  - [ ] Conversation history loads
  - [ ] Can view all children or specific child

- [ ] **Dashboard Widgets**

  - [ ] CoachWidget displays on student dashboard
  - [ ] ReviewWidget displays on student dashboard
  - [ ] CoachWidget displays on parent dashboard
  - [ ] Widgets navigate to correct routes
  - [ ] Data loads correctly

- [ ] **Tracking**

  - [ ] Question attempts are tracked
  - [ ] Time tracking is accurate
  - [ ] Review mode triggers tracking
  - [ ] Failed tracking doesn't break UI

- [ ] **Responsive Design**
  - [ ] Works on mobile devices
  - [ ] Chat interface is usable on small screens
  - [ ] Widgets stack properly on mobile

### Backend Integration Testing

- [ ] All API endpoints return expected data
- [ ] Authentication is properly enforced
- [ ] Error responses are handled gracefully
- [ ] Conversation IDs are persisted correctly
- [ ] Tracking data is stored in database

---

## Future Enhancements

### Planned Features

1. **Voice Input**: Allow students to speak questions
2. **Image Upload**: Share screenshots of problems
3. **Progress Charts**: Visual graphs in chat
4. **Notifications**: Push notifications for review reminders
5. **Gamification**: Badges for using coach features
6. **Multilingual**: Support for multiple languages
7. **Offline Mode**: Cache conversations for offline access

### Technical Improvements

1. **WebSocket Support**: Real-time streaming responses
2. **Message Reactions**: Like/dislike coach responses
3. **Export Conversations**: Download chat history
4. **Search**: Search through conversation history
5. **Analytics**: Track coach usage metrics

---

## Code Style Guidelines

All code follows **StandardJS** style:

- No semicolons
- 2-space indentation
- Single quotes for strings
- Proper spacing and formatting

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── coach/
│   │   │   ├── ChatInterface.vue
│   │   │   ├── MessageBubble.vue
│   │   │   ├── QuickActions.vue
│   │   │   └── InsightCard.vue
│   │   └── dashboard/
│   │       ├── CoachWidget.vue
│   │       └── ReviewWidget.vue
│   ├── views/
│   │   ├── StudentCoachView.vue
│   │   └── ParentCoachView.vue
│   ├── stores/
│   │   └── coachStore.js
│   ├── services/
│   │   └── coachService.js
│   └── router/
│       └── index.js (modified)
└── docs/
    ├── FRONTEND_COACH_SPEC.md (original spec)
    └── AI_COACH_IMPLEMENTATION.md (this file)
```

---

## Troubleshooting

### Common Issues

**Issue**: API calls failing with 404

- **Solution**: Verify backend endpoints are implemented
- **Check**: API base URL in `apiClient.js`

**Issue**: Widgets not showing on dashboard

- **Solution**: Check user authentication state
- **Check**: Verify user ID is available in `authStore.user?.id`

**Issue**: Tracking not working

- **Solution**: Check console for errors
- **Check**: Verify `authStore.user?.id` exists before tracking

**Issue**: Messages not displaying

- **Solution**: Check message format from backend
- **Check**: Verify `role` field is 'user', 'coach', or 'system'

---

## Maintenance Notes

### Dependencies

- Vue 3 (Composition API)
- Pinia (State Management)
- Vue Router
- `@/utils/apiClient` (Custom API client)

### Breaking Changes to Avoid

- Do not change message format structure
- Maintain backward compatibility with API responses
- Keep `userType` as 'student' or 'parent' (case-sensitive)
- Preserve conversation ID format

---

## Contact & Support

For questions about this implementation:

1. Review this documentation
2. Check `FRONTEND_COACH_SPEC.md` for original requirements
3. Review code comments in implementation files
4. Check console logs for debugging information

---

**End of Documentation**
