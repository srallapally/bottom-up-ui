<!-- client/src/components/tables/AGGridWrapper.vue -->
<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm me-2"></div>
      Loading data...
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <template v-else>
      <div class="d-flex justify-content-between align-items-center mb-2">
        <small class="text-muted">{{ rowData.length }} rows</small>
        <button class="btn btn-outline-secondary btn-sm" @click="exportCsv">
          Export CSV
        </button>
      </div>

      <ag-grid-vue
          :style="{ height: gridHeight, width: '100%' }"
          :theme="theme"
          :columnDefs="columnDefs"
          :rowData="rowData"
          :defaultColDef="defaultColDef"
          :pagination="true"
          :paginationPageSize="pageSize"
          :paginationPageSizeSelector="[25, 50, 100, 500]"
          @grid-ready="onGridReady"
      />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { themeAlpine } from 'ag-grid-community';

const theme = themeAlpine;

const props = defineProps({
  columnDefs: { type: Array, required: true },
  rowData: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  gridHeight: { type: String, default: '500px' },
  pageSize: { type: Number, default: 50 },
  exportFilename: { type: String, default: 'export' }
});

const gridApi = ref(null);

const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  minWidth: 100
};

const onGridReady = (params) => {
  gridApi.value = params.api;
  params.api.sizeColumnsToFit();
};

const exportCsv = () => {
  if (gridApi.value) {
    gridApi.value.exportDataAsCsv({
      fileName: `${props.exportFilename}.csv`
    });
  }
};
</script>