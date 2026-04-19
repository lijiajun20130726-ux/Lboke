<template>
  <div class="message-board-page">
    <!-- Hero Header -->
    <div class="page-hero">
      <div class="hero-glow"></div>
      <div 
        v-if="messages.length > 0 && danmakuEnabled" 
        class="danmaku-wall hero-danmaku"
        :class="{ paused: danmakuPaused }"
        @mouseenter="pauseDanmaku"
        @mouseleave="resumeDanmaku"
      >
        <div
          v-for="item in danmakuItems"
          :key="item.id"
          class="danmaku-item"
          :style="{
            top: item.top + '%',
            color: item.color,
            animationDuration: item.duration + 's'
          }"
        >
          {{ item.text }}
        </div>
      </div>
      <div class="container hero-content">
        <div class="hero-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
          </svg>
          留言板
        </div>
        <h1 class="hero-title">留下您的足迹</h1>
        <p class="hero-subtitle">分享您的想法、建议或问候，让我们一起交流</p>
      </div>
    </div>

    <div class="container message-container">
      <!-- Message Form -->
      <div class="message-form-card">
        <div class="form-header">
          <h3 class="form-title">发表留言</h3>
          <p class="form-desc">说点什么吧...</p>
        </div>
        <div class="form-body">
          <div class="form-row">
            <div class="input-group color-group">
              <label class="input-label">主题色</label>
              <div class="color-palette">
                <button 
                  v-for="c in colorOptions" 
                  :key="c" 
                  class="color-dot" 
                  :style="{ background: c }" 
                  :class="{ active: selectedColor === c }"
                  @click="selectedColor = c"
                  type="button"
                  :aria-label="'选择颜色 ' + c"
                />
                <button 
                  class="color-dot none" 
                  :class="{ active: !selectedColor }" 
                  @click="selectedColor = ''"
                  type="button"
                  aria-label="不使用颜色"
                />
              </div>
            </div>
          </div>
          <textarea 
            v-model="newMessage" 
            placeholder="写下你想说的话..."
            rows="4"
            class="message-textarea"
          ></textarea>
          <div class="form-footer">
            <div class="left-tools">
              <label class="switch">
                <input type="checkbox" v-model="danmakuEnabled">
                <span class="slider"></span>
                <span class="switch-label">显示弹幕</span>
              </label>
            </div>
            <span class="char-count" :class="{ danger: newMessage.length > 500 }">{{ newMessage.length }} / 500</span>
            <button 
              @click="submitMessage" 
              :disabled="!newMessage.trim() || newMessage.length > 500 || loading || cooldown > 0"
              class="submit-btn"
            >
              <svg v-if="!loading && cooldown === 0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              <span v-if="loading" class="loading-spinner"></span>
              <span v-else-if="cooldown > 0">稍后可发 {{ cooldown }}s</span>
              <span v-else>发送留言</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
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
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getMessageBoardPublic, sendMessageBoard } from '@/api/front'
import { useUserStore } from '@/stores/user'

interface Message {
  id: number
  nickname: string
  content: string
  color?: string
  created_at: string
}

interface DanmakuItem {
  id: number
  text: string
  color: string
  top: number
  duration: number
}

