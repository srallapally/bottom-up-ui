<!-- client/src/components/results/RoleList.vue -->
<template>
  <div>
    <!-- Controls -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center gap-2">
        <input
            type="text"
            class="form-control form-control-sm"
            placeholder="Search roles..."
            v-model="searchQuery"
            style="max-width: 240px;"
        />
        <select class="form-select form-select-sm" v-model="sortBy" style="max-width: 180px;">
          <option value="members_desc">Most users</option>
          <option value="members_asc">Fewest users</option>
          <option value="entitlements_desc">Most entitlements</option>
          <option value="coverage_desc">Highest coverage</option>
          <option value="name_asc">Name A-Z</option>
        </select>
      </div>
      <small class="text-muted">
        {{ filteredRoles.length }} of {{ roles.length }} roles
      </small>
    </div>

    <!-- Birthright role (pinned at top if present) -->
    <div v-if="birthrightRole" class="mb-3">
      <div class="card border-primary">
        <div class="card-body py-2 px-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-0 text-primary">{{ birthrightRole.role_name }}</h6>
              <small class="text-muted">{{ birthrightRole.role_id }}</small>
            </div>
            <span class="badge bg-primary">Baseline</span>
          </div>
          <div class="d-flex gap-3 mt-2 text-muted small">
            <span>{{ birthrightRole.entitlement_count }} entitlements</span>
            <span>Applies to all users</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Role list -->
    <div class="role-list-scroll">
      <RoleCard
          v-for="role in filteredRoles"
          :key="role.role_id"
          :role="role"
      />

      <div v-if="filteredRoles.length === 0" class="text-center text-muted py-4">
        No roles match "{{ searchQuery }}"
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import RoleCard from './RoleCard.vue';

const props = defineProps({
  roles: {
    type: Array,
    required: true
  },
  birthrightRole: {
    type: Object,
    default: null
  }
});

const searchQuery = ref('');
const sortBy = ref('members_desc');

const filteredRoles = computed(() => {
  let list = [...props.roles];

  // Filter
  const q = searchQuery.value.toLowerCase().trim();
  if (q) {
    list = list.filter(r =>
        (r.role_name || '').toLowerCase().includes(q) ||
        (r.role_id || '').toLowerCase().includes(q)
    );
  }

  // Sort
  const sorters = {
    members_desc: (a, b) => (b.member_count || 0) - (a.member_count || 0),
    members_asc: (a, b) => (a.member_count || 0) - (b.member_count || 0),
    entitlements_desc: (a, b) => (b.entitlement_count || 0) - (a.entitlement_count || 0),
    coverage_desc: (a, b) => (b.avg_coverage || 0) - (a.avg_coverage || 0),
    name_asc: (a, b) => (a.role_name || a.role_id).localeCompare(b.role_name || b.role_id)
  };

  list.sort(sorters[sortBy.value] || sorters.members_desc);

  return list;
});
</script>

<style scoped>
.role-list-scroll {
  max-height: 600px;
  overflow-y: auto;
}
</style>