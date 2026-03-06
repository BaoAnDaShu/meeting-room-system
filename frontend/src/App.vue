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

  <div v-else class="main-container">
    <!-- 顶部导航 -->
    <el-header class="header">
      <div class="header-content">
        <h1>会议室预定系统</h1>
        <div class="header-right">
          <el-button type="primary" text @click="showProfile = true">
            <el-icon><User /></el-icon>
            {{ currentUser.username }}
          </el-button>
          <el-button type="danger" text @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </div>
      </div>
    </el-header>

    <el-container class="content-wrapper">
      <!-- 左侧筛选栏 -->
      <el-aside width="280px" class="filter-sidebar">
        <el-card class="filter-card">
          <template #header>
            <div class="card-header">
              <el-icon><Search /></el-icon>
              <span>筛选会议室</span>
            </div>
          </template>
          
          <el-form :model="filterForm" label-position="top">
            <el-form-item label="会议室名称">
              <el-input 
                v-model="filterForm.name" 
                placeholder="搜索名称"
                clearable
                @input="handleFilter"
              />
            </el-form-item>
            
            <el-form-item label="容纳人数">
              <el-select v-model="filterForm.capacity" placeholder="选择容量" clearable @change="handleFilter">
                <el-option label="全部" value="" />
                <el-option label="1-10人" value="1-10" />
                <el-option label="11-20人" value="11-20" />
                <el-option label="21-50人" value="21-50" />
                <el-option label="50人以上" value="50+" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="位置">
              <el-input 
                v-model="filterForm.location" 
                placeholder="搜索位置"
                clearable
                @input="handleFilter"
              />
            </el-form-item>
            
            <el-form-item label="查看日期">
              <el-date-picker
                v-model="filterForm.date"
                type="date"
                placeholder="选择日期查看可用"
                style="width: 100%"
                value-format="YYYY-MM-DD"
                @change="handleFilter"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleFilter" style="width: 100%">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetFilter" style="width: 100%; margin-top: 10px; margin-left: 0;">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 统计信息 -->
        <el-card class="stats-card" style="margin-top: 15px;">
          <template #header>
            <div class="card-header">
              <el-icon><DataLine /></el-icon>
              <span>今日统计</span>
            </div>
          </template>
          <div class="stats-item">
            <span class="stats-label">可用会议室</span>
            <span class="stats-value available">{{ availableCount }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">已预定</span>
            <span class="stats-value reserved">{{ reservedCount }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">我的预定</span>
            <span class="stats-value mine">{{ myReserves.length }}</span>
          </div>
        </el-card>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <!-- 会议室列表 -->
        <el-card class="room-list-card">
          <template #header>
            <div class="card-header">
              <span>会议室列表 ({{ filteredRoomList.length }})</span>
              <el-radio-group v-model="viewMode" size="small">
                <el-radio-button label="list">
                  <el-icon><List /></el-icon> 列表
                </el-radio-button>
                <el-radio-button label="calendar">
                  <el-icon><Calendar /></el-icon> 日历
                </el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <!-- 列表视图 -->
          <div v-if="viewMode === 'list'">
            <el-empty v-if="filteredRoomList.length === 0" description="暂无符合条件的会议室" />
            <el-row :gutter="15" v-else>
              <el-col :span="8" v-for="room in filteredRoomList" :key="room.id">
                <el-card class="room-card" :class="{ 'room-unavailable': !isRoomAvailable(room) }">
                  <div class="room-header">
                    <h3>{{ room.name }}</h3>
                    <el-tag :type="isRoomAvailable(room) ? 'success' : 'danger'" size="small">
                      {{ isRoomAvailable(room) ? '可预定' : '已满' }}
                    </el-tag>
                  </div>
                  <div class="room-info">
                    <p><el-icon><User /></el-icon> 容纳 {{ room.capacity }} 人</p>
                    <p><el-icon><Location /></el-icon> {{ room.location }}</p>
                  </div>
                  <div class="room-actions">
                    <el-button 
                      type="primary" 
                      size="small"
                      :disabled="!isRoomAvailable(room)"
                      @click="openReserveDialog(room)"
                    >
                      立即预定
                    </el-button>
                    <el-button 
                      type="info" 
                      size="small"
                      text
                      @click="showRoomDetail(room)"
                    >
                      查看详情
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 日历视图 -->
          <div v-else class="calendar-view">
            <div class="calendar-legend">
              <div class="legend-item">
                <span class="legend-dot available"></span>
                <span>有可用会议室</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot full"></span>
                <span>会议室已满</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot none"></span>
                <span>无预定</span>
              </div>
            </div>
            <el-calendar v-model="calendarDate">
              <template #date-cell="{ data }">
                <div 
                  class="calendar-cell" 
                  :class="getCalendarCellClass(data.day)"
                  @click="selectCalendarDate(data.day)"
                >
                  <p class="calendar-date" :class="{ 'is-selected': data.isSelected }">
                    {{ data.day.split('-').slice(2).join('-') }}
                  </p>
                </div>
              </template>
            </el-calendar>
          </div>
        </el-card>

        <!-- 我的预定 -->
        <el-card class="reserves-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>我的预定记录</span>
              <el-button type="primary" text @click="refreshReserves">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          
          <el-table v-if="myReserves.length > 0" :data="myReserves" border style="width: 100%">
            <el-table-column prop="room.name" label="会议室" width="150" />
            <el-table-column prop="reserveDate" label="日期" width="120" />
            <el-table-column prop="timeSlot" label="时间段" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'" size="small">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button 
                  v-if="scope.row.status === '正常'"
                  type="danger" 
                  size="small"
                  @click="cancelReserve(scope.row.id)"
                >
                  取消
                </el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无预定记录" />
        </el-card>
      </el-main>
    </el-container>
  </div>

  <!-- 预定对话框 -->
  <el-dialog v-model="reserveDialogVisible" title="预定会议室" width="550px">
    <div v-if="selectedRoom" class="reserve-dialog-content">
      <div class="selected-room-info">
        <h3>{{ selectedRoom.name }}</h3>
        <p><el-icon><User /></el-icon> 容纳 {{ selectedRoom.capacity }} 人</p>
        <p><el-icon><Location /></el-icon> {{ selectedRoom.location }}</p>
      </div>
      
      <el-divider />
      
      <el-form :model="reserveForm" label-width="100px">
        <el-form-item label="预定日期" required>
          <el-date-picker
            v-model="reserveForm.reserveDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            @change="loadTimeSlots"
          />
        </el-form-item>
        
        <el-form-item label="时间段" required>
          <div class="time-slots">
            <el-check-tag
              v-for="slot in availableTimeSlots"
              :key="slot.time"
              :checked="selectedTimeSlots.includes(slot.time)"
              :disabled="!slot.available"
              @change="toggleTimeSlot(slot.time)"
              class="time-slot-tag"
              :class="{ 
                'unavailable': !slot.available,
                'selected': selectedTimeSlots.includes(slot.time)
              }"
            >
              {{ slot.time }}
              <el-tag v-if="!slot.available" type="danger" size="small">已约</el-tag>
            </el-check-tag>
          </div>
          <div class="time-slot-info" v-if="selectedTimeSlots.length > 0">
            <el-tag type="success">已选择 {{ selectedTimeSlots.length }} 个时段</el-tag>
            <span class="total-duration">总计: {{ selectedTimeSlots.length }} 小时</span>
          </div>
        </el-form-item>
      </el-form>

      <!-- 预定历史 -->
      <el-divider />
      <div class="reserve-history">
        <h4>该会议室预定情况</h4>
        <el-timeline v-if="roomReserves.length > 0">
          <el-timeline-item
            v-for="r in roomReserves.slice(0, 5)"
            :key="r.id"
            :type="r.status === '正常' ? 'primary' : 'info'"
          >
            <p>{{ r.reserveDate }} {{ r.timeSlot }} - {{ r.user?.username }}</p>
          </el-timeline-item>
        </el-timeline>
        <p v-else class="no-history">暂无预定记录</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="reserveDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitReserve" :disabled="selectedTimeSlots.length === 0">
        确认预定 ({{ selectedTimeSlots.length }}个时段)
      </el-button>
    </template>
  </el-dialog>

  <!-- 会议室详情对话框 -->
  <el-dialog v-model="roomDetailVisible" title="会议室详情" width="600px">
    <div v-if="selectedRoomDetail" class="room-detail">
      <div class="room-images">
        <el-carousel height="200px" v-if="selectedRoomDetail.images?.length">
          <el-carousel-item v-for="(img, index) in selectedRoomDetail.images" :key="index">
            <img :src="img" class="room-image" />
          </el-carousel-item>
        </el-carousel>
        <div v-else class="no-image">暂无图片</div>
      </div>
      
      <div class="room-detail-info">
        <h2>{{ selectedRoomDetail.name }}</h2>
        <div class="detail-tags">
          <el-tag size="large"><el-icon><User /></el-icon> {{ selectedRoomDetail.capacity }}人</el-tag>
          <el-tag size="large" type="info"><el-icon><Location /></el-icon> {{ selectedRoomDetail.location }}</el-tag>
          <el-tag size="large" :type="selectedRoomDetail.status === '可用' ? 'success' : 'danger'">
            {{ selectedRoomDetail.status }}
          </el-tag>
        </div>
        
        <div class="equipment-section" v-if="selectedRoomDetail.equipment?.length">
          <h4>设备设施</h4>
          <div class="equipment-tags">
            <el-tag v-for="eq in selectedRoomDetail.equipment" :key="eq" type="warning" effect="plain">
              {{ eq }}
            </el-tag>
          </div>
        </div>
        
        <div class="description-section" v-if="selectedRoomDetail.description">
          <h4>会议室介绍</h4>
          <p>{{ selectedRoomDetail.description }}</p>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 个人中心对话框 -->
  <el-dialog v-model="showProfile" title="个人中心" width="500px">
    <el-tabs v-model="profileTab">
      <el-tab-pane label="基本信息" name="info">
        <el-form :model="profileForm" label-width="100px">
          <el-form-item label="用户名">
            <el-input v-model="profileForm.username" disabled />
          </el-form-item>
          <el-form-item label="角色">
            <el-tag>{{ currentUser.role }}</el-tag>
          </el-form-item>
          <el-form-item label="注册时间">
            <span>{{ profileForm.createdAt || '-' }}</span>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="修改密码" name="password">
        <el-form :model="passwordForm" label-width="100px">
          <el-form-item label="原密码" required>
            <el-input v-model="passwordForm.oldPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码" required>
            <el-input v-model="passwordForm.newPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认密码" required>
            <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="changePassword">修改密码</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="预定统计" name="stats">
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-number">{{ myReserves.length }}</div>
            <div class="stat-label">总预定次数</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">{{ activeReserves.length }}</div>
            <div class="stat-label">进行中</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">{{ cancelledReserves.length }}</div>
            <div class="stat-label">已取消</div>
          </div>
        </div>
        <el-divider />
        <div class="recent-rooms">
          <h4>最近预定的会议室</h4>
          <el-tag v-for="room in recentRooms" :key="room" style="margin: 5px;">
            {{ room }}
          </el-tag>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, Lock, Search, Refresh, Calendar, List, 
  DataLine, Timer, CircleClose, Location, SwitchButton 
} from '@element-plus/icons-vue'
import request from './utils/request'

