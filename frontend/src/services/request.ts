import axios, { type AxiosError } from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10_000,
})

request.interceptors.request.use((config) => {
  // Keep this hook ready for auth headers after the backend contract is defined.
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
