<template>
  <span
    class="info-tooltip"
    :data-bs-toggle="'tooltip'"
    :data-bs-placement="placement"
    :title="text"
    ref="tooltipElement"
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      fill="currentColor" 
      viewBox="0 0 16 16"
    >
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
    </svg>
  </span>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineProps({
  text: {
    type: String,
    required: true
  },
  placement: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  }
});

const tooltipElement = ref(null);
let tooltipInstance = null;

onMounted(() => {
  if (tooltipElement.value && window.bootstrap) {
    tooltipInstance = new window.bootstrap.Tooltip(tooltipElement.value);
  }
});

onUnmounted(() => {
  if (tooltipInstance) {
    tooltipInstance.dispose();
  }
});
</script>

<style scoped>
.info-tooltip {
  color: #6c757d;
  cursor: help;
  display: inline-flex;
  align-items: center;
}

.info-tooltip:hover {
  color: #0d6efd;
}
</style>
