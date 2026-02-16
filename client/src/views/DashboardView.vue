<template>
  <div class="container mt-4">
    <h2>Dashboard</h2>
    <p class="text-muted">Session management - create or resume session</p>
    
    <div class="alert alert-info">
      <strong>Placeholder View</strong> - This will be implemented in Phase 4
    </div>
    
    <div class="card">
      <div class="card-body">
        <h5>Session Status</h5>
        <p><strong>Has Session:</strong> {{ sessionStore.hasSession ? 'Yes' : 'No' }}</p>
        <p v-if="sessionStore.sessionId">
          <strong>Session ID:</strong> {{ sessionStore.sessionId.slice(0, 8) }}...
        </p>
        
        <button 
          v-if="!sessionStore.hasSession"
          class="btn btn-primary"
          @click="createSession"
          :disabled="sessionStore.loading"
        >
          Create New Session
        </button>
        
        <button 
          v-else
          class="btn btn-success"
          @click="continueSession"
        >
          Continue to Upload
        </button>
      </div>
    </div>
    
    <RouterTester />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useSessionStore } from '@/stores/session';
import RouterTester from '@/components/common/RouterTester.vue';

const router = useRouter();
const sessionStore = useSessionStore();

const createSession = async () => {
  try {
    await sessionStore.createSession();
    router.push('/upload');
  } catch (error) {
    console.error('Failed to create session:', error);
  }
};

const continueSession = () => {
  router.push('/upload');
};
</script>
