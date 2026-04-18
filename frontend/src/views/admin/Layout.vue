<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">
        <svg class="logo-icon" viewBox="0 0 24 24" width="24" height="24">
          <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" fill="currentColor"/>
        </svg>
        <span class="logo-text">管理后台</span>
      </div>
      <nav class="menu">
        <router-link to="/admin" class="menu-item">
          <span class="icon">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 3v18h18" stroke="currentColor" fill="none" stroke-width="2"/><path d="M7 13l4 4 7-7" stroke="currentColor" fill="none" stroke-width="2"/></svg>
          </span>
          <span class="text">仪表盘</span>
        </router-link>
        <router-link to="/admin/articles" class="menu-item">
          <span class="icon">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 4h16v16H4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="2"/></svg>
          </span>
          <span class="text">文章管理</span>
        </router-link>
        <router-link to="/admin/categories" class="menu-item">
          <span class="icon">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 6h6l2 2h10v10H3z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          </span>
          <span class="text">分类管理</span>
        </router-link>
        <router-link to="/admin/tags" class="menu-item">
          <span class="icon">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 7l7-4 11 11-7 7L3 7z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="9" r="1.5" fill="currentColor"/></svg>
          </span>
          <span class="text">标签管理</span>
        </router-link>
        <router-link to="/admin/friendlinks" class="menu-item">
          <span class="icon">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M10 14L6 18a4 4 0 0 1-6-6l4-4M14 10l4-4a4 4 0 1 1 6 6l-4 4" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          </span>
          <span class="text">友链管理</span>
        </router-link>
        <router-link to="/admin/announcements" class="menu-item">
          <span class="icon">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 11h4l9-6v16l-9-6H3z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="18" r="2" fill="currentColor"/></svg>
          </span>
          <span class="text">公告管理</span>
        </router-link>
        <router-link to="/admin/subscriptions" class="menu-item">
          <span class="icon">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 5h18v14H3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 7l9 6 9-6" stroke="currentColor" stroke-width="2"/></svg>
          </span>
          <span class="text">订阅用户</span>
        </router-link>
        <router-link to="/admin/users" class="menu-item">
          <span class="icon">
            <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="9" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="7" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          </span>
          <span class="text">用户管理</span>
        </router-link>
        <router-link to="/admin/settings" class="menu-item">
          <span class="icon">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 4.3l.06.06A1.65 1.65 0 0 0 8.92 4h.18A1.65 1.65 0 0 0 10.6 3.4l.06-.06A2 2 0 1 1 13.49 6.2l-.06.06A1.65 1.65 0 0 0 13.9 8v.18A1.65 1.65 0 0 0 15.6 9" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          </span>
          <span class="text">网站设置</span>
        </router-link>
      </nav>
      <div class="user-info">
        <div class="user-details">
          <div class="user-name">{{ userStore.user?.username }}</div>
          <div class="user-role">管理员</div>
          <a v-if="siteInfo.contact_youtube" class="user-link" :href="siteInfo.contact_youtube" target="_blank" rel="noopener">YouTube</a>
        </div>
        <button class="logout-btn" @click="handleLogout" title="退出登录">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M16 17l5-5-5-5" stroke="currentColor" stroke-width="2" fill="none"/><path d="M21 12H9" stroke="currentColor" stroke-width="2"/><path d="M3 21V3h6" stroke="currentColor" stroke-width="2" fill="none"/></svg>
        </button>
      </div>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getSiteInfo } from '@/api/front'

const router = useRouter()
const userStore = useUserStore()
const siteInfo = ref<any>({})

onMounted(async () => {
  const res: any = await getSiteInfo()
  if (res.code === 200 && res.data) {
    siteInfo.value = res.data
  }
})

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/admin/login')
  }
}
</script>

<style scoped>
/* ===== UI/UX Pro Max Admin Layout ===== */

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
}

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
}

.logo {
  padding: 32px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  background: rgba(255, 255, 255, 0.03);
.logo-icon { color: #60a5fa; }
.logo-text { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.menu {
  flex: 1;
  padding: 24px 16px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 15px;
  font-weight: 500;
  border-radius: 12px;
}

.menu-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.menu-item.router-link-active {
  color: #fff;
  background: #3b82f6;
  box-shadow: 0 8px 20px -6px rgba(59, 130, 246, 0.6);
}

.menu-item .icon {
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.user-info {
  padding: 20px 24px;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.user-role {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.user-link {
  font-size: 12px;
  color: #60a5fa;
  text-decoration: none;
  transition: color 0.2s ease;
}

.user-link:hover {
  color: #93c5fd;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #cbd5e1;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.main-content {
  flex: 1;
  background: #f8fafc;
  padding: 32px;
  margin-left: 240px;
  min-height: 100vh;
}
</style>
