<template>
  <div class="session-card card" :class="{ 'card-active': isActive }">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 class="card-title mb-1">
            {{ sessionTitle }}
          </h5>
          <p class="card-subtitle text-muted mb-0">
            <small>Session ID: {{ sessionId.slice(0, 8) }}...</small>
          </p>
        </div>
        
        <span 
          class="badge"
          :class="statusBadgeClass"
        >
          {{ statusText }}
        </span>
      </div>
      
      <!-- Session Info -->
      <div class="session-info mb-3">
        <div class="info-row">
          <span class="info-label">Created:</span>
          <span class="info-value">{{ formatDate(createdAt) }}</span>
        </div>
        
        <div v-if="lastActivity" class="info-row">
          <span class="info-label">Last Activity:</span>
          <span class="info-value">{{ formatDate(lastActivity) }}</span>
        </div>
      </div>
      
      <!-- Upload Progress -->
      <div v-if="showProgress" class="upload-progress mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <small class="text-muted">Upload Progress</small>
          <small class="text-muted">{{ uploadedCount }}/3 files</small>
        </div>
        
        <div class="progress" style="height: 6px;">
          <div 
            class="progress-bar"
            :class="progressBarClass"
            :style="{ width: uploadProgress + '%' }"
            role="progressbar"
            :aria-valuenow="uploadProgress"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
        
        <div class="file-checklist mt-2">
          <div class="file-check-item">
            <span 
              class="file-check-icon"
              :class="{ 'text-success': hasIdentities, 'text-muted': !hasIdentities }"
            >
              {{ hasIdentities ? '✓' : '○' }}
            </span>
            <span class="file-check-label">Identities</span>
          </div>
          <div class="file-check-item">
            <span 
              class="file-check-icon"
              :class="{ 'text-success': hasAssignments, 'text-muted': !hasAssignments }"
            >
              {{ hasAssignments ? '✓' : '○' }}
            </span>
            <span class="file-check-label">Assignments</span>
          </div>
          <div class="file-check-item">
            <span 
              class="file-check-icon"
              :class="{ 'text-success': hasEntitlements, 'text-muted': !hasEntitlements }"
            >
              {{ hasEntitlements ? '✓' : '○' }}
            </span>
            <span class="file-check-label">Entitlements</span>
          </div>
        </div>
      </div>
      
      <!-- Stats (if completed) -->
      <div v-if="stats" class="session-stats mb-3">
        <div class="row g-2">
          <div class="col-4">
            <div class="stat-box">
              <div class="stat-value">{{ formatNumber(stats.total_users) }}</div>
              <div class="stat-label">Users</div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-box">
              <div class="stat-value">{{ formatNumber(stats.total_entitlements) }}</div>
              <div class="stat-label">Entitlements</div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-box">
              <div class="stat-value">{{ formatNumber(stats.roles_discovered || 0) }}</div>
              <div class="stat-label">Roles</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="card-actions d-flex gap-2">
        <button
          v-if="canContinue"
          class="btn btn-primary flex-grow-1"
          @click="$emit('continue')"
        >
          Continue
        </button>
        
        <button
          v-if="canViewResults"
          class="btn btn-success flex-grow-1"
          @click="$emit('view-results')"
        >
          View Results
        </button>
        
        <button
          class="btn btn-outline-danger"
          @click="handleDelete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Confirm Delete Modal -->
    <ConfirmDialog
      v-if="showDeleteConfirm"
      title="Delete Session?"
      message="Are you sure you want to delete this session? All uploaded files and results will be lost."
      confirmText="Delete"
      confirmVariant="danger"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const props = defineProps({
  sessionId: {
    type: String,
    required: true
  },
  sessionTitle: {
    type: String,
    default: 'Mining Session'
  },
  status: {
    type: String,
    required: true,
    validator: (value) => ['created', 'uploading', 'ready', 'processing', 'completed', 'error'].includes(value)
  },
  createdAt: {
    type: String,
    required: true
  },
  lastActivity: {
    type: String,
    default: null
  },
  hasIdentities: {
    type: Boolean,
    default: false
  },
  hasAssignments: {
    type: Boolean,
    default: false
  },
  hasEntitlements: {
    type: Boolean,
    default: false
  },
  stats: {
    type: Object,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['continue', 'view-results', 'delete']);

const showDeleteConfirm = ref(false);

// Computed properties
const uploadedCount = computed(() => {
  let count = 0;
  if (props.hasIdentities) count++;
  if (props.hasAssignments) count++;
  if (props.hasEntitlements) count++;
  return count;
});

const uploadProgress = computed(() => {
  return (uploadedCount.value / 3) * 100;
});

const showProgress = computed(() => {
  return ['created', 'uploading', 'ready'].includes(props.status);
});

const canContinue = computed(() => {
  return ['created', 'uploading', 'ready'].includes(props.status);
});

const canViewResults = computed(() => {
  return props.status === 'completed';
});

const statusText = computed(() => {
  const statusMap = {
    created: 'Created',
    uploading: 'Uploading',
    ready: 'Ready',
    processing: 'Processing',
    completed: 'Completed',
    error: 'Error'
  };
  return statusMap[props.status] || props.status;
});

const statusBadgeClass = computed(() => {
  const classMap = {
    created: 'bg-secondary',
    uploading: 'bg-info',
    ready: 'bg-warning',
    processing: 'bg-primary',
    completed: 'bg-success',
    error: 'bg-danger'
  };
  return classMap[props.status] || 'bg-secondary';
});

const progressBarClass = computed(() => {
  if (uploadedCount.value === 3) return 'bg-success';
  if (uploadedCount.value > 0) return 'bg-info';
  return 'bg-secondary';
});

// Handlers
const handleDelete = () => {
  showDeleteConfirm.value = true;
};

const confirmDelete = () => {
  showDeleteConfirm.value = false;
  emit('delete', props.sessionId);
};

// Formatters
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
};
</script>

<style scoped>
.session-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.session-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.session-card.card-active {
  border-color: #0d6efd;
  background-color: #f8f9fa;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
}

.session-info {
  border-top: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
  padding: 0.75rem 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #6c757d;
}

.info-value {
  color: #212529;
  font-weight: 500;
}

.file-checklist {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.file-check-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.file-check-icon {
  font-weight: bold;
  font-size: 1rem;
}

.file-check-label {
  color: #6c757d;
}

.session-stats {
  border-top: 1px solid #dee2e6;
  padding-top: 0.75rem;
}

.stat-box {
  text-align: center;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-actions {
  margin-top: 1rem;
}
</style>
