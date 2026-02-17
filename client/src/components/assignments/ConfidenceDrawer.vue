<!-- client/src/components/assignments/ConfidenceDrawer.vue -->
<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div v-if="show" class="drawer-backdrop" @click="$emit('close')"></div>
    </Transition>

    <!-- Drawer -->
    <Transition name="drawer">
      <div v-if="show" class="confidence-drawer">
        <!-- Header -->
        <div class="drawer-header">
          <div>
            <h5 class="mb-1">Confidence Breakdown</h5>
            <div class="assignment-info">
              <span class="badge bg-secondary">{{ data?.APP_ID }}</span>
              <span class="mx-2">→</span>
              <code class="text-muted">{{ data?.ENT_ID }}</code>
              <span class="mx-2">for</span>
              <strong>{{ data?.USR_ID }}</strong>
            </div>
          </div>
          <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
        </div>

        <!-- Content -->
        <div class="drawer-content">
          <!-- Justification -->
          <div class="justification-section">
            <div class="justification-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
              </svg>
            </div>
            <div class="justification-text">
              {{ data?.justification || 'No justification available' }}
            </div>
          </div>

          <!-- Confidence Breakdown -->
          <div class="breakdown-section">
            <h6 class="section-title">Confidence Score</h6>

            <div class="breakdown-grid">
              <!-- Overall Score -->
              <div class="breakdown-item overall">
                <div class="breakdown-label">Overall Confidence</div>
                <div class="breakdown-value">
                <span class="confidence-badge" :class="confidenceLevelClass">
                  {{ data?.confidence_level || 'UNKNOWN' }}
                </span>
                  <span class="confidence-score">{{ formatPercent(data?.confidence) }}</span>
                </div>
              </div>

              <!-- Individual Factors -->
              <div v-for="factor in factorScores" :key="factor.name" class="breakdown-item">
                <div class="breakdown-label">
                  {{ factor.label }}
                  <span v-if="factor.weight" class="factor-weight">(weight: {{ formatPercent(factor.weight) }})</span>
                  <span v-if="factor.value" class="attribute-value">= "{{ factor.value }}"</span>
                </div>
                <div class="breakdown-value">
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: formatPercent(factor.score) }"></div>
                  </div>
                  <span class="score-text">{{ formatPercent(factor.score) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Role & Tier Information -->
          <div v-if="data?.matched_role_id || data?.entitlement_tier" class="role-section">
            <h6 class="section-title">Role Information</h6>
            <div class="role-grid">
              <div v-if="data.entitlement_tier" class="role-item">
                <span class="role-label">Tier:</span>
                <span class="tier-badge" :class="tierClass">{{ formatTier(data.entitlement_tier) }}</span>
              </div>
              <div v-if="data.matched_role_id" class="role-item">
                <span class="role-label">Matched Role:</span>
                <span class="role-value">{{ data.matched_role_id }}</span>
              </div>
              <div v-if="data.cluster_size" class="role-item">
                <span class="role-label">Peer Group Size:</span>
                <span class="role-value">{{ data.cluster_size }} users</span>
              </div>
              <div v-if="data.peers_with_entitlement !== undefined" class="role-item">
                <span class="role-label">Peers with Access:</span>
                <span class="role-value">
                {{ data.peers_with_entitlement }}
                <span v-if="data.cluster_size" class="text-muted">
                  ({{ formatPercent(data.peers_with_entitlement / (data.cluster_size - 1)) }})
                </span>
              </span>
              </div>
              <div v-if="peerUsers.length > 0" class="role-item full-width">
                <span class="role-label">Peers in Role:</span>
                <div class="peer-list">
                <span
                    v-for="peer in peerUsers.slice(0, showAllPeers ? peerUsers.length : 20)"
                    :key="peer"
                    class="peer-badge"
                >
                  {{ peer }}
                </span>
                  <button
                      v-if="peerUsers.length > 20"
                      class="btn btn-sm btn-link p-0 ms-2"
                      @click="showAllPeers = !showAllPeers"
                  >
                    {{ showAllPeers ? 'Show less' : `Show all ${peerUsers.length}` }}
                  </button>
                </div>
              </div>
              <div v-if="data.global_prevalence" class="role-item">
                <span class="role-label">Global Prevalence:</span>
                <span class="role-value">{{ formatPercent(data.global_prevalence) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: null
  }
});

defineEmits(['close']);

const showAllPeers = ref(false);

// Parse peer users from comma-separated string
const peerUsers = computed(() => {
  if (!props.data?.peer_users) return [];
  return props.data.peer_users.split(',').filter(Boolean);
});

// Parse weights_used from string to object
const weightsUsed = computed(() => {
  if (!props.data?.weights_used) return {};
  try {
    const cleaned = props.data.weights_used
        .replace(/'/g, '"')
        .replace(/None/g, 'null');
    return JSON.parse(cleaned);
  } catch (e) {
    return {};
  }
});

// Extract factor scores from data
const factorScores = computed(() => {
  if (!props.data) return [];

  const factors = [];

  // Peer group
  if (props.data.peer_group_score !== undefined && props.data.peer_group_score !== null) {
    factors.push({
      name: 'peer_group',
      label: 'Peer Group',
      score: props.data.peer_group_score,
      weight: weightsUsed.value.peer_group
    });
  }

  // User attributes - dynamically detect all _score columns
  // Exclude system scores (peer_group, role_coverage, drift_stability)
  const excludedScores = ['peer_group_score', 'role_coverage_score', 'drift_stability_score'];

  for (const key in props.data) {
    if (key.endsWith('_score') && !excludedScores.includes(key)) {
      const score = props.data[key];
      if (score !== undefined && score !== null && score !== 0) {
        const attrName = key.replace('_score', '');

        // Get the actual attribute value from the data
        const attrValue = props.data[attrName] || null;

        factors.push({
          name: attrName,
          label: formatAttributeName(attrName),
          score: score,
          weight: weightsUsed.value[attrName],
          value: attrValue  // The actual value (e.g., "Engineering", "San Francisco")
        });
      }
    }
  }

  // Role coverage
  if (props.data.role_coverage_score !== undefined && props.data.role_coverage_score !== null) {
    factors.push({
      name: 'role_coverage',
      label: 'Role Coverage',
      score: props.data.role_coverage_score,
      weight: weightsUsed.value.role_coverage
    });
  }

  // Drift stability - HIDDEN as requested

  return factors;
});

const confidenceLevelClass = computed(() => {
  const level = props.data?.confidence_level;
  if (level === 'HIGH') return 'badge-high';
  if (level === 'MEDIUM') return 'badge-medium';
  if (level === 'LOW') return 'badge-low';
  return '';
});

const tierClass = computed(() => {
  const tier = props.data?.entitlement_tier;
  if (tier === 'core') return 'tier-core';
  if (tier === 'common') return 'tier-common';
  if (tier === 'birthright') return 'tier-birthright';
  return 'tier-residual';
});

// Formatting helpers
const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${(value * 100).toFixed(0)}%`;
};

const formatAttributeName = (name) => {
  return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
};

const formatTier = (tier) => {
  if (!tier) return 'Unknown';
  return tier.charAt(0).toUpperCase() + tier.slice(1);
};
</script>

<style scoped>
/* Backdrop */
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

/* Drawer */
.confidence-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 600px;
  max-width: 90vw;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 1050;
  display: flex;
  flex-direction: column;
}

/* Header */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  flex-shrink: 0;
}

.drawer-header h5 {
  margin: 0;
  font-weight: 600;
}

.assignment-info {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

/* Content */
.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Justification Section */
.justification-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-left: 4px solid #0d6efd;
  border-radius: 4px;
}

.justification-icon {
  flex-shrink: 0;
  color: #0d6efd;
}

.justification-text {
  flex: 1;
  line-height: 1.6;
  color: #212529;
}

/* Breakdown Section */
.breakdown-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6c757d;
  margin-bottom: 0.75rem;
  letter-spacing: 0.5px;
}

.breakdown-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.breakdown-item {
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.breakdown-item.overall {
  background-color: #e7f3ff;
  border-color: #0d6efd;
}

.breakdown-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.factor-weight {
  font-size: 0.75rem;
  color: #adb5bd;
  font-weight: normal;
}

.attribute-value {
  display: block;
  font-size: 0.875rem;
  color: #212529;
  font-weight: 600;
  margin-top: 0.25rem;
  font-family: monospace;
}

.breakdown-value {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Confidence Badge */
.confidence-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-high {
  background-color: #198754;
  color: white;
}

.badge-medium {
  background-color: #ffc107;
  color: #000;
}

.badge-low {
  background-color: #dc3545;
  color: white;
}

.confidence-score {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
}

/* Score Bar */
.score-bar {
  flex: 1;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #0d6efd 0%, #0dcaf0 100%);
  transition: width 0.3s ease;
}

.score-text {
  font-weight: 600;
  color: #495057;
  min-width: 45px;
  text-align: right;
}

/* Role Section */
.role-section {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.role-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.role-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.role-item.full-width {
  grid-column: 1 / -1;
}

.role-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.role-value {
  font-size: 0.875rem;
  color: #212529;
}

/* Peer List */
.peer-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
  align-items: center;
}

.peer-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #e9ecef;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
  color: #495057;
}

/* Tier Badge */
.tier-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tier-core {
  background-color: #d1e7dd;
  color: #0f5132;
}

.tier-common {
  background-color: #cff4fc;
  color: #055160;
}

.tier-birthright {
  background-color: #e2e3e5;
  color: #41464b;
}

.tier-residual {
  background-color: #f8d7da;
  color: #842029;
}

/* Transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>