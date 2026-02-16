<template>
  <div class="card mt-4">
    <div class="card-header">
      <h5 class="card-title mb-0">Vue Router Tester</h5>
    </div>
    <div class="card-body">
      <p class="text-muted">Test navigation and route guards</p>
      
      <div class="row">
        <div class="col-md-6">
          <h6>Current Route</h6>
          <ul class="list-unstyled">
            <li><strong>Path:</strong> {{ route.path }}</li>
            <li><strong>Name:</strong> {{ route.name }}</li>
            <li><strong>Title:</strong> {{ route.meta.title }}</li>
          </ul>
          
          <h6 class="mt-3">Route Guards Active</h6>
          <ul class="list-unstyled small">
            <li v-if="route.meta.requiresAuth">
              <span class="badge bg-primary">requiresAuth</span>
            </li>
            <li v-if="route.meta.requiresSession">
              <span class="badge bg-info">requiresSession</span>
            </li>
            <li v-if="route.meta.requiresFiles">
              <span class="badge bg-warning">requiresFiles</span>
            </li>
            <li v-if="route.meta.requiresProcessed">
              <span class="badge bg-success">requiresProcessed</span>
            </li>
            <li v-if="route.meta.requiresResults">
              <span class="badge bg-danger">requiresResults</span>
            </li>
          </ul>
        </div>
        
        <div class="col-md-6">
          <h6>Quick Navigation</h6>
          <div class="list-group">
            <router-link 
              to="/dashboard" 
              class="list-group-item list-group-item-action"
              active-class="active"
            >
              Dashboard
            </router-link>
            <router-link 
              to="/upload" 
              class="list-group-item list-group-item-action"
              active-class="active"
            >
              Upload (requires session)
            </router-link>
            <router-link 
              to="/configure" 
              class="list-group-item list-group-item-action"
              active-class="active"
            >
              Configure (requires files)
            </router-link>
            <router-link 
              to="/processing" 
              class="list-group-item list-group-item-action"
              active-class="active"
            >
              Processing (requires processed)
            </router-link>
            <router-link 
              to="/results" 
              class="list-group-item list-group-item-action"
              active-class="active"
            >
              Results (requires mining)
            </router-link>
          </div>
          
          <div class="mt-3">
            <router-link to="/browse/identities" class="btn btn-sm btn-outline-primary me-2">
              Browse Identities
            </router-link>
            <router-link to="/browse/entitlements" class="btn btn-sm btn-outline-primary me-2">
              Browse Entitlements
            </router-link>
            <router-link to="/browse/assignments" class="btn btn-sm btn-outline-primary">
              Browse Assignments
            </router-link>
          </div>
          
          <div class="mt-3">
            <router-link to="/nonexistent" class="btn btn-sm btn-outline-danger">
              Test 404 Page
            </router-link>
          </div>
        </div>
      </div>
      
      <div class="mt-4">
        <h6>State for Guards</h6>
        <ul class="list-unstyled small">
          <li>Authenticated: <strong>{{ authStore.authenticated }}</strong></li>
          <li>Has Session: <strong>{{ sessionStore.hasSession }}</strong></li>
          <li>Files Uploaded: <strong>{{ sessionStore.uploadedFileCount }}/3</strong></li>
          <li>Files Processed: <strong>{{ sessionStore.filesProcessed }}</strong></li>
          <li>Has Results: <strong>{{ resultsStore.hasResults }}</strong></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSessionStore } from '@/stores/session';
import { useResultsStore } from '@/stores/results';

const route = useRoute();
const authStore = useAuthStore();
const sessionStore = useSessionStore();
const resultsStore = useResultsStore();
</script>
