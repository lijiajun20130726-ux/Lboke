<template>
  <div class="about-container">
    <div class="about-hero">
      <div class="hero-content">
        <div class="avatar-glow-wrapper">
          <div class="glow-bg"></div>
          <img v-if="siteInfo.author_avatar" :src="siteInfo.author_avatar" class="about-avatar" />
          <div v-else class="avatar-placeholder">{{ siteInfo.author_name?.[0] || 'A' }}</div>
        </div>
        <h1 class="about-name">{{ siteInfo.author_name || '博客作者' }}</h1>
        <p class="about-intro">{{ siteInfo.author_intro || '致力于分享技术与生活的点滴。' }}</p>
      </div>
    </div>

    <div class="container about-layout">
      <!-- Stats Row -->
      <section class="about-section">
        <div class="section-header">
          <h2 class="section-title">数据概览</h2>
          <div class="section-line"></div>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">{{ stats.articles }}</span>
            <span class="stat-label">文章总数</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.categories }}</span>
            <span class="stat-label">精选分类</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.tags }}</span>
            <span class="stat-label">活跃标签</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.views }}</span>
            <span class="stat-label">全站阅读</span>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section class="about-section" v-if="hasContact">
        <div class="section-header">
          <h2 class="section-title">保持联系</h2>
          <div class="section-line"></div>
        </div>
        <div class="contact-grid">
          <a v-if="siteInfo.contact_email" :href="`mailto:${siteInfo.contact_email}`" class="contact-card">
            <div class="contact-icon email">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div class="contact-info">
              <span class="label">电子邮箱</span>
              <span class="value">{{ siteInfo.contact_email }}</span>
            </div>
          </a>
          <a v-if="siteInfo.contact_github" :href="siteInfo.contact_github" target="_blank" class="contact-card">
            <div class="contact-icon github">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 3.071 1.305 3.819.997.108-.775.482-1.305.89-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.362.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <div class="contact-info">
              <span class="label">GitHub</span>
              <span class="value">/{{ siteInfo.contact_github.split('/').pop() }}</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getSiteInfo, getStatistics } from '@/api/front'

const siteInfo = ref<any>({})
const stats = ref({ articles: 0, categories: 0, tags: 0, views: 0 })

const hasContact = computed(() => {
  return siteInfo.value.contact_email || siteInfo.value.contact_github
})

onMounted(async () => {
  const [siteRes, statsRes]: any[] = await Promise.all([getSiteInfo(), getStatistics()])
  if (siteRes.code === 200) {
    siteInfo.value = siteRes.data
    // 设置页面标题
    document.title = `关于 ${siteInfo.value.author_name || '作者'} | ${siteInfo.value.blog_title || '李嘉骏的博客'}`
  }
  if (statsRes.code === 200) stats.value = statsRes.data
})
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  background: var(--bg-body);
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

/* About Hero */
.about-hero {
  padding: 100px 24px 80px;
  background: var(--bg-body);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.avatar-glow-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 32px;
}

.glow-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
}

.about-avatar, .avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 1;
  border: 4px solid var(--bg-card);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.avatar-placeholder {
  background: var(--bg-surface-muted);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
}

.about-name {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.about-intro {
  font-size: 18px;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Section Style */
.about-section {
  margin-bottom: 80px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.section-line {
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-card {
  background: var(--bg-card);
  padding: 32px 24px;
  border-radius: 24px;
  border: 1px solid var(--border-color);
  text-align: center;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color);
  box-shadow: 0 10px 30px rgba(0, 113, 227, 0.04);
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
}

/* Contact Grid */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: var(--bg-card);
  border-radius: 20px;
  border: 1px solid var(--border-color);
  text-decoration: none;
  transition: all 0.3s;
}

.contact-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.contact-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface-muted);
  color: var(--text-primary);
  transition: all 0.3s;
}

.contact-card:hover .contact-icon {
  background: var(--accent-color);
  color: var(--text-invert);
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.contact-info .label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.contact-info .value {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .about-name { font-size: 28px; }
  .about-intro { font-size: 16px; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
