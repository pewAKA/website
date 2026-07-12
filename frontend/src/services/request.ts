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
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
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
    // Centralize response errors here so pages can stay focused on UI state.
    return Promise.reject(error)
  },
)

export default request
