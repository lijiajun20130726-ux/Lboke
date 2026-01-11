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

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">立即注册</span>
          <div v-else class="loader"></div>
        </button>
      </form>

      <div class="register-footer">
        <p>已有账号？ <router-link to="/login">返回登录</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/user'

const router = useRouter()
const loading = ref(false)

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    return alert('两次输入的密码不一致')
  }

  loading.value = true
  try {
    const res: any = await register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password
    })
    if (res.code === 201) {
      alert('注册成功，请登录')
      router.push('/login')
    } else {
      alert(res.message || '注册失败')
    }
  } catch (err: any) {
    const errorMsg = err.message || (err.response?.data?.message) || '注册出错'
    alert(errorMsg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8fafc;
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
  background: rgba(59, 130, 246, 0.05);
  filter: blur(100px);
  border-radius: 50%;
}

.blob-1 { top: -200px; left: -100px; background: rgba(59, 130, 246, 0.08); }
.blob-2 { bottom: -200px; right: -100px; background: rgba(99, 102, 241, 0.08); }

.register-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
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

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  padding-left: 4px;
}

input {
  width: 100%;
  padding: 12px 16px;
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

.submit-btn {
  margin-top: 12px;
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

.register-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 14px;
  color: #64748b;
}

.register-footer a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

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

@media (max-width: 640px) {
  .form-row { flex-direction: column; }
  .register-card { padding: 32px 24px; }
}
</style>
