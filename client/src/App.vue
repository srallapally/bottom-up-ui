<template>
  <div id="app">
    <!-- Header (only when logged in) -->
    <AppHeader
        v-if="loggedIn"
        @logout="handleLogout"
    />

    <!-- Page Content -->
    <main class="app-content">
      <router-view />
    </main>

    <AppFooter v-if="loggedIn" />
  </div>
</template>

<script>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import auth from './auth'

export default {
  name: 'App',

  components: { AppHeader, AppFooter },

  computed: {
    // Prefer server-session-backed auth store, not legacy auth.loggedIn()
    ...mapState(useAuthStore, ['loggedIn']),
  },

  watch: {
    loggedIn: {
      immediate: true,
      handler (value) {
        if (!value) {
          this.$router.replace('/login')
        }
      }
    }
  },

  methods: {
    handleLogout () {
      auth.logout()
      this.$router.replace('/login')
    }
  }
}
</script>

<style>
.app-content {
  min-height: 100vh;
  padding: 2rem 0;
  background: #f9fafb;
}
</style>
