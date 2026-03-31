<template>
  <div class="login-container">
    <div class="login-header">
      <h1>会议室管理系统</h1>
      <p>请登录以继续</p>
    </div>
    <form id="loginForm" @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input 
          v-model="loginForm.username" 
          type="text" 
          id="username" 
          name="username" 
          required 
          placeholder="请输入用户名"
        />
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input 
          v-model="loginForm.password" 
          type="password" 
          id="password" 
          name="password" 
          required 
          placeholder="请输入密码"
        />
      </div>
      <button type="submit" class="login-btn" :disabled="isLoading">
        <span v-if="isLoading" class="loading"></span>
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
      <div class="error-message" :class="{ show: errorMessage }" id="errorMessage">{{ errorMessage }}</div>
    </form>
    <div class="register-link">
      还没有账号？<a href="/register.html">立即注册</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from './utils/request'

console.log('App.vue 正在加载...')

const loginForm = ref({
  username: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  if (!loginForm.value.username || !loginForm.value.password) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await request.post('/users/login', loginForm.value)
    const data = response.data
    
    // 登录成功，保存用户信息到本地存储
    localStorage.setItem('user', JSON.stringify(data))
    
    // 根据角色跳转到不同界面
    if (data.role === 'admin') {
      window.location.href = '/admin.html'
    } else {
      // 普通用户跳转到用户界面（暂时跳转到管理员界面，后续可创建专门的用户界面）
      window.location.href = '/admin.html'
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || '登录失败，请检查用户名和密码'
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<style scoped>
.login-container {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #333;
  font-size: 24px;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
  display: none;
}

.error-message.show {
  display: block;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
  vertical-align: middle;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 30px;
    max-width: 90%;
    margin: 0 20px;
  }
  
  .login-header h1 {
    font-size: 20px;
  }
  
  .form-group input {
    padding: 10px;
  }
  
  .login-btn {
    padding: 10px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 20px;
    margin: 0 15px;
  }
  
  .login-header h1 {
    font-size: 18px;
  }
  
  .login-header p {
    font-size: 12px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
}
</style>