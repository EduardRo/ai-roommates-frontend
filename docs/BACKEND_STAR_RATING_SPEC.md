# Backend Specification: Star Rating Calculation System

## Overview

Implement a star rating system (0-5 stars) for lesson performance based on historical attempt data. The rating must consider both the average score of recent attempts and the total number of attempts, with specific caps to encourage consistent practice.

---

## Business Rules

### Star Calculation Logic

1. **Base Calculation:**

   - Stars are calculated from the **average of the last 10 attempts** (or fewer if less than 10 exist)
   - Formula: `stars = (average_score / 10) * 5`
   - Example: Average score of 8.0 → 4.0 stars

2. **Attempt-Based Caps:**

   - **< 10 attempts:** Maximum 3 stars (even if all attempts are perfect)
   - **10-19 attempts:** Maximum 4 stars
   - **≥ 20 attempts:** No cap, can achieve 5 stars

3. **Examples:**
   | Attempts | Avg Score | Calculated Stars | Capped Stars | Reason |
   |----------|-----------|------------------|--------------|--------|
   | 5 | 10.0 | 5.0 | **3.0** | < 10 attempts |
   | 10 | 10.0 | 5.0 | **4.0** | < 20 attempts |
   | 15 | 8.5 | 4.25 | **4.0** | < 20 attempts |
   | 20 | 10.0 | 5.0 | **5.0** | ≥ 20 attempts, no cap |
   | 25 | 9.0 | 4.5 | **4.5** | ≥ 20 attempts, no cap |

---

## Database Requirements

### Table: `student_progress`

**Current Schema (verify):**

```sql
CREATE TABLE student_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  lesson_id VARCHAR(50) NOT NULL,
  score INT NOT NULL,  -- Score 0-10 or 0-100?
  time_spent_minutes INT,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- ... other fields
);
```

**Required Behavior:**

- **Multiple rows per student+lesson** (do NOT overwrite, INSERT new row each time)
- Each lesson completion creates a new `student_progress` record
- Order by `completed_at DESC` to get most recent attempts

**Verify:**

- Does the current implementation INSERT or UPDATE?
- If it UPDATEs, change to INSERT to preserve attempt history

---

## API Changes

### Endpoint: `GET /api/students/{student_id}/progress`

**Current Response (assumed):**

```json
{
  "lessons": [
    {
      "lesson_id": "lesson_1_1_1",
      "score": 85,
      "completed_at": "2025-11-29 10:00:00"
    }
  ]
}
```

**New Response (required):**

```json
{
  "lessons": [
    {
      "lesson_id": "lesson_1_1_1",
      "total_attempts": 15,
      "average_score_last_10": 8.5,
      "latest_score": 9,
      "stars": 4.0,
      "completed_at": "2025-11-29 10:00:00",
      "attempt_history": [
        { "score": 9, "completed_at": "2025-11-29 10:00:00" },
        { "score": 8, "completed_at": "2025-11-29 09:00:00" }
        // ... up to 10 most recent
      ]
    }
  ]
}
```

**New Fields:**

- `total_attempts` (INT) - Total number of times this lesson was completed
- `average_score_last_10` (DECIMAL) - Average of last 10 attempts
- `stars` (DECIMAL) - Calculated star rating (0.0 to 5.0)
- `attempt_history` (ARRAY) - Last 10 attempts with scores and timestamps

---

## Implementation Steps

### 1. Update Progress Saving Logic

**File:** `progress_manager.py` (or equivalent)

**Current (assumed):**

```python
# WRONG: This overwrites previous attempts
def save_progress(student_id, lesson_id, score):
    db.execute("""
        UPDATE student_progress
        SET score = ?, completed_at = NOW()
        WHERE student_id = ? AND lesson_id = ?
    """, (score, student_id, lesson_id))
```

**Required:**

```python
# CORRECT: This preserves attempt history
def save_progress(student_id, lesson_id, score, time_spent_minutes):
    db.execute("""
        INSERT INTO student_progress
        (student_id, lesson_id, score, time_spent_minutes, completed_at)
        VALUES (?, ?, ?, ?, NOW())
    """, (student_id, lesson_id, score, time_spent_minutes))
```

---

### 2. Implement Star Calculation Function

**File:** `progress_manager.py` or `utils/calculations.py`

```python
def calculate_stars(student_id, lesson_id):
    """
    Calculate star rating for a lesson based on attempt history.

    Returns:
        dict: {
            'total_attempts': int,
            'average_score_last_10': float,
            'stars': float
        }
    """
    # Get all attempts for this lesson, ordered by most recent
    attempts = db.execute("""
        SELECT score, completed_at
        FROM student_progress
        WHERE student_id = ? AND lesson_id = ?
        ORDER BY completed_at DESC
    """, (student_id, lesson_id)).fetchall()

    total_attempts = len(attempts)

    if total_attempts == 0:
        return {
            'total_attempts': 0,
            'average_score_last_10': 0,
            'stars': 0
        }

    # Get last 10 attempts (or fewer if less than 10 exist)
    last_10 = attempts[:min(10, total_attempts)]
    average_score = sum(a['score'] for a in last_10) / len(last_10)

    # Calculate base stars (0-10 score → 0-5 stars)
    stars = (average_score / 10) * 5

    # Apply caps based on total attempts
    if total_attempts < 10:
        stars = min(3.0, stars)
    elif total_attempts < 20:
        stars = min(4.0, stars)
    # else: no cap, can get full 5 stars

    # Round to 1 decimal place
    stars = round(stars, 1)

    return {
        'total_attempts': total_attempts,
        'average_score_last_10': round(average_score, 1),
        'stars': stars,
        'attempt_history': [
            {'score': a['score'], 'completed_at': a['completed_at'].isoformat()}
            for a in last_10
        ]
    }
```

