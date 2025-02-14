import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import plausible from './plugins/plausible'

import App from './App.vue'
import './assets/main.css'

import { ViteSSG } from 'vite-ssg'
import routerConfig from './router'

export const createApp = ViteSSG(
  App,
  routerConfig,
  ({ app, router, initialState }) => {
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)
    
    app.use(pinia)
    
    if (import.meta.env.VITE_PLAUSIBLE_URL) {
      console.log('Plausible tracking enabled on ', import.meta.env.VITE_PLAUSIBLE_URL)
      const plausibleOptions = {
        hashMode: true,
        apiHost: import.meta.env.VITE_PLAUSIBLE_URL,
        domain: import.meta.env.VITE_PLAUSIBLE_TRACKING_DOMAIN,
        trackLocalhost: !!import.meta.env.VITE_PLAUSIBLE_TRACK_LOCALHOST
      }
    
      app.use(plausible, plausibleOptions)
    } else {
      app.use(plausible, {disabled: true})
    
    }
  }
)

// app.mount('#app')
