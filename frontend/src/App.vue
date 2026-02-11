<template>
  <div style="width: 1200px; margin: 20px auto;">
    <h1 style="text-align: center; margin-bottom: 20px;">会议室预定系统</h1>

    <!-- 新增会议室表单 -->
    <el-card title="添加会议室" style="margin-bottom: 20px;">
      <el-form :model="roomForm" inline @submit.prevent="addRoom">
        <el-form-item label="会议室名称">
          <el-input v-model="roomForm.name" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="容纳人数">
          <el-input v-model.number="roomForm.capacity" placeholder="请输入人数"></el-input>
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="roomForm.location" placeholder="比如：3楼301"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addRoom">添加</el-button>
        </el-form-item>
      </el-form>
    </el-card>

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
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '../src/utils/request' // 引入接口请求工具

// 会议室列表数据（存储后端返回的会议室信息）
const roomList = ref([])

// 新增会议室表单数据（和后端接口字段对应）
const roomForm = ref({
  name: '',
  capacity: 0,
  location: '',
  status: '可用'
})

// 页面加载时，自动获取会议室列表
onMounted(async () => {
  getRoomList()
})

// 调用后端接口，获取所有会议室（接口前缀改为/rooms，匹配后端实际接口）
async function getRoomList() {
  const data = await request.get('/rooms') // 调用后端 /rooms 接口（同步后端实际前缀）
  roomList.value = data // 把后端返回的数据，赋值给列表
}

// 调用后端接口，添加会议室（接口前缀改为/rooms，匹配后端实际接口）
async function addRoom() {
  // 简单校验：确保表单填写完整
  if (!roomForm.value.name || !roomForm.value.capacity || !roomForm.value.location) {
    alert('请填写完整信息！')
    return
  }
  // 调用后端添加接口，提交表单数据（接口前缀改为/rooms）
  await request.post('/rooms', roomForm.value)
  // 清空表单，方便下次添加
  roomForm.value = {
    name: '',
    capacity: 0,
    location: '',
    status: '可用'
  }
  // 重新获取列表，显示新增的会议室
  getRoomList()
  alert('添加成功！')
}
</script>

<style scoped>
/* 简单样式，让界面更美观 */
.el-card {
  margin-bottom: 20px;
}
</style>