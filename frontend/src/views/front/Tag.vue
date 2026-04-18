<template>
  <div class="list-page">
    <div class="list-hero">
      <div class="hero-glow"></div>
      <div class="container hero-content">
        <div class="hero-badge"># 标签</div>
        <h1 class="hero-title">{{ $route.params.name }}</h1>
        <p class="hero-subtitle">共 {{ articles.length }} 篇文章已关联此标签</p>
      </div>
    </div>

    <div class="container list-layout">
      <div class="article-grid" v-if="articles.length > 0">
        <div v-for="article in articles" :key="article.id" class="article-card-box">
          <div class="article-card" @click="router.push(`/article/${article.id}`)">
            <div class="card-cover" v-if="article.cover_image">
              <img :src="article.cover_image" :alt="article.title" />
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ article.title }}</h3>
              <p class="card-summary">{{ article.summary }}</p>
              <div class="card-footer">
                <span class="date">{{ formatDate(article.published_at) }}</span>
                <span class="views">{{ article.view_count }} 阅读</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📁</div>
        <p>暂无相关文章</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticles } from '@/api/front'

const route = useRoute()
const router = useRouter()
const articles = ref<any[]>([])

const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() : ''

const loadData = async () => {
  const res: any = await getArticles({ tag: route.params.name as string })
  if (res.code === 200) {
    articles.value = res.data.list
    // 设置页面标题
    const tagName = route.params.name as string
    document.title = `${tagName} - 标签 | 李嘉骏的博客`
  }
}

watch(() => route.params.name, loadData)
onMounted(loadData)
</script>

<style scoped>
.list-page { 
  min-height: 100vh; 
  background: var(--bg-body); 
}

.container { 
  max-width: 1000px; 
  margin: 0 auto; 
  padding: 0 24px; 
}

.list-hero { 
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
  background: radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(219, 39, 119, 0.06) 50%, transparent 70%);
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
  gap: 6px;
  padding: 8px 20px;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.08) 100%);
  color: var(--accent-color);
  border-radius: 100px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 24px;
  border: 1px solid rgba(236, 72, 153, 0.2);
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
}

.hero-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.15);
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
  color: var(--text-secondary); 
  font-size: 17px; 
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.list-layout { 
  padding: 0 24px 120px; 
}

.article-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
  gap: 32px; 
}

.article-card {
  background: var(--bg-card);
  border-radius: 24px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-gradient-magenta);
  opacity: 0;
  transition: opacity 0.3s;
}

.article-card:hover::before {
  opacity: 1;
}

.article-card:hover {
  transform: translateY(-8px);
  border-color: var(--accent-color);
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(236, 72, 153, 0.1);
}

.card-cover { 
  height: 200px; 
  overflow: hidden; 
  position: relative;
}

.card-cover img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); 
}

.article-card:hover .card-cover img { 
  transform: scale(1.08); 
}

.card-body { 
  display: flex; 
  flex-direction: column; 
  flex: 1; 
  padding: 24px;
}

.card-title { 
  font-size: 18px; 
  font-weight: 700; 
  color: var(--text-primary); 
  margin-bottom: 12px; 
  line-height: 1.4;
  letter-spacing: -0.3px;
  transition: color 0.2s;
}

.article-card:hover .card-title {
  color: var(--accent-color);
}

.card-summary { 
  font-size: 14px; 
  color: var(--text-secondary); 
  line-height: 1.6; 
  margin-bottom: 20px; 
  display: -webkit-box; 
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical; 
  overflow: hidden; 
}

.card-footer { 
  margin-top: auto; 
  display: flex; 
  align-items: center;
  gap: 16px;
  font-size: 13px; 
  color: var(--text-secondary); 
  font-weight: 500; 
}

.empty-state { 
  text-align: center; 
  padding: 120px 0; 
  color: var(--text-secondary); 
}

.empty-icon { 
  font-size: 64px; 
  margin-bottom: 24px; 
  opacity: 0.5;
}

@media (max-width: 768px) {
  .list-hero { padding: 80px 0 60px; }
  .hero-title { font-size: 36px; }
  .hero-subtitle { font-size: 15px; }
  .article-grid { grid-template-columns: 1fr; gap: 24px; }
  .card-cover { height: 180px; }
}
</style>

