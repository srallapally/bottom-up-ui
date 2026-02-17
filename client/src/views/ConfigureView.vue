<template>
  <div class="container mt-4">
    <div class="mb-4">
      <h2 class="mb-1">Configure Mining</h2>
      <p class="text-muted mb-0">Set mining parameters and start role discovery</p>
    </div>

    <!-- Session Info Card -->
    <div v-if="sessionStore.processedStats" class="card mb-4">
      <div class="card-body">
        <h6 class="card-title mb-3">Dataset Summary</h6>

        <div class="row g-3">
          <div class="col-md-3">
            <div class="stat-item">
              <div class="stat-value">{{ formatNumber(sessionStore.processedStats.total_users) }}</div>
              <div class="stat-label">Users</div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-item">
              <div class="stat-value">{{ formatNumber(sessionStore.processedStats.total_entitlements) }}</div>
              <div class="stat-label">Entitlements</div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-item">
              <div class="stat-value">{{ formatNumber(sessionStore.processedStats.total_assignments) }}</div>
              <div class="stat-label">Assignments</div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-item">
              <div class="stat-value">{{ sessionStore.processedStats.apps?.length || 0 }}</div>
              <div class="stat-label">Applications</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuration Form -->
    <div class="card">
      <div class="card-body">
        <ConfigForm
            :config="currentConfig"
            :loading="isSaving"
            submit-label="Start Mining"
            show-cancel
            @submit="handleStartMining"
            @cancel="handleCancel"
        />
      </div>
    </div>

    <!-- Info Alert -->
    <div class="alert alert-info mt-4" role="alert">
      <div class="d-flex align-items-start">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="me-2 flex-shrink-0" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg>
        <div>
          <strong>About Role Mining</strong>
          <p class="mb-0 small">
            This system uses a hybrid approach combining Leiden clustering for entitlement discovery
            with multi-factor confidence scoring. Mining typically takes 2-3 minutes for datasets with
            50,000+ users.
          </p>
        </div>
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
import { useSessionStore } from '@/stores/session';
import { useResultsStore } from '@/stores/results';
import ConfigForm from '@/components/config/ConfigForm.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';

const router = useRouter();
const sessionStore = useSessionStore();
const resultsStore = useResultsStore();

const currentConfig = ref({
  birthright_threshold: 0.8,
  leiden_min_similarity: 0.3,
  leiden_min_shared_users: 3,
  leiden_resolution: 1.0,
  min_role_size: 10,
  min_entitlement_coverage: 0.5,
  min_absolute_overlap: 2,
  max_clusters_per_user: 5,
  min_entitlements_per_role: 2,
  user_attributes: [],
  entitlement_prevalence_threshold: 0.75,
  entitlement_association_threshold: 0.40,
  birthright_promotion_threshold: 0.50,
  role_merge_similarity_threshold: 0.70,
  confidence_high_threshold: 0.8,
  confidence_medium_threshold: 0.5
});

const isSaving = ref(false);

// Load existing config on mount
onMounted(async () => {
  if (!sessionStore.hasSession) {
    router.push('/dashboard');
    return;
  }

  if (!sessionStore.allFilesUploaded) {
    router.push('/upload');
    return;
  }

  // Try to load existing config from session
  try {
    const config = await sessionStore.getConfig();
    if (config) {
      currentConfig.value = { ...currentConfig.value, ...config };
    }
  } catch (error) {
    console.warn('No existing config, using defaults:', error);
  }
});

// Start mining with config
const handleStartMining = async (config) => {
  isSaving.value = true;

  try {
    // Save config to session
    await sessionStore.saveConfig(config);

    // Start mining process
    //resultsStore.startMining();

    // Navigate to processing view
    router.push('/processing');

  } catch (error) {
    console.error('Failed to start mining:', error);
    sessionStore.error = error.userMessage || 'Failed to start mining';
  } finally {
    isSaving.value = false;
  }
};

// Cancel and go back
const handleCancel = () => {
  router.push('/upload');
};

// Formatter
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
};
</script>

<style scoped>
.stat-item {
  text-align: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}
</style>