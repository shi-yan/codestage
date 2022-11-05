import { createApp } from 'vue'
import App from './App.vue'
import mitt from "mitt";

const eventBus = mitt();
const app = createApp(App)
app.config.globalProperties.eventBus = eventBus;
app.mount('#app')
