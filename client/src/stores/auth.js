import { defineStore } from 'pinia'
import router from '@/router'
import auth from '@/auth'

function getRedirectTarget () {
    const q = router.currentRoute.value.query.redirect
    return Array.isArray(q) ? (q[0] || '/dashboard') : (q || '/dashboard')
}

function redirectIfOnLogin () {
    // Only redirect after login if we’re currently sitting on the login route.
    if (router.currentRoute.value.path !== '/login') return

    const target = getRedirectTarget()
    // Avoid unnecessary replace
    if (router.currentRoute.value.fullPath === target) return

    router.replace(target)
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        loggedIn: auth.loggedIn(),
        profile: auth.getUserProfile ? auth.getUserProfile() : null
    }),

    actions: {
        async init () {
            // Ensure GIS script is initialized if your auth.js exposes init()
            if (typeof auth.init === 'function') {
                await auth.init()
            }

            // Keep store state in sync with auth.js callbacks.
            // NOTE: auth.js now replays current state when this is assigned.
            auth.onChange = (isLoggedIn) => {
                this.loggedIn = !!isLoggedIn
                this.profile = auth.getUserProfile ? auth.getUserProfile() : null

                if (this.loggedIn) {
                    redirectIfOnLogin()
                }
            }

            // Initialize current state (for page refresh)
            this.loggedIn = auth.loggedIn()
            this.profile = auth.getUserProfile ? auth.getUserProfile() : null

            // If user is already logged in and on /login, go to redirect target.
            if (this.loggedIn) {
                redirectIfOnLogin()
            }
        },

        async login () {
            // With GIS renderButton flow, login() may be a no-op, but keep it for API symmetry.
            if (typeof auth.login === 'function') {
                await auth.login()
            }
        },

        logout () {
            auth.logout?.(() => {})
            this.loggedIn = false
            this.profile = null

            // Go back to login after logout
            if (router.currentRoute.value.path !== '/login') {
                router.replace('/login')
            }
        }
    }
})
