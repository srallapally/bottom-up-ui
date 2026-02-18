// client/src/main.js
import { createApp } from 'vue';
import { useAuthStore } from '@/stores/auth'
import { createPinia } from 'pinia';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import router from './router';
import App from './App.vue';

// AG Grid v35 requires explicit module registration
ModuleRegistry.registerModules([AllCommunityModule]);

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Bootstrap JS (for toast notifications)
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;

// Custom styles
import './assets/styles/main.css';

const app = createApp(App);
const pinia = createPinia();
app.directive('focus', {
    // When the bound element is inserted into the DOM...
    mounted: function (el) {
        // Focus the element
        el.focus()
    }
})
app.use(pinia);
app.use(router);
const authStore = useAuthStore()
authStore.init()
app.mount('#app');