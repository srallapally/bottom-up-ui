// client/src/auth.js
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function loadGoogleScript () {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()

    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', reject)
      return
    }

    const s = document.createElement('script')
    s.src = GOOGLE_SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

function decodeJwtPayload (jwt) {
  const parts = String(jwt || '').split('.')
  if (parts.length < 2) return null
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
      atob(payload).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  )
  return JSON.parse(json)
}

let _loggedIn = false
let _profile = null

async function fetchSession () {
  try {
    const resp = await fetch('/auth/session', { credentials: 'include' })
    if (!resp.ok) return { authenticated: false }
    return await resp.json()
  } catch (e) {
    return { authenticated: false }
  }
}

const auth = {
  async init () {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.error('Missing VITE_GOOGLE_CLIENT_ID')
      return
    }

    // Restore session (cookie-based)
    const session = await fetchSession()
    _loggedIn = !!session.authenticated
    _profile = session.user || null

    await loadGoogleScript()

    if (!this._initialized) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          try {
            const idToken = resp?.credential
            if (!idToken) throw new Error('No credential returned')

            // Optional client-side hosted-domain check (server enforces too)
            const payload = decodeJwtPayload(idToken)
            const allowedHd = import.meta.env.VITE_GOOGLE_HOSTED_DOMAIN // optional
            if (allowedHd && payload?.hd !== allowedHd) {
              console.error(`Blocked login: hd=${payload?.hd} expected ${allowedHd}`)
              await this.logout()
              this.onChange(false)
              return
            }

            // Exchange ID token for an HttpOnly session cookie
            const r = await fetch('/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ idToken })
            })

            if (!r.ok) throw new Error('Login failed')
            const body = await r.json()

            _loggedIn = true
            _profile = body.user || null
            this.onChange(true)
          } catch (e) {
            console.error(e)
            await this.logout()
            this.onChange(false)
          }
        }
      })
      this._initialized = true
    }

    // Replay current state for callers that set onChange after init
    this.onChange(_loggedIn)
  },

  async login () {
    // no-op: login is initiated by the rendered GIS button
  },

  getUserProfile () {
    return _profile
  },

  async logout (cb) {
    try {
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      // ignore
    }

    _loggedIn = false
    _profile = null
    if (cb) cb()
    this.onChange(false)
  },

  loggedIn () {
    return !!_loggedIn
  },

  onChange () {}
}

// Keep setter behavior consistent with existing store usage
let _onChange = () => {}
Object.defineProperty(auth, 'onChange', {
  get () { return _onChange },
  set (fn) {
    _onChange = (typeof fn === 'function') ? fn : () => {}
    try { _onChange(auth.loggedIn()) } catch (e) { console.error(e) }
  }
})

export default auth
