import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/store'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg, data } = response.data
    
    // 请求成功
    if (code === 0) {
      return data
    }
    
    // 处理错误
    message.error(msg || '请求失败')
    return Promise.reject(new Error(msg || '请求失败'))
  },
  (error) => {
    const { response } = error
    
    // 处理HTTP错误
    if (response && response.status) {
      switch (response.status) {
        case 401:
          message.error('未授权，请重新登录')
          // 清除用户信息并跳转到登录页
          const userStore = useUserStore()
          userStore.logout()
          window.location.href = '/login'
          break
        case 403:
          message.error('拒绝访问')
          break
        case 404:
          message.error('请求错误，未找到该资源')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(`连接错误${response.status}`)
      }
    } else {
      // 处理断网或请求超时
      if (error.message.includes('timeout')) {
        message.error('请求超时')
      } else {
        message.error('连接服务器失败')
      }
    }
    
    return Promise.reject(error)
  }
)

// 封装GET请求
export function get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.get(url, { params, ...config })
}

// 封装POST请求
export function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.post(url, data, config)
}

// 封装PUT请求
export function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.put(url, data, config)
}

// 封装DELETE请求
export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return service.delete(url, config)
}

export default service 