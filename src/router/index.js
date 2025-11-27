import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { public: true },
    },
    // Parent routes
    {
      path: '/parent/register',
      name: 'parent-register',
      component: () => import('../views/ParentRegisterView.vue'),
      meta: { public: true },
    },
    {
      path: '/parent/login',
      name: 'parent-login',
      component: () => import('../views/ParentLoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/parent/dashboard',
      name: 'parent-dashboard',
      component: () => import('../views/ParentDashboardView.vue'),
      meta: { requiresParent: true },
    },
    // Student routes
    {
      path: '/student/login',
      name: 'student-login',
      component: () => import('../views/StudentLoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/student/dashboard',
      name: 'student-dashboard',
      component: () => import('../views/StudentDashboardView.vue'),
      meta: { requiresStudent: true },
    },
    // Educational Tutor routes
    {
      path: '/learn/math/grade-4',
      name: 'curriculum',
      component: () => import('../views/CurriculumView.vue'),
      meta: { requiresStudent: true },
    },
    {
      path: '/lesson/:lessonId',
      name: 'lesson',
      component: () => import('../views/LessonView.vue'),
      meta: { requiresStudent: true },
    },
    {
      path: '/lesson/:lessonId/complete',
      name: 'lesson-complete',
      component: () => import('../views/LessonCompleteView.vue'),
      meta: { requiresStudent: true },
    },
    // Legacy routes (debate features)
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { public: true },
    },
    {
      path: '/debate',
      name: 'debate',
      component: () => import('../views/DebateView.vue'),
      meta: { public: true },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryView.vue'),
      meta: { public: true },
    },
    {
      path: '/admin/chat',
      name: 'admin-chat',
      component: () => import('../views/AdminChatView.vue'),
      meta: { public: true },
    },
  ],
})

// Route guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Allow public routes
  if (to.meta.public) {
    return next()
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Redirect to appropriate login based on route
    if (to.path.startsWith('/student')) {
      return next('/student/login')
    }
    return next('/parent/login')
  }

  // Check user type for protected routes
  if (to.meta.requiresParent && !authStore.isParent) {
    return next('/student/dashboard')
  }

  if (to.meta.requiresStudent && !authStore.isStudent) {
    return next('/parent/dashboard')
  }

  next()
})

export default router
