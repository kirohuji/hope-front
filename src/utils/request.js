import axios from 'axios'
// import qs from 'qs'
// create an axios instance
const service = axios.create({
  baseURL: 'http://192.168.50.164:3000/api/v1/',
  timeout: 10000
})
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers['X-Auth-Token'] = token
    }
    return config
  },
  error => Promise.reject(error)
)

service.interceptors.response.use(
  response =>
    response.data
  ,
  error => Promise.reject(error)
)

export default service

export const fileService = axios.create({
  baseURL: 'http://192.168.50.164:5005/api/v1/',
  timeout: 100000,
  headers: {
    "Content-Type": "multipart/form-data"
  },
  // transformRequest: [function (data) {
  //   data = qs.stringify(data);
  //   return data
  // }]
})
// fileService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
fileService.interceptors.request.use(
  // config => {
  //   const token = localStorage.getItem('accessToken')
  //   console.log(config.data)
  //   if (token) {
  //     config.headers.common['X-Auth-Token'] = token
  //   }
  //   return config
  // }
  config => config
  , error => Promise.reject(error)
)
fileService.interceptors.response.use(
  response =>
    response.data
  ,
  error => Promise.reject(error)
)
