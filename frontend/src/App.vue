<template>
  <div v-if="!isLoggedIn" class="login-container">
    <div class="login-box">
      <h2>会议室预定系统</h2>
      <p class="subtitle">请登录以继续使用</p>
      
      <el-form :model="loginForm" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input 
            v-model="loginForm.username" 
            placeholder="用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item>
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-tips">
        <p>默认管理员账号：admin / admin123</p>
        <p>请联系管理员创建新账号</p>
      </div>
    </div>
  </div>

  <div v-else style="width: 1200px; margin: 20px auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="text-align: center; margin: 0;">会议室预定系统</h1>
      <div style="display: flex; align-items: center; gap: 15px;">
        <span style="color: #666;">{{ currentUser.username }} ({{ currentUser.role }})</span>
        <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <!-- 会议室列表 -->
    <el-card title="会议室列表">
      <el-table :data="roomList" border style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="会议室名称" width="200"></el-table-column>
        <el-table-column prop="capacity" label="容纳人数" width="100"></el-table-column>
        <el-table-column prop="location" label="位置" width="200"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '可用' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === '可用'"
              type="primary" 
              size="small"
              @click="openReserveDialog(scope.row)"
            >
              预定
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 我的预定 -->
    <el-card title="我的预定" style="margin-top: 20px;">
      <el-table :data="myReserves" border style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="room.name" label="会议室" width="150"></el-table-column>
        <el-table-column prop="reserveDate" label="预定日期" width="120"></el-table-column>
        <el-table-column prop="timeSlot" label="时间段" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === '正常'"
              type="danger" 
              size="small"
              @click="cancelReserve(scope.row.id)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="myReserves.length === 0" style="text-align: center; padding: 40px; color: #999;">
        暂无预定记录
      </div>
    </el-card>
  </div>

  <!-- 预定对话框 -->
  <el-dialog v-model="reserveDialogVisible" title="预定会议室" width="400px">
    <el-form :model="reserveForm" label-width="80px">
      <el-form-item label="会议室">
        <span>{{ selectedRoom?.name }}</span>
      </el-form-item>
      <el-form-item label="预定日期">
        <el-date-picker
          v-model="reserveForm.reserveDate"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="时间段">
        <el-select v-model="reserveForm.timeSlot" placeholder="选择时间段" style="width: 100%">
          <el-option label="09:00-10:00" value="09:00-10:00" />
          <el-option label="10:00-11:00" value="10:00-11:00" />
          <el-option label="11:00-12:00" value="11:00-12:00" />
          <el-option label="14:00-15:00" value="14:00-15:00" />
          <el-option label="15:00-16:00" value="15:00-16:00" />
          <el-option label="16:00-17:00" value="16:00-17:00" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="reserveDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitReserve">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import request from './utils/request'

// 会议室类型定义
interface Room {
  id: number
  name: string
  capacity: number
  location: string
  status: string
}

// 预定类型定义
interface Reserve {
  id: number
  roomId: number
  userId: number
  reserveDate: string
  timeSlot: string
  status: string
  room?: Room
}

// 用户类型定义
interface UserInfo {
  id: number
  username: string
  role: string
}

// 登录状态
const isLoggedIn = ref(false)
const currentUser = ref<UserInfo>({ id: 0, username: '', role: '' })
const loading = ref(false)

// 登录表单
const loginForm = ref({
  username: '',
  password: ''
})

// 会议室列表数据
const roomList = ref<Room[]>([])

// 我的预定列表
const myReserves = ref<Reserve[]>([])

// 预定对话框
const reserveDialogVisible = ref(false)
const selectedRoom = ref<Room | null>(null)
const reserveForm = ref({
  reserveDate: '',
  timeSlot: ''
})

// 页面加载时检查登录状态
onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    currentUser.value = JSON.parse(user)
    isLoggedIn.value = true
    getRoomList()
    getMyReserves()
  }
})

// 登录处理
async function handleLogin() {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const response = await request.post('/users/login', loginForm.value)
    currentUser.value = response.data
    isLoggedIn.value = true
    localStorage.setItem('user', JSON.stringify(response.data))
    ElMessage.success('登录成功')
    getRoomList()
    getMyReserves()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 退出登录
function handleLogout() {
  localStorage.removeItem('user')
  isLoggedIn.value = false
  currentUser.value = { id: 0, username: '', role: '' }
  loginForm.value = { username: '', password: '' }
  ElMessage.success('已退出登录')
}

// 获取会议室列表
async function getRoomList() {
  try {
    const response = await request.get('/rooms')
    roomList.value = response.data || []
  } catch (error) {
    ElMessage.error('获取会议室列表失败')
  }
}

// 获取我的预定
async function getMyReserves() {
  try {
    const response = await request.get(`/reserves/user/${currentUser.value.id}`)
    myReserves.value = response.data || []
  } catch (error) {
    console.error('获取预定列表失败:', error)
  }
}

// 打开预定对话框
function openReserveDialog(room: Room) {
  selectedRoom.value = room
  reserveForm.value = { reserveDate: '', timeSlot: '' }
  reserveDialogVisible.value = true
}

// 提交预定
async function submitReserve() {
  if (!reserveForm.value.reserveDate || !reserveForm.value.timeSlot) {
    ElMessage.warning('请选择预定日期和时间段')
    return
  }

  try {
    await request.post('/reserves', {
      roomId: selectedRoom.value?.id,
      userId: currentUser.value.id,
      reserveDate: reserveForm.value.reserveDate,
      timeSlot: reserveForm.value.timeSlot,
      status: '正常'
    })
    ElMessage.success('预定成功')
    reserveDialogVisible.value = false
    getRoomList()
    getMyReserves()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '预定失败')
  }
}

// 取消预定
async function cancelReserve(id: number) {
  try {
    await request.delete(`/reserves/${id}`)
    ElMessage.success('取消成功')
    getMyReserves()
    getRoomList()
  } catch (error) {
    ElMessage.error('取消失败')
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-box h2 {
  text-align: center;
  margin-bottom: 10px;
  color: #333;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.login-tips {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.login-tips p {
  margin: 5px 0;
}

.el-card {
  margin-bottom: 20px;
}
</style>
