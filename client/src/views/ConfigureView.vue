<template>
  <div class="container mt-4">
    <h2>Configure Mining</h2>
    <p class="text-muted">Set mining parameters and start role discovery</p>
    
    <div class="alert alert-info">
      <strong>Placeholder View</strong> - This will be implemented in Phase 4
    </div>
    
    <div class="card">
      <div class="card-body">
        <h5>Mining Configuration</h5>
        <p>Configure parameters for the Leiden clustering algorithm</p>
        
        <div class="mt-3">
          <router-link to="/upload" class="btn btn-secondary me-2">
            Back to Upload
          </router-link>
          <button 
            class="btn btn-primary"
            @click="startMining"
          >
            Start Mining
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const startMining = () => {
  router.push('/processing');
};
</script>
