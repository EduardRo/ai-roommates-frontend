# Frontend Integration Guide - Grade 4 Math Tutor

## 🎯 Overview

This document provides everything the frontend team needs to integrate with the **Grade 4 Math Educational Tutor** backend.

**Backend Status**: ✅ Fully functional and tested  
**API Base URL**: `http://localhost:8000`

---

## 📊 What You're Building

A student learning interface where:

1. Students see a **curriculum menu** with all lessons
2. Each lesson shows **star rating** (0-5 stars) and **lock status** (🔒/✅)
3. Students click unlocked lessons to start learning
4. After completing a lesson, they earn stars and unlock the next lesson
5. Students can retry lessons to improve their score

---

## 🔌 Available API Endpoints

### 1. Get Full Curriculum

**Endpoint**: `GET /api/education/curriculum/mathematics/4`

**Response**:

```json
{
  "curriculum_id": "us_math_grade_4",
  "discipline": "mathematics",
  "grade_level": 4,
  "units": [
    {
      "unit_id": "unit_1_place_value",
      "title": "Place Value and Multi-Digit Numbers",
      "chapters": [
        {
          "chapter_id": "ch_1_1_understanding_place_value",
          "title": "Understanding Place Value",
          "lessons": [
            {
              "lesson_id": "lesson_1_1_1",
              "title": "Place Value to Millions",
              "prerequisites": [],
              "difficulty": "beginner"
            }
          ]
        }
      ]
    }
  ]
}
```

**Usage**: Load this once when student logs in. Store in your state management (Pinia/Vuex).

---

### 2. Get Specific Lesson

**Endpoint**: `GET /api/education/lesson/{lesson_id}?discipline=mathematics&grade=4`

**Example**: `GET /api/education/lesson/lesson_1_1_1`

**Response**:

```json
{
  "lesson_id": "lesson_1_1_1",
  "title": "Place Value to Millions",
  "learning_objectives": ["Understand place value", "..."],
  "phase_1_theory": {
    "explanation_content": "Each digit in a number has a specific value...",
    "comprehension_questions": [
      {
        "question": "In the number 456,789, what is the value of the digit 5?",
        "options": ["5", "50", "50,000", "500,000"],
        "correct_index": 2
      }
    ]
  },
  "phase_2_practice": {
    "total_questions": 10,
    "passing_score": 6,
    "questions": [
      {
        "question_id": "pv_mil_q1",
        "question": "What is the value of the digit 3 in 234,567?",
        "type": "multiple_choice",
        "options": ["3", "30", "30,000", "300,000"],
        "correct_index": 2,
        "explanation": "The 3 is in the ten-thousands place"
      }
    ]
  }
}
```

**Usage**: Fetch when student clicks a lesson. Use for the interactive lesson view.

---

### 3. Get Student Progress

**Endpoint**: `GET /api/students/{student_id}/progress/us_math_grade_4`

**Example**: `GET /api/students/student_123/progress/us_math_grade_4`

**Response**:

```json
{
  "student_id": "student_123",
  "curriculum_id": "us_math_grade_4",
  "lessons_completed": [
    {
      "lesson_id": "lesson_1_1_1",
      "score": 8.0,
      "stars": 4.0,
      "completed_at": "2025-11-25T14:30:00Z",
      "attempts": 1
    }
  ],
  "unlocked_lessons": ["lesson_1_1_1", "lesson_1_1_2"]
}
```

**Usage**: Load after curriculum to determine which lessons are unlocked and show stars.

---

### 4. Save Lesson Progress

**Endpoint**: `POST /api/students/{student_id}/progress/{lesson_id}`

**Example**: `POST /api/students/student_123/progress/lesson_1_1_1`

**Request Body**:

```json
{
  "score": 8.0,
  "time_spent_minutes": 45,
  "phase_1_score": 10,
  "phase_2_score": 8
}
```

**Response**:

```json
{
  "success": true,
  "lesson_id": "lesson_1_1_1",
  "score": 8.0,
  "stars": 4.0,
  "attempts": 1,
  "message": "🎉 Excellent work! You're doing great!"
}
```

**Usage**: Call after student completes Phase 2 practice questions.

