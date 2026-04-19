<template>
  <header class="navbar" :class="{ 'is-scrolled': isScrolled }">
    <div class="container navbar-inner">
      <!-- Logo & Site Name -->
      <router-link to="/" class="brand" @click="trackEvent('click_logo', 'navbar')">
        <img class="brand-icon" src="/favicon.jpg" alt="logo" />
        <div class="brand-text">
          <div class="brand-title">{{ siteInfo.blog_title || '李嘉骏的火车站' }}</div>
        </div>
      </router-link>

      <!-- Navigation Menu (Desktop) -->
      <nav class="menu desktop-only">
        <router-link to="/" class="menu-item home-item" active-class="active" @click="trackEvent('click_menu', 'home')">首页</router-link>
        
        <!-- A/B Test Group A: Flat Structure -->
        <template v-if="abGroup === 'A'">
          <router-link to="/articles" class="menu-item" active-class="active" @click="trackEvent('click_menu', 'articles_flat')">所有文章</router-link>
          <router-link to="/archive" class="menu-item" active-class="active" @click="trackEvent('click_menu', 'archive_flat')">归档</router-link>
          <router-link to="/categories" class="menu-item" active-class="active" @click="trackEvent('click_menu', 'categories_flat')">分类</router-link>
          <router-link to="/subscribe" class="menu-item" active-class="active" @click="trackEvent('click_menu', 'subscribe_flat')">订阅</router-link>
        </template>

        <!-- A/B Test Group B: Dropdown Structure -->
        <div v-else class="menu-item-group" @mouseenter="showDiscover = true" @mouseleave="showDiscover = false">
          <span class="menu-item group-trigger" :class="{ active: isDiscoverActive }">
            发现 <span class="arrow-down">▼</span>
          </span>
          <transition name="fade-slide">
            <div v-if="showDiscover" class="dropdown-menu discover-menu">
              <router-link to="/articles" class="dropdown-item" @click="trackEvent('click_menu', 'articles_dropdown')">所有文章</router-link>
              <router-link to="/archive" class="dropdown-item" @click="trackEvent('click_menu', 'archive_dropdown')">归档</router-link>
              <router-link to="/categories" class="dropdown-item" @click="trackEvent('click_menu', 'categories_dropdown')">分类</router-link>
              <router-link to="/subscribe" class="dropdown-item" @click="trackEvent('click_menu', 'subscribe_dropdown')">订阅</router-link>
            </div>
          </transition>
        </div>

        <router-link to="/friendlinks" class="menu-item" active-class="active" @click="trackEvent('click_menu', 'friendlinks')">友链</router-link>
        <router-link to="/message-board" class="menu-item" active-class="active" @click="trackEvent('click_menu', 'message_board')">留言</router-link>
        <router-link to="/about" class="menu-item" active-class="active" @click="trackEvent('click_menu', 'about')">关于</router-link>
        <a v-if="youtubeLink" :href="youtubeLink" class="menu-item" target="_blank" rel="noopener" @click="trackEvent('click_menu', 'youtube')">YouTube</a>
      </nav>

      <!-- Right Actions -->
      <div class="actions">
        <!-- Search -->
        <div class="search-wrapper" :class="{ active: searchOpen }">
          <button class="icon-btn search-toggle" @click="toggleSearch" title="搜索">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          <div class="search-input-container">
            <input 
              ref="searchInputRef"
              v-model="searchQuery" 
              type="text" 
              placeholder="搜索..." 
              @keyup.enter="handleSearch"
              @blur="closeSearchDelay"
            />
          </div>
        </div>

        <!-- Theme Toggle -->
        <button class="icon-btn theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? '切换亮色模式' : '切换暗色模式'">
          <svg v-if="theme === 'dark'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </button>

        <!-- User Actions -->
        <template v-if="!userStore.token">
          <router-link to="/login" class="btn-primary-outline login-btn" @click="trackEvent('click_auth', 'login')">登录</router-link>
        </template>
        <div v-else class="user-dropdown-wrapper" @mouseenter="showUserMenu = true" @mouseleave="showUserMenu = false">
          <button class="user-avatar-btn" :class="{ 'has-avatar': userStore.user?.avatar }">
             <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" class="user-avatar-img" alt="avatar" />
             <span v-else>{{ userStore.user?.username?.charAt(0).toUpperCase() || 'U' }}</span>
          </button>
          <transition name="fade-slide">
            <div v-if="showUserMenu" class="dropdown-menu user-menu">
              <div class="dropdown-header">
                <span class="user-name">{{ userStore.user?.username }}</span>
              </div>
              <router-link to="/user/profile" class="dropdown-item" @click="trackEvent('click_user', 'profile')">个人中心</router-link>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout" @click="handleLogout">退出登录</button>
            </div>
          </transition>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="icon-btn mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
          <svg v-if="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <transition name="slide-down">
      <div v-if="mobileMenuOpen" class="mobile-menu-container">
        <nav class="mobile-nav">
          <router-link to="/" class="mobile-item" @click="mobileMenuOpen = false">首页</router-link>
          <button class="mobile-item" type="button" @click="navigateMobile('/articles')">所有文章</button>
          <router-link to="/archive" class="mobile-item" @click="mobileMenuOpen = false">归档</router-link>
          <router-link to="/categories" class="mobile-item" @click="mobileMenuOpen = false">分类</router-link>
          <router-link to="/subscribe" class="mobile-item" @click="mobileMenuOpen = false">订阅</router-link>
          <router-link to="/friendlinks" class="mobile-item" @click="mobileMenuOpen = false">友链</router-link>
          <router-link to="/message-board" class="mobile-item" @click="mobileMenuOpen = false">留言</router-link>
          <router-link to="/about" class="mobile-item" @click="mobileMenuOpen = false">关于</router-link>
          <a v-if="youtubeLink" :href="youtubeLink" class="mobile-item" target="_blank" rel="noopener" @click="mobileMenuOpen = false; trackEvent('click_menu', 'youtube')">YouTube</a>
          <div class="mobile-divider"></div>
          <template v-if="!userStore.token">
            <router-link to="/login" class="mobile-item login" @click="mobileMenuOpen = false">登录</router-link>
          </template>
          <template v-else>
            <router-link to="/user/profile" class="mobile-item" @click="mobileMenuOpen = false">个人中心</router-link>
            <button class="mobile-item logout" @click="handleLogoutMobile">退出登录</button>
          </template>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getSiteInfo } from '@/api/front'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// State
