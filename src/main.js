import { createApp } from "vue";
import "./style.scss";
import App from "./App.vue";

import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import Icon from "./components/common/Icon.vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.component("Icon", Icon); // 全局注册 Icon 组件
app.use(pinia);
app.mount("#app");

// 注册 Service Worker (仅在生产环境)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully:', registration.scope)

        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          console.log('[PWA] New Service Worker installing...')

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新版本可用，提示用户刷新
              console.log('[PWA] New content is available, please refresh.')
              if (confirm('新版本已就绪，是否立即刷新页面？')) {
                window.location.reload()
              }
            }
          })
        })
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error)
      })
  })
}
