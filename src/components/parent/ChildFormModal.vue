<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Edit Child Profile' : 'Add New Child' }}</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <!-- Username -->
        <div class="form-group">
          <label for="username">Username *</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="Alphanumeric only (min 3 chars)"
            required
            minlength="3"
            pattern="[a-zA-Z0-9]+"
            :disabled="isEditing || loading"
            title="Only letters and numbers allowed"
          />
          <small v-if="isEditing" class="field-note">Username cannot be changed</small>
        </div>

        <!-- Password -->
        <div class="form-group" v-if="!isEditing">
          <label for="password">Password *</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Min 4 characters"
            required
            minlength="4"
            :disabled="loading"
          />
        </div>

        <!-- Display Name -->
        <div class="form-group">
          <label for="display_name">Display Name *</label>
          <input
            id="display_name"
            v-model="form.display_name"
            type="text"
            placeholder="Full name"
            required
            :disabled="loading"
          />
        </div>

        <!-- Age -->
        <div class="form-row">
          <div class="form-group">
            <label for="age">Age *</label>
            <input
              id="age"
              v-model.number="form.age"
              type="number"
              min="3"
              max="18"
              required
              :disabled="loading"
            />
          </div>

          <!-- Grade Level -->
          <div class="form-group">
            <label for="grade_level">Grade *</label>
            <input
              id="grade_level"
              v-model.number="form.grade_level"
              type="number"
              min="1"
              max="12"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Preferred Character -->
        <div class="form-group">
          <label for="preferred_character">Preferred Tutor Character</label>
          <select id="preferred_character" v-model="form.preferred_character" :disabled="loading">
            <option value="aria">Aria - The Empathetic Tutor 💙</option>
            <option value="sera">Sera - The Analytical Tutor 🧠</option>
            <option value="eidon">Eidon - The Creative Tutor ✨</option>
          </select>
        </div>

        <!-- Daily Time Limit -->
        <div class="form-group">
          <label for="daily_time_limit">Daily Time Limit (minutes)</label>
          <div class="slider-container">
            <input
              id="daily_time_limit"
              v-model.number="form.daily_time_limit_minutes"
              type="range"
              min="15"
              max="120"
              step="15"
              :disabled="loading"
            />
            <span class="slider-value">{{ form.daily_time_limit_minutes }} min</span>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn-cancel" :disabled="loading">
            Cancel
          </button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Saving...' : isEditing ? 'Update Child' : 'Add Child' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStudentsStore } from '@/stores/studentsStore'

const props = defineProps({
  child: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'save'])

const studentsStore = useStudentsStore()

const isEditing = computed(() => !!props.child)

const form = ref({
  username: '',
  password: '',
  display_name: '',
  age: 8,
  grade_level: 2,
  preferred_character: 'aria',
  daily_time_limit_minutes: 60,
})

const loading = ref(false)
const error = ref('')

// Populate form if editing
watch(
  () => props.child,
  (child) => {
    if (child) {
      form.value = {
        username: child.username,
        password: '', // Don't show existing password
        display_name: child.display_name,
        age: child.age,
        grade_level: child.grade_level,
        preferred_character: child.preferred_character,
        daily_time_limit_minutes: child.daily_time_limit_minutes,
      }
    }
  },
  { immediate: true },
)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    if (isEditing.value) {
      // Update existing child (exclude username and password)
      const updates = {
        display_name: form.value.display_name,
        age: form.value.age,
        grade_level: form.value.grade_level,
        preferred_character: form.value.preferred_character,
        daily_time_limit_minutes: form.value.daily_time_limit_minutes,
      }
      await studentsStore.updateChild(props.child.id, updates)
    } else {
      // Create new child
      await studentsStore.createChild(form.value)
    }

    emit('save')
    emit('close')
  } catch (err) {
    error.value = err.message || 'Failed to save child profile'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.btn-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 28px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #e0e0e0;
  color: #333;
}

.modal-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.field-note {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.slider-container input[type='range'] {
  flex: 1;
  padding: 0;
}

.slider-value {
  min-width: 70px;
  text-align: right;
  font-weight: 700;
  color: #667eea;
  font-size: 16px;
}

.error-message {
  padding: 12px 16px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-cancel:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
