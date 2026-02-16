import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// AG Grid styles
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

// Custom styles
import './assets/styles/main.css'

const app = createApp(App)

// Install Pinia for state management
app.use(createPinia())

// Router will be added in Phase 2
// app.use(router)

app.mount('#app')