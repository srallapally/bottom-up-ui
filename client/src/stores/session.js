/**
 * Role Mining UI - Session Store
 * 
 * Manages session lifecycle and file uploads
 * Tracks uploaded files and processed stats
 */

import { defineStore } from 'pinia';
import api from '@/services/api';
import { validateFile } from '@/services/csv';

export const useSessionStore = defineStore('session', {
  state: () => ({
    currentSession: null,  // { session_id, created_at, status }
    uploadedFiles: {
      identities: null,    // { filename, size, uploadedAt }
      assignments: null,
      entitlements: null
    },
    processedStats: null,  // { total_users, total_entitlements, apps, ... }
    config: null,          // Mining config object
    loading: false,
    error: null
  }),
  
  getters: {
    /**
     * Check if session exists
     */
    hasSession: (state) => !!state.currentSession,
    
    /**
     * Get session ID
     */
    sessionId: (state) => state.currentSession?.session_id || null,
    
    /**
     * Check if all 3 required files uploaded
     */
    allFilesUploaded: (state) => {
      return !!(
        state.uploadedFiles.identities &&
        state.uploadedFiles.assignments &&
        state.uploadedFiles.entitlements
      );
    },
    
    /**
     * Check if identities file uploaded
     */
    hasIdentities: (state) => !!state.uploadedFiles.identities,
    
    /**
     * Check if assignments file uploaded
     */
    hasAssignments: (state) => !!state.uploadedFiles.assignments,
    
    /**
     * Check if entitlements file uploaded
     */
    hasEntitlements: (state) => !!state.uploadedFiles.entitlements,
    
    /**
     * Check if files have been processed
     */
    filesProcessed: (state) => !!state.processedStats,
    
    /**
     * Get count of uploaded files
     */
    uploadedFileCount: (state) => {
      let count = 0;
      if (state.uploadedFiles.identities) count++;
      if (state.uploadedFiles.assignments) count++;
      if (state.uploadedFiles.entitlements) count++;
      return count;
    },
    
    /**
     * Get total users from processed stats
     */
    totalUsers: (state) => state.processedStats?.total_users || 0,
    
    /**
     * Get total entitlements from processed stats
     */
    totalEntitlements: (state) => state.processedStats?.total_entitlements || 0
  },
  
  actions: {
    /**
     * Create a new session
     * Returns session_id
     */
    async createSession() {
      this.loading = true;
      this.error = null;
      
      try {
        const data = await api.createSession();
        
        this.currentSession = {
          session_id: data.session_id,
          created_at: new Date().toISOString(),
          status: 'created'
        };
        
        // Reset upload state
        this.resetUploadState();
        
        console.log('[Session] Created:', this.currentSession.session_id);
        
        return this.currentSession.session_id;
      } catch (error) {
        this.error = error.userMessage || 'Failed to create session';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Delete a session
     */
    async deleteSession(sessionId) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.deleteSession(sessionId);
        
        this.currentSession = null;
        this.resetUploadState();
        
        console.log('[Session] Deleted:', sessionId);
        
        return true;
      } catch (error) {
        this.error = error.userMessage || 'Failed to delete session';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Upload a file
     * @param {string} fileType - One of: identities, assignments, entitlements
     * @param {File} file - File object
     */
    async uploadFile(fileType, file) {
      if (!this.currentSession) {
        throw new Error('No active session');
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        // Client-side validation
        console.log(`[Session] Validating ${fileType} file...`);
        const validation = await validateFile(file, fileType);
        
        if (!validation.valid) {
          const errorMsg = `Validation failed: ${validation.errors.join(', ')}`;
          this.error = errorMsg;
          throw new Error(errorMsg);
        }
        
        console.log(`[Session] Uploading ${fileType} file...`);
        
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_type', fileType);
        
        // Upload to backend
        await api.uploadFiles(formData);
        
        // Track upload in state
        this.uploadedFiles[fileType] = {
          filename: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          rowCount: validation.rowCount,
          columns: validation.columns
        };
        
        console.log(`[Session] Uploaded ${fileType}:`, {
          filename: file.name,
          size: file.size,
          rows: validation.rowCount
        });
        
        return this.uploadedFiles[fileType];
      } catch (error) {
        this.error = error.userMessage || error.message || 'Upload failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Process uploaded files
     * Backend validates and loads CSVs into memory
     */
    async processFiles() {
      if (!this.currentSession) {
        throw new Error('No active session');
      }
      
      if (!this.allFilesUploaded) {
        throw new Error('All 3 files must be uploaded before processing');
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        console.log('[Session] Processing files...');
        
        // POST /api/sessions/{id}/process
        const response = await api.processFiles(this.currentSession.session_id);
        
        this.processedStats = response.stats;
        
        console.log('[Session] Files processed:', {
          users: this.processedStats.total_users,
          entitlements: this.processedStats.total_entitlements,
          apps: this.processedStats.apps?.length || 0
        });
        
        return this.processedStats;
      } catch (error) {
        this.error = error.userMessage || 'Failed to process files';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Get mining configuration
     */
    async getConfig() {
      if (!this.currentSession) {
        throw new Error('No active session');
      }
      
      try {
        const config = await api.getConfig(this.currentSession.session_id);
        
        this.config = config;
        
        console.log('[Session] Config loaded');
        
        return this.config;
      } catch (error) {
        this.error = error.userMessage || 'Failed to load config';
        throw error;
      }
    },
    
    /**
     * Save mining configuration
     */
    async saveConfig(configOverrides) {
      if (!this.currentSession) {
        throw new Error('No active session');
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        console.log('[Session] Saving config...');
        
        const config = await api.saveConfig(
          this.currentSession.session_id,
          configOverrides
        );
        
        this.config = config;
        
        console.log('[Session] Config saved');
        
        return this.config;
      } catch (error) {
        this.error = error.userMessage || 'Failed to save config';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Reset upload state
     */
    resetUploadState() {
      this.uploadedFiles = {
        identities: null,
        assignments: null,
        entitlements: null
      };
      this.processedStats = null;
      this.config = null;
      this.error = null;
    },
    
    /**
     * Clear all session data
     */
    clearSession() {
      this.currentSession = null;
      this.resetUploadState();
      this.error = null;
    }
  }
});
