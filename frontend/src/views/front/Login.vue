<template>
  <div class="login-container">
    <div class="background-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>
    
    <div class="login-card">
      <div class="login-header">
        <div class="logo-area">
          <div class="logo-icon">B</div>
        </div>
        <h1>欢迎回来</h1>
        <p class="subtitle">请登录您的账户以继续</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>账号</label>
          <div class="input-wrapper">
            <input 
              v-model="form.account" 
              type="text" 
              placeholder="用户名或邮箱" 
              required 
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-group">
          <label>密码</label>
          <div class="input-wrapper">
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="您的安全密码" 
              required 
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-actions">
          <label class="remember-me">
            <input type="checkbox" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-password">忘记密码？</a>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">立即登录</span>
          <div v-else class="loader"></div>
        </button>
      </form>

      <div class="wechat-login">
        <button type="button" class="wechat-btn" :disabled="wechatLoading" @click="handleWeChatLogin">
          <span v-if="!wechatLoading">微信扫码登录</span>
          <div v-else class="loader"></div>
        </button>
      </div>

      <div class="login-footer">
        <p>还没有账号？ <router-link to="/register">免费注册</router-link></p>
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition name="fade-up">
      <div v-if="toast.show" class="toast-notification">
        <div class="toast-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const wechatLoading = ref(false)

const toast = ref({
  show: false,
  message: ''
})

const showToast = (message: string) => {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const form = ref({
  account: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  try {
    const res = await userStore.login(form.value.account, form.value.password)
    if (res.code === 200) {
      router.push('/')
    } else {
      showToast(res.message || '登录失败')
    }
  } catch (err) {
    showToast('登录出错，请检查网络')
  } finally {
    loading.value = false
  }
}

const handleWeChatLogin = () => {
  showToast('此功能正在开发中')
}

onMounted(async () => {
  const tokenParam = route.query.token
  const errorParam = route.query.wechat_error
  if (errorParam) {
    showToast(String(errorParam))
  }
  if (tokenParam) {
    const token = Array.isArray(tokenParam) ? tokenParam[0] : String(tokenParam)
    userStore.setToken(token)
    await userStore.fetchProfile()
    router.replace('/')
  }
})
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-body);
  overflow: hidden;
  padding: 20px;
}

/* 背景装饰 */
.background-blobs {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.blob {
  position: absolute;
  width: 500px;
  height: 500px;
  background: var(--accent-glow-1);
  filter: blur(80px);
  border-radius: 50%;
}

.blob-1 { top: -100px; right: -100px; background: var(--accent-glow-1); }
.blob-2 { bottom: -150px; left: -150px; background: var(--accent-glow-2); }

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background: var(--bg-glass-strong);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.05),
    0 10px 10px -5px rgba(0, 0, 0, 0.02);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-area {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: var(--accent-gradient);
  color: var(--text-invert);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.toast-notification {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  pointer-events: none;
}

.toast-content {
  background: var(--accent-gradient);
  backdrop-filter: blur(12px);
  color: var(--text-invert);
  padding: 12px 24px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
  font-size: 14px;
  font-weight: 500;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

h1 {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 15px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  padding-left: 4px;
}

.input-wrapper {
  position: relative;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 14px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-primary);
  transition: all 0.2s;
  outline: none;
}

input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  cursor: pointer;
}

.forgot-password {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 500;
}

.submit-btn {
  margin-top: 8px;
  width: 100%;
  padding: 14px;
  background: var(--accent-color);
  color: var(--text-invert);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.submit-btn:hover {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.login-footer a {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 600;
}

.wechat-login {
  margin-top: 16px;
}

.wechat-btn {
  width: 100%;
  padding: 12px;
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wechat-btn:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.wechat-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Loader Animation */
.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: var(--text-invert);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }
}
</style>
