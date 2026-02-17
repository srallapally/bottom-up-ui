<template>
  <div class="config-form">
    <form @submit.prevent="handleSubmit">
      <!-- Universal Access Section (was: Birthright Detection) -->
      <div class="config-section">
        <h5 class="section-title">Universal Access Detection</h5>
        <p class="section-description text-muted">
          Find access that nearly everyone has, like email or VPN — these become your baseline role
        </p>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Universal Access Threshold
                <InfoTooltip
                    text="What % of users must have an access for it to be considered universal? (80% = 4 out of 5 users)"
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

      <!-- User Attributes Section (NEW for V2) -->
      <div class="config-section">
        <h5 class="section-title">User Attributes for Confidence Scoring</h5>
        <p class="section-description text-muted">
          Select 2-5 identity attributes (department, location, job title, etc.) to weight role assignments
        </p>

        <UserAttributesConfig v-model="localConfig.user_attributes" />
      </div>

      <!-- Access Pattern Discovery Section (was: Entitlement Clustering) -->
      <div class="config-section">
        <h5 class="section-title">Access Pattern Discovery</h5>
        <p class="section-description text-muted">
          Find groups of access rights that are commonly granted together
        </p>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                How closely related must access rights be?
                <InfoTooltip
                    text="Higher = stricter grouping (only very similar access is grouped). Lower = broader groups"
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
                <small class="text-muted">Broader</small>
                <strong>{{ localConfig.leiden_min_similarity.toFixed(2) }}</strong>
                <small class="text-muted">Stricter</small>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Minimum Shared Users
                <InfoTooltip
                    text="Require at least this many users to share entitlements before grouping them"
                />
              </label>
              <input
                  type="range"
                  class="form-range"
                  v-model.number="localConfig.leiden_min_shared_users"
                  :min="2"
                  :max="10"
                  :step="1"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">2 users</small>
                <strong>{{ localConfig.leiden_min_shared_users }} users</strong>
                <small class="text-muted">10 users</small>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Role Granularity
                <InfoTooltip
                    text="More = many focused roles. Less = fewer broad roles"
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
                <small class="text-muted">Fewer broad roles</small>
                <strong>{{ localConfig.leiden_resolution.toFixed(1) }}</strong>
                <small class="text-muted">Many focused roles</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Role Size & Assignment Section (was: Role Building) -->
      <div class="config-section">
        <h5 class="section-title">Role Size &amp; Assignment</h5>
        <p class="section-description text-muted">
          Control how roles are constructed and who gets assigned to them
        </p>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Smallest Allowed Role
                <InfoTooltip
                    text="Roles with fewer users than this are discarded as too niche"
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
                <small class="text-muted">5 users</small>
                <strong>{{ localConfig.min_role_size }} users</strong>
                <small class="text-muted">50 users</small>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                How well must a user match a role?
                <InfoTooltip
                    text="A user must have at least this % of a role's access to be assigned to it"
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
                Maximum Roles Per Person
                <InfoTooltip
                    text="Limit how many roles one person can hold"
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

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Minimum Absolute Overlap
                <InfoTooltip
                    text="User must match at least this many entitlements (floor requirement)"
                />
              </label>
              <input
                  type="range"
                  class="form-range"
                  v-model.number="localConfig.min_absolute_overlap"
                  :min="1"
                  :max="10"
                  :step="1"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">1</small>
                <strong>{{ localConfig.min_absolute_overlap }}</strong>
                <small class="text-muted">10</small>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Minimum Entitlements Per Role
                <InfoTooltip
                    text="Roles with fewer entitlements are discarded as too simple"
                />
              </label>
              <input
                  type="range"
                  class="form-range"
                  v-model.number="localConfig.min_entitlements_per_role"
                  :min="2"
                  :max="10"
                  :step="1"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">2</small>
                <strong>{{ localConfig.min_entitlements_per_role }}</strong>
                <small class="text-muted">10</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Prevalence-Based Role Overlap Section (NEW for V2) -->
      <div class="config-section">
        <h5 class="section-title">Prevalence-Based Role Overlap</h5>
        <p class="section-description text-muted">
          Control how entitlements are classified within roles and detect role merge candidates
        </p>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Core Entitlement Threshold
                <InfoTooltip
                    text="What % of role members must have an entitlement for it to be 'core' to the role?"
                />
              </label>
              <input
                  type="range"
                  class="form-range"
                  v-model.number="localConfig.entitlement_prevalence_threshold"
                  :min="0.5"
                  :max="1.0"
                  :step="0.05"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">50%</small>
                <strong>{{ (localConfig.entitlement_prevalence_threshold * 100).toFixed(0) }}%</strong>
                <small class="text-muted">100%</small>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Common Entitlement Threshold
                <InfoTooltip
                    text="Entitlements between this and core threshold are 'common' but not required"
                />
              </label>
              <input
                  type="range"
                  class="form-range"
                  v-model.number="localConfig.entitlement_association_threshold"
                  :min="0.2"
                  :max="0.8"
                  :step="0.05"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">20%</small>
                <strong>{{ (localConfig.entitlement_association_threshold * 100).toFixed(0) }}%</strong>
                <small class="text-muted">80%</small>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Birthright Promotion Threshold
                <InfoTooltip
                    text="If entitlement is core in this % of roles, flag it for universal access"
                />
              </label>
              <input
                  type="range"
                  class="form-range"
                  v-model.number="localConfig.birthright_promotion_threshold"
                  :min="0.3"
                  :max="0.8"
                  :step="0.05"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">30%</small>
                <strong>{{ (localConfig.birthright_promotion_threshold * 100).toFixed(0) }}%</strong>
                <small class="text-muted">80%</small>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                Role Merge Similarity Threshold
                <InfoTooltip
                    text="If two roles have this much core entitlement overlap, flag for potential merge"
                />
              </label>
              <input
                  type="range"
                  class="form-range"
                  v-model.number="localConfig.role_merge_similarity_threshold"
                  :min="0.5"
                  :max="0.9"
                  :step="0.05"
              />
              <div class="d-flex justify-content-between">
                <small class="text-muted">50%</small>
                <strong>{{ (localConfig.role_merge_similarity_threshold * 100).toFixed(0) }}%</strong>
                <small class="text-muted">90%</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Confidence Thresholds Section (was: Confidence Scoring) -->
      <div class="config-section">
        <h5 class="section-title">Confidence Thresholds</h5>
        <p class="section-description text-muted">
          Control how assignments are rated — HIGH confidence means strong evidence the access is appropriate
        </p>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">
                High Confidence Cutoff
                <InfoTooltip
                    text="Assignments scored above this are marked HIGH — safe to auto-approve"
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
                Medium Confidence Cutoff
                <InfoTooltip
                    text="Assignments between this and the high cutoff need manual review"
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
import UserAttributesConfig from './UserAttributesConfig.vue';

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