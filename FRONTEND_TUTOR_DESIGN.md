# Frontend Design: Educational Tutor Platform

## Overview

This document outlines the frontend requirements for the **Educational Tutor Platform** (Phase 1: Grade 3 Math). The interface is designed to be engaging, child-friendly, and centered around the AI Tutor (Live2D character).

## 1. User Flow

1.  **Login**: Student logs in (existing).
2.  **Dashboard**: Sees current progress, badges, and a "Continue Learning" button.
3.  **Curriculum Selection**: Browses available subjects (Math) and lessons.
4.  **Lesson Session**:
    - **Phase 1: Theory**: Tutor explains concepts with visual aids.
    - **Phase 2: Practice**: Interactive questions with immediate AI feedback.
5.  **Lesson Summary**: Results, XP earned, Badge unlocks.

## 2. Core Views & Components

### A. DashboardView (`/dashboard`)

- **Purpose**: Hub for the student's journey.
- **Components**:
  - `WelcomeBanner`: "Welcome back, [Name]! Ready to learn?"
  - `ProgressCard`: Current Chapter progress bar (e.g., "Multiplication: 45%").
  - `ContinueButton`: Deep link to the next unlocked lesson.
  - `StatsWidget`: XP count, Streak count.

### B. CurriculumView (`/learn/math/grade-3`)

- **Purpose**: Map of the learning path.
- **Components**:
  - `ChapterList`: Accordion or list of chapters (e.g., "Chapter 1: Multiplication Basics").
  - `LessonItem`: Individual lesson card showing:
    - Title (e.g., "The 2x Table")
    - Status Icon: 🔒 Locked, 🔓 Unlocked, ✅ Completed (with Star rating 1-3).
    - Score (if completed).

### C. LessonView (`/lesson/{lesson_id}`)

- **Purpose**: The main interactive learning interface.
- **Layout**: Split screen or Focused Center.
  - **Left/Top**: `TutorContainer` (Live2D Character).
  - **Right/Bottom**: `ContentContainer` (Learning material).
- **Sub-Components**:
  - `TutorAvatar`: The Live2D canvas.
  - `DialogueBubble`: Where the AI's speech text appears (typewriter effect).
  - `TheorySlide`: Displays educational content (Text, Images, Examples) during Phase 1.
  - `QuestionCard`: Displays a practice question (MCQ or numeric input) during Phase 2.
  - `FeedbackOverlay`: Visual pop-up for "Correct!" (Green/Confetti) or "Try Again" (Orange/Encouraging).
  - `ControlBar`: "Next", "Submit", "I need help" buttons.

### D. SummaryView (Modal or Page)

- **Purpose**: Celebrate completion.
- **Components**:
  - `ScoreCard`: "You got 8/10!"
  - `RewardAnimation`: XP bar filling up, Badge unlock animation.
  - `ActionButtons`: "Retry", "Next Lesson".

## 3. State Management (Store)

We need a `EducationStore` to manage:

- `currentCurriculum`: The full JSON object loaded from API.
- `activeLesson`: ID of the lesson currently in progress.
- `lessonPhase`: 'THEORY' | 'PRACTICE' | 'SUMMARY'.
- `currentSlideIndex`: For theory phase.
- `currentQuestionIndex`: For practice phase.
- `sessionScore`: Number of correct answers.

## 4. API Integration

- **Load Curriculum**: `GET /api/education/curriculum/mathematics/3`
  - _Usage_: Call on `CurriculumView` mount. Store in `EducationStore`.
- **Start Lesson**: (Future Endpoint) `POST /api/education/lesson/start`
  - _Usage_: Initialize session, get initial AI greeting.
- **Submit Answer**: (Future Endpoint) `POST /api/education/lesson/submit`
  - _Usage_: Send student answer, get AI feedback and next step.

## 5. Design Aesthetics (Child-Friendly)

- **Colors**: Bright, warm colors (Blue/Orange/Green). Avoid stark black/white.
- **Typography**: Large, rounded fonts (e.g., 'Nunito', 'Quicksand').
- **UI Elements**: Large buttons, clear icons, generous whitespace.
- **Feedback**: Immediate visual feedback (shake on error, bounce on success).

## 6. Implementation Steps

1.  **Setup Store**: Create `useEducationStore`.
2.  **Build API Service**: `EducationService.ts` to fetch curriculum.
3.  **Create Components**: Build `LessonItem`, `TutorAvatar` (reuse existing), `DialogueBubble`.
4.  **Assemble Views**: Build `CurriculumView` first, then `LessonView`.

## 7. Backend Integration & Data Flow

### Backend Modifications

The following changes have been implemented in the backend to support this frontend:

