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
          Includes confidence scores from mining results. Click the info icon to see breakdown.
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

    <!-- Confidence Detail Drawer -->
    <ConfidenceDrawer
        :show="drawerOpen"
        :data="selectedRow"
        @close="drawerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue';
import { useSessionStore } from '@/stores/session';
import api from '@/services/api';
import AGGridWrapper from '@/components/tables/AGGridWrapper.vue';
import ConfidenceDrawer from '@/components/assignments/ConfidenceDrawer.vue';

const sessionStore = useSessionStore();
const rows = ref([]);
const loading = ref(true);
const error = ref(null);
const columnDefs = ref([]);
const hasConfidence = ref(false);
const drawerOpen = ref(false);
const selectedRow = ref(null);

// Info icon cell renderer
const InfoIconRenderer = (params) => {
  const icon = document.createElement('button');
  icon.className = 'btn btn-sm btn-link p-0';
  icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
    </svg>
  `;
  icon.style.color = '#0d6efd';
  icon.style.cursor = 'pointer';
  icon.title = 'View confidence breakdown';
  
  icon.addEventListener('click', () => {
    selectedRow.value = params.data;
    drawerOpen.value = true;
  });
  
  return icon;
};

onMounted(async () => {
  try {
    const data = await api.browseData(sessionStore.sessionId, 'assignments');
    rows.value = data.rows;
    
    // Debug: Log what columns we have
    console.log('Assignments columns:', data.columns);
    console.log('Has confidence_level:', data.columns.includes('confidence_level'));
    console.log('Has confidence:', data.columns.includes('confidence'));
    
    // Check if data has confidence scores - be more defensive
    hasConfidence.value = data.columns.includes('confidence_level')
        || data.columns.includes('confidence');

    // Build column definitions
    const cols = data.columns.map(col => {
      const def = { field: col, headerName: col };

      // Color-code confidence label column
      if (col === 'confidence_level') {
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

    // Add info icon column at the beginning if we have confidence data
    if (hasConfidence.value) {
      cols.unshift({
        headerName: '',
        field: 'info',
        cellRenderer: InfoIconRenderer,
        width: 50,
        sortable: false,
        filter: false,
        pinned: 'left'
      });
    }

    columnDefs.value = cols;
  } catch (e) {
    error.value = e.userMessage || 'Failed to load assignments';
  } finally {
    loading.value = false;
  }
});
</script>