import axios, { type AxiosError } from 'axios'

let clearAdminQueries: (() => void) | undefined

/** 由后台 Provider 注入，避免网络层直接持有另一个 QueryClient 实例。 */
export function setUnauthorizedHandler(handler: (() => void) | undefined) {
  clearAdminQueries = handler
}

const request = axios.create({
  baseURL: '/api',
  timeout: 10_000,
  withCredentials: true,
})

request.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Session 失效时统一返回登录页，具体数据入口仍由服务端重新鉴权。
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearAdminQueries?.()
      if (window.location.pathname !== '/admin/login') {
        window.location.assign('/admin/login')
      }
    }
    return Promise.reject(error)
  },
)

export default request