1.  **New Module**: `backend/education/` containing `CurriculumManager`.
2.  **Data Storage**: `backend/curricula/` storing curriculum content in JSON format (e.g., `grade_3.json`).
3.  **API Endpoint**: Added `GET /api/education/curriculum/{discipline}/{grade}` to `main.py`.

### Data Transmission Protocols

#### A. REST API (Static Content)

**Use Case**: Loading curriculum structure, lesson metadata, student progress.

**Endpoint**: `GET /api/education/curriculum/{discipline}/{grade}`

**Example Request**:

```
GET /api/education/curriculum/mathematics/3
```

**Example Response**:

```json
{
  "curriculum_id": "us_math_grade_3",
  "discipline": "mathematics",
  "grade_level": 3,
  "title": "Grade 3 Mathematics",
  "chapters": [
    {
      "chapter_id": "multiplication_basics",
      "title": "Multiplication Basics",
      "description": "Master multiplication tables 2x through 10x",
      "lessons": [
        {
          "lesson_id": "mult_2x",
          "lesson_number": 1,
          "title": "The 2x Table",
          "difficulty": "beginner",
          "estimated_minutes": 15,
          "prerequisites": [],
          "theory": {
            "slides": [
              {
                "type": "introduction",
                "content": "Let's learn the 2x table! It's like counting by 2s.",
                "visual_aid": "number_line_2x.png"
              }
            ]
          },
          "practice": {
            "question_pool_id": "mult_2x_practice",
            "total_questions": 10,
            "passing_score": 7
          }
        }
      ]
    }
  ]
}
```

**Frontend Usage**:

```typescript
// In CurriculumView.vue
const educationStore = useEducationStore();
await educationStore.loadCurriculum("mathematics", 3);
// Store now has full curriculum structure for rendering
```

#### B. WebSocket (Interactive Lessons) - PLANNED

**Use Case**: Real-time AI tutoring with streaming audio and Live2D animations.

**Connection**: `ws://localhost:8000/ws/education`

**Message Flow**:

1. **Client → Server: Start Lesson**

```json
{
  "type": "start_lesson",
  "data": {
    "lesson_id": "mult_2x",
    "student_id": "student_123",
    "phase": "theory"
  }
}
```

2. **Server → Client: Tutor Greeting (Streamed)**

```json
{
  "type": "tutor_message",
  "data": {
    "text": "Hi Emma! Ready to master the 2x table?",
    "character_id": "aria",
    "audio_url": "/audio/aria_greeting_001.mp3",
    "expression": "happy",
    "duration_ms": 3200
  }
}
```

3. **Client → Server: Student Answer**

```json
{
  "type": "submit_answer",
  "data": {
    "question_id": "mult_2x_q1",
    "answer": "14",
    "time_taken_ms": 4500
  }
}
```

4. **Server → Client: AI Feedback (Streamed)**

```json
{
  "type": "feedback",
  "data": {
    "correct": true,
    "text": "Perfect! 2 × 7 = 14. You're getting this!",
    "character_id": "aria",
    "audio_url": "/audio/aria_praise_042.mp3",
    "expression": "excited",
    "reward": {
      "xp": 10,
      "animation": "confetti"
    }
  }
}
```

5. **Server → Client: Next Question**

```json
{
  "type": "question",
  "data": {
    "question_id": "mult_2x_q2",
    "text": "What is 2 × 9?",
    "type": "numeric_input",
    "hint_available": true
  }
}
```

**Frontend Implementation Pattern**:

```typescript
// In LessonView.vue
const ws = new WebSocket("ws://localhost:8000/ws/education");

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case "tutor_message":
      displayDialogue(message.data.text);
      playAudio(message.data.audio_url);
      setCharacterExpression(message.data.expression);
      break;
    case "feedback":
      showFeedback(message.data.correct);
      if (message.data.reward) {
        animateReward(message.data.reward);
      }
      break;
    case "question":
      renderQuestion(message.data);
      break;
  }
};

function submitAnswer(answer: string) {
  ws.send(
    JSON.stringify({
      type: "submit_answer",
      data: { answer, question_id: currentQuestion.id },
    })
  );
}
```

### Summary of Communication Patterns

| Feature                    | Protocol  | Reason                                  |
| -------------------------- | --------- | --------------------------------------- |
| Load curriculum structure  | REST API  | Static data, cacheable                  |
| Student progress/scores    | REST API  | CRUD operations on database             |
| Interactive lesson session | WebSocket | Real-time streaming (audio, feedback)   |
| Live2D character sync      | WebSocket | Requires low-latency expression updates |

### Next Backend Tasks

1. Implement `LessonOrchestrator` to manage lesson flow.
2. Create `/ws/education` WebSocket endpoint.
3. Integrate with existing TTS and Live2D systems.
