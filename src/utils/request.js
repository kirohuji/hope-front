import axios from 'axios';

const service = axios.create({
  baseURL: 'https://www.lourd.top/api/v1/',
  timeout: 180000,
});
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['X-Auth-Token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

service.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default service;

export const fileService = axios.create({
  baseURL: 'https://www.lourd.top/',
  timeout: 180000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
fileService.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);
fileService.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);
