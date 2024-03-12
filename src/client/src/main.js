import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import Routes from "./router/routes";

import { BootstrapVue, IconsPlugin, ModalPlugin } from "bootstrap-vue";
import PincodeInput from "vue-pincode-input";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(ModalPlugin);

Vue.config.productionTip = false;
Vue.config.ignoredElements = [
  "field",
  "block",
  "category",
  "xml",
  "mutation",
  "value",
  "sep",
];

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  base: __dirname,
  routes: Routes,
});

Vue.component("PincodeInput", PincodeInput);

new Vue({
  render: (h) => h(App),
  router: router,
}).$mount("#app");