// 会议室类型定义
interface Room {
  id: number
  name: string
  capacity: number
  location: string
  status: string
  images?: string[]
  equipment?: string[]
  description?: string
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
  user?: { username: string }
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
const allReserves = ref<Reserve[]>([])

// 筛选表单
const filterForm = ref({
  name: '',
  capacity: '',
  location: '',
  date: ''
})

// 视图模式
const viewMode = ref('list')
const calendarDate = ref(new Date())

// 预定对话框
const reserveDialogVisible = ref(false)
const selectedRoom = ref<Room | null>(null)
const reserveForm = ref({
  reserveDate: '',
  timeSlot: ''
})
const availableTimeSlots = ref<{ time: string; available: boolean }[]>([])
const roomReserves = ref<Reserve[]>([])
const selectedTimeSlots = ref<string[]>([])

// 会议室详情
const roomDetailVisible = ref(false)
const selectedRoomDetail = ref<Room | null>(null)

// 个人中心
const showProfile = ref(false)
const profileTab = ref('info')
const profileForm = ref({
  username: '',
  createdAt: ''
})
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 我的预定列表
const myReserves = ref<Reserve[]>([])

// 计算属性：筛选后的会议室列表
const filteredRoomList = computed(() => {
  let result = roomList.value

  // 按名称筛选
  if (filterForm.value.name) {
    result = result.filter(r => r.name.toLowerCase().includes(filterForm.value.name.toLowerCase()))
  }

  // 按容量筛选
  if (filterForm.value.capacity) {
    result = result.filter(r => {
      const capacity = r.capacity
      switch (filterForm.value.capacity) {
        case '1-10': return capacity >= 1 && capacity <= 10
        case '11-20': return capacity >= 11 && capacity <= 20
        case '21-50': return capacity >= 21 && capacity <= 50
        case '50+': return capacity > 50
        default: return true
      }
    })
  }

  // 按位置筛选
  if (filterForm.value.location) {
    result = result.filter(r => r.location.includes(filterForm.value.location))
  }

  return result
})

// 统计
const availableCount = computed(() => roomList.value.filter(r => r.status === '可用').length)
const reservedCount = computed(() => roomList.value.filter(r => r.status === '已预定').length)
const activeReserves = computed(() => myReserves.value.filter(r => r.status === '正常'))
const cancelledReserves = computed(() => myReserves.value.filter(r => r.status === '已取消'))
const recentRooms = computed(() => {
  const rooms = myReserves.value.slice(0, 5).map(r => r.room?.name).filter(Boolean)
  return [...new Set(rooms)]
})

// 是否可以提交预定
const canSubmit = computed(() => {
  return reserveForm.value.reserveDate && reserveForm.value.timeSlot
})

// 页面加载时检查登录状态
onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    currentUser.value = JSON.parse(user)
    isLoggedIn.value = true
    getRoomList()
    getAllReserves()
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
    getAllReserves()
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

// 获取所有预定
async function getAllReserves() {
  try {
    const response = await request.get('/reserves')
    allReserves.value = response.data || []
  } catch (error) {
    console.error('获取预定列表失败:', error)
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

// 刷新预定
function refreshReserves() {
  getMyReserves()
  ElMessage.success('刷新成功')
}

// 处理筛选
function handleFilter() {
  // 筛选逻辑在 computed 中处理
}

// 重置筛选
function resetFilter() {
  filterForm.value = {
    name: '',
    capacity: '',
    location: '',
    date: ''
  }
}

// 判断会议室是否可用
function isRoomAvailable(room: Room): boolean {
  if (filterForm.value.date) {
    // 检查指定日期是否可用
    const dateReserves = allReserves.value.filter(r => 
      r.roomId === room.id && 
      r.reserveDate === filterForm.value.date &&
      r.status === '正常'
    )
    return dateReserves.length < 6 // 假设一天有6个时间段
  }
  return room.status === '可用'
}

// 判断会议室在指定日期是否可用
function isRoomAvailableOnDate(room: Room, date: string): boolean {
  const dateReserves = allReserves.value.filter(r => 
    r.roomId === room.id && 
    r.reserveDate === date &&
    r.status === '正常'
  )
  return dateReserves.length < 6
}

// 获取日历单元格样式类
function getCalendarCellClass(date: string): string {
  const availableCount = getAvailableRoomCount(date)
  const totalRooms = roomList.value.length
  
  if (totalRooms === 0) return 'cell-none'
  if (availableCount === 0) return 'cell-full'
  if (availableCount === totalRooms) return 'cell-available'
  return 'cell-partial'
}

// 获取日历状态文本
function getCalendarStatusText(date: string): string {
  const availableCount = getAvailableRoomCount(date)
  const totalRooms = roomList.value.length
  
  if (totalRooms === 0) return '无数据'
  if (availableCount === 0) return '已满'
  if (availableCount === totalRooms) return '可预定'
  return '部分可用'
}

// 获取可用会议室数量
function getAvailableRoomCount(date: string): number {
  if (!date || roomList.value.length === 0) return 0
  
  return roomList.value.filter(room => {
    const dateReserves = allReserves.value.filter(r => 
      r.roomId === room.id && 
      r.reserveDate === date &&
      r.status === '正常'
    )
    return dateReserves.length < 6
  }).length
}

// 获取指定日期的会议室
function getRoomsByDate(date: string): Room[] {
  return roomList.value
}

// 选择日历日期
function selectCalendarDate(date: string) {
  filterForm.value.date = date
  viewMode.value = 'list'
}

// 禁用过去的日期
function disabledDate(date: Date) {
  return date < new Date(new Date().setHours(0, 0, 0, 0))
}

// 打开预定对话框
function openReserveDialog(room: Room) {
  selectedRoom.value = room
  reserveForm.value = { reserveDate: filterForm.value.date || '', timeSlot: '' }
  selectedTimeSlots.value = [] // 清空已选择的时间段
  roomReserves.value = allReserves.value.filter(r => r.roomId === room.id && r.status === '正常')
  loadTimeSlots()
  reserveDialogVisible.value = true
}

// 加载时间段
function loadTimeSlots() {
  const slots = [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00'
  ]

  if (!reserveForm.value.reserveDate || !selectedRoom.value) {
    availableTimeSlots.value = slots.map(time => ({ time, available: false }))
    return
  }

  // 检查每个时间段的可用性
  const dateReserves = allReserves.value.filter(r => 
    r.roomId === selectedRoom.value?.id && 
    r.reserveDate === reserveForm.value.reserveDate &&
    r.status === '正常'
  )

  availableTimeSlots.value = slots.map(time => ({
    time,
    available: !dateReserves.some(r => r.timeSlot === time)
  }))
}

// 切换时间段选择
function toggleTimeSlot(time: string) {
  const slot = availableTimeSlots.value.find(s => s.time === time)
  if (!slot?.available) return

  const index = selectedTimeSlots.value.indexOf(time)
  if (index > -1) {
    // 如果已选择，则取消选择
    selectedTimeSlots.value.splice(index, 1)
  } else {
    // 如果未选择，则添加到选择列表
    selectedTimeSlots.value.push(time)
    // 按时间排序
    selectedTimeSlots.value.sort()
  }
}

// 提交预定
async function submitReserve() {
  if (!reserveForm.value.reserveDate || selectedTimeSlots.value.length === 0) {
    ElMessage.warning('请选择预定日期和时间段')
    return
  }

  try {
    // 批量提交多个时间段的预定
    const promises = selectedTimeSlots.value.map(timeSlot => 
      request.post('/reserves', {
        roomId: selectedRoom.value?.id,
        userId: currentUser.value.id,
        reserveDate: reserveForm.value.reserveDate,
        timeSlot: timeSlot,
        status: '正常'
      })
    )
    
    await Promise.all(promises)
    ElMessage.success(`成功预定 ${selectedTimeSlots.value.length} 个时段`)
    reserveDialogVisible.value = false
    getRoomList()
    getAllReserves()
    getMyReserves()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '预定失败')
  }
}

// 取消预定
async function cancelReserve(id: number) {
  try {
    await ElMessageBox.confirm('确定要取消这个预定吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await request.delete(`/reserves/${id}`)
    ElMessage.success('取消成功')
    getMyReserves()
    getAllReserves()
    getRoomList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

// 显示会议室详情
function showRoomDetail(room: Room) {
  selectedRoomDetail.value = room
  roomDetailVisible.value = true
}

// 修改密码
async function changePassword() {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    ElMessage.warning('新密码长度不能少于6位')
    return
  }

  try {
    await request.put(`/users/${currentUser.value.id}`, {
      password: passwordForm.value.newPassword
    })
    ElMessage.success('密码修改成功')
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '修改失败')
  }
}
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  height: 60px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.header h1 {
  margin: 0;
  font-size: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.filter-sidebar {
  padding-right: 20px;
}

.filter-card, .stats-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.stats-item:last-child {
  border-bottom: none;
}

.stats-value {
  font-weight: bold;
  font-size: 18px;
}

.stats-value.available { color: #67c23a; }
.stats-value.reserved { color: #f56c6c; }
.stats-value.mine { color: #409eff; }

.main-content {
  padding: 0;
}

.room-list-card, .reserves-card {
  border-radius: 8px;
}

.room-card {
  margin-bottom: 15px;
  transition: all 0.3s;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.room-unavailable {
  opacity: 0.6;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.room-header h3 {
  margin: 0;
  font-size: 16px;
}

.room-info p {
  margin: 8px 0;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.room-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.reserve-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reserve-info h4 {
  margin: 0 0 5px 0;
}

.reserve-info p {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 14px;
}

/* 日历视图 */
.calendar-view {
  padding: 20px;
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.legend-dot {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-dot.available {
  background: #67c23a;
}

.legend-dot.full {
  background: #f56c6c;
}

.legend-dot.none {
  background: #e4e7ed;
  border: 1px solid #dcdfe6;
}

.calendar-cell {
  height: 100%;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
  background: #f5f7fa;
}

.calendar-cell:hover {
  opacity: 0.8;
}

/* 无预定 - 灰色 */
.calendar-cell.cell-none {
  background: #f5f7fa;
  border: 2px solid #dcdfe6;
}

/* 全部可用 - 绿色 */
.calendar-cell.cell-available {
  background: #67c23a;
  border: 2px solid #67c23a;
}

.calendar-cell.cell-available .calendar-date {
  color: white;
}

/* 部分可用 - 橙色 */
.calendar-cell.cell-partial {
  background: #e6a23c;
  border: 2px solid #e6a23c;
}

.calendar-cell.cell-partial .calendar-date {
  color: white;
}

/* 已满 - 红色 */
.calendar-cell.cell-full {
  background: #f56c6c;
  border: 2px solid #f56c6c;
}

.calendar-cell.cell-full .calendar-date {
  color: white;
}

.calendar-date {
  font-weight: bold;
  text-align: center;
}

/* 预定对话框 */
.reserve-dialog-content {
  padding: 10px;
}

.selected-room-info {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
}

.selected-room-info h3 {
  margin: 0 0 10px 0;
}

.selected-room-info p {
  margin: 5px 0;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.time-slot-tag {
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.time-slot-tag.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
}

.time-slot-tag.selected {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.time-slot-info {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.total-duration {
  color: #666;
  font-size: 14px;
}

.reserve-history {
  max-height: 200px;
  overflow-y: auto;
}

.reserve-history h4 {
  margin-bottom: 10px;
}

.no-history {
  color: #999;
  text-align: center;
  padding: 20px;
}

/* 会议室详情 */
.room-detail {
  padding: 10px;
}

.room-images {
  margin-bottom: 20px;
}

.room-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.no-image {
  height: 200px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border-radius: 8px;
}

.room-detail-info h2 {
  margin-bottom: 15px;
}

.detail-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.equipment-section, .description-section {
  margin-top: 20px;
}

.equipment-section h4, .description-section h4 {
  margin-bottom: 10px;
}

.equipment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 个人中心 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-box {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.recent-rooms h4 {
  margin-bottom: 10px;
}

/* 登录页面 */
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
</style>
