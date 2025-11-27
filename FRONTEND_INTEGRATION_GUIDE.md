# Backend Authentication System - Frontend Integration Guide

## Overview

We have completed the **Phase 0 Authentication System** for the AI-SYNTIA V5 Educational Tutor platform. This document provides everything the frontend team needs to integrate with the backend authentication API.

---

## 🎯 What We Built

### Backend Components

1. **MySQL Database** - 9 tables for users, subscriptions, students, progress tracking
2. **JWT Authentication** - Secure token-based auth with 30-minute expiration
3. **Password Security** - Bcrypt hashing (industry standard)
4. **Role-Based Access** - Separate authentication for parents and students
5. **Subscription Management** - Automatic 1-month free trial on parent registration
6. **RESTful API** - Complete authentication and student management endpoints

---

## 🔌 API Endpoints

### Base URL

```
http://localhost:8001/api
```

### Authentication Endpoints

#### 1. Register Parent Account

**POST** `/auth/register/parent`

**Request Body:**

```json
{
  "email": "parent@example.com",
  "password": "SecurePass123",
  "parent_name": "John Doe",
  "phone": "+1234567890" // optional
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_type": "parent",
  "user_id": 1,
  "email": "parent@example.com"
}
```

**Features:**

- ✅ Automatically creates 1-month free trial subscription
- ✅ Password must be at least 6 characters
- ✅ Returns JWT token for immediate login

---

#### 2. Parent Login

**POST** `/auth/login/parent`

**Request Body:**

```json
{
  "email": "parent@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_type": "parent",
  "user_id": 1,
  "email": "parent@example.com"
}
```

---

#### 3. Student Login

**POST** `/auth/login/student`

**Request Body:**

```json
{
  "username": "emma",
  "password": "emma123"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_type": "student",
  "user_id": 42,
  "username": "emma"
}
```

**Important:**

- ✅ Automatically checks parent subscription status
- ❌ Returns `402 Payment Required` if parent subscription expired

---

#### 4. Get Parent Info

**GET** `/auth/me/parent`

**Headers:**

```
Authorization: Bearer {parent_token}
```

**Response (200 OK):**

```json
{
  "id": 1,
  "email": "parent@example.com",
  "parent_name": "John Doe",
  "phone": "+1234567890",
  "is_active": true,
  "email_verified": false,
  "created_at": "2025-11-24T10:30:00",
  "last_login": "2025-11-24T18:00:00"
}
```

---

#### 5. Get Student Info

**GET** `/auth/me/student`

**Headers:**

```
Authorization: Bearer {student_token}
```

**Response (200 OK):**

```json
{
  "id": 42,
  "parent_id": 1,
  "username": "emma",
  "display_name": "Emma Doe",
  "age": 8,
  "grade_level": 2,
  "avatar_url": null,
  "preferred_character": "aria",
  "total_xp": 0,
  "current_level": 1,
  "is_active": true,
  "daily_time_limit_minutes": 60,
  "created_at": "2025-11-24T10:35:00",
  "last_login": "2025-11-24T17:00:00"
}
```

---

### Student Management (Parent Only)

#### 6. Create Student Profile

**POST** `/students/create`

**Headers:**

```
Authorization: Bearer {parent_token}
```

**Request Body:**

```json
{
  "username": "emma",
  "password": "emma123",
  "display_name": "Emma Doe",
  "age": 8,
  "grade_level": 2,
  "preferred_character": "aria", // "aria", "sera", or "eidon"
  "daily_time_limit_minutes": 60
}
```

**Validation:**

- Username: min 3 characters, alphanumeric only
- Password: min 4 characters
- Preferred character: optional, defaults to "aria"

**Response (200 OK):**

```json
{
  "id": 42,
  "parent_id": 1,
  "username": "emma",
  "display_name": "Emma Doe",
  "age": 8,
  "grade_level": 2,
  "avatar_url": null,
  "preferred_character": "aria",
  "total_xp": 0,
  "current_level": 1,
  "is_active": true,
  "daily_time_limit_minutes": 60,
  "created_at": "2025-11-24T10:35:00",
  "last_login": null
}
```

