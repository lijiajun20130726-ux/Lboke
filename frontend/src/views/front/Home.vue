<template>
  <div class="home-container">
    <!-- Hero Section: Floating Glass 2.0 (White Style) -->
    <section v-if="latestArticle" class="hero-section">
      <div class="hero-bg-glow"></div>
      <div class="container hero-inner">
        <div class="hero-glass-card" :style="heroCardStyle">
          <div class="hero-image-box" v-if="latestArticle.cover_image">
            <img :src="latestArticle.cover_image" :alt="latestArticle.title" />
            <div class="image-overlay"></div>
          </div>
          
          <div class="hero-info">
            <div class="hero-badge" v-if="latestArticle.category_name">
              <span class="badge-dot"></span>
              {{ latestArticle.category_name }}
            </div>
            <h1 class="hero-title">{{ latestArticle.title }}</h1>
            <p class="hero-summary">{{ latestArticle.summary }}</p>
            
            <div class="hero-footer">
              <div class="hero-meta">
                <div class="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {{ formatDate(latestArticle.published_at) }}
                </div>
                <div class="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {{ latestArticle.view_count }} 阅读
                </div>
              </div>
              
              <router-link :to="`/article/${latestArticle.id}`" class="hero-cta">
                阅读全文
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="home-layout container">
      <div class="main-content">
        <div class="section-header">
          <h2 class="section-title">精选文章</h2>
          <div class="section-line"></div>
        </div>

        <div class="article-grid">
          <div 
            v-for="(article, index) in otherArticles" 
            :key="article.id" 
            class="article-card-wrapper"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="article-card" @click="router.push(`/article/${article.id}`)">
              <div class="card-cover" v-if="article.cover_image">
                <img :src="article.cover_image" :alt="article.title" loading="lazy" />
                <div class="card-category" v-if="article.category_name">{{ article.category_name }}</div>
              </div>
              <div class="card-body">
                <h3 class="card-title">{{ article.title }}</h3>
                <p class="card-summary">{{ article.summary }}</p>
                
                <div class="card-footer">
                  <div class="card-meta">
                    <span>{{ formatDate(article.published_at) }}</span>
                    <span class="meta-dot"></span>
                    <span>{{ article.view_count }} 次阅读</span>
                  </div>
                  <div class="card-tags" v-if="article.tags?.length">
                    <span v-for="tag in article.tags.slice(0, 2)" :key="tag.id" class="mini-tag">
                      #{{ tag.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="articles.length === 0" class="empty-state">
          <div class="empty-icon">📂</div>
          <p>暂无文章发布呦~，欢迎多加关注哦~</p>
        </div>

        <div class="pagination-wrapper" v-if="pagination.totalPages > 1">
          <button 
            class="page-btn" 
            :disabled="pagination.page <= 1" 
            @click="changePage(pagination.page - 1)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div class="page-info">
            <span class="current-page">{{ pagination.page }}</span>
            <span class="page-separator">/</span>
            <span class="total-pages">{{ pagination.totalPages }}</span>
          </div>
          <button 
            class="page-btn" 
            :disabled="pagination.page >= pagination.totalPages" 
            @click="changePage(pagination.page + 1)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <aside class="sidebar">
        <!-- Author Profile -->
        <div v-if="siteInfo.author_name" class="sidebar-widget profile-card">
          <div class="profile-header">
            <div class="avatar-ring">
              <img :src="siteInfo.author_avatar || '/uploads/default-avatar.jpg'" class="profile-avatar" />
            </div>
            <h3 class="profile-name">{{ siteInfo.author_name }}</h3>
            <p class="profile-bio">{{ siteInfo.author_intro }}</p>
          </div>
          
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-num">{{ statistics.articles || 0 }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ statistics.categories || 0 }}</span>
              <span class="stat-label">分类</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ statistics.tags || 0 }}</span>
              <span class="stat-label">标签</span>
            </div>
          </div>

          <div class="profile-social">
            <a v-if="siteInfo.contact_github || true" :href="siteInfo.contact_github || 'https://github.com/lijiajun20130726-ux'" target="_blank" class="social-btn github" title="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 3.071 1.305 3.819.997.108-.775.482-1.305.89-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.362.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a v-if="siteInfo.contact_youtube || true" :href="siteInfo.contact_youtube || 'https://www.youtube.com/@lijiajun-xtjj/'" target="_blank" class="social-btn youtube" title="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a v-if="siteInfo.contact_email" :href="`mailto:${siteInfo.contact_email}`" class="social-btn email" title="Email">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
            <div v-if="siteInfo.wechat_qrcode" class="social-btn wechat" title="微信">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8.69 13.585c.677 0 1.226-.549 1.226-1.226s-.549-1.226-1.226-1.226-1.226.549-1.226 1.226.549 1.226 1.226 1.226zm-2.903-1.226c0 .677.549 1.226 1.226 1.226s1.226-.549 1.226-1.226-.549-1.226-1.226-1.226-1.226.549-1.226 1.226zM12 0C5.373 0 0 4.28 0 9.507c0 2.937 1.667 5.568 4.252 7.279L3.3 20.25l4.38-2.19c1.332.368 2.76.577 4.252.577 6.627 0 12-4.28 12-9.507S18.627 0 12 0zm0 17.69c-5.893 0-10.667-3.667-10.667-8.183S6.107 1.324 12 1.324c5.893 0 10.667 3.667 10.667 8.183s-4.774 8.183-10.667 8.183zm5.226-7.33c-.677 0-1.226.549-1.226 1.226s.549 1.226 1.226 1.226 1.226-.549 1.226-1.226-.549-1.226-1.226-1.226zm-2.903 1.226c0-.677-.549-1.226-1.226-1.226s-1.226.549-1.226 1.226.549 1.226 1.226 1.226 1.226-.549 1.226-1.226z"/></svg>
              <div class="wechat-tooltip">
                <img :src="siteInfo.wechat_qrcode" alt="微信二维码" class="wechat-qr" />
              </div>
            </div>
            <div v-if="siteInfo.wechat_official_qrcode" class="social-btn wechat" title="微信公众号">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <rect x="7" y="15" width="10" height="2" rx="1" fill="#fff"/>
                <circle cx="9" cy="10" r="1.6" fill="#fff"/>
                <circle cx="15" cy="10" r="1.6" fill="#fff"/>
              </svg>
              <div class="wechat-tooltip">
                <img :src="siteInfo.wechat_official_qrcode" alt="微信公众号二维码" class="wechat-qr" />
              </div>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="sidebar-widget">
          <h3 class="widget-title">文章分类</h3>
          <div class="category-list">
            <router-link 
              v-for="cat in categories" 
              :key="cat.id" 
              :to="`/category/${cat.id}`"
              class="category-item"
            >
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-count">{{ cat.article_count || 0 }}</span>
            </router-link>
          </div>
        </div>

        <!-- Popular Articles -->
        <div class="sidebar-widget">
          <h3 class="widget-title">热门文章</h3>
          <div class="hot-list">
            <router-link 
              v-for="(article, index) in hotArticles" 
              :key="article.id" 
              :to="`/article/${article.id}`"
              class="hot-item"
            >
              <span class="hot-index">{{ index + 1 }}</span>
              <span class="hot-title">{{ article.title }}</span>
            </router-link>
          </div>
        </div>

        <div class="sidebar-widget sidebar-subscribe">
          <SubscribeBox />
        </div>

      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import SubscribeBox from '@/components/SubscribeBox.vue'
