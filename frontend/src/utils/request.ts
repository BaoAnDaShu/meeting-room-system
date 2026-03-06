import axios, { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

// 配置后端地址，前端所有请求都指向这个地址
const request = axios.create({
  baseURL: 'http://localhost:3000', // 后端接口地址（和后端启动地址一致）
  timeout: 10000, // 超时时间（10秒，防止请求卡住）
})

// 响应拦截器：统一处理后端返回的数据，简化前端调用
request.interceptors.response.use(
  (response) => {
    return response; // 返回完整的响应对象
  },
  (error: AxiosError) => {
    // 请求失败时，根据错误类型显示不同的提示
    let message = '请求失败'

    if (error.response) {
      // 服务器返回了错误响应
      const status = error.response.status
      const data = error.response.data as { message?: string }

      switch (status) {
        case 400:
          message = data.message || '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 409:
          message = data.message || '资源冲突'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = data.message || `请求失败 (${status})`
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      message = '网络错误，请检查网络连接'
    } else {
      // 请求配置出错
      message = error.message || '请求配置错误'
    }

    // 使用 Element Plus 的消息提示组件显示错误
    ElMessage.error(message)

    return Promise.reject(error)
  }
)

export default request;