<template>
  <div class="container mt-4">
    <div class="mb-4">
      <h2 class="mb-1">Upload Files</h2>
      <p class="text-muted mb-0">Upload identities, assignments, and entitlements CSV files</p>
    </div>
    
    <!-- Progress Indicator -->
    <div class="upload-progress-header mb-4">
      <div class="progress-steps">
        <div 
          class="progress-step"
          :class="{ 
            'step-active': currentStep === 1,
            'step-completed': sessionStore.hasIdentities
          }"
        >
          <div class="step-number">1</div>
          <div class="step-label">Identities</div>
        </div>
        
        <div class="step-connector" :class="{ 'connector-completed': sessionStore.hasIdentities }"></div>
        
        <div 
          class="progress-step"
          :class="{ 
            'step-active': currentStep === 2,
            'step-completed': sessionStore.hasAssignments
          }"
        >
          <div class="step-number">2</div>
          <div class="step-label">Assignments</div>
        </div>
        
        <div class="step-connector" :class="{ 'connector-completed': sessionStore.hasAssignments }"></div>
        
        <div 
          class="progress-step"
          :class="{ 
            'step-active': currentStep === 3,
            'step-completed': sessionStore.hasEntitlements
          }"
        >
          <div class="step-number">3</div>
          <div class="step-label">Entitlements</div>
        </div>
      </div>
    </div>
    
    <!-- Validation Errors -->
    <ValidationErrors
      v-if="validationErrors.length > 0"
      :errors="validationErrors"
      title="File Validation Failed"
      :summary="`Issues found in ${currentFileType} file:`"
      @dismiss="validationErrors = []"
    />
    
    <!-- Upload Section: Identities -->
    <div v-show="currentStep === 1" class="upload-step mb-4">
      <FileDropzone
        title="Upload Identities"
        file-type="identities"
        help-text="CSV file with user identity data (user_id, department, job_title, etc.)"
        :file="uploadedFiles.identities"
        :is-uploading="uploadingFile === 'identities'"
        :error-message="uploadError"
        :row-count="uploadedFiles.identities?.rowCount"
        @file-selected="(file) => handleFileSelected('identities', file)"
        @file-removed="() => handleFileRemoved('identities')"
      />
      
      <div class="step-actions mt-3">
        <router-link to="/dashboard" class="btn btn-outline-secondary">
          Back to Dashboard
        </router-link>
        
        <button
          v-if="sessionStore.hasIdentities"
          class="btn btn-primary"
          @click="currentStep = 2"
        >
          Next: Assignments
        </button>
      </div>
    </div>
    
    <!-- Upload Section: Assignments -->
    <div v-show="currentStep === 2" class="upload-step mb-4">
      <FileDropzone
        title="Upload Assignments"
        file-type="assignments"
        help-text="CSV file mapping users to entitlements (user_id, entitlement_id)"
        :file="uploadedFiles.assignments"
        :is-uploading="uploadingFile === 'assignments'"
        :error-message="uploadError"
        :row-count="uploadedFiles.assignments?.rowCount"
        @file-selected="(file) => handleFileSelected('assignments', file)"
        @file-removed="() => handleFileRemoved('assignments')"
      />
      
      <div class="step-actions mt-3">
        <button
          class="btn btn-outline-secondary"
          @click="currentStep = 1"
        >
          Back: Identities
        </button>
        
        <button
          v-if="sessionStore.hasAssignments"
          class="btn btn-primary"
          @click="currentStep = 3"
        >
          Next: Entitlements
        </button>
      </div>
    </div>
    
    <!-- Upload Section: Entitlements -->
    <div v-show="currentStep === 3" class="upload-step mb-4">
      <FileDropzone
        title="Upload Entitlements"
        file-type="entitlements"
        help-text="CSV file with entitlement metadata (entitlement_id, app_id, name, type)"
        :file="uploadedFiles.entitlements"
        :is-uploading="uploadingFile === 'entitlements'"
        :error-message="uploadError"
        :row-count="uploadedFiles.entitlements?.rowCount"
        @file-selected="(file) => handleFileSelected('entitlements', file)"
        @file-removed="() => handleFileRemoved('entitlements')"
      />
      
      <div class="step-actions mt-3">
        <button
          class="btn btn-outline-secondary"
          @click="currentStep = 2"
        >
          Back: Assignments
        </button>
        
        <button
          v-if="sessionStore.allFilesUploaded"
          class="btn btn-success"
          @click="handleContinue"
          :disabled="isProcessing"
        >
          <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Processing...</span>
          </span>
          Continue to Configure
        </button>
      </div>
    </div>
    
    <!-- Upload Summary Card -->
    <div v-if="sessionStore.uploadedFileCount > 0" class="card">
      <div class="card-body">
        <h6 class="card-title">Upload Summary</h6>
        
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>File Type</th>
                <th>Filename</th>
                <th>Rows</th>
                <th>Size</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="uploadedFiles.identities">
                <td>Identities</td>
                <td>{{ uploadedFiles.identities.filename }}</td>
                <td>{{ formatNumber(uploadedFiles.identities.rowCount) }}</td>
                <td>{{ formatFileSize(uploadedFiles.identities.size) }}</td>
                <td><span class="badge bg-success">Uploaded</span></td>
              </tr>
              
              <tr v-if="uploadedFiles.assignments">
                <td>Assignments</td>
                <td>{{ uploadedFiles.assignments.filename }}</td>
                <td>{{ formatNumber(uploadedFiles.assignments.rowCount) }}</td>
                <td>{{ formatFileSize(uploadedFiles.assignments.size) }}</td>
                <td><span class="badge bg-success">Uploaded</span></td>
              </tr>
              
              <tr v-if="uploadedFiles.entitlements">
                <td>Entitlements</td>
                <td>{{ uploadedFiles.entitlements.filename }}</td>
                <td>{{ formatNumber(uploadedFiles.entitlements.rowCount) }}</td>
                <td>{{ formatFileSize(uploadedFiles.entitlements.size) }}</td>
                <td><span class="badge bg-success">Uploaded</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionStore } from '@/stores/session';
