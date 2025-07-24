import axios from 'axios'

export const API_URL = 'https://b1u9y178ok.execute-api.ap-southeast-1.amazonaws.com';

const api = axios.create({
    baseURL: API_URL
})

export default api