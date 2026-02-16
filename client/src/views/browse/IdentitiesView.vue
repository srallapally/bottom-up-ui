<!-- client/src/views/browse/IdentitiesView.vue -->
<template>
  <div class="container-fluid mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <router-link to="/results" class="text-muted text-decoration-none small d-block mb-1">
          &larr; Back to results
        </router-link>
        <h3 class="mb-0">Identities</h3>
      </div>
    </div>

    <AGGridWrapper
        :columnDefs="columnDefs"
        :rowData="rows"
        :loading="loading"
        :error="error"
        gridHeight="600px"
        exportFilename="identities"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSessionStore } from '@/stores/session';
import api from '@/services/api';
import AGGridWrapper from '@/components/tables/AGGridWrapper.vue';

const sessionStore = useSessionStore();
const rows = ref([]);
const loading = ref(true);
const error = ref(null);
const columnDefs = ref([]);

onMounted(async () => {
  try {
    const data = await api.browseData(sessionStore.sessionId, 'identities');
    rows.value = data.rows;
    columnDefs.value = data.columns.map(col => ({
      field: col,
      headerName: col
    }));
  } catch (e) {
    error.value = e.userMessage || 'Failed to load identities';
  } finally {
    loading.value = false;
  }
});
</script>