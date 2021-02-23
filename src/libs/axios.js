import axios from 'axios'
import { Message } from 'iview'
import Cookies from 'js-cookie'
import store from '@/store'
import config from '@/config'
import { getToken } from '@/libs/util'
const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro
// import { Spin } from 'iview'
const addErrorLog = errorInfo => {
  const { statusText, status, request: { responseURL } } = errorInfo
  let info = {
    type: 'ajax',
    code: status,
    mes: statusText,
    url: responseURL
  }
  // if (!responseURL.includes('save_error_logger')) store.dispatch('addErrorLog', info)
}

class HttpRequest {
  constructor () {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      config.headers.Authorization = getToken()
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      // const { data, status } = res
      const { data } = res
      if(data.size > 0){
        return data
      }
      if (data && data.code !== 200) {

        // 后端服务在个别情况下回报201，待确认
        if (data.code === 401) {
          Message.destroy()
          Message.error(data.message)
          Cookies.remove('user')
          Cookies.remove('token')
          Cookies.remove('key')
        } else {
          if (data.message) {
            Message.destroy()
            Message.error(data.message)
          }
        }
        return false
      }
      return data
    }, error => {
      this.destroy(url)
      let errorInfo = error.response
      if (!errorInfo) {
        const { request: { statusText, status }, config } = JSON.parse(JSON.stringify(error))
        errorInfo = {
          statusText,
          status,
          request: { responseURL: config.url }
        }
      }
      addErrorLog(errorInfo)
      return Promise.reject(error)
    })
  }
  request (options) {
    // console.log(options)
    // if (options.method === 'get') {
    //   if (options.params) options.params = Object.assign(options.params, data)
    //   if (!options.params) options.params = Object.assign({}, data)
    // } else {
    //   // if (options.data) options.data = Object.assign(options.data, data);
    //   // if (!options.data) options.data = Object.assign({}, data);
    // }
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
  get (url, data) {
    let options = {
      method: 'get',
      url: url,
      params: data
    }
    return this.request(options)
  }
  post (url, data) {
    let options = {
      method: 'post',
      url: url,
      data: data
    }
    return this.request(options)
  }
}
// 当作vue的插件，挂载到vue实例上。
HttpRequest.install = function (Vue, options) {
  Vue.api = Vue.prototype.$api = new HttpRequest(options, Vue.prototype)
}
export default HttpRequest
