<template>
  <div class="chapter-section card">
    <div class="chapter-header" @click="toggleExpanded">
      <div class="chapter-info">
        <span class="chapter-tag">CHAPTER {{ chapter.chapter_number }}</span>
        <h3 class="chapter-title">{{ chapter.title }}</h3>
        <span v-if="chapter.description" class="chapter-description">{{
          chapter.description
        }}</span>
      </div>
      <div class="chapter-meta">
        <span class="progress-box">{{ completedCount }}/{{ chapter.lessons.length }}</span>
        <span class="expand-icon" :class="{ expanded: isExpanded }">▼</span>
      </div>
    </div>

    <transition name="slide">
      <div v-if="isExpanded" class="lessons-container">
        <LessonCard
          v-for="lesson in chapter.lessons"
          :key="lesson.lesson_id"
          :lesson="lesson"
          :progress="getLessonProgress(lesson.lesson_id)"
          :is-unlocked="isLessonUnlocked(lesson.lesson_id)"
          @click="handleLessonClick"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import LessonCard from './LessonCard.vue'

const props = defineProps({
  chapter: {
    type: Object,
    required: true,
  },
  completedLessons: {
    type: Array,
    default: () => [],
  },
  unlockedLessons: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['lesson-click'])

const isExpanded = ref(true)

const completedCount = computed(() => {
  return props.chapter.lessons.filter((lesson) =>
    props.completedLessons.some((cl) => cl.lesson_id === lesson.lesson_id),
  ).length
})

const getLessonProgress = (lessonId) => {
  return props.completedLessons.find((cl) => cl.lesson_id === lessonId) || null
}

const isLessonUnlocked = (lessonId) => {
  return (
    props.unlockedLessons.includes(lessonId) ||
    props.completedLessons.some((cl) => cl.lesson_id === lessonId)
  )
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const handleLessonClick = (lessonId) => {
  emit('lesson-click', lessonId)
}
</script>

<style scoped>
.chapter-section {
  margin-bottom: 24px;
  padding: 0; /* Override default card padding for this component */
  overflow: hidden;
}

.chapter-header {
  padding: 20px 24px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.chapter-header:hover {
  background: rgba(255, 255, 255, 0.03);
}

.chapter-info {
  flex: 1;
}

.chapter-tag {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-neon);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 4px;
}

.chapter-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text);
  text-shadow: none; /* Override global h3 shadow for cleaner look */
}

.chapter-description {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  display: block;
  margin-top: 4px;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-box {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-cyan);
  background: #1d1d26;
  border: 1px solid var(--color-cyan);
  padding: 5px 12px;
  border-radius: 10px;
  box-shadow: 0 0 5px rgba(0, 234, 255, 0.2);
}

.expand-icon {
  font-size: 1.2rem;
  color: var(--color-text-muted);
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.lessons-container {
  padding: 0 24px 24px;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .chapter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .chapter-meta {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
