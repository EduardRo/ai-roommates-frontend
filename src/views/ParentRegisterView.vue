<template>
  <div class="parent-register-view">
    <div class="register-container">
      <div class="register-card">
        <h1>Parent Registration</h1>
        <p class="subtitle">Create your account to get started with AI-SYNTIA</p>

        <form @submit.prevent="handleRegister" class="register-form">
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
            />
          </div>

          <!-- Parent Name -->
          <div class="form-group">
            <label for="parent_name">Your Name</label>
            <input
              id="parent_name"
              v-model="form.parent_name"
              type="text"
              placeholder="John Doe"
              required
              :disabled="loading"
            />
          </div>

          <!-- Phone (Optional) -->
          <div class="form-group">
            <label for="phone">Phone Number (Optional)</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              placeholder="+1234567890"
              :disabled="loading"
            />
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Min 6 characters"
              required
              minlength="6"
              :disabled="loading"
            />
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              placeholder="Re-enter password"
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
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <!-- Link to Login -->
        <div class="footer-link">
          Already have an account?
          <router-link to="/parent/login">Log in here</router-link>
        </div>

        <!-- Trial Info -->
        <div class="trial-info">🎉 1 month free trial included!</div>
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
  confirmPassword: '',
  parent_name: '',
  phone: '',
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = ''

  // Validate passwords match
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  // Validate password length
  if (form.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true

  try {
    await authStore.registerParent(
      form.value.email,
      form.value.password,
      form.value.parent_name,
      form.value.phone || null,
    )

    // On success, redirect to parent dashboard
    router.push('/parent/dashboard')
  } catch (err) {
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.parent-register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 480px;
}

.register-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
  text-align: center;
}

.subtitle {
  margin: 0 0 30px 0;
  color: #666;
  text-align: center;
  font-size: 14px;
}

.register-form {
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
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  padding: 12px 16px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
  text-align: center;
}

.btn-primary {
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.footer-link {
  margin-top: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.footer-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.footer-link a:hover {
  text-decoration: underline;
}

.trial-info {
  margin-top: 20px;
  padding: 12px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}
</style>
