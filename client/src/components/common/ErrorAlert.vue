<template>
  <div v-if="visible" class="alert" :class="alertClass" role="alert">
    <div class="d-flex justify-content-between align-items-start">
      <div class="flex-grow-1">
        <strong v-if="title">{{ title }}</strong>
        <p class="mb-0" :class="{ 'mt-1': title }">{{ message }}</p>
      </div>
      <button
        v-if="dismissible"
        type="button"
        class="btn-close"
        aria-label="Close"
        @click="handleDismiss"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'danger',
    validator: (value) => ['danger', 'warning', 'info', 'success'].includes(value)
  },
  dismissible: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['dismiss']);

const visible = ref(true);

const alertClass = computed(() => {
  return `alert-${props.variant}`;
});

const handleDismiss = () => {
  visible.value = false;
  emit('dismiss');
};
</script>

<style scoped>
.alert {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
