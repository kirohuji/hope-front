import axios from 'axios';
// import qs from 'qs'
// create an axios instance

const pending = []; // 声明一个数组用于存储每个请求的取消函数和axios标识
const { CancelToken } = axios;
const removePending = (config) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const p in pending) {
    if (pending[p].u === `${config.url.split('?')[0]}&${config.method}`) {
      pending[p].f();
      pending.splice(p, 1);
    }
  }
};

const service = axios.create({
  baseURL: 'https://www.lourd.top/api/v1/',
  timeout: 180000,
});
service.interceptors.request.use(
  (config) => {
    // removePending(config);
    // config.cancelToken = new CancelToken((c) => {
    //   pending.push({ u: `${config.url.split('?')[0]}&${config.method}`, f: c });
    // });
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
  baseURL: 'https://www.lourd.top',
  timeout: 180000,
  // processData: false,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  // transformRequest: [function (data) {
  //   data = qs.stringify(data);
  //   return data
  // }]
});
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
  (config) => config,
  (error) => Promise.reject(error)
);
fileService.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);
