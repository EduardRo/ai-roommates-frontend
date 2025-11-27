<template>
  <div class="home-view">
    <div class="landing-container">
      <header class="hero">
        <h1>Welcome to AI-SYNTIA V5</h1>
        <p class="subtitle">Your Interactive AI Learning Platform</p>
      </header>

      <div class="navigation-grid">
        <!-- Parent Portal -->
        <router-link to="/parent/login" class="nav-card parent-card">
          <div class="card-icon">👨‍👩‍👧‍👦</div>
          <h2>Parent Portal</h2>
          <p>Manage your children's learning journey</p>
          <span class="card-action">Login / Register →</span>
        </router-link>

        <!-- Student Portal -->
        <router-link to="/student/login" class="nav-card student-card">
          <div class="card-icon">🎓</div>
          <h2>Student Portal</h2>
          <p>Start learning with your AI tutor</p>
          <span class="card-action">Student Login →</span>
        </router-link>

        <!-- Debate Feature (Legacy) -->
        <router-link to="/debate" class="nav-card debate-card">
          <div class="card-icon">💬</div>
          <h2>AI Debate</h2>
          <p>Watch AI characters debate topics</p>
          <span class="card-action">Start Debate →</span>
        </router-link>

        <!-- History Viewer -->
        <router-link to="/history" class="nav-card history-card">
          <div class="card-icon">📚</div>
          <h2>Debate History</h2>
          <p>View saved debate sessions</p>
          <span class="card-action">View History →</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// No special logic needed - just navigation
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

.home-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  padding: 20px;
  position: relative;
}

.home-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(160, 0, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(0, 240, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.landing-container {
  max-width: 1000px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.hero {
  text-align: center;
  margin-bottom: 60px;
  color: white;
}

.hero h1 {
  font-size: 48px;
  margin: 0 0 16px 0;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-cyan) 0%, var(--color-neon) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(160, 0, 255, 0.5);
  filter: drop-shadow(0 0 20px rgba(0, 240, 255, 0.3));
}

.subtitle {
  font-size: 24px;
  margin: 0;
  color: var(--color-text);
  font-weight: 400;
}

.navigation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.nav-card {
  background: var(--color-card-bg);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  text-decoration: none;
  color: var(--color-text);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 260px;
  position: relative;
  overflow: hidden;
}

.nav-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(160, 0, 255, 0.1) 0%, rgba(0, 240, 255, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(160, 0, 255, 0.4);
  border-color: var(--color-neon);
}

.nav-card:hover::before {
  opacity: 1;
}

.card-icon {
  font-size: 64px;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 10px rgba(160, 0, 255, 0.5));
  position: relative;
  z-index: 1;
}

.nav-card h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
  position: relative;
  z-index: 1;
}

.nav-card p {
  margin: 0 0 20px 0;
  color: var(--color-text-muted);
  font-size: 15px;
  line-height: 1.5;
  flex-grow: 1;
  position: relative;
  z-index: 1;
}

.card-action {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
  position: relative;
  z-index: 1;
  border: 2px solid transparent;
}

/* Card-specific colors */
.parent-card .card-action {
  background: linear-gradient(135deg, var(--color-neon) 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 0 20px rgba(160, 0, 255, 0.4);
}

.student-card .card-action {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  box-shadow: 0 0 20px rgba(240, 147, 251, 0.4);
}

.debate-card .card-action {
  background: linear-gradient(135deg, var(--color-cyan) 0%, #00f2fe 100%);
  color: #000;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
}

.history-card .card-action {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #000;
  box-shadow: 0 0 20px rgba(67, 233, 123, 0.4);
}

.nav-card:hover .card-action {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(160, 0, 255, 0.6);
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 36px;
  }

  .subtitle {
    font-size: 18px;
  }

  .navigation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
