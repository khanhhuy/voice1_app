import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

const apiClient = axios.create({
  baseURL,
})

apiClient.interceptors.request.use(
  (config) => {
    if (!window.voice1?.token) {
      // window.location.href = '/login'
      return Promise.reject(new Error('No authentication token'))
    }
    
    config.headers.Authorization = `Bearer ${window.voice1.token}`
    return config
  },
  (error) => {
    return Promise.reject(new Error(error))
  }
)

export {
  apiClient,
  baseURL,
}