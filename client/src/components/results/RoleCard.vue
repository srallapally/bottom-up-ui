<!-- client/src/components/results/RoleCard.vue -->
<template>
  <router-link
      :to="`/roles/${role.role_id}`"
      class="card role-card mb-2 text-decoration-none text-body d-block"
  >
    <div class="card-body py-2 px-3">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h6 class="mb-0">{{ role.role_name || role.role_id }}</h6>
          <small v-if="role.role_name && role.role_name !== role.role_id" class="text-muted">
            {{ role.role_id }}
          </small>
        </div>
        <span class="badge" :class="confidenceBadge">
          {{ coverageLabel }}
        </span>
      </div>

      <div class="d-flex gap-3 mt-2 text-muted small">
        <span>{{ role.member_count }} users</span>
        <span>{{ role.entitlement_count }} entitlements</span>
      </div>

      <!-- Top HR attribute if available -->
      <div v-if="topAttribute" class="mt-1">
        <small class="text-muted">
          {{ topAttribute.label }}: <strong>{{ topAttribute.value }}</strong> ({{ topAttribute.pct }})
        </small>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  role: {
    type: Object,
    required: true
  }
});

const coveragePct = computed(() => {
  return props.role.avg_coverage != null
      ? (props.role.avg_coverage * 100).toFixed(0)
      : null;
});

const coverageLabel = computed(() => {
  if (coveragePct.value == null) return '—';
  return `${coveragePct.value}% coverage`;
});

const confidenceBadge = computed(() => {
  const pct = Number(coveragePct.value);
  if (pct >= 90) return 'bg-success';
  if (pct >= 70) return 'bg-warning text-dark';
  return 'bg-secondary';
});

const topAttribute = computed(() => {
  const hr = props.role.hr_summary;
  if (!hr || Object.keys(hr).length === 0) return null;

  const preferred = ['department', 'jobcode', 'business_unit', 'job_level', 'location_country'];
  for (const key of preferred) {
    if (hr[key]?.length) {
      const top = hr[key][0];
      return {
        label: key.replace('_', ' '),
        value: top.value,
        pct: `${(top.pct * 100).toFixed(0)}%`
      };
    }
  }
  return null;
});
</script>

<style scoped>
.role-card {
  transition: box-shadow 0.15s, border-color 0.15s;
  cursor: pointer;
}

.role-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #0d6efd;
}
</style>