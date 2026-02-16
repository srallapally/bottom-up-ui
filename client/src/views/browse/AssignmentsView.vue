<template>
  <div class="container mt-4">
    <h2>Browse Assignments</h2>
    <p class="text-muted">View all user-entitlement assignments with confidence scores</p>
    
    <div class="alert alert-info">
      <strong>Placeholder View</strong> - This will be implemented in Phase 4
      <br>
      Will include AG Grid table with confidence scoring tooltips
    </div>
    
    <div class="card">
      <div class="card-body">
        <h5>Assignments Table</h5>
        <p>Displays: USR_ID, APP_ID, ENT_ID, confidence (HIGH/MEDIUM/LOW), peer support</p>
        
        <router-link to="/results" class="btn btn-secondary">
          Back to Results
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// AG Grid integration will be added in Phase 4
</script>
