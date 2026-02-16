<!-- client/src/views/ResultsView.vue -->
<template>
  <div class="container mt-4">
    <!-- Header row -->
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h2 class="mb-1">Mining Results</h2>
        <p class="text-muted mb-0">
          {{ resultsStore.totalRoles }} roles discovered
          <span v-if="resultsStore.miningDuration">
            in {{ resultsStore.miningDuration }}s
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
    <SummaryCards :summary="resultsStore.summary" class="mb-4" />

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

    <!-- Quick Actions -->
    <div class="card mt-3">
      <div class="card-body">
        <h6 class="mb-2">Browse Data</h6>
        <div class="btn-group" role="group">
          <router-link to="/browse/identities" class="btn btn-outline-primary btn-sm">
            Identities
          </router-link>
          <router-link to="/browse/entitlements" class="btn btn-outline-primary btn-sm">
            Entitlements
          </router-link>
          <router-link to="/browse/assignments" class="btn btn-outline-primary btn-sm">
            Assignments
          </router-link>
        </div>
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
import { ref } from 'vue';
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
</script>