const searchQuery = ref('')
const searchOpen = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const mobileMenuOpen = ref(false)
const showUserMenu = ref(false)
const showDiscover = ref(false)
const isScrolled = ref(false)
const abGroup = ref('A') // Default to A
const siteInfo = ref<any>({})
const theme = ref('light')
const startTime = ref(Date.now())
const lastPageTime = ref(Date.now())
const youtubeFallback = 'https://www.youtube.com/@lijiajun-xtjj/'

// Computed
const isDiscoverActive = computed(() => {
  return ['/articles', '/archive', '/categories'].includes(route.path)
})
const youtubeLink = computed(() => {
  return siteInfo.value?.contact_youtube || youtubeFallback
})

// Methods

// Analytics Tracker
const trackEvent = (action: string, label: string, value?: number) => {
  const eventData = {
    group: abGroup.value,
    action,
    label,
    value,
    timestamp: new Date().toISOString(),
    path: route.path
  }
  
  // Simulate sending to backend
  console.log(`[📊 Analytics] Group:${abGroup.value} | Event:${action} | Label:${label} ${value ? `| Value:${value}` : ''}`)
  
  // Store locally for demo purposes
  const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
  events.push(eventData)
  localStorage.setItem('analytics_events', JSON.stringify(events.slice(-50))) // Keep last 50
}

const trackPageDwellTime = () => {
  const now = Date.now()
  const duration = (now - lastPageTime.value) / 1000 // seconds
  if (duration > 0.5) { // Ignore very short jumps
    trackEvent('page_dwell_time', route.path, parseFloat(duration.toFixed(2)))
  }
  lastPageTime.value = now
}

// Watch route change to track dwell time
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (oldPath) {
      trackPageDwellTime()
    }
  }
)

// Theme Logic
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.value = savedTheme
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark'
  }
  applyTheme()
}

const initABGroup = () => {
  const savedGroup = localStorage.getItem('ab_group')
  if (savedGroup) {
    abGroup.value = savedGroup
  } else {
    // Randomly assign A or B (50/50)
    const group = Math.random() > 0.5 ? 'B' : 'A'
    abGroup.value = group
    localStorage.setItem('ab_group', group)
  }
  console.log(`[🧪 A/B Test] Current Group: ${abGroup.value}`)
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  applyTheme()
  trackEvent('toggle_theme', theme.value)
}

const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('theme', theme.value)
}

// Search Logic
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    trackEvent('search', searchQuery.value)
    router.push({ path: '/search', query: { q: searchQuery.value } })
    searchOpen.value = false
    mobileMenuOpen.value = false
    searchQuery.value = ''
  }
}

