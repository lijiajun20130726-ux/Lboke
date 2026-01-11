<template>
  <div class="front-layout">
    <header class="header">
      <div class="container">
        <router-link to="/" class="logo">{{ siteInfo.site_name || 'Blog' }}</router-link>
        <nav class="nav">
          <router-link to="/">首页</router-link>
          <router-link to="/archives">归档</router-link>
          <router-link to="/about">关于</router-link>
        </nav>
        <div class="user-actions">
          <div v-if="userStore.token" class="user-info">
            <img :src="userStore.user?.avatar || '/uploads/default-avatar.jpg'" class="avatar" />
            <span class="nickname">{{ userStore.user?.nickname }}</span>
            <button @click="handleLogout" class="logout-btn">退出</button>
          </div>
          <div v-else class="auth-links">
            <router-link to="/login">登录</router-link>
            <router-link to="/register">注册</router-link>
          </div>
        </div>
        <div class="search-box">
          <input v-model="keyword" placeholder="搜索文章..." @keyup.enter="handleSearch" />
        </div>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
    <footer class="footer">
      <p>&copy; {{ new Date().getFullYear() }} {{ siteInfo.site_name }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSiteInfo } from '@/api/front'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const keyword = ref('')
const siteInfo = ref<any>({})

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}

const handleSearch = () => {
  if (keyword.value.trim()) {
    router.push({ path: '/search', query: { q: keyword.value } })
  }
}

onMounted(async () => {
  const res: any = await getSiteInfo()
  if (res.code === 200) {
    siteInfo.value = res.data
  }
})
</script>

<style scoped>
.front-layout { min-height: 100vh; display: flex; flex-direction: column; background-color: #f8fafc; }

.header { 
  background: rgba(255, 255, 255, 0.8); 
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
  position: sticky; 
  top: 0; 
  z-index: 100; 
  transition: all 0.3s ease;
}

.header .container { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 0 24px; 
  height: 72px; 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
}

.logo { 
  font-size: 24px; 
  font-weight: 800; 
  color: #0f172a; 
  text-decoration: none; 
  letter-spacing: -0.02em;
}

.nav { display: flex; gap: 32px; }
.nav a { 
  color: #475569; 
  text-decoration: none; 
  transition: all 0.2s; 
  font-weight: 600;
  font-size: 15px;
}
.nav a:hover, .nav a.router-link-active { color: #3b82f6; }

.user-actions { display: flex; align-items: center; gap: 20px; }
.auth-links { display: flex; gap: 16px; }
.auth-links a { 
  font-size: 14px; 
  color: #475569; 
  text-decoration: none; 
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}
.auth-links a:hover { background: #f1f5f9; color: #0f172a; }
.auth-links a:last-child { background: #0f172a; color: #fff; }
.auth-links a:last-child:hover { background: #334155; }

.user-info { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #0f172a; }
.avatar { width: 36px; height: 32px; border-radius: 100%; object-fit: cover; border: 2px solid #e2e8f0; }
.logout-btn { 
  padding: 6px 12px; 
  border: 1px solid #e2e8f0; 
  background: #fff; 
  border-radius: 8px; 
  cursor: pointer; 
  font-size: 12px; 
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
}
.logout-btn:hover { color: #ef4444; border-color: #fecaca; background: #fef2f2; }

.search-box { margin-left: 20px; }
.search-box input { 
  padding: 10px 16px; 
  border: 1px solid #e2e8f0; 
  border-radius: 100px; 
  outline: none; 
  width: 200px;
  background: #f1f5f9;
  font-size: 14px;
  transition: all 0.2s;
}
.search-box input:focus { width: 260px; background: #fff; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

.main { flex: 1; width: 100%; padding: 40px 0; box-sizing: border-box; }

.footer { 
  background: #fff; 
  padding: 48px 0; 
  border-top: 1px solid #e2e8f0;
  text-align: center; 
}
.footer p { color: #64748b; font-size: 14px; font-weight: 500; }

@media (max-width: 768px) {
  .nav { display: none; }
  .search-box input { width: 120px; }
  .search-box input:focus { width: 160px; }
}
</style>
