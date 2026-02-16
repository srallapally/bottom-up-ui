<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">System Health Check</h5>
    </div>
    <div class="card-body">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Checking health...</span>
        </div>
        <p class="mt-2 text-muted">Checking system health...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        <strong>Health Check Failed</strong>
        <p class="mb-0">{{ error }}</p>
        <button class="btn btn-sm btn-danger mt-2" @click="checkHealth">
          Retry
        </button>
      </div>
      
      <div v-else-if="healthData">
        <!-- Express Server Status -->
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>Express Server</strong>
              <div class="text-muted small">Node.js middleware</div>
            </div>
            <span :class="statusBadgeClass(healthData.express)">
              {{ healthData.express }}
            </span>
          </div>
        </div>
        
        <hr>
        
        <!-- Flask Backend Status -->
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>Flask Backend</strong>
              <div class="text-muted small">{{ healthData.flaskUrl }}</div>
            </div>
            <span :class="statusBadgeClass(healthData.flask)">
              {{ typeof healthData.flask === 'string' ? healthData.flask : 'ok' }}
            </span>
          </div>
          
          <!-- Flask Details -->
          <div v-if="healthData.flask && typeof healthData.flask === 'object'" class="mt-2 ps-3">
            <div class="text-muted small">
              <div>Status: {{ healthData.flask.status }}</div>
              <div v-if="healthData.flask.timestamp">
                Timestamp: {{ new Date(healthData.flask.timestamp).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>
        
        <hr>
        
        <!-- Authentication Status -->
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>Authentication</strong>
              <div class="text-muted small">Session status</div>
            </div>
            <span :class="healthData.authenticated ? 'badge bg-success' : 'badge bg-warning'">
              {{ healthData.authenticated ? 'Authenticated' : 'Not Authenticated' }}
            </span>
          </div>
          
          <!-- User Details -->
          <div v-if="healthData.user" class="mt-2 ps-3">
            <div class="text-muted small">
              <div>User ID: {{ healthData.user.id }}</div>
              <div>Email: {{ healthData.user.email }}</div>
            </div>
          </div>
        </div>
        
        <!-- Last Checked -->
        <div class="text-center mt-4">
          <button class="btn btn-sm btn-outline-primary" @click="checkHealth">
            <i class="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <div class="text-muted small mt-2">
            Last checked: {{ lastChecked.toLocaleTimeString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const loading = ref(false);
const error = ref(null);
const healthData = ref(null);
const lastChecked = ref(new Date());

const checkHealth = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    healthData.value = await api.health();
    lastChecked.value = new Date();
  } catch (err) {
    error.value = err.userMessage || 'Failed to check health';
    healthData.value = null;
  } finally {
    loading.value = false;
  }
};

const statusBadgeClass = (status) => {
  if (!status) return 'badge bg-secondary';
  
  const statusStr = typeof status === 'string' ? status : status.status;
  
  if (statusStr === 'ok' || statusStr === 'healthy') {
    return 'badge bg-success';
  }
  if (statusStr === 'unavailable' || statusStr === 'error') {
    return 'badge bg-danger';
  }
  return 'badge bg-warning';
};

onMounted(() => {
  checkHealth();
});
</script>

<style scoped>
.card {
  max-width: 600px;
  margin: 2rem auto;
}
</style>
