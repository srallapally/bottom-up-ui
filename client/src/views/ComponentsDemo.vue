<template>
  <div class="container">
    <h2>Common Components Demo</h2>
    <p class="text-muted">Testing LoadingSpinner, ErrorAlert, and ConfirmDialog</p>

    <hr class="my-4" />

    <!-- LoadingSpinner Demo -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">LoadingSpinner Component</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <h6>Small</h6>
            <LoadingSpinner size="sm" message="Loading..." />
          </div>
          <div class="col-md-4">
            <h6>Medium (default)</h6>
            <LoadingSpinner message="Processing data..." />
          </div>
          <div class="col-md-4">
            <h6>Large</h6>
            <LoadingSpinner size="lg" message="Mining roles..." />
          </div>
        </div>
        <div class="row mt-4">
          <div class="col-12">
            <h6>Blocking (full height)</h6>
            <LoadingSpinner blocking message="This blocks the entire area" />
          </div>
        </div>
      </div>
    </div>

    <!-- ErrorAlert Demo -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">ErrorAlert Component</h5>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <h6>Danger (default)</h6>
          <ErrorAlert
            title="Upload Failed"
            message="The CSV file could not be processed. Please check the file format."
            @dismiss="console.log('Dismissed')"
          />
        </div>
        <div class="mb-3">
          <h6>Warning</h6>
          <ErrorAlert
            variant="warning"
            title="Missing Data"
            message="Some rows in your file are missing required columns."
            @dismiss="console.log('Dismissed')"
          />
        </div>
        <div class="mb-3">
          <h6>Info</h6>
          <ErrorAlert
            variant="info"
            message="Mining process will take approximately 3 minutes to complete."
            @dismiss="console.log('Dismissed')"
          />
        </div>
        <div class="mb-3">
          <h6>Success</h6>
          <ErrorAlert
            variant="success"
            title="Success"
            message="Role mining completed successfully. 159 roles discovered."
            @dismiss="console.log('Dismissed')"
          />
        </div>
        <div class="mb-3">
          <h6>Non-dismissible</h6>
          <ErrorAlert
            variant="danger"
            message="Critical error: Session expired. Please login again."
            :dismissible="false"
          />
        </div>
      </div>
    </div>

    <!-- ConfirmDialog Demo -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">ConfirmDialog Component</h5>
      </div>
      <div class="card-body">
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-danger" @click="showDeleteConfirm">
            Delete Session (Danger)
          </button>
          <button class="btn btn-warning" @click="showOverwriteConfirm">
            Overwrite Data (Warning)
          </button>
          <button class="btn btn-primary" @click="showSaveConfirm">
            Save Changes (Primary)
          </button>
        </div>
        <div v-if="lastAction" class="alert alert-info mt-3">
          Last action: {{ lastAction }}
        </div>
      </div>
    </div>

    <ConfirmDialog
      ref="confirmDialog"
      :title="dialogTitle"
      :message="dialogMessage"
      :variant="dialogVariant"
      :confirm-text="dialogConfirmText"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const confirmDialog = ref(null);
const lastAction = ref('');

const dialogTitle = ref('');
const dialogMessage = ref('');
const dialogVariant = ref('danger');
const dialogConfirmText = ref('Confirm');

const showDeleteConfirm = async () => {
  dialogTitle.value = 'Delete Session';
  dialogMessage.value = 'Are you sure you want to delete this session? This action cannot be undone.';
  dialogVariant.value = 'danger';
  dialogConfirmText.value = 'Delete';
  
  try {
    await confirmDialog.value.show();
    lastAction.value = 'Session deleted (confirmed)';
  } catch {
    lastAction.value = 'Delete cancelled';
  }
};

const showOverwriteConfirm = async () => {
  dialogTitle.value = 'Overwrite Data';
  dialogMessage.value = 'Uploading new files will replace existing data. Do you want to continue?';
  dialogVariant.value = 'warning';
  dialogConfirmText.value = 'Overwrite';
  
  try {
    await confirmDialog.value.show();
    lastAction.value = 'Data overwritten (confirmed)';
  } catch {
    lastAction.value = 'Overwrite cancelled';
  }
};

const showSaveConfirm = async () => {
  dialogTitle.value = 'Save Configuration';
  dialogMessage.value = 'Save the current mining configuration for this session?';
  dialogVariant.value = 'primary';
  dialogConfirmText.value = 'Save';
  
  try {
    await confirmDialog.value.show();
    lastAction.value = 'Configuration saved (confirmed)';
  } catch {
    lastAction.value = 'Save cancelled';
  }
};

const handleConfirm = () => {
  console.log('Dialog confirmed');
};

const handleCancel = () => {
  console.log('Dialog cancelled');
};
</script>
