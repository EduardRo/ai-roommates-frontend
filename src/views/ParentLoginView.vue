<template>
  <div class="parent-login-view">
    <div class="login-container">
      <div class="login-card">
        <h1>Parent Login</h1>
        <p class="subtitle">Welcome back! Log in to your account</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Email -->
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="parent@example.com"
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
              placeholder="Enter your password"
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
            {{ loading ? 'Logging in...' : 'Log In' }}
          </button>
        </form>

        <!-- Links -->
        <div class="footer-links">
          <div class="link-row">
            Don't have an account?
            <router-link to="/parent/register">Sign up here</router-link>
          </div>
          <div class="link-row">
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>
        </div>
      </div>

      <!-- Student Login Link -->
      <div class="switch-login">
        <p>Are you a student?</p>
        <router-link to="/student/login" class="student-link"> Student Login → </router-link>
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
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.loginParent(form.value.email, form.value.password)

    // On success, redirect to parent dashboard
    router.push('/parent/dashboard')
  } catch (err) {
    error.value = err.message || 'Login failed. Please check your credentials.'
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
  --color-border: rgba(160, 0, 255, 0.3);
  --color-text: #e0e0e0;
  --color-text-muted: #a0a0a0;
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.parent-login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  padding: 20px;
  position: relative;
}

.parent-login-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 30% 40%, rgba(160, 0, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.login-container {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
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
  color: var(--color-cyan);
  font-size: 32px;
  text-align: center;
  font-weight: 800;
  text-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
}

.subtitle {
  margin: 0 0 30px 0;
  color: var(--color-text-muted);
  text-align: center;
  font-size: 15px;
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
  font-size: 15px;
}

.form-group input {
  padding: 14px 18px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  font-size: 15px;
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
  border-color: var(--color-neon);
  box-shadow: 0 0 0 4px rgba(160, 0, 255, 0.2);
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
  font-size: 14px;
  text-align: center;
  font-weight: 600;
}

.btn-primary {
  padding: 16px 28px;
  background: linear-gradient(135deg, var(--color-neon) 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(160, 0, 255, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(160, 0, 255, 0.6);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.footer-links {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-row {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}

.link-row a {
  color: var(--color-cyan);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.link-row a:hover {
  color: var(--color-neon);
  text-shadow: 0 0 10px rgba(160, 0, 255, 0.5);
}

.forgot-password {
  color: var(--color-text-muted) !important;
  font-size: 13px !important;
}

.forgot-password:hover {
  color: var(--color-text) !important;
}

.switch-login {
  margin-top: 30px;
  text-align: center;
}

.switch-login p {
  color: var(--color-text);
  margin: 0 0 12px 0;
  font-size: 14px;
}

.student-link {
  display: inline-block;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-cyan);
  text-decoration: none;
  border-radius: 10px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  border: 2px solid var(--color-border);
  transition: all 0.3s;
  font-size: 15px;
}

.student-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-cyan);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
  transform: translateX(5px);
}
</style>
