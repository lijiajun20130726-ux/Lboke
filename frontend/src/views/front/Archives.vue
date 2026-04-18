<template>
  <div class="archives-page">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">时间归档</h1>
        <p class="page-subtitle">回望每一个值得记录的瞬间。</p>
      </header>

      <div class="archives-timeline">
        <div v-for="(archive, index) in archives" :key="archive.month" class="archive-group">
          <div class="month-marker">
            <div class="marker-dot"></div>
            <div class="month-label" @click="toggleArchive(index, archive.month)">
              <span class="month-text">{{ formatMonth(archive.month) }}</span>
              <span class="article-count">{{ archive.count }} 篇文章</span>
              <svg 
                class="expand-icon" 
                :class="{ rotated: archive.expanded }"
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <transition name="fade-slide">
            <div v-if="archive.expanded" class="article-list-container">
              <div v-if="archive.loading" class="loading-box">
                <div class="mini-spinner"></div>
              </div>
              <div v-else class="article-links">
                <router-link 
                  v-for="article in archive.articles" 
                  :key="article.id" 
                  :to="`/article/${article.id}`"
                  class="article-item"
                >
                  <span class="day">{{ formatDay(article.published_at) }}</span>
                  <span class="title">{{ article.title }}</span>
                </router-link>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArchives, getArchiveArticles } from '@/api/front'

interface Archive {
  month: string
  count: number
  articles?: any[]
  expanded?: boolean
  loading?: boolean
}

const archives = ref<Archive[]>([])

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-')
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  return `${months[parseInt(month) - 1]} ${year}`
}

const formatDay = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.getDate().toString().padStart(2, '0')
}

const toggleArchive = async (index: number, month: string) => {
  const archive = archives.value[index]
  if (archive.expanded) {
    archive.expanded = false
    return
  }

  archive.expanded = true
  if (!archive.articles) {
    archive.loading = true
    try {
      const res: any = await getArchiveArticles(month)
      if (res.code === 200) archive.articles = res.data
    } finally {
      archive.loading = false
    }
  }
}

onMounted(async () => {
  const res: any = await getArchives()
  if (res.code === 200) {
    archives.value = res.data.map((item: any) => ({
      ...item,
      expanded: false,
      loading: false
    }))
    if (archives.value.length > 0) toggleArchive(0, archives.value[0].month)
  }
})
</script>

<style scoped>
.archives-page {
  padding: 60px 0 100px;
  background: var(--bg-body);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  margin-bottom: 60px;
  text-align: center;
}

.page-title {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

.archives-timeline {
  position: relative;
  padding-left: 20px;
}

.archives-timeline::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--border-color);
  border-radius: 4px;
}

.archive-group {
  margin-bottom: 40px;
}

.month-marker {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.marker-dot {
  position: absolute;
  left: -20px;
  width: 8px;
  height: 8px;
  background: var(--accent-color);
  border-radius: 50%;
  border: 2px solid var(--bg-card);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
  z-index: 1;
}

.month-label {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: var(--bg-glass-strong);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.month-label:hover {
  border-color: var(--accent-color);
  transform: translateX(6px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
  background: var(--bg-card);
}

.month-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.article-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-color);
  background: rgba(0, 113, 227, 0.05);
  padding: 2px 10px;
  border-radius: 100px;
}

.expand-icon {
  color: var(--text-secondary);
  transition: transform 0.3s;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.article-list-container {
  padding-left: 12px;
}

.article-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 20px;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.article-item:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 197, 253, 0.02) 100%);
  border-color: rgba(59, 130, 246, 0.1);
  transform: translateX(10px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.04);
}

.day {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  width: 24px;
}

.title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

.article-item:hover .title { color: var(--accent-color); }

.loading-box {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.mini-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>
