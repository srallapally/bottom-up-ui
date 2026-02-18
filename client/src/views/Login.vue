<template>
  <div class="login-page">
    <div id="ping-login-widget"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { widget } from '@forgerock/login-widget';

let unsubscribe;

onMounted(() => {
  widget.mount('ping-login-widget');

  // Start the configured journey (tree)
  widget.start({
    journey: import.meta.env.VITE_PING_JOURNEY_NAME, // e.g. BottomUpLogin
  });

  // Subscribe to widget events (login success, errors, etc.)
  unsubscribe = widget.subscribe((event) => {
    if (event.type === 'LoginSuccess') {
      // At this point, Ping session exists; if you want OAuth tokens,
      // trigger token acquisition via SDK flows (below).
      window.location.href = '/';
    }
  });
});

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe();
  widget.unmount();
});
</script>