import { getArticles, getCategories, getHotArticles, getSiteInfo, getStatistics } from '@/api/front'

const router = useRouter()
const articles = ref<any[]>([])
const categories = ref<any[]>([])
const hotArticles = ref<any[]>([])
const siteInfo = ref<any>({})
const statistics = ref<any>({})
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 })

const latestArticle = computed(() => articles.value[0] || null)
const otherArticles = computed(() => articles.value.slice(1))

const heroCardStyle = computed(() => {
  // Use a subtle ambient glow based on the image if available, else a soft blue
  return {}
})

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadArticles = async (page = 1) => {
  const res: any = await getArticles({ page, pageSize: 10 })
  if (res.code === 200) {
    articles.value = res.data.list
    pagination.value = res.data.pagination
  }
}

const changePage = (page: number) => {
  loadArticles(page)
  window.scrollTo({ top: 400, behavior: 'smooth' })
}

onMounted(async () => {
  window.scrollTo({ top: 0 });
  loadArticles()
  const [catRes, hotRes, siteRes, statRes]: any[] = await Promise.all([
    getCategories(true), 
    getHotArticles(5),
    getSiteInfo(),
    getStatistics()
  ])
  if (catRes.code === 200) categories.value = catRes.data
  if (hotRes.code === 200) hotArticles.value = hotRes.data
  if (siteRes.code === 200) {
    siteInfo.value = siteRes.data
    // 设置首页标题
    document.title = `${siteInfo.value.blog_title || '李嘉骏的博客'} - ${siteInfo.value.blog_subtitle || '技术分享与生活记录'}`
  }
  if (statRes.code === 200) statistics.value = statRes.data
})
</script>

