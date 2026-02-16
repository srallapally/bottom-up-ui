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
import { useAuthStore } from '@/stores/auth';
import { useSessionStore } from '@/stores/session';
import { useResultsStore } from '@/stores/results';

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Dashboard'
    }
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
      requiresResults: true,
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
      requiresResults: true,
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
      requiresResults: true,
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
  const authStore = useAuthStore();
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
  
  if (to.meta.requiresAuth) {
    // Check if authenticated
    if (!authStore.authenticated) {
      console.log('[Router] Not authenticated, checking session...');
      
      try {
        await authStore.checkSession();
      } catch (error) {
        console.error('[Router] Session check failed:', error);
        // Mock auth should auto-create user, but if it fails, redirect to dashboard
        // which will trigger session check again
        return next('/dashboard');
      }
      
      if (!authStore.authenticated) {
        console.log('[Router] Authentication failed, redirecting to dashboard');
        return next('/dashboard');
      }
    }
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

// ============================================================================
// EXPORT
// ============================================================================

export default router;
