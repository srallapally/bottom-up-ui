<template>
  <div class="container mt-4">
    <h2>Mining in Progress</h2>
    <p class="text-muted">Role discovery is running (approximately 3 minutes)</p>
    
    <div class="alert alert-info">
      <strong>Placeholder View</strong> - This will be implemented in Phase 4
    </div>
    
    <div class="card text-center">
      <div class="card-body py-5">
        <div class="spinner-border text-primary mb-3" style="width: 4rem; height: 4rem;" role="status">
          <span class="visually-hidden">Mining in progress...</span>
        </div>
        <h5>Mining in Progress</h5>
        <p class="text-muted">
          Running Leiden clustering algorithm...
          <br>
          This may take 2-3 minutes.
        </p>
        
        <div v-if="resultsStore.isMining && resultsStore.miningStartTime" class="mt-3">
          <p class="small text-muted">
            Started {{ Math.round((Date.now() - resultsStore.miningStartTime) / 1000) }} seconds ago
          </p>
        </div>
        
        <button 
          class="btn btn-success mt-3"
          @click="goToResults"
        >
          Simulate Complete - View Results
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useResultsStore } from '@/stores/results';

const router = useRouter();
const resultsStore = useResultsStore();

const goToResults = () => {
  router.push('/results');
};
</script>
