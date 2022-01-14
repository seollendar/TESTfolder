/*!

 =========================================================
 * Vue Paper Dashboard - v2.0.0
 =========================================================

 * Product Page: http://www.creative-tim.com/product/paper-dashboard
 * Copyright 2019 Creative Tim (http://www.creative-tim.com)
 * Licensed under MIT (https://github.com/creativetimofficial/paper-dashboard/blob/master/LICENSE.md)

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 */
import Vue from "vue";
import App from "./App";
import router from "./router/index";
import vuetify from '@/plugins/vuetify' // path to vuetify export
import PaperDashboard from "./plugins/paperDashboard";
import "vue-notifyjs/themes/default.css";
import env from '../server/env.js';
const axios = require('axios');
Vue.use(PaperDashboard);

let server = "http://" + env.server.HOST + ":" + env.server.PORT;
console.log("prototype server addr : ", server);
Vue.prototype.env = {server: server};
Vue.prototype.$http = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  baseURL: server
});
Vue.prototype.$axios = axios
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
