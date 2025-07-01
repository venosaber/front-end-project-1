import axios from 'axios'

const api = axios.create({
    baseURL: 'https://b1u9y178ok.execute-api.ap-southeast-1.amazonaws.com'
})

export default api