<template>
  <div>
    <div v-show="loading" class="app-loader" aria-live="polite" aria-busy="true">
      <div class="loader-inner">
        <div class="logo-wrap">
          <img class="loader-logo" :src="logoSrc" alt="Logo" />
          <span class="ring"></span>
          <span class="glow"></span>
        </div>
        <div class="loading-text">正在加载...</div>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const logoSrc = '/favicon.jpg'
const LOADER_MS = 3000
let hideTimer: number | undefined

const startFixedLoader = () => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = undefined
  }
  loading.value = true
  hideTimer = window.setTimeout(() => {
    loading.value = false
    hideTimer = undefined
  }, LOADER_MS)
}

onMounted(async () => {
  const alreadyShown = sessionStorage.getItem('home_loader_shown') === '1'
  const isHome = route.path === '/'
  if (!alreadyShown && isHome) {
    startFixedLoader()
    sessionStorage.setItem('home_loader_shown', '1')
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.app-loader {
  position: fixed;
  inset: 0;
  background: radial-gradient(1200px 600px at 50% 20%, rgba(0,0,0,0.06), transparent),
              var(--bg-body);
  display: grid;
  place-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loader-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.logo-wrap {
  position: relative;
  width: 86px;
  height: 86px;
  display: grid;
  place-items: center;
}

.loader-logo {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 14px;
  box-shadow: 0 10px 30px var(--shadow-md);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
}

.ring {
  position: absolute;
  width: 86px;
  height: 86px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--accent-color);
  animation: spin 1.1s linear infinite;
  filter: drop-shadow(0 0 8px var(--accent-color));
}

.glow {
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.0);
  animation: pulse 1.6s ease-in-out infinite;
}

.loading-text {
  font-size: 13px;
  color: var(--text-secondary);
  letter-spacing: 0.3px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(9, 187, 7, 0.35); }
  70%  { box-shadow: 0 0 0 14px rgba(9, 187, 7, 0); }
  100% { box-shadow: 0 0 0 0 rgba(9, 187, 7, 0); }
}

@media (max-width: 768px) {
  .logo-wrap { width: 76px; height: 76px; }
  .loader-logo { width: 58px; height: 58px; }
  .ring { width: 76px; height: 76px; }
}
</style>
