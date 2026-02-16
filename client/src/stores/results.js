/**
 * Role Mining UI - Results Store
 * 
 * Manages mining results and export
 * Handles 3-minute blocking mining operation
 */

import { defineStore } from 'pinia';
import api from '@/services/api';

export const useResultsStore = defineStore('results', {
  state: () => ({
    results: null,         // Full results JSON from mining
    loading: false,
    error: null,
    miningStartTime: null,
    miningEndTime: null
  }),
  
  getters: {
    /**
     * Get list of roles
     */
    roles: (state) => state.results?.roles || [],
    
    /**
     * Get birthright role
     */
    birthrightRole: (state) => state.results?.birthright_role || null,
    
    /**
     * Get summary statistics
     */
    summary: (state) => state.results?.summary || {},
    
    /**
     * Get confidence scoring data
     */
    confidenceScoring: (state) => state.results?.confidence_scoring || {},
    
    /**
     * Check if results exist
     */
    hasResults: (state) => !!state.results,
    
    /**
     * Get total roles count
     */
    totalRoles: (state) => state.results?.summary?.total_roles || 0,
    
    /**
     * Get total users count
     */
    totalUsers: (state) => state.results?.summary?.total_users || 0,
    
    /**
     * Get assigned users count
     */
    assignedUsers: (state) => state.results?.summary?.assigned_users || 0,
    
    /**
     * Get mining duration in seconds
     */
    miningDuration: (state) => {
      if (!state.miningStartTime || !state.miningEndTime) return null;
      return Math.round((state.miningEndTime - state.miningStartTime) / 1000);
    },
    
    /**
     * Check if currently mining
     */
    isMining: (state) => state.loading,
    
    /**
     * Get Leiden clustering stats
     */
    leidenStats: (state) => state.results?.leiden_stats || {},
    
    /**
     * Get recommendations data
     */
    recommendations: (state) => state.results?.recommendations || [],
    
    /**
     * Get over-provisioned users
     */
    overProvisioned: (state) => state.results?.over_provisioned || []
  },
  
  actions: {
    /**
     * Start role mining
     * This is a blocking operation that takes ~3 minutes
     * 
     * @param {string} sessionId - Session ID
     * @param {Object} configOverrides - Optional config overrides
     */
    async mine(sessionId, configOverrides = {}) {
      this.loading = true;
      this.error = null;
      this.miningStartTime = Date.now();
      this.miningEndTime = null;
      
      try {
        console.log('[Results] Starting mining...', {
          sessionId,
          configOverrides
        });
        
        // POST /api/sessions/{id}/mine
        // Blocking call with 5-minute timeout
        const results = await api.mine(sessionId, configOverrides);
        
        this.results = results;
        this.miningEndTime = Date.now();
        
        const duration = this.miningDuration;
        
        console.log('[Results] Mining complete:', {
          duration: `${duration}s`,
          roles: this.totalRoles,
          users: this.totalUsers
        });
        
        return this.results;
      } catch (error) {
        this.error = error.userMessage || 'Mining failed';
        this.miningEndTime = Date.now();
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Load existing results
     * For resuming a session with completed mining
     * 
     * @param {string} sessionId - Session ID
     */
    async loadResults(sessionId) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('[Results] Loading results...');
        
        // GET /api/sessions/{id}/results
        const results = await api.getMiningResults(sessionId);
        
        this.results = results;
        
        console.log('[Results] Results loaded:', {
          roles: this.totalRoles,
          users: this.totalUsers
        });
        
        return this.results;
      } catch (error) {
        this.error = error.userMessage || 'Failed to load results';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Export all roles
     * Downloads ZIP file with role definitions and assignments
     * 
     * @param {string} sessionId - Session ID
     */
    async exportAll(sessionId) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('[Results] Exporting roles...');
        
        // GET /api/sessions/{id}/export (blob response)
        const blob = await api.exportRoles(sessionId);
        
        // Trigger browser download
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `role_mining_${sessionId.slice(0, 8)}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        console.log('[Results] Export complete');
        
        return true;
      } catch (error) {
        this.error = error.userMessage || 'Export failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Get recommendations for a user
     * 
     * @param {string} userId - User ID
     */
    async getRecommendations(userId) {
      try {
        const data = await api.getRecommendations(userId);
        return data;
      } catch (error) {
        this.error = error.userMessage || 'Failed to load recommendations';
        throw error;
      }
    },
    
    /**
     * Get over-provisioned users
     */
    async getOverProvisioned() {
      try {
        const data = await api.getOverProvisioned();
        return data;
      } catch (error) {
        this.error = error.userMessage || 'Failed to load over-provisioned users';
        throw error;
      }
    },
    
    /**
     * Get assignments with confidence scores
     * 
     * @param {Object} params - Query params (filters, pagination)
     */
    async getAssignments(params = {}) {
      try {
        const data = await api.getAssignments(params);
        return data;
      } catch (error) {
        this.error = error.userMessage || 'Failed to load assignments';
        throw error;
      }
    },
    
    /**
     * Clear results
     */
    clearResults() {
      this.results = null;
      this.error = null;
      this.miningStartTime = null;
      this.miningEndTime = null;
    },
    
    /**
     * Clear error
     */
    clearError() {
      this.error = null;
    }
  }
});