const newMessage = ref('')
const messages = ref<Message[]>([])
const loading = ref(false)
const listLoading = ref(true)
const userStore = useUserStore()
const danmakuItems = ref<DanmakuItem[]>([])
let danmakuTimer: ReturnType<typeof setInterval> | null = null
let danmakuIndex = 0
let danmakuSeed = 0
const danmakuEnabled = ref(true)
const danmakuPaused = ref(false)
const lanes = ref<number>(6)
const laneStep = ref<number>(0) // current lane idx
const selectedColor = ref<string>('') // message/accent color
const colorOptions = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
const cooldown = ref(0)
let cooldownTimer: ReturnType<typeof window.setInterval> | undefined
const toast = ref<{show: boolean; message: string}>({ show: false, message: '' })
const showToast = (message: string) => {
  toast.value = { show: true, message }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const startCooldown = (seconds = 60) => {
  cooldown.value = seconds
  if (cooldownTimer) window.clearInterval(cooldownTimer)
  cooldownTimer = window.setInterval(() => {
    if (cooldown.value <= 1) {
      cooldown.value = 0
      if (cooldownTimer) {
        window.clearInterval(cooldownTimer)
        cooldownTimer = undefined
      }
    } else {
      cooldown.value -= 1
    }
  }, 1000)
}

const addDanmakuItem = (message: Message) => {
  const len = Math.min(120, (message.content || '').length || 20)
  const duration = Math.min(24, Math.max(10, 10 + len * 0.18))
  const laneIdx = laneStep.value % Math.max(1, lanes.value)
  laneStep.value += 1
  const top = 6 + laneIdx * ((88 - 6) / Math.max(1, lanes.value - 1 || 1)) // 6%~88% evenly
  const item: DanmakuItem = {
    id: danmakuSeed++,
    text: message.content,
    color: message.color || 'var(--text-invert)',
    top,
    duration
  }
  danmakuItems.value = [...danmakuItems.value, item]
  window.setTimeout(() => {
    danmakuItems.value = danmakuItems.value.filter((current) => current.id !== item.id)
  }, (duration + 1) * 1000)
}

const startDanmaku = () => {
  if (!danmakuEnabled.value) return
  if (danmakuTimer || messages.value.length === 0) return
  danmakuTimer = setInterval(() => {
    if (messages.value.length === 0) return
    const message = messages.value[danmakuIndex % messages.value.length]
    danmakuIndex += 1
    addDanmakuItem(message)
  }, 1200)
}

const stopDanmaku = () => {
  if (danmakuTimer) {
    clearInterval(danmakuTimer)
    danmakuTimer = null
  }
}

const pauseDanmaku = () => {
  danmakuPaused.value = true
  stopDanmaku()
}
const resumeDanmaku = () => {
  danmakuPaused.value = false
  startDanmaku()
}

const submitMessage = async () => {
  if (cooldown.value > 0) {
    showToast(`请稍后 ${cooldown.value}s 再发送`)
    return
  }
  const content = newMessage.value.trim()
  if (!content || content.length > 500) return
  
  loading.value = true
  try {
    const nickname = userStore.user?.nickname || userStore.user?.username || '游客'
    const res: any = await sendMessageBoard({ nickname, content, color: selectedColor.value || undefined })
    if (res.code === 200 && res.data) {
      messages.value = [res.data, ...messages.value]
      addDanmakuItem(res.data)
      showToast('留言已发送')
      sessionStorage.setItem('msg_last_sent_at', String(Date.now()))
      startCooldown(60)
    }
    newMessage.value = ''
  } catch (error) {
    console.error('提交留言失败:', error)
    showToast('提交留言失败')
  } finally {
    loading.value = false
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(async () => {
  document.title = '留言板 | 李嘉骏的博客'
  try {
    const res: any = await getMessageBoardPublic()
    if (res.code === 200) {
      messages.value = res.data || []
    }
  } finally {
    listLoading.value = false
    startDanmaku()
  }
  const last = Number(sessionStorage.getItem('msg_last_sent_at') || '0')
  if (last) {
    const passed = Math.floor((Date.now() - last) / 1000)
    const remain = 60 - passed
    if (remain > 0) startCooldown(remain)
  }
})

onUnmounted(() => {
  stopDanmaku()
  if (cooldownTimer) {
    window.clearInterval(cooldownTimer)
    cooldownTimer = undefined
  }
})

watch(danmakuEnabled, (v) => {
  if (v) {
    startDanmaku()
  } else {
    stopDanmaku()
    danmakuItems.value = []
  }
})
</script>

<style scoped>
.message-board-page {
  min-height: 100vh;
  background: var(--bg-body);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero Header */
.page-hero {
  padding: 100px 0 80px;
  background: var(--bg-hero);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(147, 197, 253, 0.06) 50%, transparent 70%);
  z-index: 0;
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.8; transform: translateX(-50%) scale(1.1); }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.08) 100%);
  color: var(--accent-color);
  border-radius: 100px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 24px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 16px;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 17px;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Message Container */
.message-container {
  padding: 40px 24px 100px;
}

.danmaku-wall {
  position: relative;
  height: 140px;
  margin-bottom: 32px;
  background: var(--bg-glass);
  border-radius: 24px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.hero-danmaku {
  position: absolute;
  inset: 0;
  height: auto;
  margin: 0;
  max-width: none;
  background: transparent;
  border: none;
  box-shadow: none;
  z-index: 0;
}
.hero-danmaku.paused .danmaku-item { animation-play-state: paused; }

.danmaku-item {
  position: absolute;
  left: 100%;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);
  animation-name: danmaku-move;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes danmaku-move {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - 120vw));
  }
}

/* Message Form Card */
.message-form-card {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 48px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-form-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.form-header {
  margin-bottom: 24px;
}

.form-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}

.form-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-textarea {
  width: 100%;
  border: 2px solid var(--border-color);
  border-radius: 16px;
  padding: 16px 20px;
  font-size: 15px;
  font-family: inherit;
  color: var(--text-primary);
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s;
  background: var(--bg-card);
}

.message-textarea::placeholder {
  color: var(--text-secondary);
}

.message-textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 220px;
  flex: 1;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.text-input {
  height: 40px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 0 12px;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: all .2s;
}
.text-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.color-group { min-width: 260px; }
.color-palette {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.color-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s, border-color .2s;
}
.color-dot:hover { transform: translateY(-1px) scale(1.03); }
.color-dot.active { border-color: var(--text-primary); box-shadow: 0 0 0 3px rgba(0,0,0,.06); }
.color-dot.none { background: repeating-conic-gradient(#ccc 0 10deg, transparent 10deg 20deg) #fff; }

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}
.char-count.danger { color: #ef4444; font-weight: 700; }

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: var(--accent-gradient);
  color: var(--text-invert);
  border: none;
  border-radius: 100px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-gradient-strong);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--text-invert);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Messages Section */
.messages-section {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.section-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-color);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

/* Messages List */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-item:hover {
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transform: translateX(4px);
}

.message-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-gradient-soft);
  color: var(--text-invert);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 12px;
}

.message-username {
  font-weight: 700;
  font-size: 15px;
  color: var(--text-primary);
}

.message-time {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.message-text {
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 15px;
  margin: 0;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.switch input { display: none; }
.slider {
  width: 44px;
  height: 24px;
  background: var(--border-color);
  border-radius: 999px;
  position: relative;
  transition: background .2s;
}
.slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--bg-card);
  border-radius: 50%;
  transition: transform .2s;
  box-shadow: 0 2px 6px rgba(0,0,0,.15);
}
.switch input:checked + .slider { background: var(--accent-color); }
.switch input:checked + .slider::after { transform: translateX(20px); }
.switch-label { font-size: 13px; color: var(--text-secondary); }

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-hero {
    padding: 80px 0 60px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 15px;
  }

  .message-container {
    padding: 32px 16px 80px;
  }

  .message-form-card,
  .messages-section {
    padding: 24px;
  }

  .form-title {
    font-size: 18px;
  }

  .message-item {
    padding: 16px;
  }

  .message-avatar {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .submit-btn {
    width: 100%;
    justify-content: center;
  }

  .form-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .char-count {
    text-align: center;
  }
}

/* Toast (对齐邮箱验证码提示样式) */
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
