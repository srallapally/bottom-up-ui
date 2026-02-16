<!-- client/src/components/results/SummaryCards.vue -->
<template>
  <div class="row g-3">
    <div class="col-md-3 col-6" v-for="metric in metrics" :key="metric.label">
      <div class="card text-center h-100">
        <div class="card-body py-3">
          <div class="metric-value" :class="metric.colorClass">{{ metric.value }}</div>
          <div class="metric-label">{{ metric.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  summary: {
    type: Object,
    required: true
  }
});

const metrics = computed(() => {
  const s = props.summary;
  const coveragePct = s.total_users > 0
      ? ((s.assigned_users / s.total_users) * 100).toFixed(0)
      : 0;

  return [
    {
      label: 'Roles Discovered',
      value: s.total_roles?.toLocaleString() ?? '0',
      colorClass: 'text-primary'
    },
    {
      label: 'Users Assigned',
      value: s.assigned_users?.toLocaleString() ?? '0',
      colorClass: 'text-success'
    },
    {
      label: 'User Coverage',
      value: `${coveragePct}%`,
      colorClass: 'text-info'
    },
    {
      label: 'Avg Roles / User',
      value: s.avg_clusters_per_user?.toFixed(1) ?? '0',
      colorClass: 'text-secondary'
    }
  ];
});
</script>

<style scoped>
.metric-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
}

.metric-label {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  margin-top: 0.25rem;
}
</style>