<template>
  <div class="login-page">
    <div class="bg-blobs">
      <span class="blob b1"></span>
      <span class="blob b2"></span>
      <span class="grid"></span>
    </div>
    <div class="login-card">
      <div class="brand">
        <svg class="brand-icon" viewBox="0 0 24 24" width="28" height="28">
          <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" fill="currentColor"/>
        </svg>
        <div class="brand-meta">
          <h1 class="brand-title">博客管理后台</h1>
          <p class="brand-subtitle">Admin Console</p>
        </div>
      </div>
      
      <!-- 登录表单 -->
      <form v-if="!showSecret" @submit.prevent="handleLogin">
        <div class="form-item input-wrap">
          <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-7 9a7 7 0 0 1 14 0" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          <input v-model="form.username" type="text" placeholder="用户名" required />
        </div>
        <div class="form-item input-wrap">
          <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18"><rect x="3" y="7" width="18" height="14" rx="2" ry="2" stroke="currentColor" fill="none" stroke-width="2"/><path d="M7 7V5a5 5 0 0 1 10 0v2" stroke="currentColor" fill="none" stroke-width="2"/></svg>
          <input v-model="form.password" type="password" placeholder="密码" required />
        </div>
        <div class="form-item" v-if="error">
          <span class="error">{{ error }}</span>
        </div>
        <button type="submit" class="primary-btn" :disabled="loading">
          <span v-if="!loading">登录</span>
          <span v-else class="btn-spinner"></span>
        </button>
      </form>

      <!-- 暗号验证 -->
      <form v-else @submit.prevent="verifySecret">
        <div class="secret-question">
          <p class="question-label">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 17v-2a4 4 0 1 1 4-4" stroke="currentColor" fill="none" stroke-width="2"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
            安全验证
          </p>
          <p class="question-text">李嘉骏网站怎么样？</p>
        </div>
        <div class="form-item input-wrap">
          <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18"><path d="M20 7h-8l-2-2H4v14h16V7z" stroke="currentColor" fill="none" stroke-width="2"/></svg>
          <input v-model="secretAnswer" type="text" placeholder="请输入答案" required autocomplete="off" />
        </div>
        <div class="form-item" v-if="error">
          <span class="error">{{ error }}</span>
        </div>
        <button type="submit" class="primary-btn">确认</button>
      </form>
    </div>
    <Transition name="fade-up">
      <div v-if="toast.show" class="toast-notification">
        <div class="toast-content">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')
const showSecret = ref(false)
const secretAnswer = ref('')
const SECRET_CODE = '新途嘉骏特别好'
const toast = ref({ show: false, message: '' })
const showToast = (m: string) => { toast.value = { show: true, message: m }; setTimeout(() => toast.value.show = false, 3000) }

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await userStore.login(form.value.username, form.value.password)
    loading.value = false
    if (res.code === 200) {
      // 密码和验证码正确，显示暗号验证
      showSecret.value = true
      error.value = ''
      showToast('验证问题以确保安全')
    } else {
      error.value = res.message || '登录失败'
      showToast(error.value)
    }
  } catch (err: any) {
    loading.value = false
    error.value = err.message || '登录失败，请检查网络连接'
    showToast(error.value)
  }
}

const verifySecret = () => {
  if (secretAnswer.value.trim() === SECRET_CODE) {
    router.push('/admin')
  } else {
    error.value = '答案不对，再想想～'
    showToast(error.value)
  }
}
</script>

<style scoped>
.login-page { 
  min-height: 100vh; display: grid; place-items: center; 
  background: radial-gradient(1200px 600px at 70% 0%, rgba(59,130,246,.15), transparent),
              radial-gradient(900px 500px at 10% 100%, rgba(99,102,241,.18), transparent),
              #0f172a;
  position: relative;
  overflow: hidden;
}
.bg-blobs .blob { position: absolute; filter: blur(60px); opacity: .6; border-radius: 50%; }
.bg-blobs .b1 { width: 420px; height: 420px; background: #60a5fa; top: -120px; right: -120px; }
.bg-blobs .b2 { width: 360px; height: 360px; background: #a78bfa; bottom: -120px; left: -120px; }
.bg-blobs .grid { 
  position: absolute; inset: 0; 
  background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), 
                    linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
  background-size: 24px 24px; pointer-events: none;
}
.login-card { 
  width: 380px; padding: 36px 32px; border-radius: 24px; 
  background: rgba(255,255,255,0.08); 
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,0.16);
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
}
.brand { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; color: #e5e7eb; }
.brand-icon { color: #60a5fa; }
.brand-title { margin: 0; font-size: 20px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em; }
.brand-subtitle { margin: 0; color: #94a3b8; font-size: 12px; }
.form-item { margin-bottom: 16px; }
.input-wrap { position: relative; }
.input-icon { position: absolute; top: 50%; left: 12px; transform: translateY(-50%); color: #94a3b8; }
/* 深色输入框（含自动填充处理） */
input { 
  width: 100%; height: 44px; padding: 0 14px 0 38px; 
  border: 2px solid rgba(148,163,184,0.35); 
  border-radius: 12px; font-size: 14px; 
  color: #e5e7eb; 
  background: #0b1220; 
  caret-color: #e5e7eb;
}
input::placeholder { color: #94a3b8; }
input:focus { outline: none; border-color: #60a5fa; box-shadow: 0 0 0 4px rgba(96,165,250,0.2); }
/* Chrome/Edge/Safari 自动填充背景与文字颜色修正 */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: #e5e7eb;
  -webkit-box-shadow: 0 0 0 1000px #0b1220 inset !important;
  box-shadow: 0 0 0 1000px #0b1220 inset !important;
  caret-color: #e5e7eb;
  border: 2px solid rgba(148,163,184,0.35);
}
.primary-btn { width: 100%; height: 44px; border: none; border-radius: 12px; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: #fff; font-weight: 700; cursor: pointer; transition: transform .15s ease, box-shadow .2s ease; }
.primary-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(59,130,246,.35); }
.primary-btn:disabled { opacity: .6; cursor: not-allowed; }
.btn-spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,.6); border-top-color: transparent; display: inline-block; animation: spin .8s linear infinite; }
.error { color: #fca5a5; font-size: 13px; }
.secret-question { text-align: center; margin-bottom: 20px; padding: 16px; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; color: #e5e7eb; }
.question-label { font-size: 12px; color: #94a3b8; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px; }
.question-text { font-size: 16px; font-weight: 700; color: #e5e7eb; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Toast */
.toast-notification { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); z-index: 10000; pointer-events: none; }
.toast-content { background: rgba(0,0,0,.6); backdrop-filter: blur(10px); color: #fff; padding: 10px 18px; border-radius: 999px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
.fade-up-enter-active, .fade-up-leave-active { transition: all .3s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translate(-50%, -16px); }
</style>
