<template>
  <div class="star-rating" :class="size">
    <div class="stars-container">
      <svg
        v-for="i in 5"
        :key="i"
        class="star-svg"
        :class="{
          filled: i <= fullStars,
          half: i === halfStarPosition,
          empty: i > fullStars && i !== halfStarPosition,
        }"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient :id="'half-grad-' + i">
            <stop offset="50%" stop-color="currentColor" class="stop-filled" />
            <stop offset="50%" stop-color="currentColor" class="stop-empty" />
          </linearGradient>
        </defs>
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          :fill="i === halfStarPosition ? `url(#half-grad-${i})` : 'currentColor'"
        />
      </svg>
    </div>
    <span v-if="showScore" class="score-text">{{ score }}/10</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 10,
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  showScore: {
    type: Boolean,
    default: false,
  },
})

const stars = computed(() => props.score / 2)
const fullStars = computed(() => Math.floor(stars.value))
const hasHalfStar = computed(() => stars.value % 1 >= 0.25 && stars.value % 1 < 0.75)
const halfStarPosition = computed(() => (hasHalfStar.value ? fullStars.value + 1 : null))
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.stars-container {
  display: flex;
  align-items: center;
}

.star-svg {
  width: 24px;
  height: 24px;
  transition: transform 0.2s ease;
}

/* Size Variants */
.star-rating.small .star-svg {
  width: 16px;
  height: 16px;
}

.star-rating.large .star-svg {
  width: 32px;
  height: 32px;
}

/* Colors */
.star-svg {
  color: #333; /* Default fallback */
}

.star-svg.filled {
  color: #ffd700;
  filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.5));
}

.star-svg.half .stop-filled {
  stop-color: #ffd700;
}

.star-svg.half .stop-empty {
  stop-color: #444; /* Empty part color */
}

.star-svg.empty {
  color: #444;
}

.score-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

/* Animations */
.star-svg.filled,
.star-svg.half {
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>
