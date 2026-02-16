<!-- client/src/views/browse/AssignmentsView.vue -->
<template>
  <div class="container-fluid mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <router-link to="/results" class="text-muted text-decoration-none small d-block mb-1">
          &larr; Back to results
        </router-link>
        <h3 class="mb-0">Assignments</h3>
        <small v-if="hasConfidence" class="text-muted">
          Includes confidence scores from mining results
        </small>
      </div>
    </div>

    <AGGridWrapper
        :columnDefs="columnDefs"
        :rowData="rows"
        :loading="loading"
        :error="error"
        gridHeight="600px"
        :pageSize="100"
        exportFilename="assignments"
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
const hasConfidence = ref(false);

onMounted(async () => {
  try {
    const data = await api.browseData(sessionStore.sessionId, 'assignments');
    rows.value = data.rows;
    hasConfidence.value = data.columns.includes('confidence_label')
        || data.columns.includes('confidence');

    columnDefs.value = data.columns.map(col => {
      const def = { field: col, headerName: col };

      // Color-code confidence label column
      if (col === 'confidence_label') {
        def.cellStyle = (params) => {
          const val = params.value;
          if (val === 'HIGH') return { color: '#198754', fontWeight: 'bold' };
          if (val === 'MEDIUM') return { color: '#ffc107', fontWeight: 'bold' };
          if (val === 'LOW') return { color: '#dc3545', fontWeight: 'bold' };
          return null;
        };
      }

      // Format confidence as percentage
      if (col === 'confidence') {
        def.valueFormatter = (params) => {
          const v = parseFloat(params.value);
          return isNaN(v) ? params.value : `${(v * 100).toFixed(0)}%`;
        };
      }

      return def;
    });
  } catch (e) {
    error.value = e.userMessage || 'Failed to load assignments';
  } finally {
    loading.value = false;
  }
});
</script>