---

### 3. Update Progress Endpoint

**File:** `routes/students.py` (or equivalent)

```python
@router.get("/students/{student_id}/progress")
async def get_student_progress(student_id: int):
    """Get student's lesson progress with star ratings."""

    # Get all unique lessons the student has attempted
    lessons = db.execute("""
        SELECT DISTINCT lesson_id, MAX(completed_at) as latest_completion
        FROM student_progress
        WHERE student_id = ?
        GROUP BY lesson_id
        ORDER BY latest_completion DESC
    """, (student_id,)).fetchall()

    progress_data = []
    for lesson in lessons:
        lesson_id = lesson['lesson_id']

        # Calculate stars and get stats
        stats = calculate_stars(student_id, lesson_id)

        # Get latest score
        latest = db.execute("""
            SELECT score, completed_at
            FROM student_progress
            WHERE student_id = ? AND lesson_id = ?
            ORDER BY completed_at DESC
            LIMIT 1
        """, (student_id, lesson_id)).fetchone()

        progress_data.append({
            'lesson_id': lesson_id,
            'total_attempts': stats['total_attempts'],
            'average_score_last_10': stats['average_score_last_10'],
            'latest_score': latest['score'],
            'stars': stats['stars'],
            'completed_at': latest['completed_at'].isoformat(),
            'attempt_history': stats['attempt_history']
        })

    return {'lessons': progress_data}
```

---

## Testing Requirements

### Test Case 1: First Attempt

```python
# Student completes lesson for the first time with score 10
save_progress(student_id=1, lesson_id='lesson_1', score=10)

result = calculate_stars(student_id=1, lesson_id='lesson_1')
assert result['total_attempts'] == 1
assert result['average_score_last_10'] == 10.0
assert result['stars'] == 3.0  # Capped at 3 because < 10 attempts
```

### Test Case 2: 5 Perfect Attempts

```python
# Student completes lesson 5 times, all perfect scores
for i in range(5):
    save_progress(student_id=1, lesson_id='lesson_1', score=10)

result = calculate_stars(student_id=1, lesson_id='lesson_1')
assert result['total_attempts'] == 5
assert result['average_score_last_10'] == 10.0
assert result['stars'] == 3.0  # Still capped at 3
```

### Test Case 3: 10 Perfect Attempts

```python
# Student completes lesson 10 times, all perfect
for i in range(10):
    save_progress(student_id=1, lesson_id='lesson_1', score=10)

result = calculate_stars(student_id=1, lesson_id='lesson_1')
assert result['total_attempts'] == 10
assert result['average_score_last_10'] == 10.0
assert result['stars'] == 4.0  # Capped at 4 because < 20 attempts
```

### Test Case 4: 20 Perfect Attempts

```python
# Student completes lesson 20 times, all perfect
for i in range(20):
    save_progress(student_id=1, lesson_id='lesson_1', score=10)

result = calculate_stars(student_id=1, lesson_id='lesson_1')
assert result['total_attempts'] == 20
assert result['average_score_last_10'] == 10.0
assert result['stars'] == 5.0  # No cap, full 5 stars!
```

### Test Case 5: Mixed Scores

```python
# Student has 15 attempts with varying scores
scores = [10, 9, 8, 10, 7, 9, 10, 8, 9, 10, 6, 8, 9, 10, 7]
for score in scores:
    save_progress(student_id=1, lesson_id='lesson_1', score=score)

result = calculate_stars(student_id=1, lesson_id='lesson_1')
assert result['total_attempts'] == 15
# Last 10 scores: [10, 9, 8, 10, 7, 9, 10, 8, 9, 10]
# Average: 9.0
assert result['average_score_last_10'] == 9.0
assert result['stars'] == 4.0  # Capped at 4 (< 20 attempts)
```

---

## Migration Considerations

### If Current System Overwrites Scores:

**Option 1: Preserve Existing Data**

```sql
-- Rename old table
ALTER TABLE student_progress RENAME TO student_progress_old;

-- Create new table with same schema
CREATE TABLE student_progress LIKE student_progress_old;

-- Copy old data (each student+lesson becomes 1 attempt)
INSERT INTO student_progress
SELECT * FROM student_progress_old;
```

**Option 2: Fresh Start**

- Keep old table as backup
- Start new attempt tracking from now
- Historical data shows 1 attempt per lesson

---

## Summary

**Changes Required:**

1. ✅ Change `student_progress` saving from UPDATE to INSERT
2. ✅ Implement `calculate_stars()` function with attempt caps
3. ✅ Update progress endpoint to return new fields
4. ✅ Add unit tests for star calculation logic

**Expected Behavior:**

- Each lesson completion creates a new database row
- Stars calculated from average of last 10 attempts
- Caps applied based on total attempt count
- Frontend receives pre-calculated stars

**Estimated Effort:** 2-3 hours
