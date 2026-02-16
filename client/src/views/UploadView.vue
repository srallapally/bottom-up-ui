<template>
  <div class="container mt-4">
    <h2>Upload Files</h2>
    <p class="text-muted">Upload identities, assignments, and entitlements CSV files</p>
    
    <div class="alert alert-info">
      <strong>Placeholder View</strong> - This will be implemented in Phase 4
    </div>
    
    <div class="card">
      <div class="card-body">
        <h5>Upload Progress</h5>
        <p><strong>Files Uploaded:</strong> {{ sessionStore.uploadedFileCount }}/3</p>
        
        <ul class="list-group">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Identities
            <span :class="sessionStore.hasIdentities ? 'badge bg-success' : 'badge bg-secondary'">
              {{ sessionStore.hasIdentities ? 'Uploaded' : 'Pending' }}
            </span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Assignments
            <span :class="sessionStore.hasAssignments ? 'badge bg-success' : 'badge bg-secondary'">
              {{ sessionStore.hasAssignments ? 'Uploaded' : 'Pending' }}
            </span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Entitlements
            <span :class="sessionStore.hasEntitlements ? 'badge bg-success' : 'badge bg-secondary'">
              {{ sessionStore.hasEntitlements ? 'Uploaded' : 'Pending' }}
            </span>
          </li>
        </ul>
        
        <div class="mt-3">
          <router-link to="/dashboard" class="btn btn-secondary me-2">
            Back to Dashboard
          </router-link>
          <button 
            v-if="sessionStore.allFilesUploaded"
            class="btn btn-primary"
            @click="goToConfigure"
          >
            Continue to Configure
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useSessionStore } from '@/stores/session';

const router = useRouter();
const sessionStore = useSessionStore();

const goToConfigure = () => {
  router.push('/configure');
};
</script>
