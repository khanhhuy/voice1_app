import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3006',
})

export {
  apiClient,
}