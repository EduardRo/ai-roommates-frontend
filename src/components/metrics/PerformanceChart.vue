<template>
  <div class="performance-chart">
    <div class="chart-header">
      <h3>📈 Performance Trend</h3>
      <div class="time-range-selector">
        <button
          v-for="range in timeRanges"
          :key="range.value"
          :class="{ active: selectedRange === range.value }"
          @click="$emit('range-change', range.value)"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="chart-loading">
      <div class="spinner"></div>
      <p>Loading performance data...</p>
    </div>

    <div v-else-if="chartData.dates.length === 0" class="chart-empty">
      <p>📚 No performance data yet. Complete some lessons to see your progress!</p>
    </div>

    <div v-else class="chart-container">
      <!-- CSS-based line chart -->
      <div class="chart-canvas">
        <div class="y-axis">
          <span class="y-label">10</span>
          <span class="y-label">8</span>
          <span class="y-label">6</span>
          <span class="y-label">4</span>
          <span class="y-label">2</span>
          <span class="y-label">0</span>
        </div>

        <div class="chart-area">
          <!-- Grid lines -->
          <div class="grid-line" v-for="i in 5" :key="i" :style="{ bottom: `${i * 20}%` }"></div>

          <!-- Data points and line -->
          <svg class="line-chart" :viewBox="`0 0 ${chartData.dates.length * 100} 100`">
            <!-- Line path -->
            <polyline
              :points="linePoints"
              fill="none"
              stroke="url(#gradient)"
              stroke-width="3"
              class="chart-line"
            />

            <!-- Gradient definition -->
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #b026ff; stop-opacity: 1" />
                <stop offset="100%" style="stop-color: #00eaff; stop-opacity: 1" />
              </linearGradient>
            </defs>

            <!-- Data points -->
            <circle
              v-for="(score, index) in chartData.scores"
              :key="index"
              :cx="index * 100 + 50"
              :cy="100 - score * 10"
              r="5"
              fill="#00eaff"
              class="data-point"
              @mouseenter="showTooltip(index, $event)"
              @mouseleave="hideTooltip"
            />
          </svg>
        </div>

        <div class="x-axis">
          <span v-for="(date, index) in displayDates" :key="index" class="x-label">
            {{ date }}
          </span>
        </div>
      </div>

      <!-- Tooltip -->
      <div v-if="tooltip.show" class="chart-tooltip" :style="tooltipStyle">
        <div class="tooltip-content">
          <strong>{{ chartData.dates[tooltip.index] }}</strong>
          <p>Score: {{ chartData.scores[tooltip.index] }}/10</p>
          <p>⭐ {{ chartData.stars[tooltip.index] }} stars</p>
          <p class="lesson-id">{{ chartData.lessons[tooltip.index] }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
    default: () => ({ dates: [], scores: [], lessons: [], stars: [] }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  selectedRange: {
    type: String,
    default: '30d',
  },
})

defineEmits(['range-change'])

const timeRanges = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: 'All Time', value: 'all' },
]

const tooltip = ref({
  show: false,
  index: 0,
  x: 0,
  y: 0,
})

// Calculate line points for SVG polyline
const linePoints = computed(() => {
  return props.chartData.scores
    .map((score, index) => `${index * 100 + 50},${100 - score * 10}`)
    .join(' ')
})

// Show only every nth date label to avoid crowding
const displayDates = computed(() => {
  const dates = props.chartData.dates
  if (dates.length <= 7) return dates

  const step = Math.ceil(dates.length / 7)
  return dates.filter((_, index) => index % step === 0)
})

const tooltipStyle = computed(() => ({
  left: `${tooltip.value.x}px`,
  top: `${tooltip.value.y}px`,
}))

function showTooltip(index, event) {
  tooltip.value = {
    show: true,
    index,
    x: event.clientX + 10,
    y: event.clientY - 60,
  }
}

function hideTooltip() {
  tooltip.value.show = false
}
</script>

<style scoped>
.performance-chart {
  background: rgba(26, 26, 37, 0.6);
  border: 1px solid rgba(0, 234, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3 {
  margin: 0;
  color: var(--color-cyan, #00eaff);
  font-size: 1.25rem;
  text-shadow: 0 0 10px rgba(0, 234, 255, 0.5);
}

.time-range-selector {
  display: flex;
  gap: 0.5rem;
}

.time-range-selector button {
  padding: 0.5rem 1rem;
  background: rgba(0, 234, 255, 0.1);
  border: 1px solid rgba(0, 234, 255, 0.3);
  border-radius: 8px;
  color: #999;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.875rem;
}

.time-range-selector button:hover {
  background: rgba(0, 234, 255, 0.2);
  border-color: var(--color-cyan, #00eaff);
  color: var(--color-cyan, #00eaff);
}

.time-range-selector button.active {
  background: rgba(0, 234, 255, 0.3);
  border-color: var(--color-cyan, #00eaff);
  color: var(--color-cyan, #00eaff);
  box-shadow: 0 0 15px rgba(0, 234, 255, 0.3);
}

.chart-loading,
.chart-empty {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 234, 255, 0.2);
  border-top-color: var(--color-cyan, #00eaff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.chart-container {
  position: relative;
}

.chart-canvas {
  display: flex;
  gap: 1rem;
  height: 300px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
}

.y-label {
  color: #666;
  font-size: 0.75rem;
}

.chart-area {
  flex: 1;
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
}

.line-chart {
  width: 100%;
  height: 100%;
}

.chart-line {
  filter: drop-shadow(0 0 8px rgba(0, 234, 255, 0.6));
}

.data-point {
  cursor: pointer;
  transition: r 0.2s;
  filter: drop-shadow(0 0 4px rgba(0, 234, 255, 0.8));
}

.data-point:hover {
  r: 7;
}

.x-axis {
  display: flex;
  justify-content: space-around;
  margin-top: 0.5rem;
  padding: 0 3rem;
}

.x-label {
  color: #666;
  font-size: 0.75rem;
  text-align: center;
}

.chart-tooltip {
  position: fixed;
  background: rgba(26, 26, 37, 0.95);
  border: 1px solid var(--color-cyan, #00eaff);
  border-radius: 8px;
  padding: 0.75rem;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 0 20px rgba(0, 234, 255, 0.4);
}

.tooltip-content strong {
  color: var(--color-cyan, #00eaff);
  display: block;
  margin-bottom: 0.5rem;
}

.tooltip-content p {
  margin: 0.25rem 0;
  color: #ccc;
  font-size: 0.875rem;
}

.lesson-id {
  color: #666;
  font-size: 0.75rem;
  font-family: monospace;
}
</style>