---

#### 7. List All Children

**GET** `/students/list`

**Headers:**

```
Authorization: Bearer {parent_token}
```

**Response (200 OK):**

```json
[
  {
    "id": 42,
    "username": "emma",
    "display_name": "Emma Doe",
    "age": 8,
    "grade_level": 2,
    ...
  },
  {
    "id": 43,
    "username": "jack",
    "display_name": "Jack Doe",
    "age": 10,
    "grade_level": 4,
    ...
  }
]
```

---

#### 8. Update Student Profile

**PATCH** `/students/{student_id}`

**Headers:**

```
Authorization: Bearer {parent_token}
```

**Request Body (all fields optional):**

```json
{
  "display_name": "Emma Rose Doe",
  "age": 9,
  "grade_level": 3,
  "preferred_character": "sera",
  "daily_time_limit_minutes": 90,
  "is_active": true
}
```

**Response (200 OK):**

```json
{
  "id": 42,
  "username": "emma",
  "display_name": "Emma Rose Doe",
  "age": 9,
  ...
}
```

---

## 🔐 Authentication Flow

### Parent Flow

```
1. User visits app → Show login/register page
2. Parent registers → POST /auth/register/parent
3. Backend returns JWT token
4. Store token in localStorage/sessionStorage
5. Redirect to parent dashboard
6. Use token for all subsequent API calls
```

### Student Flow

```
1. Parent creates child profile → POST /students/create
2. Student visits app → Show student login page
3. Student enters username/password → POST /auth/login/student
4. Backend checks parent subscription
5. If valid, returns JWT token
6. Store token and redirect to learning interface
```

---

## 🛡️ Security Implementation

### Token Storage (Frontend)

```javascript
// After successful login
const response = await fetch("/api/auth/login/parent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();

// Store token
localStorage.setItem("authToken", data.access_token);
localStorage.setItem("userType", data.user_type);
localStorage.setItem("userId", data.user_id);
```

### Making Authenticated Requests

```javascript
const token = localStorage.getItem("authToken");

const response = await fetch("/api/students/list", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

### Token Expiration Handling

```javascript
// If token expires (401 response)
if (response.status === 401) {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userType");
  localStorage.removeItem("userId");
  // Redirect to login
  window.location.href = "/login";
}
```

---

## ⚠️ Error Handling

### Common HTTP Status Codes

| Status | Meaning          | Action                                     |
| ------ | ---------------- | ------------------------------------------ |
| `200`  | Success          | Process response data                      |
| `400`  | Bad Request      | Show validation error to user              |
| `401`  | Unauthorized     | Invalid/expired token → redirect to login  |
| `402`  | Payment Required | Subscription expired → show upgrade prompt |
| `403`  | Forbidden        | Account inactive or wrong role             |
| `404`  | Not Found        | Resource doesn't exist                     |

### Example Error Responses

```json
{
  "detail": "Email already registered"
}
```

```json
{
  "detail": "Invalid email or password"
}
```

```json
{
  "detail": "Parent subscription has expired"
}
```

---

## 📋 Frontend Requirements

### Pages Needed

#### 1. Parent Pages

- **Landing/Marketing Page**
- **Parent Registration Page**
  - Email, password, name, phone (optional)
  - Terms & conditions checkbox
  - Link to login page
- **Parent Login Page**

  - Email & password fields
  - "Forgot password" link (future)
  - Link to registration page

- **Parent Dashboard**

  - List of children (from `/students/list`)
  - Add child button
  - Each child card shows: name, age, grade, progress
  - Click child to view detailed progress

- **Add/Edit Child Modal**
  - Username, password, display name
  - Age, grade level
  - Preferred tutor character (dropdown)
  - Daily time limit (slider/input)

#### 2. Student Pages

- **Student Login Page**
  - Username & password (simpler than parent login)
  - Fun, kid-friendly design
- **Student Dashboard (Learning Interface)**
  - Welcome message with character
  - Start lesson button
  - Progress indicators (XP, level)
  - Available lessons/chapters

### UI/UX Recommendations

- Use **separate login pages** for parents and students
- **Student UI** should be colorful, fun, large buttons
- **Parent UI** should be professional, data-focused
- Store `userType` to show appropriate dashboard
- Show **trial expiration** reminder on parent dashboard

---

## 🧪 Testing the API

### Using the Interactive Docs

1. Start backend: `uvicorn test_auth_api:app --reload --port 8001`
2. Visit: `http://localhost:8001/docs`
3. Test all endpoints with Swagger UI

