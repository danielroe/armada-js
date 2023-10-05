import App from '../App.vue'
import { renderToString } from 'vue/server-renderer'
import { createApp } from 'vue'

export default defineEventHandler(async event => {
  const template = (await useStorage().getItem('templates:index.html')) as string
  const app = createApp(App)
  const html = await renderToString(app)
  return template.replace('<main id="root"></main>', `<main id="root">${html}</main>`)
})
