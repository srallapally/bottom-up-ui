<template>
  <div class="page">
    <div class="shell">
      <div class="brand">
        <div class="logo">RM</div>
        <div>
          <div class="title">Role Mining UI</div>
          <div class="tagline">Bottom-up role mining from entitlement patterns</div>
        </div>
      </div>

      <div class="card">
        <div class="cardHeader">
          <h1>Sign in</h1>
          <p>
            Access clustering results, role candidates, and governance insights.
          </p>
        </div>

        <div class="signin">
          <div id="g_id_signin"></div>

          <div v-if="domainHint" class="hint">
            Restricted to <span class="pill">{{ domainHint }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="features">
          <div class="feature">
            <div class="dot"></div>
            <div>
              <div class="featureTitle">Entitlement-first clustering</div>
              <div class="featureDesc">Discover baseline access patterns and stable roles.</div>
            </div>
          </div>
          <div class="feature">
            <div class="dot"></div>
            <div>
              <div class="featureTitle">Explainable results</div>
              <div class="featureDesc">See why users/entitlements grouped together.</div>
            </div>
          </div>
          <div class="feature">
            <div class="dot"></div>
            <div>
              <div class="featureTitle">Export & iterate</div>
              <div class="featureDesc">Review candidates and refine before publishing.</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <router-link class="link" to="/about">What is this?</router-link>
        </div>
      </div>

      <div class="fineprint">
        <span>Need access?</span>
        <span class="sep">•</span>
        <span>Contact your admin for Workspace membership.</span>
      </div>
    </div>
  </div>
</template>

<script>
import auth from '../auth'

export default {
  data () {
    return {
      domainHint: import.meta.env.VITE_GOOGLE_HOSTED_DOMAIN || ''
    }
  },
  async mounted () {
    await auth.init()

    window.google.accounts.id.renderButton(
        document.getElementById('g_id_signin'),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill'
        }
    )
  }
}
</script>

<style scoped>
/* Page */
.page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px 18px;
  background:
      radial-gradient(900px 600px at 20% 15%, rgba(99, 102, 241, 0.16), transparent 55%),
      radial-gradient(800px 500px at 80% 25%, rgba(16, 185, 129, 0.14), transparent 55%),
      radial-gradient(900px 600px at 50% 95%, rgba(59, 130, 246, 0.10), transparent 60%),
      #ffffff;
}

.shell {
  width: 100%;
  max-width: 920px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

/* Brand header */
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: center;
  user-select: none;
}

.logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #111827;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(16, 185, 129, 0.20));
  border: 1px solid rgba(17, 24, 39, 0.10);
}

.title {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  line-height: 1.1;
}

.tagline {
  margin-top: 2px;
  font-size: 14px;
  color: rgba(17, 24, 39, 0.70);
}

/* Card */
.card {
  background: rgba(255, 255, 255, 0.80);
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 18px;
  box-shadow:
      0 18px 50px rgba(17, 24, 39, 0.08),
      0 6px 18px rgba(17, 24, 39, 0.06);
  backdrop-filter: blur(10px);
  padding: 26px;
  max-width: 620px;
  margin: 0 auto;
}

.cardHeader h1 {
  margin: 0 0 6px 0;
  font-size: 28px;
  letter-spacing: -0.3px;
  color: #111827;
}

.cardHeader p {
  margin: 0;
  color: rgba(17, 24, 39, 0.70);
  font-size: 14px;
  line-height: 1.5;
}

/* Sign-in block */
.signin {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.70);
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
  color: #111827;
  background: rgba(17, 24, 39, 0.06);
  border: 1px solid rgba(17, 24, 39, 0.08);
}

/* Divider */
.divider {
  margin: 18px 0;
  height: 1px;
  background: rgba(17, 24, 39, 0.08);
}

/* Features */
.features {
  display: grid;
  gap: 12px;
}

.feature {
  display: grid;
  grid-template-columns: 10px 1fr;
  gap: 10px;
  align-items: start;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  margin-top: 6px;
  background: rgba(99, 102, 241, 0.70);
}

.featureTitle {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.featureDesc {
  margin-top: 2px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.70);
  line-height: 1.45;
}

/* Footer */
.footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-start;
}

.link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}
.link:hover {
  text-decoration: underline;
}

/* Fineprint */
.fineprint {
  display: flex;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.60);
}

.sep {
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 520px) {
  .card {
    padding: 18px;
    border-radius: 14px;
  }
  .cardHeader h1 {
    font-size: 24px;
  }
}
</style>
