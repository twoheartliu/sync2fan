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
