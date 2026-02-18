// client/src/router/index.js
/**
 * Role Mining UI - Vue Router Configuration
 *
 * Routes with navigation guards enforcing workflow:
 * 1. Dashboard (session management)
 * 2. Upload (3 CSV files)
 * 3. Configure (mining parameters)
 * 4. Processing (mining in progress)
 * 5. Results (role list + export)
 * 6. Browse (data tables)
 */

import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from '@/stores/session';
import { useResultsStore } from '@/stores/results';
import auth from '@/auth'
import About from '@/components/About.vue'
import Login from '@/components/Login.vue'

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

const routes = [
  { path: '/about', component: About },
  { path: '/login', component: Login },
  { path: '/logout',
    beforeEnter (to, from, next) {
      auth.logout()
      next('/')
    }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/UploadView.vue'),
    meta: {
      requiresAuth: true,
      requiresSession: true,
      title: 'Upload Files'
    }
  },
  {
    path: '/configure',
    name: 'Configure',
    component: () => import('@/views/ConfigureView.vue'),
    meta: {
      requiresAuth: true,
      requiresSession: true,
      requiresFiles: true,
      title: 'Configure Mining'
    }
  },
  {
    path: '/processing',
    name: 'Processing',
    component: () => import('@/views/ProcessingView.vue'),
    meta: {
      requiresAuth: true,
      requiresSession: true,
      requiresProcessed: true,
      title: 'Mining in Progress'
    }
  },
  {
    path: '/results',
    name: 'Results',
    component: () => import('@/views/ResultsView.vue'),
    meta: {
      requiresAuth: true,
      requiresSession: true,
      requiresResults: true,
      title: 'Mining Results'
    }
  },
  {
    path: '/roles/:roleId',
    name: 'RoleDetail',
    component: () => import('@/views/RoleDetailView.vue'),
    meta: { requiresAuth: true, requiresSession: true, requiresResults: true }
  },
  {
    path: '/browse/identities',
    name: 'BrowseIdentities',
    component: () => import('@/views/browse/IdentitiesView.vue'),
    meta: {
      requiresAuth: true,
      requiresSession: true,
      requiresProcessed: true,
      title: 'Browse Identities'
    }
  },
  {
    path: '/browse/entitlements',
    name: 'BrowseEntitlements',
    component: () => import('@/views/browse/EntitlementsView.vue'),
    meta: {
      requiresAuth: true,
      requiresSession: true,
      requiresProcessed: true,
      title: 'Browse Entitlements'
    }
  },
  {
    path: '/browse/assignments',
    name: 'BrowseAssignments',
    component: () => import('@/views/browse/AssignmentsView.vue'),
    meta: {
      requiresAuth: true,
      requiresSession: true,
      requiresProcessed: true,
      title: 'Browse Assignments'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: 'Page Not Found'
    }
  }
];

// ============================================================================
// ROUTER INSTANCE
// ============================================================================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// ============================================================================
// NAVIGATION GUARDS
// ============================================================================

router.beforeEach(async (to, from, next) => {
  const sessionStore = useSessionStore();
  const resultsStore = useResultsStore();

  console.log('[Router] Navigating:', {
    from: from.path,
    to: to.path,
    meta: to.meta
  });

  // Set page title
  document.title = to.meta.title
      ? `${to.meta.title} - Role Mining UI`
      : 'Role Mining UI';

  // ============================================================================
  // 1. CHECK AUTHENTICATION
  // ============================================================================
  // Enforce auth for any route that declares meta.requiresAuth
  if (to.meta.requiresAuth && !auth.loggedIn()) {
    console.log('[Router] Not authenticated, redirecting to login');
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }

  // ============================================================================
  // 2. CHECK SESSION EXISTS
  // ============================================================================

  if (to.meta.requiresSession && !sessionStore.hasSession) {
    console.log('[Router] No session, redirecting to dashboard');
    return next('/dashboard');
  }

  // ============================================================================
  // 3. CHECK FILES UPLOADED
  // ============================================================================

  if (to.meta.requiresFiles && !sessionStore.allFilesUploaded) {
    console.log('[Router] Files not uploaded, redirecting to upload');
    return next('/upload');
  }

  // ============================================================================
  // 4. CHECK FILES PROCESSED
  // ============================================================================

  if (to.meta.requiresProcessed && !sessionStore.filesProcessed) {
    console.log('[Router] Files not processed, redirecting to configure');
    return next('/configure');
  }

  // ============================================================================
  // 5. CHECK MINING COMPLETE
  // ============================================================================

  if (to.meta.requiresResults && !resultsStore.hasResults) {
    console.log('[Router] No results, redirecting to processing');
    return next('/processing');
  }

  // All checks passed
  console.log('[Router] Navigation allowed');
  next();
});

// ============================================================================
// NAVIGATION ERROR HANDLING
// ============================================================================

router.onError((error) => {
  console.error('[Router] Navigation error:', error);
});

function requireAuth (to, from, next) {
  if (!auth.loggedIn()) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default router;
