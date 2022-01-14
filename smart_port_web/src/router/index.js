import Vue from "vue";
import VueRouter from "vue-router";
import BootstrapVue from 'bootstrap-vue'
import routes from "./routes";
Vue.use(VueRouter);
Vue.use(BootstrapVue);

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkActiveClass: "active"
});

export default router;
