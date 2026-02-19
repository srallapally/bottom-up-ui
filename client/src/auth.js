// client/src/auth.js
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const STORAGE_KEY = 'google_id_token'

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
  // JWT is header.payload.signature
  const parts = String(jwt || '').split('.')
  if (parts.length < 2) return null
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
      atob(payload).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  )
  return JSON.parse(json)
}

const auth = {
  async init () {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.error('Missing VITE_GOOGLE_CLIENT_ID')
      return
    }

    await loadGoogleScript()

    // Initialize once
    if (!this._initialized) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => {
          try {
            const idToken = resp?.credential
            if (!idToken) throw new Error('No credential returned')

            const payload = decodeJwtPayload(idToken)
            const allowedHd = import.meta.env.VITE_GOOGLE_HOSTED_DOMAIN // optional
            if (allowedHd && payload?.hd !== allowedHd) {
              console.error(`Blocked login: hd=${payload?.hd} expected ${allowedHd}`)
              this.logout()
              this.onChange(false)
              return
            }

            sessionStorage.setItem(STORAGE_KEY, idToken)
            this.onChange(true)
          } catch (e) {
            console.error(e)
            this.logout()
            this.onChange(false)
          }
        }
      })
      this._initialized = true
    }
  },

  async login () {
    // no-op: login is initiated by the rendered GIS button
  },

  getIdToken () {
    return sessionStorage.getItem(STORAGE_KEY)
  },

  getUserProfile () {
    const token = this.getIdToken()
    const payload = decodeJwtPayload(token)
    if (!payload) return null
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      hd: payload.hd,
      sub: payload.sub
    }
  },

  logout (cb) {
    sessionStorage.removeItem(STORAGE_KEY)
    if (cb) cb()
    this.onChange(false)
  },

  loggedIn () {
    const token = this.getIdToken()
    if (!token) return false

    try {
      const payload = decodeJwtPayload(token)
      if (!payload?.exp) return false

      const now = Math.floor(Date.now() / 1000)
      return payload.exp > now
    } catch (e) {
      return false
    }
  },

  // placeholder; real handler is installed via the setter below
  onChange () {}
}

// ---- FIX: make onChange assignment replay current state (eliminates race) ----
let _onChange = () => {}
Object.defineProperty(auth, 'onChange', {
  get () {
    return _onChange
  },
  set (fn) {
    _onChange = (typeof fn === 'function') ? fn : () => {}

    // Immediately replay current state so callers never miss a prior login.
    try {
      _onChange(auth.loggedIn())
    } catch (e) {
      console.error(e)
    }
  }
})

export default auth
