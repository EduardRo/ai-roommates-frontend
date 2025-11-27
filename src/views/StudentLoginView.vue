<template>
  <div class="student-login-view">
    <div class="login-container">
      <!-- Decorative Character -->
      <div class="character-decoration">
        <div class="character-circle">👋</div>
        <p class="welcome-text">Hey there, student!</p>
      </div>

      <div class="login-card">
        <h1>Student Login</h1>
        <p class="subtitle">Enter your username to start learning!</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Username -->
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="Your username"
              required
              :disabled="loading"
              autofocus
            />
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Your password"
              required
              :disabled="loading"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Logging in...' : "Let's Learn! 🚀" }}
          </button>
        </form>

        <!-- Help Text -->
        <div class="help-text">
          <p>Need help? Ask your parent!</p>
        </div>
      </div>

      <!-- Parent Login Link -->
      <div class="switch-login">
        <router-link to="/parent/login" class="parent-link"> ← Parent Login </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.loginStudent(form.value.username, form.value.password)

    // On success, redirect to student dashboard
    router.push('/student/dashboard')
  } catch (err) {
    // Make error message kid-friendly
    if (err.message.includes('subscription')) {
      error.value = '⚠️ Please ask your parent to renew the subscription'
    } else if (err.message.includes('password')) {
      error.value = '❌ Wrong username or password. Try again!'
    } else {
      error.value = '❌ Something went wrong. Ask your parent for help!'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:root {
  --color-card-bg: rgba(20, 20, 27, 0.8);
  --color-neon: #a000ff;
  --color-cyan: #00f0ff;
  --color-pink: #f093fb;
  --color-border: rgba(240, 147, 251, 0.3);
  --color-text: #e0e0e0;
  --color-text-muted: #a0a0a0;
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.student-login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  padding: 20px;
  position: relative;
}

.student-login-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 30% 40%, rgba(240, 147, 251, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(245, 87, 108, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.login-container {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

.character-decoration {
  text-align: center;
  margin-bottom: 30px;
}

.character-circle {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--color-pink) 0%, #f5576c 100%);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  box-shadow: 0 0 30px rgba(240, 147, 251, 0.5);
  border: 3px solid var(--color-pink);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.welcome-text {
  margin: 16px 0 0 0;
  color: var(--color-text);
  font-size: 20px;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(240, 147, 251, 0.5);
}

.login-card {
  background: var(--color-card-bg);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border);
}

h1 {
  margin: 0 0 10px 0;
  color: var(--color-pink);
  font-size: 32px;
  text-align: center;
  font-weight: 800;
  text-shadow: 0 0 20px rgba(240, 147, 251, 0.5);
}

.subtitle {
  margin: 0 0 30px 0;
  color: var(--color-text-muted);
  text-align: center;
  font-size: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 700;
  color: var(--color-text);
  font-size: 16px;
}

.form-group input {
  padding: 14px 18px;
  border: 3px solid var(--color-border);
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

.form-group input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-pink);
  box-shadow: 0 0 0 4px rgba(240, 147, 251, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.form-group input:disabled {
  background-color: rgba(255, 255, 255, 0.02);
  cursor: not-allowed;
  opacity: 0.5;
}

.error-message {
  padding: 14px 18px;
  background-color: rgba(255, 50, 50, 0.1);
  border: 2px solid rgba(255, 50, 50, 0.3);
  border-radius: 12px;
  color: #ff6b6b;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
}

.btn-primary {
  padding: 16px 28px;
  background: linear-gradient(135deg, var(--color-pink) 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(240, 147, 251, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(240, 147, 251, 0.6);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.help-text {
  margin-top: 20px;
  text-align: center;
}

.help-text p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.switch-login {
  margin-top: 25px;
  text-align: center;
}

.parent-link {
  display: inline-block;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-cyan);
  text-decoration: none;
  border-radius: 10px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(0, 240, 255, 0.3);
  transition: all 0.3s;
  font-size: 15px;
}

.parent-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-cyan);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
  transform: translateX(-5px);
}
</style>