### Quick Test Script (JavaScript/Fetch)

```javascript
// 1. Register parent
const registerParent = async () => {
  const response = await fetch(
    "http://localhost:8001/api/auth/register/parent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "Test123!",
        parent_name: "Test Parent",
      }),
    }
  );
  const data = await response.json();
  console.log("Parent registered:", data);
  return data.access_token;
};

// 2. Create student
const createStudent = async (parentToken) => {
  const response = await fetch("http://localhost:8001/api/students/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${parentToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "testchild",
      password: "child123",
      display_name: "Test Child",
      age: 8,
      grade_level: 2,
    }),
  });
  const data = await response.json();
  console.log("Student created:", data);
};

// 3. Student login
const studentLogin = async () => {
  const response = await fetch("http://localhost:8001/api/auth/login/student", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "testchild",
      password: "child123",
    }),
  });
  const data = await response.json();
  console.log("Student logged in:", data);
  return data.access_token;
};

// Run the flow
(async () => {
  const parentToken = await registerParent();
  await createStudent(parentToken);
  const studentToken = await studentLogin();
  console.log("All tests passed!");
})();
```

---

## 🗄️ Database Schema Overview

For reference, here are the key database models:

### Users (Parents)

- `id`, `email`, `password_hash`, `parent_name`, `phone`
- `is_active`, `email_verified`, `created_at`, `last_login`

### Student Profiles

- `id`, `parent_id`, `username`, `password_hash`, `display_name`
- `age`, `grade_level`, `avatar_url`, `preferred_character`
- `total_xp`, `current_level`, `is_active`, `daily_time_limit_minutes`

### Subscriptions

- `id`, `user_id`, `plan_type` (monthly, quarterly, biannual, annual)
- `status` (trial, active, expired, cancelled)
- `is_trial`, `trial_ends_at`, `starts_at`, `ends_at`

---

## 🎨 Character Options

Students can choose from 3 tutor characters:

| Character | Personality              | Teaching Style                                |
| --------- | ------------------------ | --------------------------------------------- |
| **Aria**  | Empathetic & Encouraging | Patient, supportive, celebrates small wins    |
| **Sera**  | Analytical & Precise     | Methodical, focuses on understanding concepts |
| **Eidon** | Creative & Playful       | Uses stories, games, makes learning fun       |

---

## 📦 Next Steps

### Backend (Complete ✅)

- [x] Database setup
- [x] Authentication system
- [x] JWT tokens
- [x] API endpoints
- [x] Subscription management

### Frontend (Todo 📝)

- [ ] Parent registration page
- [ ] Parent login page
- [ ] Parent dashboard
- [ ] Add/edit child functionality
- [ ] Student login page
- [ ] Student dashboard (learning interface)
- [ ] Token management & API integration
- [ ] Error handling & validation

### Future Phases

- **Phase 1**: Curriculum system (lessons, theory, practice)
- **Phase 2**: Progress tracking, rewards, parent dashboard analytics
- **Phase 3**: Free practice mode, review system

---

## 🤝 Support & Questions

If you encounter any issues or need clarification:

1. Check the interactive API docs: `http://localhost:8001/docs`
2. Review error messages - they're descriptive
3. Check token expiration (30 minutes default)
4. Verify Authorization header format: `Bearer {token}`

Good luck with the frontend implementation! 🚀
