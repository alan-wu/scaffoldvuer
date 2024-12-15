import { defineCustomElementSFC } from 'vue-web-component-wrapper';
import { createPinia, setActivePinia } from "pinia";
import { useMainStore } from '@/store/index'

import ScaffoldVuerComponent from "./components/ScaffoldVuer.vue";

setActivePinia(createPinia());
const mainStore = useMainStore();
const token = document.cookie.split("; ").find((row) => row.startsWith("user-token"));
if (mainStore && token) {
  mainStore.setUserToken(token.split("=")[1]);
}

const ScaffoldVuer = defineCustomElementSFC(ScaffoldVuerComponent, { shadowRoot: false });

customElements.define("scaffoldvuer-wc", ScaffoldVuer);

/*
const wrappedElement = wrap(Vue, ScaffoldVuer);

window.customElements.define("scaffoldvuer-wc", wrappedElement);
*/