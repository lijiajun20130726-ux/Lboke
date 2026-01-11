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

      <div class="login-footer">
        <p>还没有账号？ <router-link to="/register">免费注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

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
      // 可以在这里集成一个更好的提示组件，目前先用 alert
      alert(res.message || '登录失败')
    }
  } catch (err) {
    alert('登录出错，请检查网络')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8fafc;
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
  background: rgba(59, 130, 246, 0.05);
  filter: blur(80px);
  border-radius: 50%;
}

.blob-1 { top: -100px; right: -100px; background: rgba(59, 130, 246, 0.08); }
.blob-2 { bottom: -150px; left: -150px; background: rgba(99, 102, 241, 0.08); }

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
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
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

h1 {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.subtitle {
  color: #64748b;
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
  color: #475569;
  padding-left: 4px;
}

.input-wrapper {
  position: relative;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  color: #0f172a;
  transition: all 0.2s;
  outline: none;
}

input:focus {
  border-color: #3b82f6;
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
  color: #64748b;
  cursor: pointer;
}

.forgot-password {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.submit-btn {
  margin-top: 8px;
  width: 100%;
  padding: 14px;
  background: #0f172a;
  color: white;
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
  background: #1e293b;
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
  color: #64748b;
}

.login-footer a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

/* Loader Animation */
.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
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
