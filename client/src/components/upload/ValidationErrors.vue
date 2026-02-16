<template>
  <div v-if="errors.length > 0" class="validation-errors">
    <div class="alert alert-danger" role="alert">
      <div class="d-flex align-items-start">
        <div class="error-icon me-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
        </div>
        
        <div class="flex-grow-1">
          <h6 class="alert-heading mb-2">
            {{ title || 'Validation Failed' }}
          </h6>
          
          <p v-if="summary" class="mb-2">{{ summary }}</p>
          
          <ul class="error-list mb-0">
            <li v-for="(error, index) in displayErrors" :key="index">
              {{ error }}
            </li>
          </ul>
          
          <button
            v-if="errors.length > maxVisible && !showAll"
            type="button"
            class="btn btn-sm btn-outline-danger mt-2"
            @click="showAll = true"
          >
            Show {{ errors.length - maxVisible }} more error{{ errors.length - maxVisible !== 1 ? 's' : '' }}
          </button>
        </div>
        
        <button
          v-if="dismissible"
          type="button"
          class="btn-close"
          @click="$emit('dismiss')"
          aria-label="Close"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  errors: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  maxVisible: {
    type: Number,
    default: 5
  },
  dismissible: {
    type: Boolean,
    default: true
  }
});

defineEmits(['dismiss']);

const showAll = ref(false);

const displayErrors = computed(() => {
  if (showAll.value || props.errors.length <= props.maxVisible) {
    return props.errors;
  }
  return props.errors.slice(0, props.maxVisible);
});
</script>

<style scoped>
.validation-errors {
  margin-bottom: 1rem;
}

.error-icon {
  flex-shrink: 0;
  color: #dc3545;
}

.error-list {
  padding-left: 1.25rem;
  margin-bottom: 0;
}

.error-list li {
  margin-bottom: 0.25rem;
}

.error-list li:last-child {
  margin-bottom: 0;
}

.alert-heading {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
</style>
