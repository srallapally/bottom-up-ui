<!-- client/src/views/DashboardView.vue -->
<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Dashboard</h2>
        <p class="text-muted mb-0">Manage your role mining sessions</p>
      </div>

      <button
          class="btn btn-primary"
          @click="handleCreateSession"
          :disabled="sessionStore.loading || resuming"
      >
        <span v-if="sessionStore.loading" class="spinner-border spinner-border-sm me-2" role="status">
          <span class="visually-hidden">Creating...</span>
        </span>
        Create New Session
      </button>
    </div>

    <!-- Resuming indicator -->
    <div v-if="resuming" class="text-center py-5">
      <div class="spinner-border text-primary mb-3" role="status"></div>
      <p class="text-muted">Restoring your session...</p>
    </div>

    <!-- Current Session -->
    <div v-else-if="sessionStore.hasSession" class="mb-4">
      <h5 class="mb-3">Current Session</h5>

      <SessionCard
          :session-id="sessionStore.sessionId"
          session-title="Active Mining Session"
          :status="getSessionStatus()"
          :created-at="sessionStore.currentSession.created_at"
          :last-activity="new Date().toISOString()"
          :has-identities="sessionStore.hasIdentities"
          :has-assignments="sessionStore.hasAssignments"
          :has-entitlements="sessionStore.hasEntitlements"
          :stats="sessionStore.processedStats"
          :is-active="true"
          @continue="handleContinue"
          @view-results="handleViewResults"
          @reconfigure="handleReconfigure"
          @delete="handleDelete"
      />
    </div>

    <!-- No Session State -->
    <div v-else class="text-center py-5">
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="text-muted mb-3" viewBox="0 0 16 16">
          <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>
        </svg>

        <h4>No Active Session</h4>
        <p class="text-muted mb-4">
          Create a new session to start role mining
        </p>

        <button
            class="btn btn-lg btn-primary"
            @click="handleCreateSession"
            :disabled="sessionStore.loading"
        >
          Create Session
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <ErrorAlert
        v-if="sessionStore.error"
        :message="sessionStore.error"
        @dismiss="sessionStore.error = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSessionStore } from '@/stores/session';
import { useResultsStore } from '@/stores/results';
import SessionCard from '@/components/session/SessionCard.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';

const router = useRouter();
const authStore = useAuthStore();
const sessionStore = useSessionStore();
const resultsStore = useResultsStore();

const resuming = ref(false);

// On mount: rehydrate session if stores are empty but a session exists on the server
onMounted(async () => {
  if (!sessionStore.hasSession && authStore.miningSessionId) {
    resuming.value = true;
    try {
      await sessionStore.resumeSession(authStore.miningSessionId);

      // If session has processed data, try loading results too
      if (sessionStore.filesProcessed && !resultsStore.hasResults) {
        try {
          await resultsStore.loadResults(authStore.miningSessionId);
        } catch (e) {
          // No results yet — that's fine, user hasn't mined
          console.log('[Dashboard] No results to load (expected if not mined yet)');
        }
      }
    } catch (e) {
      console.error('[Dashboard] Failed to resume session:', e);
      // Session might have been deleted on Flask side — clear the stale reference
      authStore.miningSessionId = null;
    } finally {
      resuming.value = false;
    }
  }
});

const getSessionStatus = () => {
  if (!sessionStore.hasSession) return 'created';
  if (resultsStore.hasResults) return 'completed';
  if (sessionStore.filesProcessed) return 'ready';
  if (sessionStore.allFilesUploaded) return 'ready';
  if (sessionStore.uploadedFileCount > 0) return 'uploading';
  return 'created';
};

const handleCreateSession = async () => {
  try {
    await sessionStore.createSession();
    router.push('/upload');
  } catch (error) {
    console.error('Failed to create session:', error);
  }
};

const handleContinue = () => {
  if (!sessionStore.allFilesUploaded) {
    router.push('/upload');
  } else if (!sessionStore.config) {
    router.push('/configure');
  } else {
    router.push('/processing');
  }
};

const handleViewResults = () => {
  router.push('/results');
};

const handleReconfigure = () => {
  router.push('/configure');
};

const handleDelete = async (sessionId) => {
  try {
    await sessionStore.deleteSession(sessionId);
    resultsStore.clearResults();
    authStore.miningSessionId = null;
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
};
</script>

<style scoped>
.empty-state {
  max-width: 400px;
  margin: 0 auto;
}
</style>