---

### 5. Check Unlock Status

**Endpoint**: `GET /api/students/{student_id}/lessons/{lesson_id}/unlock-status`

**Example**: `GET /api/students/student_123/lessons/lesson_1_1_2/unlock-status`

**Response**:

```json
{
  "lesson_id": "lesson_1_1_2",
  "is_unlocked": true,
  "reason": "All prerequisites met",
  "prerequisites": ["lesson_1_1_1"]
}
```

**Usage**: Check before allowing student to start a lesson (optional - you can use `unlocked_lessons` from progress endpoint instead).

---

## 🎨 UI Components to Build

### 1. CurriculumView (Lesson Menu)

**Route**: `/learn/math/grade-4`

**Layout**:

```
┌─────────────────────────────────────────┐
│ 📖 Unit 1: Place Value                  │
├─────────────────────────────────────────┤
│ Chapter 1: Understanding Place Value    │
│                                          │
│ ⭐⭐⭐⭐⭐  Place Value to Millions   ✅ │
│ ⭐⭐⭐⭐☆  Expanded Form              ✅ │
│ ☆☆☆☆☆  Comparing Numbers             💫 │
│ ☆☆☆☆☆  Word Form                     🔒 │
│ ☆☆☆☆☆  Place Value Patterns          🔒 │
└─────────────────────────────────────────┘
```

**Data Flow**:

1. Fetch curriculum: `GET /api/education/curriculum/mathematics/4`
2. Fetch progress: `GET /api/students/{student_id}/progress/us_math_grade_4`
3. Merge data to show stars and lock status
4. On lesson click: Navigate to `/lesson/{lesson_id}`

**Components**:

- `LessonCard.vue` - Individual lesson with stars and lock icon
- `ChapterSection.vue` - Collapsible chapter with lessons
- `UnitHeader.vue` - Unit title and description

---

### 2. LessonView (Interactive Lesson)

**Route**: `/lesson/{lesson_id}`

**Layout**:

```
┌─────────────────────────────────────────┐
│ 🎓 Lesson: Place Value to Millions      │
├─────────────────────────────────────────┤
│                                          │
│  [AI Character Avatar]                   │
│                                          │
│  "Hi! Let's learn about place value!"   │
│                                          │
│  [Content Area]                          │
│  - Theory explanation                    │
│  - Comprehension questions               │
│  - Practice problems                     │
│                                          │
│  [Next Button]                           │
└─────────────────────────────────────────┘
```

**Two Phases**:

**Phase 1: Theory** (No scoring)

- Display `explanation_content`
- Show `comprehension_questions` as MCQ
- Allow student to proceed at their own pace

**Phase 2: Practice** (Scored)

- Show 10 questions from `phase_2_practice.questions`
- Track correct answers
- Calculate score: `correct_answers / 10 * 10` (e.g., 8/10 = 8.0)
- Call save progress API

**Components**:

- `TheorySlide.vue` - Display explanation content
- `QuestionCard.vue` - MCQ component
- `FeedbackOverlay.vue` - Show "Correct!" or "Try again"
- `ProgressBar.vue` - Show question progress (1/10, 2/10, etc.)

---

### 3. SummaryView (Lesson Complete)

**Layout**:

```
┌─────────────────────────────────────────┐
│          🎉 Lesson Complete!             │
├─────────────────────────────────────────┤
│                                          │
│         You scored: 8/10                 │
│                                          │
│         ⭐⭐⭐⭐☆                        │
│                                          │
│   🎉 Excellent work! You're doing great! │
│                                          │
│   [Next Lesson] [Retry] [Back to Menu]  │
└─────────────────────────────────────────┘
```

**Data**: Use response from save progress API

---

## 🗂️ State Management (Pinia/Vuex)

### EducationStore

```typescript
interface EducationStore {
  // Curriculum data
  curriculum: Curriculum | null;

  // Student progress
  studentId: string;
  completedLessons: LessonProgress[];
  unlockedLessons: string[];

  // Current lesson
  currentLesson: Lesson | null;
  currentPhase: "theory" | "practice" | "summary";
  currentQuestionIndex: number;
  sessionScore: number;

  // Actions
  loadCurriculum(discipline: string, grade: number): Promise<void>;
  loadProgress(studentId: string, curriculumId: string): Promise<void>;
  startLesson(lessonId: string): Promise<void>;
  submitAnswer(questionId: string, answer: number): void;
  completeLesson(): Promise<void>;
}
```

