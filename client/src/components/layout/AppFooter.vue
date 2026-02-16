<template>
  <footer class="container mt-5 py-4 text-center text-muted border-top">
    <small>
      Vue {{ vueVersion }} • Environment: {{ environment }}
      <span v-if="sessionStore.hasSession" class="ms-3">
        Session: {{ sessionStore.sessionId.slice(0, 8) }}
      </span>
    </small>
  </footer>
</template>

<script setup>
import { version } from 'vue';
import { useSessionStore } from '@/stores/session';

const sessionStore = useSessionStore();
const vueVersion = version;
const environment = import.meta.env.VITE_ENV || 'development';
</script>

<style scoped>
footer {
  margin-top: auto;
}
</style>
