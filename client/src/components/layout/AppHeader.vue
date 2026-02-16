<template>
  <header class="bg-primary text-white py-3 mb-4">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="h3 mb-0">
            <router-link to="/dashboard" class="text-white text-decoration-none">
              Role Mining UI
            </router-link>
          </h1>
          <p class="mb-0 small">Hybrid Entitlement-Centric Role Discovery</p>
        </div>
        <div v-if="authStore.authenticated" class="text-end">
          <small class="d-block">{{ authStore.userName }}</small>
          <small class="text-white-50">{{ authStore.userEmail }}</small>
          <button 
            v-if="showLogout"
            class="btn btn-sm btn-outline-light mt-2"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';

defineProps({
  showLogout: {
    type: Boolean,
    default: true
  }
});

const authStore = useAuthStore();

const handleLogout = () => {
  // Logout will be handled by auth store action
  authStore.logout();
};
</script>

<style scoped>
header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
