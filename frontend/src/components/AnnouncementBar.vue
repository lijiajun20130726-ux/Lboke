<template>
  <transition name="slide-down">
    <div v-if="announcements.length > 0" class="announcement-wrapper">
      <div 
        class="announcement-bar" 
        :class="[`is-${currentAnnouncement.type}`, { 'is-clickable': hasDialog }]"
        @mouseenter="stopAutoPlay"
        @mouseleave="startAutoPlay"
        @click="openDialogIfAvailable"
      >
        <div class="container bar-content">
          <div class="announcement-main">
            <div class="announcement-icon">
              <svg v-if="currentAnnouncement.type === 'info'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <svg v-else-if="currentAnnouncement.type === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <svg v-else-if="currentAnnouncement.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            
            <div class="announcement-text">
              <span class="announcement-title">{{ currentAnnouncement.title }}</span>
              <span class="announcement-desc" v-if="currentAnnouncement.content">{{ currentAnnouncement.content }}</span>
            </div>

            <a v-if="currentAnnouncement.link" :href="currentAnnouncement.link" class="announcement-link" target="_blank" @click.stop>
              {{ currentAnnouncement.link_text || '了解更多' }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>

          <div class="announcement-controls" v-if="announcements.length > 1" @click.stop>
            <button @click="prev" class="control-btn" aria-label="Previous" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="control-index">{{ currentIndex + 1 }}/{{ announcements.length }}</span>
            <button @click="next" class="control-btn" aria-label="Next" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
  <transition name="fade-zoom">
  <div v-if="showDialog" class="dialog-overlay" @click.self="closeDialog">
    <div 
      class="dialog-card" 
      :class="[`is-${currentAnnouncement.type}`]"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'announcement-dialog-title'"
    >
      <div class="dialog-header">
        <div class="dialog-title-wrap">
          <div class="dialog-icon">
            <svg v-if="currentAnnouncement.type === 'info'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <svg v-else-if="currentAnnouncement.type === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <svg v-else-if="currentAnnouncement.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <h3 id="announcement-dialog-title" class="dialog-title">{{ currentAnnouncement.title }}</h3>
        </div>
        <button class="close-btn" @click="closeDialog" aria-label="关闭">×</button>
      </div>
      <div class="dialog-body">
        <div class="dialog-content" v-if="currentAnnouncement.content">{{ currentAnnouncement.content }}</div>
        <a 
          v-if="currentAnnouncement.link" 
          :href="currentAnnouncement.link" 
          target="_blank" 
          class="dialog-link"
        >{{ currentAnnouncement.link_text || '访问链接' }}</a>
      </div>
    </div>
  </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import api from '@/api/index'

interface Announcement {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  link: string
  link_text: string
}

const announcements = ref<Announcement[]>([])
const currentIndex = ref(0)
const timer = ref<any>(null)

const currentAnnouncement = computed(() => announcements.value[currentIndex.value] || {})

const fetchAnnouncements = async () => {
  try {
    const res: any = await api.get('/front/announcements')
    if (res.code === 200) {
      announcements.value = res.data
      if (announcements.value.length > 1) {
        startAutoPlay()
      }
    }
  } catch (error) {
    console.error('Failed to fetch announcements:', error)
  }
}

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % announcements.value.length
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + announcements.value.length) % announcements.value.length
}

const startAutoPlay = () => {
  if (timer.value) return
  timer.value = setInterval(next, 6000)
}

const stopAutoPlay = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

onMounted(fetchAnnouncements)
onUnmounted(stopAutoPlay)

const showDialog = ref(false)
const hasDialog = computed(() => {
  const current = currentAnnouncement.value as Partial<Announcement>
  return Boolean(current.content || current.link)
})
const openDialogIfAvailable = () => {
  if (!hasDialog.value) return
  showDialog.value = true
  stopAutoPlay()
  if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
}
const closeDialog = () => {
  showDialog.value = false
  if (announcements.value.length > 1) startAutoPlay()
  if (typeof document !== 'undefined') document.body.style.overflow = ''
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeDialog()
}
watch(showDialog, (val) => {
  if (typeof document === 'undefined') return
  if (val) {
    document.addEventListener('keydown', handleKeyDown)
  } else {
    document.removeEventListener('keydown', handleKeyDown)
  }
})
</script>

<style scoped>
.announcement-wrapper {
  position: relative;
  z-index: 900;
  width: 100%;
  padding: 0;
}

.announcement-bar {
  min-height: 48px;
  display: flex;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--text-primary);
  width: 100%;
  margin: 0;
  padding: 8px 16px 8px 18px;
  border-radius: 0;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  backdrop-filter: none;
  background: var(--bg-card);
  position: relative;
  --announcement-accent: #3b82f6;
}
.announcement-bar.is-clickable { cursor: pointer; }
.announcement-bar.is-clickable:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-color-hover);
}
.announcement-bar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--announcement-accent);
}

/* Types */
.announcement-bar.is-info { --announcement-accent: #2b7bff; }
.announcement-bar.is-warning { --announcement-accent: #ff9f43; }
.announcement-bar.is-success { --announcement-accent: #34c759; }
.announcement-bar.is-error { --announcement-accent: #ff3b30; }

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  width: 100%;
}

.bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.announcement-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.announcement-icon {
  display: flex;
  align-items: center;
  opacity: 0.9;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  justify-content: center;
  border-radius: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  color: var(--announcement-accent);
}

.announcement-text {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.announcement-title {
  font-weight: 700;
  font-size: 13px;
  white-space: nowrap;
}

.announcement-desc {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 54vw;
}

.announcement-link {
  color: var(--announcement-accent);
  text-decoration: none;
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 8px;
  border: none;
  box-shadow: none;
}

.announcement-link:hover {
  text-decoration: underline;
  transform: none;
}

.announcement-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  padding: 0;
  border-radius: 0;
  flex-shrink: 0;
  border: none;
  box-shadow: none;
  color: var(--text-secondary);
}

.control-btn {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.75;
  transition: opacity 0.2s;
}

.control-btn:hover { opacity: 1; }

.control-index {
  font-size: 11px;
  font-weight: 700;
  font-family: 'SF Pro Text', 'SF Mono', system-ui, sans-serif;
  min-width: 24px;
  text-align: center;
  letter-spacing: 0.2px;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.dialog-card {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 16px;
  padding: 20px 20px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.dialog-card.is-info { border-top: 4px solid #2b7bff; }
.dialog-card.is-warning { border-top: 4px solid #ff9f43; }
.dialog-card.is-success { border-top: 4px solid #34c759; }
.dialog-card.is-error { border-top: 4px solid #ff3b30; }
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.dialog-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dialog-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d1d1f;
  opacity: 0.8;
}
.dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #86868b;
  line-height: 1;
}
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 60vh;
  overflow-y: auto;
}
.dialog-content {
  font-size: 14px;
  color: #1d1d1f;
  line-height: 1.7;
}
.dialog-link {
  align-self: flex-start;
  color: #0071e3;
  text-decoration: none;
  font-weight: 700;
  font-size: 13px;
}
.dialog-link:hover { text-decoration: underline; }

/* Animations */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-enter-from, .slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
.fade-zoom-enter-active, .fade-zoom-leave-active {
  transition: opacity 0.2s ease;
}
.fade-zoom-enter-from, .fade-zoom-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .announcement-desc { display: none; }
  .bar-content { gap: 6px; }
  .announcement-bar { border-radius: 0; }
  .announcement-title { font-size: 12.5px; }
}
</style>
