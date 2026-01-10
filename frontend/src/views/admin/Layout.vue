<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">博客管理</div>
      <nav class="menu">
        <router-link to="/admin/dashboard">📊 仪表盘</router-link>
        <router-link to="/admin/articles">📝 文章管理</router-link>
        <router-link to="/admin/categories">📁 分类管理</router-link>
        <router-link to="/admin/tags">🏷️ 标签管理</router-link>
        <router-link to="/admin/settings">⚙️ 网站设置</router-link>
      </nav>
      <div class="user-info">
        <span>{{ userStore.user?.nickname }}</span>
        <button @click="handleLogout">退出</button>
      </div>
    </aside>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; }
.sidebar { width: 220px; background: #001529; color: #fff; display: flex; flex-direction: column; }
.logo { padding: 20px; font-size: 20px; font-weight: bold; text-align: center; border-bottom: 1px solid #0d2840; }
.menu { flex: 1; padding: 10px 0; }
.menu a { display: block; padding: 12px 24px; color: rgba(255,255,255,0.65); text-decoration: none; transition: all 0.3s; }
.menu a:hover, .menu a.router-link-active { color: #fff; background: #1890ff; }
.user-info { padding: 16px; border-top: 1px solid #0d2840; display: flex; justify-content: space-between; align-items: center; }
.user-info button { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 4px 12px; border-radius: 4px; cursor: pointer; }
.main { flex: 1; background: #f0f2f5; padding: 24px; overflow-y: auto; }
</style>
