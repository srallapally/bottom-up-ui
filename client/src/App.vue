<template>
  <div id="app">
    <header class="bg-primary text-white py-3 mb-4">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-0">Role Mining UI</h1>
            <p class="mb-0 small">Hybrid Entitlement-Centric Role Discovery</p>
          </div>
          <div v-if="authStore.authenticated" class="text-end">
            <small class="d-block">{{ authStore.userName }}</small>
            <small class="text-white-50">{{ authStore.userEmail }}</small>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation breadcrumb -->
    <div class="container mb-3" v-if="showBreadcrumb">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/dashboard">Dashboard</router-link>
          </li>
          <li
              v-if="currentRoute !== 'Dashboard'"
              class="breadcrumb-item active"
              aria-current="page"
          >
            {{ currentRoute }}
          </li>
        </ol>
      </nav>
    </div>

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="container mt-5 py-4 text-center text-muted border-top">
      <small>
        Vue {{ vueVersion }} • Environment: {{ environment }}
        <span v-if="sessionStore.hasSession" class="ms-3">
          Session: {{ sessionStore.sessionId.slice(0, 8) }}
        </span>
      </small>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { version } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useSessionStore } from '@/stores/session';

const route = useRoute();
const authStore = useAuthStore();
const sessionStore = useSessionStore();

const vueVersion = version;
const environment = import.meta.env.VITE_ENV || 'development';

const currentRoute = computed(() => route.meta.title || route.name);
const showBreadcrumb = computed(() => route.name !== 'Dashboard' && route.name !== 'NotFound');
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

main {
  flex: 1;
}

/* Page transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Breadcrumb styling */
.breadcrumb {
  background-color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  margin-bottom: 0;
}
</style>
