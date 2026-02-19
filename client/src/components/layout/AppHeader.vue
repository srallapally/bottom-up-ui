<template>
  <header class="app-header">
    <div class="container d-flex align-items-center justify-content-between py-2">

      <!-- Left: Brand + Nav -->
      <div class="d-flex align-items-center gap-4">
        <router-link to="/dashboard" class="app-brand">
          Role Mining
        </router-link>

        <nav class="app-nav">
          <router-link to="/dashboard" class="nav-item">Dashboard</router-link>
          <router-link to="/about" class="nav-item">About</router-link>
        </nav>
      </div>

      <!-- Right: Logout -->
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary" @click="$emit('logout')">
          Log out
        </button>
      </div>

    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  emits: ['logout']
}
</script>

<style scoped>
.app-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.app-brand {
  font-weight: 700;
  font-size: 1.15rem;
  color: #111827;
  text-decoration: none;
  letter-spacing: -0.2px;
}

.app-nav {
  display: flex;
  gap: 1.25rem;
  margin-left: 1.25rem;
  align-items: center;
}

/* Force link look regardless of bootstrap defaults */
.nav-item {
  display: inline-flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 8px;

  font-size: 0.95rem;
  font-weight: 500;

  color: #6b7280 !important;
  text-decoration: none !important;
}

/* spacing in case gap isn't honored for any reason */
.nav-item + .nav-item {
  margin-left: 0.75rem;
}

.nav-item:hover {
  color: #111827 !important;
  background: #f3f4f6;
  text-decoration: none !important;
}

.nav-item.router-link-active {
  color: #111827 !important;
  background: #eef2ff;
  font-weight: 600;
  text-decoration: none !important;
}

button.btn {
  border-radius: 10px;
  font-weight: 500;
}
</style>
