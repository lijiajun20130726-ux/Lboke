<template>
  <div class="register-container">
    <div class="background-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>
    
    <div class="register-card">
      <div class="register-header">
        <div class="logo-area">
          <div class="logo-icon">B</div>
        </div>
        <h1>创建新账号</h1>
        <p class="subtitle">加入我们的社区，开始您的创作之旅</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label>用户名</label>
          <div class="input-wrapper">
            <input v-model="form.username" type="text" placeholder="起一个酷酷的名字" required :disabled="loading" />
          </div>
        </div>

        <div class="form-group">
          <label>邮箱地址</label>
          <div class="input-wrapper">
            <input v-model="form.email" type="email" placeholder="you@example.com" required :disabled="loading" />
          </div>
        </div>

        <div class="form-group">
          <label>邮箱验证码</label>
          <div class="code-row">
            <div class="input-wrapper">
              <input v-model="form.code" type="text" placeholder="请输入验证码" required :disabled="loading" />
            </div>
            <button type="button" class="send-code-btn" :disabled="loading || sending || countdown > 0" @click="handleSendCode">
              <span v-if="countdown === 0">{{ sending ? '发送中...' : '发送验证码' }}</span>
              <span v-else>{{ countdown }}s 后重试</span>
            </button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>密码</label>
            <div class="input-wrapper">
              <input v-model="form.password" type="password" placeholder="至少6位" required :disabled="loading" />
            </div>
          </div>
          <div class="form-group">
            <label>确认密码</label>
            <div class="input-wrapper">
              <input v-model="form.confirmPassword" type="password" placeholder="再次输入" required :disabled="loading" />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <label class="agree-terms">
            <input v-model="agreeTerms" type="checkbox" :disabled="loading" />
            <span>我已阅读并同意</span>
            <router-link to="/terms-of-service">服务条款</router-link>
            <span>和</span>
            <router-link to="/privacy-policy">隐私政策</router-link>
          </label>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">立即注册</span>
          <div v-else class="loader"></div>
        </button>
      </form>

      <div class="register-footer">
        <p>已有账号？ <router-link to="/login">返回登录</router-link></p>
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
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { register, sendRegisterCode } from '@/api/user'

const router = useRouter()
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)
const agreeTerms = ref(false)
let timer: ReturnType<typeof window.setInterval> | undefined

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
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  code: ''
})

const startCountdown = () => {
  countdown.value = 60
  if (timer) window.clearInterval(timer)
  timer = window.setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0
      if (timer) window.clearInterval(timer)
      timer = undefined
      return
    }
    countdown.value -= 1
  }, 1000)
}

const handleSendCode = async () => {
  const email = form.value.email.trim()
  if (!email) return showToast('请输入邮箱')
  form.value.email = email
  if (sending.value || countdown.value > 0) return
  sending.value = true
  try {
    const res: any = await sendRegisterCode(email)
    if (res.code === 200) {
      showToast('验证码已发送')
      startCountdown()
    } else {
      showToast(res.message || '发送失败')
    }
  } catch (err: any) {
    const errorMsg = err.message || (err.response?.data?.message) || '发送失败'
    showToast(errorMsg)
  } finally {
    sending.value = false
  }
}

const handleRegister = async () => {
  const email = form.value.email.trim()
  if (!email) return showToast('请输入邮箱')
  form.value.email = email
  if (form.value.password !== form.value.confirmPassword) {
    return showToast('两次输入的密码不一致')
  }
  if (!form.value.code) {
    return showToast('请输入邮箱验证码')
  }
  if (!agreeTerms.value) {
    return showToast('请先同意服务条款和隐私政策')
  }

  loading.value = true
  try {
    const res: any = await register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
      code: form.value.code
    })
    if (res.code === 201) {
      showToast('注册成功，请登录')
      router.push('/login')
    } else {
      showToast(res.message || '注册失败')
    }
  } catch (err: any) {
    const errorMsg = err.message || (err.response?.data?.message) || '注册出错'
    showToast(errorMsg)
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<style scoped>
.register-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-body);
  overflow: hidden;
  padding: 40px 20px;
}

.background-blobs {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.blob {
  position: absolute;
  width: 600px;
  height: 600px;
  background: var(--accent-glow-1);
  filter: blur(100px);
  border-radius: 50%;
}

.blob-1 { top: -200px; left: -100px; background: var(--accent-glow-1); }
.blob-2 { bottom: -200px; right: -100px; background: var(--accent-glow-2); }

.register-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 500px;
  background: var(--bg-glass-strong);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
}

.register-header {
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.form-row {
  display: flex;
  gap: 16px;
}

.code-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  padding-left: 4px;
}

input:not([type="checkbox"]) {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-primary);
  transition: all 0.2s;
  outline: none;
}

input:not([type="checkbox"]):focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--accent-color);
}

.send-code-btn {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.send-code-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.send-code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.agree-terms {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.agree-terms a {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 600;
}
.submit-btn {
  margin-top: 12px;
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

.register-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.register-footer a {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 600;
}

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

@media (max-width: 640px) {
  .form-row { flex-direction: column; }
  .register-card { padding: 32px 24px; }
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
</style>
