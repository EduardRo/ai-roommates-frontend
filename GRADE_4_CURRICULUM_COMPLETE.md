# Grade 4 Mathematics Curriculum - Complete Specification

## AI-SYNTIA-V5 Educational Platform

**Version**: 1.0  
**Date**: November 25, 2025  
**Target Audience**: Backend & Frontend Teams  
**Subject**: Mathematics (US Common Core Standards)  
**Grade Level**: 4 (Age 9-10)

---

# Table of Contents

1. [Overview](#overview)
2. [Frontend User Experience](#frontend-user-experience)
3. [Complete JSON Structure](#complete-json-structure)
4. [Backend Implementation Guide](#backend-implementation-guide)
5. [Database Schema](#database-schema)
6. [API Specifications](#api-specifications)
7. [Star Rating System](#star-rating-system)
8. [Lesson Unlocking Logic](#lesson-unlocking-logic)
9. [Integration Flow](#integration-flow)

---

# Overview

## Curriculum Scope

- **Total Units**: 8
- **Total Chapters**: 25+
- **Total Lessons**: ~160
- **Instructional Days**: 180 (36 weeks)
- **Lesson Duration**: 50 minutes each
- **Assessment**: 0-10 point scale (displayed as 0-5 stars)

## Content Structure

```
Grade 4 Mathematics
├── Unit 1: Place Value and Multi-Digit Numbers (4 weeks, 20 lessons)
├── Unit 2: Addition and Subtraction (3 weeks, 15 lessons)
├── Unit 3: Multiplication Concepts (5 weeks, 25 lessons)
├── Unit 4: Division Concepts (4 weeks, 20 lessons)
├── Unit 5: Fractions (6 weeks, 30 lessons)
├── Unit 6: Measurement and Data (4 weeks, 20 lessons)
├── Unit 7: Geometry (4 weeks, 20 lessons)
└── Unit 8: Problem Solving and Patterns (2 weeks, 10 lessons)
```

---

# Frontend User Experience

## Student Dashboard - Lesson Selection Menu

### Visual Layout

Students see a menu displaying ALL lessons for their grade level with:

**Left Side**: ⭐⭐⭐⭐⭐ (Star rating 0-5 stars)  
**Right Side**: Lesson Name  
**Status Icons**:

- 🔒 Locked (prerequisites not met)
- ✅ Completed
- 💫 New/Available
- 🏆 Perfect Score (5 stars)

### Example Display

```
📖 Unit 1: Place Value and Multi-Digit Numbers

Chapter 1.1: Understanding Place Value
┌────────────────────────────────────────────┐
│ ⭐⭐⭐⭐⭐  Place Value to Millions      ✅ │
│ ⭐⭐⭐⭐☆  Expanded Form                 ✅ │
│ ☆☆☆☆☆  Comparing Numbers              💫 │
└────────────────────────────────────────────┘

Chapter 1.2: Rounding Numbers
┌────────────────────────────────────────────┐
│ ☆☆☆☆☆  Rounding to 10 and 100         🔒 │
│ ☆☆☆☆☆  Rounding to 1,000              🔒 │
└────────────────────────────────────────────┘
```

### Interaction Flow

1. Student clicks on an **unlocked** lesson
2. Frontend navigates to `/lesson/{lesson_id}`
3. Student enters interactive session with AI character
4. **Phase 1**: AI explains the concept (Theory)
5. **Phase 2**: Student practices problems
6. Score is calculated (0-10 points)
7. Stars are displayed (0-5 stars)
8. Next lesson unlocks if score ≥ 6

---

# Complete JSON Structure

## Full Example: Grade 4 Mathematics Curriculum

```json
{
  "curriculum_id": "us_math_grade_4",
  "discipline": "mathematics",
  "grade_level": 4,
  "education_system": "us_common_core",
  "language": "en",
  "metadata": {
    "display_name": "Grade 4 Mathematics",
    "description": "Fourth grade math covering place value, operations, fractions, geometry, and measurement",
    "age_range": [9, 10],
    "total_instructional_days": 180,
    "total_weeks": 36,
    "difficulty": "intermediate"
  },
  "units": [
    {
      "unit_id": "unit_1_place_value",
      "unit_number": 1,
      "title": "Place Value and Multi-Digit Numbers",
      "description": "Understanding large numbers up to millions",
      "duration_weeks": 4,
      "estimated_lessons": 20,
      "chapters": [
        {
          "chapter_id": "ch_1_1_understanding_place_value",
          "chapter_number": 1,
          "title": "Understanding Place Value",
          "description": "Master place value to millions and number forms",
          "estimated_lessons": 3,
          "lessons": [
            {
              "lesson_id": "lesson_1_1_1",
              "lesson_number": 1,
              "title": "Place Value to Millions",
              "learning_objectives": [
                "Understand that each place represents 10 times the value to its right",
                "Read and write numbers to 1,000,000",
                "Identify the value of digits in large numbers"
              ],
              "estimated_duration_minutes": 50,
              "difficulty": "beginner",
              "prerequisites": [],
              "phase_1_theory": {
                "explanation_content": "Each digit in a number has a specific value based on its position. The place value system uses base 10, meaning each place is 10 times larger than the one to its right.",
                "comprehension_questions": [
                  {
                    "question": "In the number 456,789, what is the value of the digit 5?",
                    "options": ["5", "50", "50,000", "500,000"],
                    "correct_index": 2
                  }
                ],
                "example_exercises": [
                  {
                    "problem": "What is the value of 7 in 372,841?",
                    "solution": "70,000",
                    "worked_solution": "The 7 is in the ten-thousands place, so it represents 7 × 10,000 = 70,000"
                  }
                ]
              },
              "phase_2_practice": {
                "question_pool_id": "place_value_millions",
                "total_questions": 10,
                "passing_score": 6
              }
            },
            {
              "lesson_id": "lesson_1_1_2",
              "lesson_number": 2,
              "title": "Expanded Form and Standard Form",
              "learning_objectives": [
                "Write numbers in expanded form",
                "Convert between standard and expanded form",
                "Use word form for large numbers"
              ],
              "estimated_duration_minutes": 50,
              "difficulty": "beginner",
              "prerequisites": ["lesson_1_1_1"],
              "phase_1_theory": {
                "explanation_content": "Numbers can be written in different forms: standard form (45,678), expanded form (40,000 + 5,000 + 600 + 70 + 8), and word form (forty-five thousand, six hundred seventy-eight).",
                "comprehension_questions": [
                  {
                    "question": "What is 60,000 + 3,000 + 200 + 40 + 5 in standard form?",
                    "options": ["60,345", "63,245", "6,345", "603,245"],
                    "correct_index": 1
                  }
                ],
                "example_exercises": []
              },
              "phase_2_practice": {
                "question_pool_id": "expanded_standard_form",
                "total_questions": 10,
                "passing_score": 6
              }
            }
          ]
        },
        {
          "chapter_id": "ch_1_2_rounding",
          "chapter_number": 2,
          "title": "Rounding Numbers",
          "description": "Round large numbers for estimation",
          "estimated_lessons": 2,
          "lessons": [
            {
              "lesson_id": "lesson_1_2_1",
              "lesson_number": 1,
              "title": "Rounding to Nearest 10 and 100",
              "learning_objectives": [
                "Apply rounding rules",
                "Round numbers to nearest ten and hundred"
              ],
              "estimated_duration_minutes": 50,
              "difficulty": "beginner",
              "prerequisites": ["lesson_1_1_3"],
              "phase_1_theory": {
                "explanation_content": "When rounding, look at the digit to the right of the place you're rounding to. If it's 5 or greater, round up.",
                "comprehension_questions": [],
                "example_exercises": []
              },
              "phase_2_practice": {
                "question_pool_id": "rounding_10_100",
                "total_questions": 10,
                "passing_score": 6
              }
            }
          ]
        }
      ]
    },
    {
      "unit_id": "unit_2_addition_subtraction",
      "unit_number": 2,
      "title": "Addition and Subtraction",
      "description": "Multi-digit addition and subtraction fluency",
      "duration_weeks": 3,
      "estimated_lessons": 15,
      "chapters": [
        {
          "chapter_id": "ch_2_1_addition",
          "chapter_number": 1,
          "title": "Multi-Digit Addition",
          "estimated_lessons": 2,
          "lessons": [
            {
              "lesson_id": "lesson_2_1_1",
              "lesson_number": 1,
              "title": "Adding with Regrouping",
              "learning_objectives": [
                "Add 4-digit numbers with regrouping",
                "Use the standard algorithm"
              ],
              "estimated_duration_minutes": 50,
              "difficulty": "intermediate",
              "prerequisites": [],
              "phase_1_theory": {
                "explanation_content": "When the sum of digits in a column is 10 or more, we regroup by carrying.",
                "comprehension_questions": [],
                "example_exercises": []
              },
              "phase_2_practice": {
                "question_pool_id": "addition_regrouping",
                "total_questions": 10,
                "passing_score": 6
              }
            }
          ]
        }
      ]
    }
  ],
  "performance_tracking": {
    "star_rating_scale": {
      "0_stars": { "min_score": 0, "max_score": 2, "description": "Needs significant improvement" },
      "1_star": { "min_score": 2, "max_score": 4, "description": "Beginning understanding" },
      "2_stars": { "min_score": 4, "max_score": 6, "description": "Developing skills" },
      "3_stars": { "min_score": 6, "max_score": 8, "description": "Proficient" },
      "4_stars": { "min_score": 8, "max_score": 9, "description": "Advanced" },
      "5_stars": { "min_score": 9, "max_score": 10, "description": "Mastered" }
    },
    "unlocking_rules": {
      "minimum_passing_score": 6,
      "minimum_stars_to_unlock": 3,
      "sequential_unlock": true,
      "allow_retakes": true
    }
  }
}
```

---

# Backend Implementation Guide

## Data Structure Hierarchy

```
Curriculum
  └── Units (8 units)
       └── Chapters (3-5 per unit)
            └── Lessons (2-10 per chapter)
                 ├── Phase 1: Theory (AI explains)
                 └── Phase 2: Practice (10 questions)
```

## Lesson Object Fields

### Core Fields

- `lesson_id` (string): Unique identifier
- `lesson_number` (int): Order within chapter
- `title` (string): Display name
- `learning_objectives` (array): What students will learn
- `estimated_duration_minutes` (int): Expected time
- `difficulty` (string): "beginner", "intermediate", or "advanced"
- `prerequisites` (array): lesson_ids that must be completed first

### Phase 1: Theory

- `explanation_content` (string): Concept explanation for AI
- `comprehension_questions` (array): Multiple choice questions
  - `question` (string)
  - `options` (array of strings)
  - `correct_index` (int, 0-based)
- `example_exercises` (array): Worked examples
  - `problem` (string)
  - `solution` (string)
  - `worked_solution` (string)

### Phase 2: Practice

- `question_pool_id` (string): Reference to question bank
- `total_questions` (int): Always 10
- `passing_score` (int): Always 6

---

# Database Schema

## Table: `curriculums`

```sql
CREATE TABLE curriculums (
  id VARCHAR(50) PRIMARY KEY,
  discipline VARCHAR(50),
  grade_level INT,
  education_system VARCHAR(50),
  language VARCHAR(10),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Table: `units`

```sql
CREATE TABLE units (
  id VARCHAR(50) PRIMARY KEY,
  curriculum_id VARCHAR(50) REFERENCES curriculums(id),
  unit_number INT,
  title VARCHAR(200),
  description TEXT,
  duration_weeks INT,
  estimated_lessons INT
);
```

## Table: `chapters`

```sql
CREATE TABLE chapters (
  id VARCHAR(50) PRIMARY KEY,
  unit_id VARCHAR(50) REFERENCES units(id),
  chapter_number INT,
  title VARCHAR(200),
  description TEXT,
  estimated_lessons INT
);
```

## Table: `lessons`

```sql
CREATE TABLE lessons (
  id VARCHAR(50) PRIMARY KEY,
  chapter_id VARCHAR(50) REFERENCES chapters(id),
  lesson_number INT,
  title VARCHAR(200),
  learning_objectives TEXT[],
  estimated_duration_minutes INT,
  difficulty VARCHAR(20),
  prerequisites VARCHAR(50)[],
  phase_1_content JSONB,
  phase_2_content JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Table: `student_lesson_progress`

```sql
CREATE TABLE student_lesson_progress (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50),
  lesson_id VARCHAR(50) REFERENCES lessons(id),
  score DECIMAL(3,1),  -- e.g., 7.5
  stars DECIMAL(3,2),  -- e.g., 3.75
  completed_at TIMESTAMP,
  time_spent_minutes INT,
  attempts INT DEFAULT 1,
  phase_1_score INT,
  phase_2_score INT,
  UNIQUE(student_id, lesson_id, completed_at)
);

CREATE INDEX idx_student_progress ON student_lesson_progress(student_id, lesson_id);
```

---

# API Specifications

## 1. Get Complete Curriculum

### Endpoint

```
GET /api/education/curriculum/{discipline}/{grade_level}
```

### Example Request

```
GET /api/education/curriculum/mathematics/4
```

### Response (200 OK)

```json
{
  "curriculum_id": "us_math_grade_4",
  "discipline": "mathematics",
  "grade_level": 4,
  "units": [...],
  "performance_tracking": {...}
}
```

---

## 2. Get Specific Lesson

### Endpoint

```
GET /api/education/lesson/{lesson_id}
```

### Example Request

```
GET /api/education/lesson/lesson_1_1_1
```

### Response (200 OK)

```json
{
  "lesson_id": "lesson_1_1_1",
  "title": "Place Value to Millions",
  "learning_objectives": [...],
  "phase_1_theory": {...},
  "phase_2_practice": {...}
}
```

---

## 3. Get Student Progress

### Endpoint

```
GET /api/students/{student_id}/progress/{curriculum_id}
```

### Example Request

```
GET /api/students/student_123/progress/us_math_grade_4
```

### Response (200 OK)

```json
{
  "student_id": "student_123",
  "curriculum_id": "us_math_grade_4",
  "lessons_completed": [
    {
      "lesson_id": "lesson_1_1_1",
      "score": 8,
      "stars": 4.0,
      "completed_at": "2025-11-20T14:30:00Z",
      "attempts": 1
    },
    {
      "lesson_id": "lesson_1_1_2",
      "score": 7.5,
      "stars": 3.75,
      "completed_at": "2025-11-21T10:15:00Z",
      "attempts": 2
    }
  ],
  "unlocked_lessons": ["lesson_1_1_1", "lesson_1_1_2", "lesson_1_1_3"]
}
```

---

## 4. Save Lesson Progress

### Endpoint

```
POST /api/students/{student_id}/progress/{lesson_id}
```

### Example Request

```
POST /api/students/student_123/progress/lesson_1_1_1
Content-Type: application/json

{
  "score": 8,
  "completed_at": "2025-11-20T14:30:00Z",
  "time_spent_minutes": 45,
  "phase_1_score": 10,
  "phase_2_score": 8
}
```

### Response (200 OK)

```json
{
  "success": true,
  "lesson_id": "lesson_1_1_1",
  "score": 8,
  "stars": 4.0,
  "next_lesson_unlocked": "lesson_1_1_2",
  "message": "Great job! You earned 4 stars!"
}
```

---

## 5. Check Unlock Status

### Endpoint

```
GET /api/students/{student_id}/lessons/{lesson_id}/unlock-status
```

### Example Request

```
GET /api/students/student_123/lessons/lesson_1_1_3/unlock-status
```

### Response (200 OK)

```json
{
  "lesson_id": "lesson_1_1_3",
  "is_unlocked": false,
  "reason": "Must complete lesson_1_1_2 with score 6 or higher",
  "prerequisites_met": false,
  "missing_prerequisites": ["lesson_1_1_2"],
  "current_score_for_prerequisite": 4
}
```

---

# Star Rating System

## Score to Stars Conversion

### Formula

```javascript
stars = score / 2
```

### Rating Table

| Score | Stars   | Description                   | Visual |
| ----- | ------- | ----------------------------- | ------ |
| 0-2   | 0 stars | Needs significant improvement | ☆☆☆☆☆  |
| 2-4   | 1 star  | Beginning understanding       | ★☆☆☆☆  |
| 4-6   | 2 stars | Developing skills             | ★★☆☆☆  |
| 6-8   | 3 stars | Proficient                    | ★★★☆☆  |
| 8-9   | 4 stars | Advanced                      | ★★★★☆  |
| 9-10  | 5 stars | Mastered                      | ★★★★★  |

### Half-Stars

Decimal scores create partial stars:

- Score 7.5 → 3.75 stars → ★★★◐☆
- Score 9.5 → 4.75 stars → ★★★★◐

### Implementation Example

```javascript
// Backend calculation
function calculateStars(score) {
  return Math.round((score / 2) * 4) / 4 // Rounds to nearest 0.25
}

// Examples
calculateStars(8) // → 4.0
calculateStars(7.5) // → 3.75
calculateStars(10) // → 5.0
```

---

# Lesson Unlocking Logic

## Rules

### 1. Sequential Unlocking

- Lessons within a chapter unlock in order
- Lesson 1 → Lesson 2 → Lesson 3

### 2. Minimum Passing Score

- **Required**: 6/10 points (3 stars)
- Below 6 → Next lesson stays locked
- 6 or above → Next lesson unlocks

### 3. Prerequisites

Some lessons require completion of other lessons:

```json
"prerequisites": ["lesson_3_2_1"]
```

### 4. Initial State

- Only `lesson_1_1_1` is unlocked initially
- All other lessons are locked

## Example Flow

```
Student Status: New
├── lesson_1_1_1: UNLOCKED ✓
├── lesson_1_1_2: LOCKED 🔒
└── lesson_1_1_3: LOCKED 🔒

Student completes lesson_1_1_1 with score 7
├── lesson_1_1_1: COMPLETED (3.5 stars) ✅
├── lesson_1_1_2: UNLOCKED ✓
└── lesson_1_1_3: LOCKED 🔒

Student completes lesson_1_1_2 with score 4
├── lesson_1_1_1: COMPLETED (3.5 stars) ✅
├── lesson_1_1_2: COMPLETED (2 stars) ⚠️
└── lesson_1_1_3: LOCKED 🔒 (need 6+ on lesson_1_1_2)

Student retakes lesson_1_1_2, scores 8
├── lesson_1_1_1: COMPLETED (3.5 stars) ✅
├── lesson_1_1_2: COMPLETED (4 stars) ✅
└── lesson_1_1_3: UNLOCKED ✓
```

## Backend Logic Pseudocode

```python
def can_unlock_lesson(student_id, lesson_id):
    lesson = get_lesson(lesson_id)

    # Check all prerequisites
    for prereq_lesson_id in lesson.prerequisites:
        progress = get_student_progress(student_id, prereq_lesson_id)

        if not progress:
            return False, f"Must complete {prereq_lesson_id}"

        if progress.score < 6:
            return False, f"Must score 6+ on {prereq_lesson_id}"

    return True, "Lesson unlocked"
```

---

# Integration Flow

## Complete User Journey

### 1. Student Login

```
Frontend → GET /api/students/{student_id}/profile
Backend  → Returns: { student_id, grade_level: 4, ... }
```

### 2. Load Curriculum

```
Frontend → GET /api/education/curriculum/mathematics/4
Backend  → Returns: Complete curriculum JSON
Frontend → Stores curriculum in Vuex/Pinia store
```

### 3. Load Progress

```
Frontend → GET /api/students/{student_id}/progress/us_math_grade_4
Backend  → Returns: Array of completed lessons + unlocked lessons
Frontend → Merges progress with curriculum data
```

### 4. Display Lesson Menu

```
Frontend renders:
- All lessons from curriculum
- Stars from progress data
- Lock icons for lessons not in unlocked_lessons array
- Green highlight for available lessons
```

### 5. Student Clicks Lesson

```
Frontend checks: Is lesson unlocked?

If NO:
  Show tooltip: "Complete previous lesson with 3+ stars"

If YES:
  Frontend → Navigate to /lesson/{lesson_id}
  Frontend → GET /api/education/lesson/{lesson_id}
  Backend  → Returns lesson details with both phases
  Frontend → Start AI character interaction
```

### 6. Phase 1: Theory

```
AI Character:
- Presents explanation_content
- Asks comprehension_questions
- Shows example_exercises
- Adapts based on student responses

Frontend tracks:
- Questions answered correctly
- Time spent
```

### 7. Phase 2: Practice

```
Frontend → Get 10 questions from question_pool_id
Student → Solves problems with AI guidance
AI → Provides hints, explanations, encouragement

Frontend calculates:
- Correct answers (0-10)
- Total score
```

### 8. Complete Lesson

```
Frontend → POST /api/students/{student_id}/progress/{lesson_id}
           Body: { score: 8, time_spent_minutes: 45, ... }

Backend:
1. Saves progress to database
2. Calculates stars (8 / 2 = 4.0)
3. Checks if next lesson should unlock
4. Returns success + next_lesson_unlocked

Frontend:
1. Shows celebration animation
2. Displays stars earned
3. Updates lesson menu with new progress
4. Shows "Next Lesson" button if unlocked
```

---

# Two-Phase Learning System

## Phase 1: Theory & Comprehension

### Purpose

AI character explains the mathematical concept to the student.

### Duration

~20-25 minutes

### Content Structure

```json
"phase_1_theory": {
  "explanation_content": "Concept explanation text that AI will present",
  "comprehension_questions": [
    {
      "question": "Question to check understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 2
    }
  ],
  "example_exercises": [
    {
      "problem": "Sample problem",
      "solution": "Answer",
      "worked_solution": "Step-by-step explanation"
    }
  ]
}
```

### Student Experience

1. AI character greets student and introduces topic
2. AI presents `explanation_content` in engaging way
3. AI asks `comprehension_questions` to check understanding
4. AI shows `example_exercises` with worked solutions
5. Student can ask questions about the concept
6. AI adapts explanation based on student comprehension

### Scoring

Comprehension questions contribute to overall score but Phase 2 is the main assessment.

---

## Phase 2: Practice & Assessment

### Purpose

Student independently solves problems to demonstrate mastery.

### Duration

~25-30 minutes

### Content Structure

```json
"phase_2_practice": {
  "question_pool_id": "place_value_millions",
  "total_questions": 10,
  "passing_score": 6
}
```

### Student Experience

1. AI presents 10 practice problems from the question pool
2. Student solves each problem
3. AI provides:
   - Immediate feedback (correct/incorrect)
   - Hints if student is stuck
   - Explanations for wrong answers
   - Encouragement throughout
4. Final score is calculated: correct/10

### Scoring

- Each correct answer: 1 point
- Total possible: 10 points
- Passing: 6+ points (3+ stars)

---

# Question Pool Implementation

## Structure

Each `question_pool_id` references a collection of problems stored separately.

### Example Question Pool: `place_value_millions`

```json
{
  "pool_id": "place_value_millions",
  "topic": "Place Value to Millions",
  "difficulty": "beginner",
  "questions": [
    {
      "question_id": "pv_mil_001",
      "question_text": "What is the value of the digit 5 in 456,789?",
      "question_type": "multiple_choice",
      "options": ["5", "50", "50,000", "500,000"],
      "correct_answer_index": 2,
      "explanation": "The 5 is in the ten-thousands place, so it equals 50,000"
    },
    {
      "question_id": "pv_mil_002",
      "question_text": "Write 700,000 + 30,000 + 4,000 + 200 + 10 + 5 in standard form",
      "question_type": "short_answer",
      "correct_answer": "734,215",
      "explanation": "Combine all place values to get 734,215"
    }
  ]
}
```

## Backend Requirements

1. Store question pools in database or JSON files
2. When Phase 2 starts, randomly select 10 questions from pool
3. Ensure variety (don't repeat questions in same session)
4. Track which questions student got right/wrong for analytics

---

# Full Curriculum Content Summary

## Unit 1: Place Value and Multi-Digit Numbers (4 weeks)

- Chapter 1.1: Understanding Place Value (3 lessons)
- Chapter 1.2: Rounding Numbers (2 lessons)

## Unit 2: Addition and Subtraction (3 weeks)

- Chapter 2.1: Multi-Digit Addition (2 lessons)
- Chapter 2.2: Multi-Digit Subtraction (2 lessons)

## Unit 3: Multiplication Concepts (5 weeks)

- Chapter 3.1: Multiplication Foundations (2 lessons)
- Chapter 3.2: Multiplying by 1-Digit Numbers (3 lessons)
- Chapter 3.3: Multiplying 2-Digit Numbers (2 lessons)
- Chapter 3.4: Factors and Multiples (3 lessons)

## Unit 4: Division Concepts (4 weeks)

- Chapter 4.1: Division Foundations (2 lessons)
- Chapter 4.2: Dividing Multi-Digit Numbers (3 lessons)

## Unit 5: Fractions (6 weeks)

- Chapter 5.1: Understanding Fractions (2 lessons)
- Chapter 5.2: Equivalent Fractions (2 lessons)
- Chapter 5.3: Comparing and Ordering Fractions (2 lessons)
- Chapter 5.4: Adding and Subtracting Fractions (3 lessons)
- Chapter 5.5: Multiplying Fractions by Whole Numbers (1 lesson)
- Chapter 5.6: Decimals and Fractions (3 lessons)

## Unit 6: Measurement and Data (4 weeks)

- Chapter 6.1: Measurement Conversions (5 lessons)
- Chapter 6.2: Perimeter and Area (3 lessons)
- Chapter 6.3: Data and Graphs (2 lessons)

## Unit 7: Geometry (4 weeks)

- Chapter 7.1: Points, Lines, and Angles (5 lessons)
- Chapter 7.2: Two-Dimensional Shapes (3 lessons)

## Unit 8: Problem Solving and Patterns (2 weeks)

- Chapter 8.1: Multi-Step Word Problems (2 lessons)
- Chapter 8.2: Patterns and Functions (2 lessons)

---

# Implementation Checklist

## Backend Tasks

- [ ] Create database tables (curriculums, units, chapters, lessons, student_lesson_progress)
- [ ] Populate database with Grade 4 curriculum JSON
- [ ] Implement GET `/api/education/curriculum/{discipline}/{grade_level}`
- [ ] Implement GET `/api/education/lesson/{lesson_id}`
- [ ] Implement GET `/api/students/{student_id}/progress/{curriculum_id}`
- [ ] Implement POST `/api/students/{student_id}/progress/{lesson_id}`
- [ ] Implement GET `/api/students/{student_id}/lessons/{lesson_id}/unlock-status`
- [ ] Build star rating calculation logic (score / 2)
- [ ] Build lesson unlocking logic with prerequisites
- [ ] Create question pools for each `question_pool_id`
- [ ] Test all endpoints with sample data
- [ ] Document API for frontend team

## Frontend Tasks

- [ ] Create Lesson Menu component
- [ ] Create Star Rating display component
- [ ] Implement lesson unlock/lock UI
- [ ] Build Lesson View page
- [ ] Integrate with AI character for Phase 1
- [ ] Build practice problem interface for Phase 2
- [ ] Implement progress tracking
- [ ] Add celebration animations for completed lessons
- [ ] Test with various student progress scenarios
- [ ] Handle edge cases (retakes, perfect scores, etc.)

---

# Contact & Support

**Questions?** Reach out to the development team!

**Frontend Team**: Handles UI/UX, lesson display, star ratings  
**Backend Team**: Handles API, database, unlocking logic

**Version**: 1.0  
**Last Updated**: November 25, 2025

---

**End of Document** ✅
