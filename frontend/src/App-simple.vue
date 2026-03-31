<template>
  <div>
    <h1>Element Plus 测试</h1>
    <el-button type="primary">测试按钮</el-button>
    <el-input v-model="testText" placeholder="请输入内容" style="width: 300px; margin-left: 10px;" />
    <p>输入内容: {{ testText }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

console.log('App.vue 正在加载...')

const testText = ref('')
</script>

<style>
body {
  padding: 20px;
  background: #f5f7fa;
}
</style>
