import axios from 'axios'
// import qs from 'qs'
// create an axios instance
const service = axios.create({
  baseURL: 'https://www.lourd.online/api/v1/',
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
  baseURL: 'http://85.31.235.82:8080/api/v1/',
  timeout: 100000,
  // processData: false,
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
