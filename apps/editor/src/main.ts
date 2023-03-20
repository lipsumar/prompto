import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "vue-query";
import vClickOutside from "click-outside-vue3";
import VueKonva from "vue-konva";
import App from "@/App.vue";
import router from "./router";

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin);
app.use(vClickOutside);
app.use(VueKonva);

app.mount("#app");
