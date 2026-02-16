<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">Pinia Stores Tester</h5>
    </div>
    <div class="card-body">
      <!-- Auth Store -->
      <div class="mb-4">
        <h6 class="border-bottom pb-2">Auth Store</h6>
        
        <div v-if="authStore.loading" class="text-muted">
          <div class="spinner-border spinner-border-sm me-2"></div>
          Loading...
        </div>
        
        <div v-else>
          <div class="mb-2">
            <strong>Authenticated:</strong> 
            <span :class="authStore.authenticated ? 'text-success' : 'text-danger'">
              {{ authStore.authenticated ? 'Yes' : 'No' }}
            </span>
          </div>
          
          <div v-if="authStore.user" class="mb-2">
            <strong>User:</strong> {{ authStore.userName }} ({{ authStore.userEmail }})
          </div>
          
          <div v-if="authStore.error" class="alert alert-danger alert-sm">
            {{ authStore.error }}
          </div>
          
          <div class="btn-group btn-group-sm">
            <button 
              class="btn btn-primary" 
              @click="checkSession"
              :disabled="authStore.loading"
            >
              Check Session
            </button>
            <button 
              class="btn btn-secondary" 
              @click="logout"
              :disabled="!authStore.authenticated || authStore.loading"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <!-- Session Store -->
      <div class="mb-4">
        <h6 class="border-bottom pb-2">Session Store</h6>
        
        <div v-if="sessionStore.loading" class="text-muted">
          <div class="spinner-border spinner-border-sm me-2"></div>
          Loading...
        </div>
        
        <div v-else>
          <div class="mb-2">
            <strong>Has Session:</strong> 
            <span :class="sessionStore.hasSession ? 'text-success' : 'text-danger'">
              {{ sessionStore.hasSession ? 'Yes' : 'No' }}
            </span>
            <span v-if="sessionStore.sessionId" class="ms-2 text-muted small">
              ({{ sessionStore.sessionId.slice(0, 8) }})
            </span>
          </div>
          
          <div v-if="sessionStore.hasSession" class="mb-2">
            <strong>Files Uploaded:</strong> {{ sessionStore.uploadedFileCount }}/3
            <div class="small text-muted">
              <span :class="sessionStore.hasIdentities ? 'text-success' : 'text-muted'">
                ✓ Identities
              </span> | 
              <span :class="sessionStore.hasAssignments ? 'text-success' : 'text-muted'">
                ✓ Assignments
              </span> | 
              <span :class="sessionStore.hasEntitlements ? 'text-success' : 'text-muted'">
                ✓ Entitlements
              </span>
            </div>
          </div>
          
          <div v-if="sessionStore.processedStats" class="mb-2">
            <strong>Processed Stats:</strong>
            {{ sessionStore.totalUsers }} users, 
            {{ sessionStore.totalEntitlements }} entitlements
          </div>
          
          <div v-if="sessionStore.error" class="alert alert-danger alert-sm">
            {{ sessionStore.error }}
          </div>
          
          <div class="btn-group btn-group-sm">
            <button 
              class="btn btn-primary" 
              @click="createSession"
              :disabled="sessionStore.loading || sessionStore.hasSession"
            >
              Create Session
            </button>
            <button 
              class="btn btn-danger" 
              @click="deleteSession"
              :disabled="sessionStore.loading || !sessionStore.hasSession"
            >
              Delete Session
            </button>
          </div>
        </div>
      </div>
      
      <!-- Results Store -->
      <div class="mb-4">
        <h6 class="border-bottom pb-2">Results Store</h6>
        
        <div v-if="resultsStore.loading" class="text-muted">
          <div class="spinner-border spinner-border-sm me-2"></div>
          Mining in progress...
          <div v-if="resultsStore.miningStartTime" class="small">
            Started {{ Math.round((Date.now() - resultsStore.miningStartTime) / 1000) }}s ago
          </div>
        </div>
        
        <div v-else>
          <div class="mb-2">
            <strong>Has Results:</strong> 
            <span :class="resultsStore.hasResults ? 'text-success' : 'text-danger'">
              {{ resultsStore.hasResults ? 'Yes' : 'No' }}
            </span>
          </div>
          
          <div v-if="resultsStore.hasResults" class="mb-2">
            <strong>Results:</strong> {{ resultsStore.totalRoles }} roles, 
            {{ resultsStore.assignedUsers }}/{{ resultsStore.totalUsers }} users assigned
            <div v-if="resultsStore.miningDuration" class="small text-muted">
              Mining took {{ resultsStore.miningDuration }}s
            </div>
          </div>
          
          <div v-if="resultsStore.error" class="alert alert-danger alert-sm">
            {{ resultsStore.error }}
          </div>
          
          <div class="btn-group btn-group-sm">
            <button 
              class="btn btn-success" 
              @click="clearResults"
              :disabled="!resultsStore.hasResults"
            >
              Clear Results
            </button>
          </div>
        </div>
      </div>
      
      <!-- Store State Inspector -->
      <div>
        <h6 class="border-bottom pb-2">Store State (JSON)</h6>
        <div class="accordion" id="storeAccordion">
          <!-- Auth State -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button 
                class="accordion-button collapsed" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#authCollapse"
              >
                Auth Store State
              </button>
            </h2>
            <div id="authCollapse" class="accordion-collapse collapse" data-bs-parent="#storeAccordion">
              <div class="accordion-body">
                <pre class="bg-light p-2 small">{{ JSON.stringify(authStore.$state, null, 2) }}</pre>
              </div>
            </div>
          </div>
          
          <!-- Session State -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button 
                class="accordion-button collapsed" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#sessionCollapse"
              >
                Session Store State
              </button>
            </h2>
            <div id="sessionCollapse" class="accordion-collapse collapse" data-bs-parent="#storeAccordion">
              <div class="accordion-body">
                <pre class="bg-light p-2 small">{{ JSON.stringify(sessionStore.$state, null, 2) }}</pre>
              </div>
            </div>
          </div>
          
          <!-- Results State -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button 
                class="accordion-button collapsed" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#resultsCollapse"
              >
                Results Store State
              </button>
            </h2>
            <div id="resultsCollapse" class="accordion-collapse collapse" data-bs-parent="#storeAccordion">
              <div class="accordion-body">
                <pre class="bg-light p-2 small">{{ JSON.stringify(resultsStore.$state, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useSessionStore } from '@/stores/session';
import { useResultsStore } from '@/stores/results';

const authStore = useAuthStore();
const sessionStore = useSessionStore();
const resultsStore = useResultsStore();

// Auth actions
const checkSession = async () => {
  try {
    await authStore.checkSession();
  } catch (error) {
    console.error('Check session failed:', error);
  }
};

const logout = async () => {
  try {
    await authStore.logout();
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Session actions
const createSession = async () => {
  try {
    await sessionStore.createSession();
  } catch (error) {
    console.error('Create session failed:', error);
  }
};

const deleteSession = async () => {
  if (!confirm('Delete current session?')) return;
  
  try {
    await sessionStore.deleteSession(sessionStore.sessionId);
  } catch (error) {
    console.error('Delete session failed:', error);
  }
};

// Results actions
const clearResults = () => {
  resultsStore.clearResults();
};
</script>

<style scoped>
.card {
  max-width: 900px;
  margin: 2rem auto;
}

.alert-sm {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

pre {
  max-height: 400px;
  overflow-y: auto;
  margin: 0;
  font-size: 0.75rem;
}

.accordion-button {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.accordion-body {
  padding: 0.5rem;
}
</style>
