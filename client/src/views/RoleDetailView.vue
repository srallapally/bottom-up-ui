<!-- client/src/views/RoleDetailView.vue -->
<template>
  <div class="container mt-4">
    <!-- Not found -->
    <div v-if="!role" class="alert alert-warning">
      Role not found.
      <router-link to="/results" class="alert-link">Back to results</router-link>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <router-link to="/results" class="text-muted text-decoration-none small d-block mb-1">
            &larr; Back to results
          </router-link>
          <h2 class="mb-0">{{ role.role_name || role.role_id }}</h2>
          <p class="text-muted mb-0">
            {{ role.role_id }}
            <span v-if="role.entitlement_cluster_id != null">
              &middot; Cluster {{ role.entitlement_cluster_id }}
            </span>
          </p>
        </div>
        <span class="badge fs-6" :class="coverageBadgeClass">
          {{ coveragePct }}% avg coverage
        </span>
      </div>

      <!-- Stats row -->
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-6">
          <div class="card text-center h-100">
            <div class="card-body py-3">
              <div class="stat-value text-primary">{{ role.member_count }}</div>
              <div class="stat-label">Users</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card text-center h-100">
            <div class="card-body py-3">
              <div class="stat-value text-info">{{ role.entitlement_count }}</div>
              <div class="stat-label">Entitlements</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card text-center h-100">
            <div class="card-body py-3">
              <div class="stat-value">{{ coveragePct }}%</div>
              <div class="stat-label">Avg Coverage</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card text-center h-100">
            <div class="card-body py-3">
              <div class="stat-value">{{ role.status || 'draft' }}</div>
              <div class="stat-label">Status</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Entitlements -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">
            Entitlements ({{ role.entitlement_count }})
          </h5>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead>
              <tr>
                <th>Application</th>
                <th>Entitlement</th>
                <th>ID</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="ent in entitlementRows" :key="ent.entitlement_id">
                <td>
                  <span class="badge bg-light text-dark">{{ ent.app_id }}</span>
                </td>
                <td>{{ ent.ent_name }}</td>
                <td><code class="small">{{ ent.entitlement_id }}</code></td>
              </tr>
              <tr v-if="entitlementRows.length === 0">
                <td colspan="3" class="text-muted text-center">No entitlement detail available</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- HR Breakdown -->
      <div v-if="hasHrSummary" class="card mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">User Profile</h5>
          <div class="row">
            <div
                v-for="(values, attr) in role.hr_summary"
                :key="attr"
                class="col-md-4 col-6 mb-3"
            >
              <h6 class="text-muted small text-uppercase mb-2">{{ formatAttrName(attr) }}</h6>
              <div v-for="item in values" :key="item.value" class="mb-1">
                <div class="d-flex justify-content-between small">
                  <span>{{ item.value }}</span>
                  <span class="text-muted">{{ item.count }} ({{ (item.pct * 100).toFixed(0) }}%)</span>
                </div>
                <div class="progress" style="height: 4px;">
                  <div
                      class="progress-bar"
                      :style="{ width: (item.pct * 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coverage Distribution -->
      <div v-if="hasCoverageDist" class="card mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">Coverage Distribution</h5>
          <div class="row">
            <div
                v-for="(count, bucket) in role.coverage_distribution"
                :key="bucket"
                class="col mb-2"
            >
              <div class="text-center">
                <div class="fw-bold">{{ count }}</div>
                <div class="small text-muted">{{ bucket }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Members (top 50) -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">
            Members
            <span class="text-muted fw-normal">(showing {{ displayMembers.length }} of {{ role.member_count }})</span>
          </h5>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead>
              <tr>
                <th>User ID</th>
                <th>Coverage</th>
                <th>Has / Total</th>
                <th>Missing</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="member in displayMembers" :key="member.userId">
                <td><code class="small">{{ member.userId }}</code></td>
                <td>
                    <span class="badge" :class="memberCoverageBadge(member.coverage)">
                      {{ (member.coverage * 100).toFixed(0) }}%
                    </span>
                </td>
                <td>{{ member.hasCount }} / {{ member.totalCount }}</td>
                <td>
                  <span v-if="member.missing.length === 0" class="text-success small">None</span>
                  <span v-else class="small text-muted">
                      {{ member.missing.slice(0, 3).join(', ') }}
                      <span v-if="member.missing.length > 3">
                        +{{ member.missing.length - 3 }} more
                      </span>
                    </span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <p v-if="role.member_count > maxMembers" class="text-muted small mt-2 mb-0">
            Showing first {{ maxMembers }} members. Export for full list.
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useResultsStore } from '@/stores/results';

const route = useRoute();
const resultsStore = useResultsStore();
const maxMembers = 50;

const role = computed(() => {
  const roleId = route.params.roleId;
  return resultsStore.roles.find(r => r.role_id === roleId) || null;
});

const coveragePct = computed(() => {
  if (!role.value || role.value.avg_coverage == null) return 0;
  return (role.value.avg_coverage * 100).toFixed(0);
});

const coverageBadgeClass = computed(() => {
  const pct = Number(coveragePct.value);
  if (pct >= 90) return 'bg-success';
  if (pct >= 70) return 'bg-warning text-dark';
  return 'bg-secondary';
});

const entitlementRows = computed(() => {
  if (!role.value) return [];
  // Prefer entitlements_detail if available, fall back to raw entitlements list
  if (role.value.entitlements_detail?.length) {
    return role.value.entitlements_detail;
  }
  return (role.value.entitlements || []).map(id => {
    const parts = id.split(':', 2);
    return {
      entitlement_id: id,
      app_id: parts.length === 2 ? parts[0] : '',
      ent_name: parts.length === 2 ? parts[1] : id
    };
  });
});

const hasHrSummary = computed(() => {
  return role.value?.hr_summary && Object.keys(role.value.hr_summary).length > 0;
});

const hasCoverageDist = computed(() => {
  return role.value?.coverage_distribution && Object.keys(role.value.coverage_distribution).length > 0;
});

const displayMembers = computed(() => {
  if (!role.value) return [];
  const coverage = role.value.member_coverage || {};
  const members = role.value.members || [];

  return members.slice(0, maxMembers).map(userId => {
    const cov = coverage[userId] || {};
    return {
      userId,
      coverage: cov.coverage ?? 1,
      hasCount: cov.has_count ?? role.value.entitlement_count,
      totalCount: cov.total_count ?? role.value.entitlement_count,
      missing: cov.missing || []
    };
  });
});

const formatAttrName = (attr) => {
  return attr.replace(/_/g, ' ');
};

const memberCoverageBadge = (coverage) => {
  const pct = coverage * 100;
  if (pct >= 90) return 'bg-success';
  if (pct >= 70) return 'bg-warning text-dark';
  return 'bg-danger';
};
</script>

<style scoped>
.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  margin-top: 0.25rem;
}
</style>