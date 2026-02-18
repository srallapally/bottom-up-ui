<template>
  <div id="app">
    <!-- NAV ONLY WHEN LOGGED IN -->
    <div v-if="loggedIn">
      <h1>Role Mining UI</h1>

      <ul>
        <li>
          <a href="#" @click.prevent="onLogout">Log out</a>
        </li>
        <li>
          <router-link to="/about">About</router-link>
        </li>
        <li>
          <router-link to="/dashboard">Dashboard</router-link>
        </li>
      </ul>
    </div>

    <!-- PAGE CONTENT -->
    <router-view />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import auth from './auth'

export default {
  data () {
    return {
      loggedIn: auth.loggedIn()
    }
  },
  created () {
    auth.onChange = (loggedIn) => {
      this.loggedIn = !!loggedIn
    }
  },
  methods: {
    onLogout () {
      const authStore = useAuthStore()
      authStore.logout()
    }
  }
}
</script>

<style>
html, body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  color: #2c3e50;
}

#app {
  padding: 0 20px;
}

ul {
  line-height: 1.5em;
  padding-left: 1.5em;
}

a {
  color: #7f8c8d;
  text-decoration: none;
}

a:hover {
  color: #4fc08d;
}
</style>