<style scoped>
.home-container { 
  width: 100%; 
  min-height: 100vh;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero Section: Aurora UI + Glassmorphism */
.hero-section {
  position: relative;
  padding: 80px 0 100px;
  background: var(--bg-body);
  overflow: hidden;
}

.hero-bg-glow {
  position: absolute;
  top: -20%;
  right: -10%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(147, 197, 253, 0.08) 40%, transparent 70%);
  z-index: 0;
  pointer-events: none;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 30px) scale(1.05); }
}

.hero-inner {
  position: relative;
  z-index: 1;
}

.hero-glass-card {
  display: flex;
  background: var(--bg-glass);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--bg-glass-border);
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(59, 130, 246, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-glass-card:hover {
  transform: translateY(-6px) scale(1.005);
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.08),
    0 12px 32px rgba(59, 130, 246, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 1);
}

.hero-image-box {
  flex: 1.2;
  position: relative;
  min-height: 460px;
  overflow: hidden;
}

.hero-image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-glass-card:hover .hero-image-box img {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 100%);
}

.hero-info {
  flex: 1;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(59, 130, 246, 0.12);
  color: var(--accent-color);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
  width: fit-content;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-color);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 113, 227, 0.4);
}

.hero-title {
  font-size: 42px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
  margin-bottom: 20px;
  letter-spacing: -0.03em;
}

