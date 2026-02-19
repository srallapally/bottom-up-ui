<template>
  <div class="p-3">
    Signing you in…
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import auth from '@/auth'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  try {
    await auth.handleLoginCallback()
    router.replace(route.query.redirect || '/')
  } catch (e) {
    // If callback processing fails, return to login.
    router.replace('/login')
  }
})
</script>
