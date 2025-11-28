<template>
  <div class="insight-card">
    <div class="insight-header">
      <h3>📊 Learning Insights</h3>
    </div>
    <div class="insight-content">
      <div class="stat-row">
        <div class="stat-item">
          <span class="label">Average Score</span>
          <span class="value">{{ insights.performance_summary.avg_score }}%</span>
        </div>
        <div class="stat-item">
          <span class="label">Trend</span>
          <span :class="['value', insights.performance_summary.trend]">
            {{ insights.performance_summary.trend }}
          </span>
        </div>
      </div>

      <div v-if="insights.neuroscience_tip" class="tip-box">
        <strong>🧠 Brain Tip:</strong>
        <p>{{ insights.neuroscience_tip }}</p>
      </div>

      <div v-if="insights.recommendations?.length" class="recommendations">
        <strong>Recommended Next Steps:</strong>
        <ul>
          <li v-for="(rec, i) in insights.recommendations" :key="i">
            {{ rec }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  insights: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.insight-card {
  background: #221232;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  overflow: hidden;
  border: 1px solid #eee;
}

.insight-header {
  background: #f8f9fa;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.insight-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.insight-content {
  padding: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.value {
  font-weight: bold;
  font-size: 1.1rem;
}

.value.improving {
  color: #28a745;
}
.value.stable {
  color: #ffc107;
}
.value.declining {
  color: #dc3545;
}

.tip-box {
  background: rgba(108, 117, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.tip-box strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.tip-box p {
  margin: 0;
  font-size: 0.9rem;
  color: #2d3748;
}

.recommendations ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
  font-size: 0.9rem;
}

.recommendations li {
  margin-bottom: 0.25rem;
}
</style>
