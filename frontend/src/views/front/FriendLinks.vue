x<template>
  <div class="friendlinks-page">
    <div class="container">
      <!-- Hero Section -->
      <header class="page-hero">
        <div class="hero-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          <span>友情链接</span>
        </div>
        <h1 class="hero-title">友情链接</h1>
        <p class="hero-desc">与优秀的人同行，遇见更好的世界</p>
      </header>

      <!-- Links Grid -->
      <div class="links-grid">
        <a 
          v-for="link in friendLinks" 
          :key="link.id" 
          :href="link.url" 
          target="_blank" 
          rel="noopener noreferrer"
          class="link-card"
        >
          <div class="card-avatar">
            <img v-if="link.logo" :src="link.logo" :alt="link.name" @error="handleImageError" />
            <div v-else class="avatar-placeholder">
              {{ link.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="card-content">
            <h3 class="link-name">{{ link.name }}</h3>
            <p class="link-desc">{{ link.description || '暂无描述' }}</p>
          </div>
          <div class="card-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </div>
        </a>
      </div>

      <!-- Empty State -->
      <div v-if="friendLinks.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </div>
        <h3>暂无友链</h3>
        <p>敬请期待更多优质站点的加入</p>
      </div>

      <!-- Apply Section -->
      <section class="apply-section">
        <div class="apply-card">
          <div class="apply-intro">
            <div class="apply-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <div class="apply-content">
              <h3>申请友链</h3>
              <p>填写网站信息提交申请。</p>
            </div>
          </div>
          <form class="apply-form" @submit.prevent="handleApply">
            <div class="form-row">
              <input v-model.trim="applyForm.name" placeholder="网站名称" required />
              <input v-model.trim="applyForm.url" type="url" placeholder="网站地址 https://example.com" required />
            </div>
            <input v-model.trim="applyForm.logo" type="url" placeholder="Logo 地址（可选）" />
            <textarea v-model.trim="applyForm.description" rows="3" placeholder="网站简介（可选）"></textarea>
            <div class="form-actions">
              <span v-if="applyMessage" :class="['apply-message', applySuccess ? 'success' : 'error']">
                {{ applyMessage }}
              </span>
              <button type="submit" class="apply-btn" :disabled="applyLoading">
                {{ applyLoading ? '提交中...' : '提交申请' }}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFriendLinksPublic, applyFriendLink } from '@/api/front'

interface FriendLink {
  id: number
  name: string
  url: string
  logo?: string
  description?: string
}

const friendLinks = ref<FriendLink[]>([])
const loading = ref(true)
const applyLoading = ref(false)
const applyMessage = ref('')
const applySuccess = ref(false)

const applyForm = ref({
  name: '',
  url: '',
  logo: '',
  description: ''
})

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

onMounted(async () => {
  try {
    const res: any = await getFriendLinksPublic()
    if (res.code === 200) {
      friendLinks.value = res.data
    }
  } finally {
    loading.value = false
  }
})

const handleApply = async () => {
  applyMessage.value = ''
  applySuccess.value = false
  if (!applyForm.value.name || !applyForm.value.url) {
    applyMessage.value = '请填写网站名称和网站地址'
    return
  }
  applyLoading.value = true
  try {
    const payload = {
      name: applyForm.value.name.trim(),
      url: applyForm.value.url.trim(),
      logo: applyForm.value.logo.trim() || undefined,
      description: applyForm.value.description.trim() || undefined
    }
    const res: any = await applyFriendLink(payload)
    if (res.code === 200) {
      applySuccess.value = true
      applyMessage.value = res.message || '申请已提交，等待审核'
      applyForm.value = { name: '', url: '', logo: '', description: '' }
    } else {
      applyMessage.value = res.message || '提交失败，请稍后再试'
    }
  } catch (error: any) {
    applyMessage.value = error?.response?.data?.message || '提交失败，请稍后再试'
  } finally {
    applyLoading.value = false
  }
}
</script>

<style scoped>
.friendlinks-page {
  min-height: 100vh;
  padding: 60px 0 100px;
  background: var(--bg-body);
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero */
.page-hero {
  text-align: center;
  margin-bottom: 64px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--accent-color);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  margin-bottom: 16px;
}

.hero-desc {
  font-size: 18px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Grid */
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 80px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-card);
  border-radius: 20px;
  border: 1px solid var(--border-color);
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.link-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 113, 227, 0.03) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.link-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
}

.link-card:hover::before {
  opacity: 1;
}

.card-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-surface-muted);
}

.card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-gradient-indigo);
  color: var(--text-invert);
  font-size: 24px;
  font-weight: 700;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.link-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.link-desc {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-arrow {
  color: var(--text-secondary);
  transition: all 0.3s;
}

.link-card:hover .card-arrow {
  color: var(--accent-color);
  transform: translate(4px, -4px);
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 14px;
}

/* Apply */
.apply-section {
  margin-top: 40px;
}

.apply-card {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  padding: 32px 40px;
  background: var(--bg-card);
  border-radius: 24px;
  border: 1px solid var(--border-color);
}

.apply-intro {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.apply-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.apply-content {
  flex: 1;
}

.apply-content h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.apply-content p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.apply-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.apply-form input,
.apply-form textarea {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.apply-form input:focus,
.apply-form textarea:focus {
  border-color: var(--accent-color);
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.apply-message {
  font-size: 13px;
  color: var(--text-secondary);
}

.apply-message.success {
  color: #34c759;
}

.apply-message.error {
  color: #ff3b30;
}

.apply-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-color);
  color: var(--text-invert);
  padding: 12px 24px;
  border-radius: 100px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
  border: none;
  cursor: pointer;
}

.apply-btn:hover {
  background: var(--accent-color-hover);
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.apply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title { font-size: 36px; }
  .links-grid { grid-template-columns: 1fr; }
  .apply-card {
    grid-template-columns: 1fr;
    text-align: left;
    padding: 32px 24px;
  }
  .form-row { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; align-items: flex-start; }
  .apply-btn { width: 100%; justify-content: center; }
}
</style>
