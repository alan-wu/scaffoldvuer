import Vue from 'vue'
import vueCustomElement from 'vue-custom-element';

Vue.use(vueCustomElement);

import ScaffoldVuer from "./components/ScaffoldVuer.vue";

Vue.customElement("scaffoldvuer-wc", ScaffoldVuer);

/*
const wrappedElement = wrap(Vue, ScaffoldVuer);

window.customElements.define("scaffoldvuer-wc", wrappedElement);
*/