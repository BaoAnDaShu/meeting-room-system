import axios from 'axios'

// 配置后端地址，前端所有请求都指向这个地址
const request = axios.create({
  baseURL: 'http://localhost:3000', // 后端接口地址（和后端启动地址一致）
  timeout: 10000, // 超时时间（10秒，防止请求卡住）
})

// 响应拦截器：统一处理后端返回的数据，简化前端调用
request.interceptors.response.use(
  (response) => {
    return response.data; // 直接返回后端返回的数据，不用额外处理
  },
  (error) => {
    // 请求失败时，提示错误信息
    alert('请求失败：' + error.message);
    return Promise.reject(error);
  }
)

export default request;