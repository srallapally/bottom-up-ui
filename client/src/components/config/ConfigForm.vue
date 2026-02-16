<template>
  <div class="config-form">
    <form @submit.prevent="handleSubmit">
      <!-- Birthright Detection Section -->
      <div class="config-section">
        <h5 class="section-title">Birthright Detection</h5>
        <p class="section-description text-muted">
          Identify entitlements that most users have (e.g., email, basic system access)
        </p>
        
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Birthright Threshold
                <InfoTooltip 
                  text="Percentage of users required to classify as birthright (e.g., 0.8 = 80%)"
                />
              </label>
              <input
                type="range"
                class="form-range"
                v-model.number="localConfig.birthright_threshold"
                :min="0.5"
                :max="1.0"
                :step="0.05"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">50%</small>
                <strong>{{ (localConfig.birthright_threshold * 100).toFixed(0) }}%</strong>
                <small class="text-muted">100%</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Leiden Clustering Section -->
      <div class="config-section">
        <h5 class="section-title">Entitlement Clustering</h5>
        <p class="section-description text-muted">
          Group similar entitlements based on co-occurrence patterns
        </p>
        
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Minimum Similarity
                <InfoTooltip 
                  text="Minimum Jaccard similarity to connect entitlements (0.3 recommended)"
                />
              </label>
              <input
                type="range"
                class="form-range"
                v-model.number="localConfig.leiden_min_similarity"
                :min="0.2"
                :max="0.7"
                :step="0.05"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">0.2</small>
                <strong>{{ localConfig.leiden_min_similarity.toFixed(2) }}</strong>
                <small class="text-muted">0.7</small>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Clustering Resolution
                <InfoTooltip 
                  text="Higher values create more/smaller roles, lower creates fewer/larger roles"
                />
              </label>
              <input
                type="range"
                class="form-range"
                v-model.number="localConfig.leiden_resolution"
                :min="0.3"
                :max="3.0"
                :step="0.1"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">0.3</small>
                <strong>{{ localConfig.leiden_resolution.toFixed(1) }}</strong>
                <small class="text-muted">3.0</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Role Building Section -->
      <div class="config-section">
        <h5 class="section-title">Role Building</h5>
        <p class="section-description text-muted">
          Define role size and user assignment criteria
        </p>
        
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Minimum Role Size
                <InfoTooltip 
                  text="Minimum users required for a role (smaller roles are discarded)"
                />
              </label>
              <input
                type="range"
                class="form-range"
                v-model.number="localConfig.min_role_size"
                :min="5"
                :max="50"
                :step="5"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">5</small>
                <strong>{{ localConfig.min_role_size }}</strong>
                <small class="text-muted">50</small>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Minimum Coverage
                <InfoTooltip 
                  text="Minimum % of role entitlements user must have (0.5 = 50%)"
                />
              </label>
              <input
                type="range"
                class="form-range"
                v-model.number="localConfig.min_entitlement_coverage"
                :min="0.3"
                :max="0.9"
                :step="0.05"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">30%</small>
                <strong>{{ (localConfig.min_entitlement_coverage * 100).toFixed(0) }}%</strong>
                <small class="text-muted">90%</small>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Max Roles Per User
                <InfoTooltip 
                  text="Maximum number of roles one user can belong to"
                />
              </label>
              <input
                type="range"
                class="form-range"
                v-model.number="localConfig.max_clusters_per_user"
                :min="1"
                :max="10"
                :step="1"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">1</small>
                <strong>{{ localConfig.max_clusters_per_user }}</strong>
                <small class="text-muted">10</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Confidence Scoring Section -->
      <div class="config-section">
        <h5 class="section-title">Confidence Scoring</h5>
        <p class="section-description text-muted">
          Set thresholds for HIGH/MEDIUM/LOW confidence labels
        </p>
        
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                High Confidence Threshold
                <InfoTooltip 
                  text="Confidence score above this is marked HIGH (0.8 = 80%)"
                />
              </label>
              <input
                type="range"
                class="form-range"
                v-model.number="localConfig.confidence_high_threshold"
                :min="0.6"
                :max="1.0"
                :step="0.05"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">60%</small>
                <strong>{{ (localConfig.confidence_high_threshold * 100).toFixed(0) }}%</strong>
                <small class="text-muted">100%</small>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Medium Confidence Threshold
                <InfoTooltip 
                  text="Confidence score above this is marked MEDIUM"
                />
              </label>
              <input
                type="range"
                class="form-range"
                v-model.number="localConfig.confidence_medium_threshold"
                :min="0.3"
                :max="0.8"
                :step="0.05"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">30%</small>
                <strong>{{ (localConfig.confidence_medium_threshold * 100).toFixed(0) }}%</strong>
                <small class="text-muted">80%</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Form Actions -->
      <div class="form-actions d-flex justify-content-between">
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="handleReset"
        >
          Reset to Defaults
        </button>
        
        <div>
          <button
            v-if="showCancel"
            type="button"
            class="btn btn-secondary me-2"
            @click="$emit('cancel')"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status">
              <span class="visually-hidden">Saving...</span>
            </span>
            {{ submitLabel }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import InfoTooltip from './InfoTooltip.vue';

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  submitLabel: {
    type: String,
    default: 'Save Configuration'
  },
  showCancel: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);

// Default configuration
const DEFAULT_CONFIG = {
  birthright_threshold: 0.8,
  leiden_min_similarity: 0.3,
  leiden_resolution: 1.0,
  min_role_size: 10,
  min_entitlement_coverage: 0.5,
  max_clusters_per_user: 5,
  confidence_high_threshold: 0.8,
  confidence_medium_threshold: 0.5
};

// Local config state
const localConfig = ref({ ...DEFAULT_CONFIG, ...props.config });

// Watch for external config changes
watch(
  () => props.config,
  (newConfig) => {
    localConfig.value = { ...DEFAULT_CONFIG, ...newConfig };
  },
  { deep: true }
);

// Form handlers
const handleSubmit = () => {
  emit('submit', { ...localConfig.value });
};

const handleReset = () => {
  localConfig.value = { ...DEFAULT_CONFIG };
};
</script>

<style scoped>
.config-form {
  max-width: 800px;
}

.config-section {
  padding: 1.5rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  background-color: #fff;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #212529;
}

.section-description {
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-range {
  margin-bottom: 0.25rem;
}

.form-actions {
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
  margin-top: 1.5rem;
}
</style>
