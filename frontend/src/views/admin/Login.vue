<template>
  <div class="login-page">
    <div class="login-box">
      <h2>博客管理后台</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <input v-model="form.username" type="text" placeholder="用户名" required />
        </div>
        <div class="form-item">
          <input v-model="form.password" type="password" placeholder="密码" required />
        </div>
        <div class="form-item" v-if="error">
          <span class="error">{{ error }}</span>
        </div>
        <button type="submit" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
      </form>
    </div>
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

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await userStore.login(form.value.username, form.value.password)
    loading.value = false
    console.log('Login response:', res)
    if (res.code === 200) {
      router.push('/admin')
    } else {
      error.value = res.message || '登录失败'
    }
  } catch (err: any) {
    loading.value = false
    console.error('Login error:', err)
    error.value = err.message || '登录失败，请检查网络连接'
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.login-box { background: #fff; padding: 40px; border-radius: 8px; width: 360px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
h2 { text-align: center; margin-bottom: 30px; color: #333; }
.form-item { margin-bottom: 20px; }
input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
input:focus { border-color: #667eea; outline: none; }
button { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
button:disabled { opacity: 0.7; }
.error { color: #ff4d4f; font-size: 14px; }
</style>
