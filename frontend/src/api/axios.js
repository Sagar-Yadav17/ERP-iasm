import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : 'http://localhost:5000/api/v1',
  withCredentials: true,
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.request.use((config) => {
  const authStorage = JSON.parse(
    localStorage.getItem('auth-storage') || '{}'
  )

  const token = authStorage?.state?.token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default API