import HttpRequest from '@/libs/axios'
import config from '@/config'
const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro

// const axios = new HttpRequest(baseUrl)
// console.log(baseUrl)
const axios = new HttpRequest(baseUrl)

HttpRequest.install((Vue, options) => {
  Vue.api = Vue.prototype.$api = axios
})

export default HttpRequest
