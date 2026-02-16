<template>
  <div class="container mt-4">
    <h2>Mining Results</h2>
    <p class="text-muted">View discovered roles and export results</p>

    <div class="alert alert-info">
      <strong>Placeholder View</strong> - This will be implemented in Phase 4
    </div>

    <div class="row">
      <div class="col-md-4 mb-3">
        <div class="card">
          <div class="card-body text-center">
            <h3 class="text-primary">{{ resultsStore.totalRoles }}</h3>
            <p class="text-muted mb-0">Roles Discovered</p>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card">
          <div class="card-body text-center">
            <h3 class="text-success">{{ resultsStore.assignedUsers }}</h3>
            <p class="text-muted mb-0">Users Assigned</p>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card">
          <div class="card-body text-center">
            <h3 class="text-info">{{ resultsStore.totalUsers }}</h3>
            <p class="text-muted mb-0">Total Users</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ADDED: Reconfigure action -->
    <div class="card mt-3">
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-1">Not satisfied with these results?</h6>
          <p class="text-muted mb-0 small">Adjust mining parameters and re-run on the same data.</p>
        </div>
        <button class="btn btn-outline-warning" @click="handleReconfigure">
          Reconfigure &amp; Re-run
        </button>
      </div>
    </div>

    <div class="card mt-3">
      <div class="card-body">
        <h5>Quick Actions</h5>
        <div class="btn-group" role="group">
          <router-link to="/browse/identities" class="btn btn-outline-primary">
            Browse Identities
          </router-link>
          <router-link to="/browse/entitlements" class="btn btn-outline-primary">
            Browse Entitlements
          </router-link>
          <router-link to="/browse/assignments" class="btn btn-outline-primary">
            Browse Assignments
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useResultsStore } from '@/stores/results';

const router = useRouter();
const resultsStore = useResultsStore();

// ADDED: Navigate to configure view to re-run mining
const handleReconfigure = () => {
  router.push('/configure');
};
</script>