---

## 🌟 Star Rating Display

**Formula**: `stars = score / 2`

**Examples**:

- Score 10 → 5.0 stars → ⭐⭐⭐⭐⭐
- Score 8 → 4.0 stars → ⭐⭐⭐⭐☆
- Score 6 → 3.0 stars → ⭐⭐⭐☆☆
- Score 4 → 2.0 stars → ⭐⭐☆☆☆
- Score 0 → 0.0 stars → ☆☆☆☆☆

**Component**:

```vue
<template>
  <div class="star-rating">
    <span v-for="i in 5" :key="i">
      {{ i <= stars ? "⭐" : "☆" }}
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  score: Number, // 0-10
});

const stars = computed(() => props.score / 2);
</script>
```

---

## 🔒 Unlocking Logic

**Rules**:

1. First lesson (`lesson_1_1_1`) is always unlocked
2. Subsequent lessons require previous lesson with score ≥ 6
3. Students can retry lessons to improve score
4. Retakes replace the previous score

**Frontend Logic**:

```typescript
function isLessonUnlocked(lessonId: string): boolean {
  return unlockedLessons.includes(lessonId);
}

function canStartLesson(lessonId: string): boolean {
  if (!isLessonUnlocked(lessonId)) {
    showTooltip("Complete previous lesson with 3+ stars");
    return false;
  }
  return true;
}
```

---

## 📝 Example Integration Flow

### 1. Student Logs In

```typescript
// Load curriculum
await educationStore.loadCurriculum("mathematics", 4);

// Load progress
await educationStore.loadProgress(studentId, "us_math_grade_4");

// Navigate to curriculum view
router.push("/learn/math/grade-4");
```

### 2. Student Clicks Lesson

```typescript
async function startLesson(lessonId: string) {
  if (!canStartLesson(lessonId)) return;

  await educationStore.startLesson(lessonId);
  router.push(`/lesson/${lessonId}`);
}
```

### 3. Student Completes Lesson

```typescript
async function finishLesson() {
  const score = calculateScore(); // 0-10

  const result = await api.post(
    `/api/students/${studentId}/progress/${lessonId}`,
    { score, time_spent_minutes: 45 }
  );

  showSummary(result.stars, result.message);
}
```

---

## 🧪 Testing Your Integration

1. **Start Backend**: `python run_server.py`
2. **Test Endpoints**: `python test_education_api.py`
3. **Use Test Student ID**: `test_student_123`
4. **Try Different Scores**: Test with scores 0, 5, 6, 8, 10 to see unlocking

---

## 📦 Current Curriculum Content

**Available Now**:

- Unit 1: Place Value and Multi-Digit Numbers
  - Chapter 1: Understanding Place Value (5 lessons)
    - Lesson 1: Place Value to Millions
    - Lesson 2: Expanded Form and Standard Form
    - Lesson 3: Comparing Large Numbers
    - Lesson 4: Word Form and Number Names
    - Lesson 5: Place Value Patterns

**Total**: 5 lessons, 50 practice questions

---

## 🚀 Next Steps

1. **Create Store**: Set up `useEducationStore` with Pinia
2. **Build CurriculumView**: Display lessons with stars and locks
3. **Build LessonView**: Interactive lesson with questions
4. **Test Flow**: Complete a lesson end-to-end
5. **Add Animations**: Celebrate lesson completion!

---

## 💡 Tips

- **Cache Curriculum**: Load once, store in state
- **Optimistic UI**: Show stars immediately after completion
- **Error Handling**: Handle network errors gracefully
- **Loading States**: Show spinners while fetching data
- **Responsive Design**: Works on tablets (target audience: kids)

---

**Questions?** Check `GRADE_4_IMPLEMENTATION.md` for backend details!

**Status**: ✅ Backend Ready | Frontend In Progress  
**Last Updated**: November 25, 2025