import FileDropzone from '@/components/upload/FileDropzone.vue';
import ValidationErrors from '@/components/upload/ValidationErrors.vue';

const router = useRouter();
const sessionStore = useSessionStore();

// State
const currentStep = ref(1);
const uploadingFile = ref(null);
const uploadError = ref('');
const validationErrors = ref([]);
const currentFileType = ref('');
const isProcessing = ref(false);

// Track uploaded files locally for display
const uploadedFiles = computed(() => sessionStore.uploadedFiles);

// Determine initial step based on upload progress
onMounted(() => {
  if (!sessionStore.hasSession) {
    router.push('/dashboard');
    return;
  }
  
  // Start at first incomplete step
  if (!sessionStore.hasIdentities) {
    currentStep.value = 1;
  } else if (!sessionStore.hasAssignments) {
    currentStep.value = 2;
  } else if (!sessionStore.hasEntitlements) {
    currentStep.value = 3;
  } else {
    currentStep.value = 3; // All uploaded, stay on step 3
  }
});

// File selection handler
const handleFileSelected = async (fileType, file) => {
  uploadingFile.value = fileType;
  uploadError.value = '';
  validationErrors.value = [];
  currentFileType.value = fileType;
  
  try {
    await sessionStore.uploadFile(fileType, file);
    
    // Auto-advance to next step after successful upload
    if (fileType === 'identities') {
      currentStep.value = 2;
    } else if (fileType === 'assignments') {
      currentStep.value = 3;
    }
    // Stay on step 3 if entitlements uploaded
    
  } catch (error) {
    console.error(`Upload failed for ${fileType}:`, error);
    
    // Extract validation errors if available
    if (error.message && error.message.includes('Validation failed:')) {
      const errorMsg = error.message.replace('Validation failed: ', '');
      validationErrors.value = errorMsg.split(', ');
    } else {
      uploadError.value = error.userMessage || error.message || 'Upload failed';
    }
  } finally {
    uploadingFile.value = null;
  }
};

// File removal handler
const handleFileRemoved = (fileType) => {
  // In session store, this would mark file as null
  sessionStore.uploadedFiles[fileType] = null;
  uploadError.value = '';
  validationErrors.value = [];
};

// Continue to configure
const handleContinue = async () => {
  isProcessing.value = true;
  
  try {
    // Process files on backend (validates and loads into memory)
    await sessionStore.processFiles();
    
    // Navigate to configure
    router.push('/configure');
  } catch (error) {
    console.error('Failed to process files:', error);
    uploadError.value = error.userMessage || 'Failed to process files';
  } finally {
    isProcessing.value = false;
  }
};

// Formatters
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
</script>

<style scoped>
.upload-progress-header {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.step-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.progress-step.step-active .step-number {
  background-color: #0d6efd;
  color: white;
}

.progress-step.step-active .step-label {
  color: #0d6efd;
}

.progress-step.step-completed .step-number {
  background-color: #198754;
  color: white;
}

.progress-step.step-completed .step-label {
  color: #198754;
}

.step-connector {
  width: 80px;
  height: 2px;
  background-color: #e9ecef;
  margin: 0 1rem;
  margin-bottom: 1.75rem;
  transition: all 0.3s ease;
}

.step-connector.connector-completed {
  background-color: #198754;
}

.upload-step {
  max-width: 700px;
  margin: 0 auto;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
</style>
