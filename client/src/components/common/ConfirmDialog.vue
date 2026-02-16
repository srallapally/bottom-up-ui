<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="modal fade show"
      tabindex="-1"
      style="display: block"
      @click.self="handleCancel"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="handleCancel"
            ></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="btn"
              :class="confirmButtonClass"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="visible" class="modal-backdrop fade show"></div>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  variant: {
    type: String,
    default: 'danger',
    validator: (value) => ['danger', 'warning', 'primary', 'success'].includes(value)
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const visible = ref(false);
const resolvePromise = ref(null);
const rejectPromise = ref(null);

const confirmButtonClass = computed(() => {
  return `btn-${props.variant}`;
});

const show = () => {
  visible.value = true;
  return new Promise((resolve, reject) => {
    resolvePromise.value = resolve;
    rejectPromise.value = reject;
  });
};

const handleConfirm = () => {
  visible.value = false;
  emit('confirm');
  if (resolvePromise.value) {
    resolvePromise.value(true);
  }
};

const handleCancel = () => {
  visible.value = false;
  emit('cancel');
  if (rejectPromise.value) {
    rejectPromise.value(false);
  }
};

defineExpose({
  show
});
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
