import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Login from '../views/Login.vue'; // 登录页
import Home from '../views/Home.vue'; // 首页（会议室列表+预定）
import MyReserve from '../views/MyReserve.vue'; // 我的预定页

// 路由规则（对应不同页面）
const routes: RouteRecordRaw[] = [
  {
    path: '/', // 访问路径
    name: 'Login',
    component: Login, // 对应页面组件
    meta: { title: '登录' } // 页面标题
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { title: '会议室预定系统' },
    // 路由守卫：未登录用户不能访问首页
    beforeEnter: (to, from, next) => {
      const user = localStorage.getItem('user'); // 获取本地存储的用户信息
      if (user) {
        next(); // 已登录，允许访问
      } else {
        next('/'); // 未登录，跳转到登录页
      }
    }
  },
  {
    path: '/my-reserve',
    name: 'MyReserve',
    component: MyReserve,
    meta: { title: '我的预定' },
    // 路由守卫：未登录用户不能访问我的预定页
    beforeEnter: (to, from, next) => {
      const user = localStorage.getItem('user');
      if (user) {
        next();
      } else {
        next('/');
      }
    }
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 路由模式（HTML5模式，无#）
  routes // 注册路由规则
});

// 全局路由守卫：修改页面标题
router.beforeEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
});

export default router;
