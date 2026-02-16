<template>
  <div id="app">
    <header class="bg-primary text-white py-3 mb-4">
      <div class="container">
        <h1 class="h3 mb-0">Role Mining UI - Phase 3 Test</h1>
        <p class="mb-0 small">CSV Service Layer</p>
      </div>
    </header>
    
    <main class="container">
      <!-- Tab Navigation -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'health' }"
            @click="activeTab = 'health'"
            href="#"
          >
            Health Check
          </a>
        </li>
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'csv' }"
            @click="activeTab = 'csv'"
            href="#"
          >
            CSV Validator
          </a>
        </li>
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'stores' }"
            @click="activeTab = 'stores'"
            href="#"
          >
            Pinia Stores
          </a>
        </li>
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'status' }"
            @click="activeTab = 'status'"
            href="#"
          >
            Status
          </a>
        </li>
      </ul>
      
      <!-- Tab Content -->
      <div v-show="activeTab === 'health'">
        <HealthCheck />
      </div>
      
      <div v-show="activeTab === 'csv'">
        <CSVTester />
      </div>
      
      <div v-show="activeTab === 'stores'">
        <StoresTester />
      </div>
      
      <div v-show="activeTab === 'status'">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Phase 3 Implementation Status</h5>
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                CSV Service - File validation
                <span class="badge bg-success">✓ Complete</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                CSV Service - PapaParse integration
                <span class="badge bg-success">✓ Complete</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                CSV Service - Schema validation
                <span class="badge bg-success">✓ Complete</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Pinia - Auth Store
                <span class="badge bg-success">✓ Complete</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Pinia - Session Store
                <span class="badge bg-success">✓ Complete</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Pinia - Results Store
                <span class="badge bg-success">✓ Complete</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Vue Router with guards
                <span class="badge bg-secondary">Pending</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="alert alert-info mt-4">
        <h6 class="alert-heading">Testing Instructions:</h6>
        <ol class="mb-0">
          <li><strong>Health Check:</strong> Test API connectivity to Express and Flask backends</li>
          <li><strong>CSV Validator:</strong> Upload sample CSV files to test validation</li>
          <li><strong>Pinia Stores:</strong> Test auth, session, and results store actions</li>
          <li>Ensure Express and Flask backends are running</li>
          <li>Check browser console for store action logs</li>
        </ol>
      </div>
    </main>
    
    <footer class="container mt-5 py-4 text-center text-muted">
      <small>Vue {{ vueVersion }} • Environment: {{ environment }}</small>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { version } from 'vue';
import HealthCheck from '@/components/common/HealthCheck.vue';
import CSVTester from '@/components/common/CSVTester.vue';
import StoresTester from '@/components/common/StoresTester.vue';

const vueVersion = version;
const environment = import.meta.env.VITE_ENV || 'development';
const activeTab = ref('health');
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
