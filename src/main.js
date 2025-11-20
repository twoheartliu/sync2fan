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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 在生产环境或者明确测试 PWA 时注册
    if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
      navigator.serviceWorker
        .register('/service-worker.js', {
          scope: '/'
        })
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration.scope)
          console.log('[PWA] Registration details:', {
            active: registration.active,
            installing: registration.installing,
            waiting: registration.waiting,
            scope: registration.scope
          })

          // 检查更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            console.log('[PWA] New Service Worker installing...')

            newWorker.addEventListener('statechange', () => {
              console.log('[PWA] Service Worker state:', newWorker.state)
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新版本可用，提示用户刷新
                console.log('[PWA] New content is available, please refresh.')
                if (confirm('新版本已就绪，是否立即刷新页面？')) {
                  window.location.reload()
                }
              }
            })
          })

          // 定期检查更新
          setInterval(() => {
            registration.update()
          }, 60000) // 每分钟检查一次
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error)
          console.error('[PWA] Error details:', {
            message: error.message,
            stack: error.stack
          })
        })
    } else {
      console.log('[PWA] Service Worker not registered in development mode')
    }
  })
} else {
  console.warn('[PWA] Service Workers are not supported in this browser')
}