const toggleSearch = () => {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    trackEvent('open_search', 'navbar')
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

const closeSearchDelay = () => {
  setTimeout(() => {
    if (!searchQuery.value) {
      searchOpen.value = false
    }
  }, 200)
}

const handleLogout = () => {
  trackEvent('logout', 'user_menu')
  userStore.logout()
  router.push('/login')
  showUserMenu.value = false
}

const handleLogoutMobile = () => {
  trackEvent('logout', 'mobile_menu')
  userStore.logout()
  router.push('/login')
  mobileMenuOpen.value = false
}

const navigateMobile = (path: string) => {
  mobileMenuOpen.value = false
  if (route.path !== path) {
    router.push(path)
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

// Lifecycle
onMounted(async () => {
  // Init
  window.addEventListener('scroll', handleScroll)
  // Track the last page duration when leaving the site
  window.addEventListener('beforeunload', trackPageDwellTime)
  
  initTheme()
  initABGroup()

  // Fetch Site Info
  try {
    const res: any = await getSiteInfo()
    if (res.code === 200 && res.data) {
      siteInfo.value = res.data
    }
  } catch (err) {
    console.error('获取网站信息失败', err)
  }
})

onUnmounted(() => {
  trackPageDwellTime()
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('beforeunload', trackPageDwellTime)
})
</script>

<style scoped>
/* Variables mapped to Global CSS Variables */
.navbar {
  --nav-height: 70px;
  /* Use global vars */
  --transition-speed: 0.3s;
  
  position: sticky;
  top: 0;
  z-index: 1000;
  height: var(--nav-height);
  background: var(--bg-nav);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid transparent;
  transition: all var(--transition-speed) ease;
}

.navbar.is-scrolled {
  background: var(--bg-nav-scrolled);
  box-shadow: var(--shadow-sm);
  border-bottom-color: var(--border-color);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-primary);
  z-index: 1001;
}

.brand-icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.brand-title {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.5px;
}

/* Menu Desktop */
.menu {
  display: flex;
  align-items: center;
  gap: 32px;
}

.menu-item {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 15px;
  text-decoration: none;
  transition: color 0.2s;
  position: relative;
  cursor: pointer;
}

.menu-item:hover, .menu-item.active {
  color: var(--text-primary);
}

.menu-item.home-item.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent-color);
  border-radius: 2px;
}

/* Dropdown */
.menu-item-group {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.arrow-down {
  font-size: 10px;
  margin-left: 4px;
  opacity: 0.6;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-dropdown);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  padding: 8px;
  min-width: 160px;
  margin-top: 10px;
}

.dropdown-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: var(--bg-dropdown);
  border-left: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
}

.dropdown-item {
  display: block;
  padding: 10px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  text-align: left;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--bg-body); /* Slightly different from dropdown bg */
  color: var(--text-primary);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 6px 0;
}

.dropdown-item.logout {
  color: var(--danger-color);
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Actions */
.actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--bg-body);
  color: var(--text-primary);
}

/* Search */
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-container {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background: var(--bg-input);
  border-radius: 20px;
  opacity: 0;
}

.search-wrapper.active .search-input-container {
  width: 240px;
  opacity: 1;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--accent-color);
}

.search-input-container input {
  width: 100%;
  padding: 8px 16px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-primary);
}

.search-wrapper.active .search-toggle {
  color: var(--accent-color);
}

/* User */
.user-dropdown-wrapper {
  position: relative;
}

.user-avatar-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color), #8b5cf6);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  overflow: hidden;
}

.user-avatar-btn.has-avatar {
  background: transparent;
  padding: 0;
  border: 1px solid var(--border-color);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-menu {
  right: 0;
  left: auto;
  transform: none;
  min-width: 200px;
}

.user-menu::before {
  left: auto;
  right: 10px;
}

.dropdown-header {
  padding: 10px 16px;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-body);
  border-radius: 8px 8px 0 0;
  margin: -8px -8px 8px -8px;
  border-bottom: 1px solid var(--border-color);
}

.btn-primary-outline {
  padding: 6px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary-outline:hover {
  border-color: var(--text-primary);
  background: var(--text-primary);
  color: var(--bg-card);
}

/* Mobile */
.mobile-toggle {
  display: none;
}

.mobile-menu-container {
  position: fixed;
  top: var(--nav-height);
  left: 0;
  width: 100%;
  background: var(--bg-nav-scrolled); /* Higher opacity for mobile menu */
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  padding: 20px 0;
  z-index: 999;
  box-shadow: var(--shadow-md);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
}

.mobile-item {
  padding: 12px 24px;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s;
  text-align: left;
  background: none;
  border: none;
  width: 100%;
}

.mobile-item:hover {
  background: var(--bg-body);
}

.mobile-divider {
  height: 1px;
  background: var(--border-color);
  margin: 10px 24px;
}

.mobile-item.login {
  color: var(--accent-color);
}

.mobile-item.logout {
  color: var(--danger-color);
}

/* Responsive */
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  
  .mobile-toggle {
    display: flex;
  }
  
  .search-wrapper.active .search-input-container {
    width: 200px;
    right: 40px; 
  }
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px) translateX(-50%);
}
.user-menu.fade-slide-enter-from,
.user-menu.fade-slide-leave-to {
  transform: translateY(10px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
