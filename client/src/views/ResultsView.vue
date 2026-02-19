<!-- client/src/views/ResultsView.vue -->
<template>
  <div class="container mt-4">
    <!-- Header row -->
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h2 class="mb-1">Mining Results</h2>
        <p class="text-muted mb-0">
          {{ totalRolesForUi }} roles discovered
          <span v-if="miningDurationForUi !== null">
            in {{ miningDurationForUi }}s
          </span>
        </p>
      </div>
      <div class="d-flex gap-2">
        <button
            class="btn btn-outline-warning"
            @click="handleReconfigure"
        >
          Reconfigure &amp; Re-run
        </button>
        <button
            class="btn btn-primary"
            @click="handleExport"
            :disabled="exporting"
        >
          <span v-if="exporting" class="spinner-border spinner-border-sm me-1"></span>
          {{ exporting ? 'Exporting...' : 'Export All Roles' }}
        </button>
      </div>
    </div>

    <!-- Summary cards -->
    <SummaryCards :summary="summaryForUi" class="mb-3" />

    <!-- Browse data cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3 col-6">
        <router-link to="/browse/identities" class="text-decoration-none">
          <div class="card text-center h-100 browse-card">
            <div class="card-body py-3">
              <div class="metric-value text-primary">{{ formatNumber(sessionStore.totalUsers) }}</div>
              <div class="metric-label">Identities</div>
            </div>
          </div>
        </router-link>
      </div>
      <div class="col-md-3 col-6">
        <router-link to="/browse/entitlements" class="text-decoration-none">
          <div class="card text-center h-100 browse-card">
            <div class="card-body py-3">
              <div class="metric-value text-primary">{{ formatNumber(sessionStore.totalEntitlements) }}</div>
              <div class="metric-label">Entitlements</div>
            </div>
          </div>
        </router-link>
      </div>
      <div class="col-md-3 col-6">
        <router-link to="/browse/assignments" class="text-decoration-none">
          <div class="card text-center h-100 browse-card">
            <div class="card-body py-3">
              <div class="metric-value text-primary">{{ formatNumber(sessionStore.processedStats?.total_assignments) }}</div>
              <div class="metric-label">Assignments</div>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Role list -->
    <div class="card">
      <div class="card-body">
        <h5 class="card-title mb-3">Discovered Roles</h5>
        <RoleList
            :roles="resultsStore.roles"
            :birthright-role="resultsStore.birthrightRole"
        />
      </div>
    </div>

    <!-- Export error -->
    <ErrorAlert
        v-if="exportError"
        :message="exportError"
        class="mt-3"
        @dismiss="exportError = null"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useResultsStore } from '@/stores/results';
import { useSessionStore } from '@/stores/session';
import SummaryCards from '@/components/results/SummaryCards.vue';
import RoleList from '@/components/results/RoleList.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';

const router = useRouter();
const resultsStore = useResultsStore();
const sessionStore = useSessionStore();

const exporting = ref(false);
const exportError = ref(null);

/**
 * Summary fields have shifted a few times (store vs backend keys).
 * This normalizes the object passed to SummaryCards so the UI doesn't regress to zeros.
 */
const summaryForUi = computed(() => {
  const s = resultsStore.summary || {};

  const totalRoles =
      (typeof s.total_roles === 'number' ? s.total_roles : null) ??
      (Array.isArray(resultsStore.roles) ? resultsStore.roles.length : 0);

  const totalUsers =
      (typeof s.total_users === 'number' ? s.total_users : null) ??
      (typeof sessionStore.totalUsers === 'number' ? sessionStore.totalUsers : 0);

  const assignedUsers =
      (typeof s.assigned_users === 'number' ? s.assigned_users : null) ??
      (typeof s.users_assigned === 'number' ? s.users_assigned : null) ??
      0;

  const avgClustersPerUser =
      (typeof s.avg_clusters_per_user === 'number' ? s.avg_clusters_per_user : null) ??
      (typeof s.avg_roles_per_user === 'number' ? s.avg_roles_per_user : null) ??
      0;

  return {
    ...s,
    total_roles: totalRoles,
    total_users: totalUsers,
    assigned_users: assignedUsers,
    avg_clusters_per_user: avgClustersPerUser
  };
});

const totalRolesForUi = computed(() => summaryForUi.value.total_roles ?? 0);

/**
 * Avoid "in —" regression:
 * - show duration only if we actually have one
 * - prefer store timing, fallback to any backend-provided duration if present
 */
const miningDurationForUi = computed(() => {
  if (typeof resultsStore.miningDuration === 'number') return resultsStore.miningDuration;

  const s = resultsStore.summary || {};
  const backendDuration =
      s.mining_duration_seconds ??
      s.duration_seconds ??
      resultsStore.results?.mining_duration_seconds ??
      resultsStore.results?.duration_seconds;

  return typeof backendDuration === 'number' ? backendDuration : null;
});

const handleExport = async () => {
  exporting.value = true;
  exportError.value = null;

  try {
    await resultsStore.exportAll(sessionStore.currentSession.session_id);
  } catch (error) {
    exportError.value = error.userMessage || 'Export failed';
  } finally {
    exporting.value = false;
  }
};

const handleReconfigure = () => {
  router.push('/configure');
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
};
</script>

<style scoped>
.browse-card {
  cursor: pointer;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.browse-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #0d6efd;
}

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
