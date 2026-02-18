<template>
  <div>
    <h2>Login</h2>
    <p v-if="$route.query.redirect">
      You need to login first.
    </p>
    <button type="button" @click="login">
      Sign in with SSO
    </button>
  </div>
</template>

<script>
import auth from '../auth'

export default {
  methods: {
    login () {
      // OIDC redirect (Authorization Code + PKCE). The provider handles the login UI.
      return auth.login()
    }
  }
}
</script>
