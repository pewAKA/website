import axios, { type AxiosError } from 'axios'

export const adminTokenStorageKey = 'lynco-hub-admin-token'

export function getAdminToken() {
  return window.sessionStorage.getItem(adminTokenStorageKey)
}

export function setAdminToken(token: string) {
  window.sessionStorage.setItem(adminTokenStorageKey, token)
}

export function clearAdminToken() {
  window.sessionStorage.removeItem(adminTokenStorageKey)
}

const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 10_000,
})

request.interceptors.request.use((config) => {
  // 管理员令牌仅保留在会话内，关闭浏览器标签页后需要重新登录。
  const token = getAdminToken()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 令牌失效时统一结束当前后台会话，避免各页面重复处理 401。
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearAdminToken()
      if (window.location.pathname !== '/admin/login') {
        window.location.assign('/admin/login')
      }
    }
    return Promise.reject(error)
  },
)

export default request
