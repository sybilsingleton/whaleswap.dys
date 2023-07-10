/*global DysonLoader dysonVueStore*/
import { createApp } from 'vue'

import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import './app.css';

DysonLoader().then(() => {
  console.log('Dyson loaded')
  const app = createApp(App)
  app.use(dysonVueStore)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')

  app.config.globalProperties.window = window
})
