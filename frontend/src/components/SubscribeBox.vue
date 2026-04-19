<template>
  <div class="subscribe-box">
    <div class="subscribe-content">
      <div class="subscribe-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <div class="subscribe-text">
        <h4>订阅更新</h4>
        <p>第一时间获取最新文章通知</p>
      </div>
    </div>
    <form @submit.prevent="handleSubscribe" class="subscribe-form">
      <div class="input-wrapper" :class="{ focused: isFocused, success: isSuccess, error: isError }">
        <input 
          v-model="email" 
          type="email" 
          placeholder="your@email.com"
          @focus="isFocused = true"
          @blur="isFocused = false"
          :disabled="loading"
        />
        <button type="submit" :disabled="loading || !email.trim()">
          <span v-if="loading" class="loading-spinner"></span>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
      <transition name="fade">
        <p v-if="message" :class="['message', isError ? 'error' : 'success']">{{ message }}</p>
      </transition>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { subscribe } from '@/api/subscription'

const email = ref('')
const loading = ref(false)
const message = ref('')
const isFocused = ref(false)
const isSuccess = ref(false)
const isError = ref(false)

const handleSubscribe = async () => {
  if (!email.value || loading.value) return
  const e = email.value.trim().toLowerCase()
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  if (!valid) {
    message.value = '邮箱格式不正确'
    isError.value = true
    setTimeout(() => {
      message.value = ''
      isError.value = false
    }, 3000)
    return
  }
  
  loading.value = true
  message.value = ''
  isSuccess.value = false
  isError.value = false
  
  try {
    const res: any = await subscribe(e)
    if (res.code === 200) {
      message.value = res.message || '订阅成功！'
      isSuccess.value = true
      email.value = ''
    } else {
      message.value = res.message || '订阅失败'
      isError.value = true
    }
  } catch (error: any) {
    message.value = error.response?.data?.message || '订阅失败，请稍后重试'
    isError.value = true
  } finally {
    loading.value = false
    setTimeout(() => {
      message.value = ''
      isSuccess.value = false
      isError.value = false
    }, 4000)
  }
}
</script>

<style scoped>
.subscribe-box {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.subscribe-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.subscribe-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--bg-surface-muted);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  flex-shrink: 0;
}

.subscribe-text h4 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: -0.02em;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
}

.subscribe-text p {
  font-size: 14px;
  color: var(--text-secondary);
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.subscribe-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-wrapper {
  display: flex;
  background: var(--bg-input);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

.input-wrapper.focused {
  border-color: var(--accent-color);
  background: var(--bg-card);
}

.input-wrapper.success {
  border-color: #34c759;
}

.input-wrapper.error {
  border-color: #ff3b30;
}

.input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 14px 16px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.input-wrapper input::placeholder {
  color: var(--text-secondary);
}

.input-wrapper input:disabled {
  color: var(--text-secondary);
  -webkit-text-fill-color: var(--text-secondary);
  opacity: 1;
}

.input-wrapper input:disabled::placeholder {
  color: var(--text-secondary);
}

.input-wrapper button {
  background: transparent;
  border: none;
  padding: 0 20px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid var(--border-color);
}

.input-wrapper button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.input-wrapper button:active:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
}

.input-wrapper button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--text-secondary);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.message {
  font-size: 13px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
}

.message.success {
  color: #34c759;
  background: transparent;
  border: 1px solid #34c759;
}

.message.error {
  color: #ff3b30;
  background: transparent;
  border: 1px solid #ff3b30;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
