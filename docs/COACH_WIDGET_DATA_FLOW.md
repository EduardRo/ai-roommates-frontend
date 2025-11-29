# CoachWidget Data Flow Documentation

## Overview

The `CoachWidget` displays student learning statistics on the dashboard, including weekly lessons completed and average score.

## Current Status

**Backend IS returning data, but it's all zeros:**

```javascript
{
  lessons: 0,
  average: 0
}
```

This means either:

1. The backend hasn't received any lesson completion data yet
2. The backend's calculation logic is incorrect
3. The data exists but the query is looking in the wrong place/time range

---

## Complete Data Flow

### 1. Component: `CoachWidget.vue`

**Location:** `e:\AI-SYNTIA-V5\frontend\src\components\dashboard\CoachWidget.vue`

**What it does:**

- Displays weekly stats (lessons completed, average score)
- Shows recommendations for lessons to review
- Provides a button to open the AI Coach chat

**Code (lines 99-115):**

```javascript
try {
  // Load quick insights
  console.log('[CoachWidget] Fetching insights for user:', userId)
  const insights = await coachStore.getQuickInsights({
    userType: props.userType,
    userId: userId,
  })
  console.log('[CoachWidget] Received insights:', insights)

  if (props.userType === 'student') {
    recommendations.value = insights.recommendations || []
    weeklyStats.value = insights.weekly_stats || { lessons: 0, average: 0 }
    console.log('[CoachWidget] Set weekly stats:', weeklyStats.value)
  }
}
```

---

### 2. Store: `coachStore.js`

**Location:** `e:\AI-SYNTIA-V5\frontend\src\stores\coachStore.js`

**What it does:**

- Acts as a middleman between components and services
- Just passes through the data from `coachService`

**Code (lines 68-78):**

```javascript
async getQuickInsights({ userType, userId }) {
  try {
    return await coachService.getQuickInsights({
      userType,
      userId,
    })
  } catch (error) {
    console.error('Failed to get insights:', error)
    return {}
  }
}
```

---

### 3. Service: `coachService.js`

**Location:** `e:\AI-SYNTIA-V5\frontend\src\services\coachService.js`

**What it does:**

- Makes the actual HTTP request to the backend
- Determines the correct endpoint based on user type

**Code (lines 30-36):**

```javascript
async getQuickInsights({ userType, userId }) {
  const endpoint =
    userType === 'student'
      ? `/students/${userId}/coach/insights`
      : `/parents/${userId}/children/summary`

  return await apiGet(endpoint)
}
```

---

## API Endpoint

### For Students

**Endpoint:** `GET /api/students/{userId}/coach/insights`

**Example Request:**

```
GET http://localhost:8000/api/students/3/coach/insights
```

**Expected Response Format:**

```json
{
  "weekly_stats": {
    "lessons": 5,
    "average": 85
  },
  "recommendations": [
    {
      "lesson_id": "math_101",
      "days_overdue": 3
    }
  ]
}
```

**Current Response (from your logs):**

```json
{
  "weekly_stats": {
    "lessons": 0,
    "average": 0
  },
  "recommendations": []
}
```

---

## Backend Requirements

For the widget to show correct data, the backend needs to:

1. **Query the `student_progress` table** for lessons completed in the last 7 days
2. **Calculate:**
   - `lessons`: Count of completed lessons this week
   - `average`: Average score across those lessons
3. **Return the data** in the format shown above

### SQL Query Example (what backend should do)

```sql
SELECT
  COUNT(*) as lessons,
  AVG(score) as average
FROM student_progress
WHERE student_id = {userId}
  AND completed_at >= NOW() - INTERVAL '7 days'
  AND completed = true
```

---

## Troubleshooting

### Why is the data showing zeros?

**Check 1: Has the student completed any lessons?**

- The frontend IS saving lesson completion data (we fixed that)
- Check if the backend database has records in `student_progress` table

**Check 2: Is the backend calculating correctly?**

- The backend might be looking at the wrong time range
- The backend might be filtering incorrectly (e.g., wrong student_id)

**Check 3: Is the data recent enough?**

- The widget shows "This Week" stats
- If lessons were completed more than 7 days ago, they won't show

---

## Next Steps

1. **Verify lesson completion is saving:**

   - Complete a lesson
   - Check browser console for: `[LessonView] Lesson progress saved successfully`
   - Check backend database for new row in `student_progress` table

2. **Ask backend team to verify:**

   - Does `/api/students/{id}/coach/insights` endpoint exist?
   - Is it querying the correct table?
   - Is it filtering by the last 7 days?
   - Is it returning the correct data structure?

3. **Test the endpoint directly:**
   ```bash
   curl http://localhost:8000/api/students/3/coach/insights
   ```
   Check what it returns.
