/**
 * Role Mining UI - Auth Store
 * 
 * Manages authentication state (mock user for now)
 * Express auto-creates mock user session on /auth/session
 */

import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,           // { id, email, displayName }
    authenticated: false,
    loading: false,
    error: null
  }),
  
  getters: {
    /**
     * Get user display name
     */
    userName: (state) => state.user?.displayName || 'User',
    
    /**
     * Get user email
     */
    userEmail: (state) => state.user?.email || '',
    
    /**
     * Get user ID
     */
    userId: (state) => state.user?.id || null,
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated: (state) => state.authenticated
  },
  
  actions: {
    /**
     * Check session status
     * Express auto-creates mock user if not exists
     */
    async checkSession() {
      this.loading = true;
      this.error = null;
      
      try {
        // GET /auth/session - Express creates mock user
        // Note: /auth is proxied directly (not under /api)
        const response = await axios.get('/auth/session', {
          withCredentials: true
        });
        
        this.user = response.data.user;
        this.authenticated = response.data.authenticated;
        
        console.log('[Auth] Session checked:', {
          authenticated: this.authenticated,
          userId: this.user?.id
        });
        
        return this.user;
      } catch (error) {
        this.error = error.userMessage || 'Failed to check session';
        this.authenticated = false;
        this.user = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Logout user
     * Destroys session on server
     */
    async logout() {
      try {
        await axios.get('/auth/logout', {
          withCredentials: true
        });
        
        this.user = null;
        this.authenticated = false;
        
        console.log('[Auth] User logged out');
        
        // Router navigation should be handled by caller
        return true;
      } catch (error) {
        this.error = error.userMessage || 'Logout failed';
        throw error;
      }
    },
    
    /**
     * Clear auth state
     */
    clearAuth() {
      this.user = null;
      this.authenticated = false;
      this.error = null;
    }
  }
});
