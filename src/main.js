import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import axios from 'axios'
import NProgress from 'nprogress'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import 'nprogress/nprogress.css'
// 代码高亮
// import 'highlight.js/styles/github.css'
// 其他元素使用 github 的样式
import 'github-markdown-css/github-markdown.css'

Vue.config.productionTip = false
axios.defaults.baseURL = 'http://127.0.0.1:85/api/'
Vue.prototype.$axios = axios
// 请求的拦截器
axios.interceptors.request.use(
  (config) => {
    NProgress.start()
    config.headers['Content-Type'] = 'application/json;charset=utf-8'
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)
axios.interceptors.response.use((config) => {
  NProgress.done()
  return config
})

Vue.use(mavonEditor)
new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
