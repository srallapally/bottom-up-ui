<template>
  <div class="loading-spinner-container" :class="containerClass">
    <div class="spinner-border" :class="spinnerClass" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p v-if="message" class="mt-3 mb-0 text-muted">{{ message }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  message: {
    type: String,
    default: ''
  },
  blocking: {
    type: Boolean,
    default: false
  }
});

const spinnerClass = computed(() => {
  const classes = ['text-primary'];
  if (props.size === 'sm') classes.push('spinner-border-sm');
  return classes.join(' ');
});

const containerClass = computed(() => {
  return props.blocking ? 'blocking' : 'inline';
});
</script>

<style scoped>
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner-container.blocking {
  min-height: 200px;
}

.loading-spinner-container.inline {
  padding: 1rem 0;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.spinner-border.spinner-border-sm {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
