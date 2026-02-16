<template>
  <div 
    class="file-dropzone"
    :class="{ 
      'dragover': isDragOver,
      'has-file': file !== null,
      'uploading': isUploading,
      'error': hasError
    }"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <!-- Upload State -->
    <div v-if="!file && !isUploading" class="dropzone-content">
      <div class="dropzone-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
        </svg>
      </div>
      
      <h5 class="dropzone-title">{{ title }}</h5>
      <p class="dropzone-hint text-muted">
        Drag and drop {{ fileType }} CSV file here, or 
        <label class="file-input-label">
          browse
          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            @change="onFileSelect"
            class="d-none"
          />
        </label>
      </p>
      
      <small v-if="helpText" class="text-muted">{{ helpText }}</small>
    </div>
    
    <!-- Uploading State -->
    <div v-else-if="isUploading" class="dropzone-content">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Uploading...</span>
      </div>
      <p class="mb-0">Uploading {{ file?.name }}...</p>
    </div>
    
    <!-- File Uploaded State -->
    <div v-else-if="file" class="dropzone-content">
      <div class="file-info">
        <div class="file-icon text-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
            <path d="M4.5 0A2.5 2.5 0 0 0 2 2.5v11A2.5 2.5 0 0 0 4.5 16h7a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 11.5 0h-7zM3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 13.5v-11z"/>
          </svg>
        </div>
        
        <div class="file-details">
          <p class="file-name mb-1">{{ file.name }}</p>
          <p class="file-meta text-muted mb-0">
            {{ formatFileSize(file.size) }}
            <span v-if="rowCount"> • {{ rowCount.toLocaleString() }} rows</span>
          </p>
        </div>
        
        <button
          v-if="allowRemove"
          type="button"
          class="btn btn-sm btn-outline-danger"
          @click="onRemove"
          :disabled="isUploading"
        >
          Remove
        </button>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-if="hasError" class="error-message">
      <small class="text-danger">{{ errorMessage }}</small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    validator: (value) => ['identities', 'assignments', 'entitlements'].includes(value)
  },
  helpText: {
    type: String,
    default: ''
  },
  allowRemove: {
    type: Boolean,
    default: true
  },
  file: {
    type: Object,
    default: null
  },
  isUploading: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  rowCount: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['file-selected', 'file-removed']);

const fileInput = ref(null);
const isDragOver = ref(false);

const hasError = computed(() => !!props.errorMessage);

// Drag and drop handlers
const onDragEnter = () => {
  isDragOver.value = true;
};

const onDragOver = () => {
  isDragOver.value = true;
};

const onDragLeave = () => {
  isDragOver.value = false;
};

const onDrop = (event) => {
  isDragOver.value = false;
  
  const files = event.dataTransfer.files;
  
  if (files.length === 0) return;
  
  const file = files[0];
  
  // Validate file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return;
  }
  
  emit('file-selected', file);
};

// File input handler
const onFileSelect = (event) => {
  const files = event.target.files;
  
  if (files.length === 0) return;
  
  const file = files[0];
  
  emit('file-selected', file);
  
  // Reset input to allow re-selection of same file
  event.target.value = '';
};

// Remove file handler
const onRemove = () => {
  emit('file-removed');
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
</script>

<style scoped>
.file-dropzone {
  position: relative;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s ease;
  background-color: #f8f9fa;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.file-dropzone:hover {
  border-color: #adb5bd;
  background-color: #e9ecef;
}

.file-dropzone.dragover {
  border-color: #0d6efd;
  background-color: #e7f1ff;
}

.file-dropzone.has-file {
  border-color: #198754;
  background-color: #d1e7dd;
}

.file-dropzone.uploading {
  border-color: #0d6efd;
  background-color: #cfe2ff;
}

.file-dropzone.error {
  border-color: #dc3545;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.dropzone-icon {
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.dropzone-title {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  color: #212529;
}

.dropzone-hint {
  margin-bottom: 0;
  font-size: 0.9rem;
}

.file-input-label {
  color: #0d6efd;
  cursor: pointer;
  text-decoration: underline;
}

.file-input-label:hover {
  color: #0a58ca;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 500px;
}

.file-icon {
  flex-shrink: 0;
}

.file-details {
  flex-grow: 1;
  text-align: left;
}

.file-name {
  font-weight: 500;
  color: #212529;
  word-break: break-word;
}

.file-meta {
  font-size: 0.875rem;
}

.error-message {
  margin-top: 0.5rem;
}
</style>
