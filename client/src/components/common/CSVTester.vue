<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">CSV Service Tester</h5>
    </div>
    <div class="card-body">
      <!-- File Type Selection -->
      <div class="mb-3">
        <label class="form-label">File Type</label>
        <select v-model="fileType" class="form-select">
          <option value="identities">Identities</option>
          <option value="assignments">Assignments</option>
          <option value="entitlements">Entitlements</option>
        </select>
        <div class="form-text">
          Required columns: {{ requiredColumns.join(', ') }}
        </div>
      </div>
      
      <!-- File Upload -->
      <div class="mb-3">
        <label class="form-label">Select CSV File</label>
        <input 
          type="file" 
          class="form-control"
          accept=".csv"
          @change="handleFileSelect"
        />
      </div>
      
      <!-- Validation Results -->
      <div v-if="validationResult" class="mt-4">
        <div v-if="validationResult.valid" class="alert alert-success">
          <h6 class="alert-heading">✓ Validation Passed</h6>
          <p class="mb-0">
            File is valid with {{ validationResult.rowCount }} rows.
          </p>
          <div class="mt-2 small">
            <strong>Columns found:</strong> {{ validationResult.columns.join(', ') }}
          </div>
        </div>
        
        <div v-else class="alert alert-danger">
          <h6 class="alert-heading">✗ Validation Failed</h6>
          <ul class="mb-0">
            <li v-for="(error, index) in validationResult.errors" :key="index">
              {{ error }}
            </li>
          </ul>
        </div>
        
        <!-- Sample Data Preview -->
        <div v-if="validationResult.sample && validationResult.sample.length > 0" class="mt-3">
          <h6>Sample Data (first 5 rows):</h6>
          <div class="table-responsive">
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th v-for="col in validationResult.columns" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in validationResult.sample" :key="idx">
                  <td v-for="col in validationResult.columns" :key="col">
                    {{ row[col] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Validating...</span>
        </div>
        <p class="mt-2 text-muted">Validating CSV file...</p>
      </div>
      
      <!-- File Info -->
      <div v-if="selectedFile" class="mt-3">
        <h6>File Information:</h6>
        <ul class="list-unstyled small text-muted">
          <li><strong>Name:</strong> {{ selectedFile.name }}</li>
          <li><strong>Size:</strong> {{ formattedSize }}</li>
          <li><strong>Type:</strong> {{ selectedFile.type || 'text/csv' }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  validateFile, 
  getRequiredColumns, 
  formatFileSize 
} from '@/services/csv';

const fileType = ref('identities');
const selectedFile = ref(null);
const validationResult = ref(null);
const loading = ref(false);

const requiredColumns = computed(() => {
  return getRequiredColumns(fileType.value);
});

const formattedSize = computed(() => {
  return selectedFile.value ? formatFileSize(selectedFile.value.size) : '0 Bytes';
});

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  
  if (!file) {
    selectedFile.value = null;
    validationResult.value = null;
    return;
  }
  
  selectedFile.value = file;
  loading.value = true;
  validationResult.value = null;
  
  try {
    const result = await validateFile(file, fileType.value);
    validationResult.value = result;
  } catch (error) {
    validationResult.value = {
      valid: false,
      errors: [error.message],
      rowCount: 0,
      columns: []
    };
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.card {
  max-width: 800px;
  margin: 2rem auto;
}

.table {
  font-size: 0.875rem;
}

.table td {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
