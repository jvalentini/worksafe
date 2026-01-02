import { createApp } from "vue";
import App from "$lib/components/App.vue";

const target = document.getElementById("app");

if (!target) {
  throw new Error("Missing #app mount element");
}

createApp(App).mount(target);
