# Progress & Performance Tracking - Complete Guide

## Backend Endpoints & Data Format

### 1. **Question-Level Tracking**

**Endpoint**: `POST /api/students/{student_id}/questions/attempt`

**When to Call**: Every time a student answers a question (correct or incorrect)

**Request Format**:

```json
{
  "lesson_id": "math_101",
  "question_id": "q_1",
  "student_answer": "42",
  "correct_answer": "42",
  "time_spent": 15,
  "session_id": 456
}
```

**Response**:

```json
{
  "success": true,
  "is_correct": true,
  "attempt_number": 1
}
```

**What Gets Saved**:

- Individual question attempts
- Correct/incorrect status
- Time spent per question
- Attempt number (for retry tracking)
- Mistake patterns for AI analysis

---

### 2. **Lesson Completion**

**Endpoint**: `POST /api/students/{student_id}/progress`

**When to Call**: When a student completes a lesson

**Request Format**:

```json
{
  "lesson_id": "math_101",
  "score": 85,
  "time_spent": 1200,
  "completed": true,
  "mastery_level": "proficient"
}
```

**What Gets Saved**:

- Overall lesson score
- Completion status
- Time spent on lesson
- Mastery level
- Triggers retention tracking if score >= 80%

---

### 3. **Lesson Review (Spaced Repetition)**

**Endpoint**: `POST /api/students/{student_id}/lessons/{lesson_id}/review`

**When to Call**: When a student completes a review of a previously mastered lesson

**Request Format**:

```json
{
  "score": 90
}
```

**Response**:

```json
{
  "success": true
}
```

**What Gets Saved**:

- Review attempt score
- Days since initial mastery
- Retention rate calculation
- Updates spaced repetition schedule

---

### 4. **Session Tracking**

**Endpoint**: `POST /api/students/{student_id}/sessions`

**When to Call**: At the start and end of a study session

**Request Format (Start)**:

```json
{
  "action": "start",
  "lesson_id": "math_101"
}
```

**Request Format (End)**:

```json
{
  "action": "end",
  "session_id": 123,
  "duration_seconds": 1800,
  "focus_score": 0.85
}
```

**What Gets Saved**:

- Session start/end times
- Total duration
- Focus score (behavioral metric)
- Time of day patterns
- Session frequency

---

### 5. **Get Review Recommendations**

**Endpoint**: `GET /api/students/{student_id}/reviews/recommended`

**When to Call**: On dashboard load, to show lessons needing review

**Response**:

```json
[
  {
    "lesson_id": "math_3_2",
    "urgency": 15.5,
    "days_overdue": 2,
    "days_since_mastery": 17,
    "recommended_interval": 14,
    "last_retention_rate": 0.85
  }
]
```

---

## Frontend Implementation Checklist

### **1. Quiz/Exercise Component** (`QuizComponent.vue` or similar)

**Current Issue**: Likely not tracking individual question attempts

**Required Changes**:

```javascript
// In your submitAnswer or checkAnswer method
async function submitAnswer(questionId, answer) {
  const startTime = this.questionStartTime; // Track when question was shown
  const timeSpent = Math.round((Date.now() - startTime) / 1000);

  // 1. Check if answer is correct (existing logic)
  const isCorrect = checkAnswer(answer, correctAnswer);

  // 2. NEW: Send to backend for tracking
  try {
    await apiClient.post(`/api/students/${studentId}/questions/attempt`, {
      lesson_id: currentLessonId,
      question_id: questionId,
      student_answer: answer,
      correct_answer: correctAnswer,
      time_spent: timeSpent,
      session_id: currentSessionId, // if you have session tracking
    });
  } catch (error) {
    console.error("Failed to track question:", error);
    // Don't block user flow if tracking fails
  }

  // 3. Continue with existing UI logic (show feedback, next question, etc.)
}

// Track when question is displayed
function showQuestion(question) {
  this.questionStartTime = Date.now();
  // ... rest of your logic
}
```

---

### **2. Lesson Completion** (`LessonView.vue` or `ProgressManager`)

**Current Issue**: May not be calling the progress endpoint correctly

**Required Changes**:

```javascript
async function completeLesson(finalScore) {
  try {
    // Call existing progress endpoint
    await apiClient.post(`/api/students/${studentId}/progress`, {
      lesson_id: lessonId,
      score: finalScore,
      time_spent: totalTimeSpent,
      completed: true,
      mastery_level: calculateMasteryLevel(finalScore),
    });

    // Show completion UI
    showCompletionScreen();
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
}

function calculateMasteryLevel(score) {
  if (score >= 90) return "mastered";
  if (score >= 80) return "proficient";
  if (score >= 70) return "developing";
  return "needs_practice";
}
```