.hero-summary {
  font-size: 17px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.hero-meta {
  display: flex;
  gap: 20px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: var(--accent-gradient);
  color: var(--text-invert);
  border-radius: 100px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.hero-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.hero-cta:hover::before {
  left: 100%;
}

.hero-cta:hover {
  background: var(--accent-gradient-strong);
  transform: translateX(4px) translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

/* Home Layout */
.home-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 48px;
  padding-bottom: 80px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.section-line {
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

/* Article Grid */
.article-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.article-card-wrapper {
  opacity: 0;
  transform: translateY(20px);
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.article-card {
  display: flex;
  background: var(--bg-card);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  position: relative;
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-gradient-rainbow);
  opacity: 0;
  transition: opacity 0.3s;
}

.article-card:hover::before {
  opacity: 1;
}

.article-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(59, 130, 246, 0.08);
  border-color: var(--accent-color);
}

.card-cover {
  flex: 0 0 260px;
  position: relative;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.article-card:hover .card-cover img {
  transform: scale(1.05);
}

.card-category {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 4px 12px;
  background: var(--bg-glass-strong);
  backdrop-filter: blur(4px);
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
}

.card-body {
  flex: 1;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.4;
  transition: color 0.2s;
}

.article-card:hover .card-title {
  color: var(--accent-color);
}

.card-summary {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.meta-dot {
  width: 3px;
  height: 3px;
  background: var(--border-color-hover);
  border-radius: 50%;
}

.mini-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-color);
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 4px;
}

/* Sidebar Widgets */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.sidebar-widget {
  background: var(--bg-card);
  border-radius: 24px;
  padding: 28px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-widget:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.sidebar-subscribe {
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.sidebar-subscribe:hover {
  box-shadow: none;
  transform: none;
}

.sidebar-subscribe :deep(.subscribe-box) {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.widget-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.widget-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: var(--accent-color);
  border-radius: 100px;
}

/* Profile Card */
.profile-card {
  text-align: center;
  background: var(--bg-card);
}

.avatar-ring {
  width: 90px;
  height: 90px;
  margin: 0 auto 16px;
  padding: 4px;
  border: 2px solid var(--accent-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.profile-bio {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 24px;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.stat-num {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
}

.profile-social {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.social-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

.social-btn.github:hover {
  color: #333;
  border-color: #333;
  box-shadow: 0 4px 12px rgba(51, 51, 51, 0.15);
}

.social-btn.youtube:hover {
  color: #ff0000;
  border-color: #ff0000;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.15);
}

.social-btn.email:hover {
  color: var(--accent-color);
  border-color: var(--accent-color);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.15);
}

.social-btn.wechat {
  position: relative;
}

.social-btn.wechat:hover {
  color: #07c160;
  border-color: #07c160;
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.15);
}

.wechat-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: #fff;
  color: #333;
  padding: 6px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  pointer-events: none;
  border: 1px solid #eee;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wechat-qr {
  width: 160px;
  height: 160px;
  object-fit: contain;
  border-radius: 4px;
}

.wechat-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: #fff transparent transparent transparent;
}

.social-btn.wechat:hover .wechat-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-5px);
}

.social-btn:hover {
  transform: translateY(-2px);
}

/* Category List */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.category-item:hover {
  background: rgba(0, 113, 227, 0.05);
  color: var(--accent-color);
}

.cat-count {
  font-size: 11px;
  font-weight: 700;
  background: var(--bg-surface-muted);
  padding: 2px 8px;
  border-radius: 100px;
  color: var(--text-secondary);
}

.category-item:hover .cat-count {
  background: var(--accent-color);
  color: var(--text-invert);
}

/* Hot List */
.hot-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hot-item {
  display: flex;
  gap: 12px;
  text-decoration: none;
  align-items: flex-start;
}

.hot-index {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-secondary);
  line-height: 1;
  font-style: italic;
}

.hot-item:nth-child(1) .hot-index { color: var(--rank-1); }
.hot-item:nth-child(2) .hot-index { color: var(--rank-2); }
.hot-item:nth-child(3) .hot-index { color: var(--rank-3); }

.hot-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.4;
  transition: color 0.2s;
}

.hot-item:hover .hot-title {
  color: var(--accent-color);
}

/* Tag Cloud */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-pill {
  padding: 6px 14px;
  background: var(--bg-surface-muted);
  color: var(--text-secondary);
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.tag-pill:hover {
  background: var(--accent-color);
  color: var(--text-invert);
  transform: scale(1.05);
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 60px;
}

.page-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background: rgba(0, 113, 227, 0.02);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.current-page { color: var(--text-primary); font-size: 16px; }
.page-separator { color: var(--text-secondary); }
.total-pages { color: var(--text-secondary); font-size: 14px; }

/* Empty State */
.empty-state {
  text-align: center;
  padding: 100px 0;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

@media (max-width: 1024px) {
  .home-layout { grid-template-columns: 1fr; gap: 40px; }
  .sidebar { order: 2; }
  .main-content { order: 1; }
}

@media (max-width: 768px) {
  .hero-glass-card { flex-direction: column; border-radius: 24px; }
  .hero-image-box { min-height: 240px; }
  .hero-info { padding: 32px; }
  .hero-title { font-size: 28px; }
  .hero-summary { margin-bottom: 24px; }
  .article-card { flex-direction: column; }
  .card-cover { flex: 0 0 200px; }
}
</style>

