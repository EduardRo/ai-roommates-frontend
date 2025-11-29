# Metrics System Analysis & Roadmap

## 📊 Current Status Overview

| Metric Category | Status          | Data Source            | Used By AI? | Notes                                                                 |
| --------------- | --------------- | ---------------------- | ----------- | --------------------------------------------------------------------- |
| **Performance** | ✅ **Active**   | `student_progress`     | Yes         | Tracks scores, completion, trends. Fixed in recent update.            |
| **Retention**   | ✅ **Active**   | `retention_tracking`   | Yes         | Tracks mastery and spaced repetition needs.                           |
| **Behavioral**  | ❌ **Inactive** | `behavioral_analytics` | No (Empty)  | Table exists but is **never populated**.                              |
| **Time/Usage**  | ❌ **Inactive** | `daily_usage`          | No (Empty)  | Table exists but is **never populated**.                              |
| **Session**     | ⚠️ **Partial**  | `sessions`             | Partial     | Session records exist but may lack start/end times for duration calc. |

---

## 🔍 Detailed Analysis

### 1. Performance Metrics (Working)

- **What is saved:** Lesson completion, scores, attempts, timestamps.
- **When:** Immediately upon lesson completion via `ProgressManager.save_progress()`.
- **AI Usage:**
  - `avg_score`: Determines if student is struggling.
  - `trend`: "Improving" vs "Declining" (calculated from last 3 scores).
  - `strengths/weaknesses`: Derived from subject-level performance.
- **Verdict:** **Fully Functional.**

### 2. Retention Metrics (Working)

- **What is saved:** "Mastery" events (score >= 80%).
- **When:** Saved alongside progress in `ProgressManager`.
- **AI Usage:**
  - `urgent_reviews_count`: Tells AI to suggest specific reviews.
  - `overall_retention_score`: Triggers "neuroscience tips" about spaced repetition.
- **Verdict:** **Fully Functional.**

### 3. Behavioral Metrics (Missing)

- **Intended Data:** `focus_score`, `engagement_level`, `help_requests`, `hesitation_count`.
- **Current State:** The `BehavioralAnalytics` table exists but there is **zero code** in the backend to write to it.
- **Impact:** The AI receives `0` for focus and engagement, leading to generic advice.
- **Recommendation:** Need a "Session Heartbeat" or "Activity Tracker" on the frontend to send this data.

### 4. Time & Usage Metrics (Missing)

- **Intended Data:** `total_minutes`, `session_count`, `study_days`.
- **Current State:** The `DailyUsage` table exists but is **never updated**.
- **Impact:** The AI thinks the student has studied for 0 hours.
  | ------------------ | --------------------------------------------------------------------------------------- | --------------------------- |
  | **Score Trend** | "I see your math scores are trending up this week!" | **Motivation & Confidence** |
  | **Retention** | "It's been 3 days since you mastered Fractions. Let's do a quick review to lock it in." | **Long-term Memory** |
  | **Focus (Future)** | "I noticed you clicked away 5 times. Let's try a 5-minute breathing exercise." | **Better Study Habits** |
  | **Time (Future)** | "You've studied for 2 hours today! That's a personal best." | **Achievement** |

## ✅ Recommendation

**Immediate Next Step:**
Implement **Phase 1 (Session & Time Tracking)**. This is the easiest high-impact win. It will allow the AI to say "You've been working hard for X hours" and populate the `DailyUsage` table.
