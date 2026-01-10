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

const router = useRouter()
const keyword = ref('')
const siteInfo = ref<any>({})

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
.front-layout { min-height: 100vh; display: flex; flex-direction: column; }
.header { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
.header .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
.logo { font-size: 24px; font-weight: bold; color: #333; text-decoration: none; }
.nav { display: flex; gap: 24px; }
.nav a { color: #666; text-decoration: none; transition: color 0.3s; }
.nav a:hover, .nav a.router-link-active { color: #1890ff; }
.search-box input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; outline: none; }
.main { flex: 1; max-width: 1200px; margin: 0 auto; padding: 20px; width: 100%; box-sizing: border-box; }
.footer { background: #f5f5f5; padding: 20px; text-align: center; color: #999; }
</style>