---

### **3. Review Mode** (`LessonView.vue`)

**Current Issue**: Likely not distinguishing between first-time lessons and reviews

**Required Changes**:

```javascript
// Check if this is a review session
const isReviewMode = this.$route.query.mode === "review";

async function completeLesson(score) {
  if (isReviewMode) {
    // This is a review - call review endpoint
    try {
      await apiClient.post(
        `/api/students/${studentId}/lessons/${lessonId}/review`,
        {
          score: score,
        }
      );
    } catch (error) {
      console.error("Failed to track review:", error);
    }
  } else {
    // This is first-time completion - call progress endpoint
    await apiClient.post(`/api/students/${studentId}/progress`, {
      lesson_id: lessonId,
      score: score,
      // ... other fields
    });
  }
}
```

---

### **4. Session Tracking** (App-level or Dashboard)

**Current Issue**: Probably not tracking study sessions

**Required Changes**:

```javascript
// In your main App.vue or Dashboard component
let currentSessionId = null;

async function startSession(lessonId) {
  try {
    const response = await apiClient.post(
      `/api/students/${studentId}/sessions`,
      {
        action: "start",
        lesson_id: lessonId,
      }
    );
    currentSessionId = response.data.session_id;

    // Store in localStorage for persistence
    localStorage.setItem("currentSessionId", currentSessionId);
  } catch (error) {
    console.error("Failed to start session:", error);
  }
}

async function endSession() {
  if (!currentSessionId) return;

  try {
    await apiClient.post(`/api/students/${studentId}/sessions`, {
      action: "end",
      session_id: currentSessionId,
      duration_seconds: calculateDuration(),
      focus_score: calculateFocusScore(),
    });

    currentSessionId = null;
    localStorage.removeItem("currentSessionId");
  } catch (error) {
    console.error("Failed to end session:", error);
  }
}

// Call on beforeUnmount or window.beforeunload
window.addEventListener("beforeunload", endSession);
```

---

### **5. Dashboard - Review Widget** (`ReviewWidget.vue`)

**Current Issue**: Likely not showing spaced repetition recommendations

**Required Implementation**:

```vue
<template>
  <div class="review-widget" v-if="reviews.length > 0">
    <h3>🧠 Memory Boost</h3>
    <div v-for="review in reviews" :key="review.lesson_id">
      <span>{{ formatLessonName(review.lesson_id) }}</span>
      <span class="overdue">{{ review.days_overdue }} days overdue</span>
      <button @click="startReview(review.lesson_id)">Review</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/services/apiClient";

const reviews = ref([]);
const router = useRouter();

async function loadReviews() {
  try {
    const response = await apiClient.get(
      `/api/students/${studentId}/reviews/recommended`
    );
    reviews.value = response.data;
  } catch (error) {
    console.error("Failed to load reviews:", error);
  }
}

function startReview(lessonId) {
  router.push({
    name: "LessonView",
    params: { id: lessonId },
    query: { mode: "review" }, // IMPORTANT: Mark as review mode
  });
}

onMounted(loadReviews);
</script>
```

---

## Summary of Required Frontend Changes

### **Critical (Must Implement)**:

1. ✅ **Question Tracking**: Add `POST /questions/attempt` to quiz component
2. ✅ **Review Mode**: Detect review mode and call `POST /lessons/{id}/review`
3. ✅ **Review Widget**: Show recommendations from `GET /reviews/recommended`

### **Important (Should Implement)**:

4. ⚠️ **Session Tracking**: Track study sessions for behavioral analytics
5. ⚠️ **Time Tracking**: Measure time per question and per lesson

### **Optional (Nice to Have)**:

6. 💡 **Focus Score**: Calculate focus based on tab visibility, idle time
7. 💡 **Confidence Level**: Ask students how confident they are (1-5 scale)

---

## Testing Checklist

After implementing, verify:

- [ ] Question attempts appear in `question_attempts` table
- [ ] Lesson completion creates/updates `student_progress` record
- [ ] High scores (>80%) create `retention_tracking` record
- [ ] Review completions create `review_attempts` record
- [ ] Sessions appear in `sessions` table
- [ ] Coach insights reflect recent performance
- [ ] Review recommendations appear on dashboard

---

## Database Tables Being Populated

1. **`question_attempts`** - Every question answered
2. **`student_progress`** - Lesson completions
3. **`retention_tracking`** - Mastered lessons (score >= 80%)
4. **`review_attempts`** - Review completions
5. **`sessions`** - Study sessions
6. **`coach_conversations`** - AI coach chats
7. **`coach_messages`** - Individual messages
8. **`coach_contexts`** - Long-term student profiles

All of these feed into the AI Coach's analytics and recommendations.
