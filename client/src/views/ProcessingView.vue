<template>
  <div class="container mt-4">
    <div class="text-center py-5">
      <!-- Mining in Progress -->
      <div v-if="resultsStore.isMining" class="mining-status">
        <div class="spinner-border text-primary mb-4" style="width: 5rem; height: 5rem;" role="status">
          <span class="visually-hidden">Mining in progress...</span>
        </div>
        
        <h2 class="mb-3">Role Mining in Progress</h2>
        
        <p class="text-muted mb-4">
          Running Leiden clustering algorithm on your dataset.<br>
          This typically takes 2-3 minutes.
        </p>
        
        <!-- Progress Indicators -->
        <div class="progress-info mb-4">
          <div v-if="elapsedSeconds > 0" class="alert alert-info d-inline-block">
            <strong>Elapsed Time:</strong> {{ formatElapsedTime(elapsedSeconds) }}
          </div>
        </div>
        
        <!-- Mining Steps (Illustrative) -->
        <div class="mining-steps">
          <div class="step-item" :class="{ 'step-active': elapsedSeconds > 0 }">
            <div class="step-icon">✓</div>
            <div class="step-text">Loading data...</div>
          </div>
          
          <div class="step-item" :class="{ 'step-active': elapsedSeconds > 10 }">
            <div class="step-icon">{{ elapsedSeconds > 10 ? '✓' : '○' }}</div>
            <div class="step-text">Detecting birthright entitlements...</div>
          </div>
          
          <div class="step-item" :class="{ 'step-active': elapsedSeconds > 20 }">
            <div class="step-icon">{{ elapsedSeconds > 20 ? '✓' : '○' }}</div>
            <div class="step-text">Clustering entitlements...</div>
          </div>
          
          <div class="step-item" :class="{ 'step-active': elapsedSeconds > 60 }">
            <div class="step-icon">{{ elapsedSeconds > 60 ? '✓' : '○' }}</div>
            <div class="step-text">Building roles...</div>
          </div>
          
          <div class="step-item" :class="{ 'step-active': elapsedSeconds > 90 }">
            <div class="step-icon">{{ elapsedSeconds > 90 ? '⟳' : '○' }}</div>
            <div class="step-text">Scoring confidence...</div>
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="text-danger mb-3" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
        </svg>
        
        <h2 class="mb-3">Mining Failed</h2>
        
        <div class="alert alert-danger d-inline-block mb-4">
          {{ error }}
        </div>
        
        <div>
          <router-link to="/configure" class="btn btn-primary me-2">
            Back to Configuration
          </router-link>
          
          <button class="btn btn-outline-secondary" @click="retryMining">
            Retry Mining
          </button>
        </div>
      </div>
      
      <!-- Timeout Warning -->
      <div v-else-if="isTimeout" class="timeout-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="text-warning mb-3" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        
        <h2 class="mb-3">Operation Taking Longer Than Expected</h2>
        
        <p class="text-muted mb-4">
          The mining process is taking longer than usual. This can happen with very large datasets.
        </p>
        
        <div>
          <button class="btn btn-primary me-2" @click="checkStatus">
            Check Status
          </button>
          
          <router-link to="/dashboard" class="btn btn-outline-secondary">
            Return to Dashboard
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionStore } from '@/stores/session';
import { useResultsStore } from '@/stores/results';
import api from '@/services/api';

const router = useRouter();
const sessionStore = useSessionStore();
const resultsStore = useResultsStore();

const error = ref(null);
const isTimeout = ref(false);
const elapsedSeconds = ref(0);

let intervalId = null;

onMounted(async () => {
  if (!sessionStore.hasSession) {
    router.push('/dashboard');
    return;
  }
  
  // Start the mining process
  await startMining();
  
  // Start elapsed time counter
  intervalId = setInterval(() => {
    if (resultsStore.isMining && resultsStore.miningStartTime) {
      elapsedSeconds.value = Math.floor((Date.now() - resultsStore.miningStartTime) / 1000);
      
      // Show timeout warning after 5 minutes
      if (elapsedSeconds.value > 300) {
        isTimeout.value = true;
      }
    }
  }, 1000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

const startMining = async () => {
  error.value = null;
  isTimeout.value = false;
  
  try {
    // Call mining API with current session config
    const results = await api.mine(
      sessionStore.sessionId,
      sessionStore.config || {}
    );
    
    // Store results
    resultsStore.setResults(results);
    resultsStore.completeMining();
    
    // Navigate to results
    router.push('/results');
    
  } catch (err) {
    console.error('Mining failed:', err);
    
    error.value = err.userMessage || err.message || 'Mining operation failed';
    resultsStore.completeMining(); // Stop loading state
  }
};

const retryMining = async () => {
  error.value = null;
  elapsedSeconds.value = 0;
  resultsStore.startMining();
  await startMining();
};

const checkStatus = async () => {
  try {
    // Try to fetch results to see if mining completed
    const results = await api.getMiningResults(sessionStore.sessionId);
    
    if (results) {
      resultsStore.setResults(results);
      resultsStore.completeMining();
      router.push('/results');
    } else {
      // Still processing
      alert('Mining is still in progress. Please wait a few more minutes.');
    }
  } catch (err) {
    console.error('Status check failed:', err);
    error.value = 'Unable to check mining status. Please try again.';
  }
};

const formatElapsedTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins === 0) {
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  }
  
  return `${mins} minute${mins !== 1 ? 's' : ''}, ${secs} second${secs !== 1 ? 's' : ''}`;
};
</script>

<style scoped>
.mining-status,
.error-state,
.timeout-state {
  max-width: 600px;
  margin: 0 auto;
}

.progress-info {
  margin: 2rem 0;
}

.mining-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
  max-width: 400px;
  margin: 2rem auto;
  text-align: left;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.step-item.step-active {
  opacity: 1;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.step-item.step-active .step-icon {
  background-color: #d1e7dd;
  color: #198754;
}

.step-text {
  font-size: 0.95rem;
  color: #495057;
}
</style>
