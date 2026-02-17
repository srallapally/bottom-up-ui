<template>
  <div class="user-attributes-config">
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2 mb-0">Loading identity columns...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div v-else-if="availableColumns.length === 0" class="alert alert-warning" role="alert">
      No identity columns available. Please upload identities.csv first.
    </div>

    <div v-else>
      <p class="text-muted mb-3">
        Select 2-5 attributes from your identity data for confidence scoring.
        Weights will be automatically balanced if not specified.
      </p>

      <div class="attributes-list">
        <div
            v-for="column in availableColumns"
            :key="column"
            class="attribute-item"
            :class="{ 'selected': isSelected(column) }"
        >
          <div class="attribute-checkbox">
            <input
                type="checkbox"
                class="form-check-input"
                :id="`attr-${column}`"
                :value="column"
                :checked="isSelected(column)"
                @change="toggleAttribute(column)"
                :disabled="!isSelected(column) && selectedCount >= 5"
            />
            <label class="form-check-label" :for="`attr-${column}`">
              {{ column }}
            </label>
          </div>

          <div v-if="isSelected(column)" class="attribute-weight">
            <label class="form-label">Weight</label>
            <input
                type="range"
                class="form-range form-range-sm"
                :value="getWeight(column)"
                @input="updateWeight(column, $event.target.value)"
                :min="0.1"
                :max="1.0"
                :step="0.05"
            />
            <span class="weight-value">{{ (getWeight(column) * 100).toFixed(0) }}%</span>
          </div>
        </div>
      </div>

      <div class="mt-3">
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">
            Selected: {{ selectedCount }} / 5
            <span v-if="selectedCount < 2" class="text-danger">(minimum 2 required)</span>
          </small>
          <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="autoBalance"
              :disabled="selectedCount === 0"
          >
            Auto-balance Weights
          </button>
        </div>

        <div v-if="weightSum !== 1.0" class="alert alert-warning mt-2 mb-0" role="alert">
          <small>⚠ Weights must sum to 100% (currently {{ (weightSum * 100).toFixed(0) }}%)</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useSessionStore } from '@/stores/session';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

const sessionStore = useSessionStore();
const loading = ref(true);
const error = ref(null);
const availableColumns = ref([]);
const selectedAttributes = ref(new Map());

// Initialize from modelValue
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.length > 0) {
    selectedAttributes.value = new Map(
        newVal.map(attr => [attr.column, attr.weight || 0])
    );
  }
}, { immediate: true });

// Computed properties
const selectedCount = computed(() => selectedAttributes.value.size);

const weightSum = computed(() => {
  let sum = 0;
  selectedAttributes.value.forEach(weight => {
    sum += parseFloat(weight);
  });
  return Math.round(sum * 100) / 100; // Round to 2 decimals
});

// Methods
const isSelected = (column) => selectedAttributes.value.has(column);

const getWeight = (column) => selectedAttributes.value.get(column) || 0;

const toggleAttribute = (column) => {
  if (selectedAttributes.value.has(column)) {
    selectedAttributes.value.delete(column);
  } else {
    // Add with equal weight distribution
    const newWeight = 1.0 / (selectedAttributes.value.size + 1);
    selectedAttributes.value.set(column, newWeight);
    autoBalance();
  }
  emitUpdate();
};

const updateWeight = (column, value) => {
  selectedAttributes.value.set(column, parseFloat(value));
  emitUpdate();
};

const autoBalance = () => {
  if (selectedAttributes.value.size === 0) return;

  const equalWeight = 1.0 / selectedAttributes.value.size;
  selectedAttributes.value.forEach((_, column) => {
    selectedAttributes.value.set(column, equalWeight);
  });
  emitUpdate();
};

const emitUpdate = () => {
  const attributes = Array.from(selectedAttributes.value.entries()).map(([column, weight]) => ({
    column,
    weight: parseFloat(weight.toFixed(2))
  }));
  emit('update:modelValue', attributes);
};

// Load available columns
onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    // Get columns from uploaded identities file
    const identitiesFile = sessionStore.uploadedFiles.identities;

    if (!identitiesFile || !identitiesFile.columns) {
      throw new Error('Identity columns not available. Upload identities.csv first.');
    }

    // Filter out ID columns and internal fields
    availableColumns.value = identitiesFile.columns.filter(col =>
        !['user_id', 'id', 'ID', 'User_ID'].includes(col)
    );

    console.log('[UserAttributesConfig] Loaded columns:', availableColumns.value);
  } catch (err) {
    error.value = err.message;
    console.error('[UserAttributesConfig] Error loading columns:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.user-attributes-config {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.attributes-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.attribute-item {
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.75rem;
  transition: all 0.2s;
}

.attribute-item.selected {
  border-color: #0d6efd;
  background-color: #f0f7ff;
}

.attribute-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0;
}

.attribute-checkbox .form-check-input {
  margin: 0;
  cursor: pointer;
}

.attribute-checkbox .form-check-label {
  margin: 0;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.attribute-weight {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e9ecef;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
}

.attribute-weight .form-label {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6c757d;
}

.form-range-sm {
  height: 0.5rem;
}

.weight-value {
  font-weight: 600;
  color: #0d6efd;
  min-width: 45px;
  text-align: right;
}
</style>