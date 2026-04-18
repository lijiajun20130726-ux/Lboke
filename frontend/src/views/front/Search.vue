<template>
  <div class="list-page">
    <div class="list-hero">
      <div class="hero-glow"></div>
      <div class="container hero-content">
        <div class="hero-badge">🔍 搜索</div>
        <h1 class="hero-title">{{ $route.query.q }}</h1>
        <p class="hero-subtitle" v-if="!loading">找到 {{ articles.length }} 个相关结果</p>
        <p class="hero-subtitle" v-else>正在寻找中...</p>
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

      <div v-else-if="!loading" class="empty-state">
        <div class="empty-icon">🔎</div>
        <p>未找到相关文章</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchArticles } from '@/api/front'

const route = useRoute()
const router = useRouter()
const articles = ref<any[]>([])
const loading = ref(false)

const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() : ''

const search = async () => {
  const keyword = route.query.q as string
  if (!keyword) return
  loading.value = true
  const res: any = await searchArticles({ keyword })
  if (res.code === 200) articles.value = res.data.list
  loading.value = false
}

watch(() => route.query.q, search)
onMounted(search)
</script>

<style scoped>
.list-page { min-height: 100vh; background: var(--bg-body); }
.container { max-width: 1000px; margin: 0 auto; padding: 0 24px; }

.list-hero { 
  padding: 80px 0 60px; 
  background: var(--bg-hero-alt);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(0, 113, 227, 0.08) 0%, transparent 70%);
  z-index: 0;
}

.hero-content { position: relative; z-index: 1; }

.hero-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--accent-color);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 20px;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 16px;
  letter-spacing: -0.03em;
}

.hero-subtitle { color: var(--text-secondary); font-size: 16px; }

.list-layout { padding: 40px 24px 100px; }

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
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  transform: translateY(-6px);
  border-color: var(--accent-color);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
}

.card-cover { height: 180px; overflow: hidden; }
.card-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; }
.article-card:hover .card-cover img { transform: scale(1.08); }

.card-body { padding: 24px; display: flex; flex-direction: column; flex: 1; }
.card-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; line-height: 1.4; }
.card-summary { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-footer { margin-top: auto; display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); font-weight: 600; }

.empty-state { text-align: center; padding: 100px 0; color: var(--text-secondary); }
.empty-icon { font-size: 48px; margin-bottom: 16px; }

@media (max-width: 768px) {
  .hero-title { font-size: 32px; }
  .article-grid { grid-template-columns: 1fr; }
}
</style>

