// client/src/stores/auth.js
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
    miningSessionId: null, // Session ID from Express CSV tracker (survives refresh)
    loading: false,
    error: null
  }),

  getters: {
    userName: (state) => state.user?.displayName || 'User',
    userEmail: (state) => state.user?.email || '',
    userId: (state) => state.user?.id || null,
    isAuthenticated: (state) => state.authenticated
  },

  actions: {
    /**
     * Check session status
     * Express auto-creates mock user if not exists
     * Also returns miningSessionId if one exists in CSV tracker
     */
    async checkSession() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get('/auth/session', {
          withCredentials: true
        });

        this.user = response.data.user;
        this.authenticated = response.data.authenticated;
        this.miningSessionId = response.data.miningSessionId || null;

        console.log('[Auth] Session checked:', {
          authenticated: this.authenticated,
          userId: this.user?.id,
          miningSessionId: this.miningSessionId
        });

        return this.user;
      } catch (error) {
        this.error = error.userMessage || 'Failed to check session';
        this.authenticated = false;
        this.user = null;
        this.miningSessionId = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await axios.get('/auth/logout', {
          withCredentials: true
        });

        this.user = null;
        this.authenticated = false;
        this.miningSessionId = null;

        console.log('[Auth] User logged out');
        return true;
      } catch (error) {
        this.error = error.userMessage || 'Logout failed';
        throw error;
      }
    },

    clearAuth() {
      this.user = null;
      this.authenticated = false;
      this.miningSessionId = null;
      this.error = null;
    }
  }
});