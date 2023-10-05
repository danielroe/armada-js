import App from '../App.vue'
import { createSSRApp } from 'vue'

const app = createSSRApp(App)
app.mount('#root')
