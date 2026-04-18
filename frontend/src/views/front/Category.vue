<template>
  <div class="list-page">
    <div class="list-hero">
      <div class="hero-glow"></div>
      <div class="container hero-content">
        <div class="hero-badge">📁 分类</div>
        <h1 class="hero-title">{{ isCategoryList ? '分类' : categoryName }}</h1>
        <p class="hero-subtitle">{{ isCategoryList ? '选择分类，浏览该分类下的文章列表' : '浏览该分类下的所有文章' }}</p>
        <button v-if="!isCategoryList" class="back-btn" @click="router.push('/categories')">返回分类</button>
      </div>
    </div>

    <div class="container list-layout">
      <div v-if="errorMessage" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ errorMessage }}</p>
        <button class="btn" @click="loadData">重试</button>
      </div>

      <div v-else-if="isCategoryList">
        <div class="category-grid" v-if="categories.length">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="category-card"
            @click="router.push(`/category/${cat.id}`)"
          >
            <div class="cat-name">{{ cat.name }}</div>
            <div class="cat-count">{{ cat.article_count || 0 }} 篇文章</div>
          </button>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📂</div>
          <p>暂无分类</p>
        </div>
      </div>

      <div v-else>
        <div class="article-grid" v-if="articles.length > 0" :key="String(categoryId)">
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
          <div class="empty-icon">📂</div>
          <p>该分类下暂无文章</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticles, getCategories } from '@/api/front'

const route = useRoute()
const router = useRouter()
const articles = ref<any[]>([])
const categories = ref<any[]>([])
const categoryName = ref('')
const errorMessage = ref('')

const categoryId = computed<number | null>(() => {
  const raw = route.params.id
  if (raw === undefined || raw === null || raw === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  return n
})

const isCategoryList = computed(() => categoryId.value === null)

const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() : ''

const loadData = async () => {
  errorMessage.value = ''
  try {
    if (isCategoryList.value) {
      const res: any = await getCategories(true)
      if (res.code === 200) {
        categories.value = res.data || []
      } else {
        errorMessage.value = res.message || '获取分类失败'
      }
      articles.value = []
      categoryName.value = ''
      document.title = `分类 | 李嘉骏的博客`
      return
    }

    const id = categoryId.value as number
    const [artRes, catRes]: any[] = await Promise.all([getArticles({ category_id: id }), getCategories(true)])

    if (catRes.code === 200) {
      categories.value = catRes.data || []
      const cat = categories.value.find((c: any) => c.id === id)
      categoryName.value = cat?.name || ''
    } else {
      categoryName.value = ''
    }

    if (artRes.code === 200) {
      articles.value = artRes.data.list || []
    } else {
      articles.value = []
      errorMessage.value = artRes.message || '获取文章失败'
    }

    if (!categoryName.value) {
      errorMessage.value = errorMessage.value || '分类不存在或已被删除'
      document.title = `分类 | 李嘉骏的博客`
      return
    }
    document.title = `${categoryName.value} - 分类 | 李嘉骏的博客`
  } catch (e: any) {
    articles.value = []
    categories.value = []
    categoryName.value = ''
    errorMessage.value = e?.message || '加载失败'
  }
}

watch(() => route.fullPath, loadData)
onMounted(loadData)
</script>

<style scoped>
.list-page { min-height: 100vh; background: var(--bg-body); }
.container { max-width: 1000px; margin: 0 auto; padding: 0 24px; }

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
  background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(147, 197, 253, 0.06) 50%, transparent 70%);
  z-index: 0;
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.8; transform: translateX(-50%) scale(1.1); }
}

.hero-content { position: relative; z-index: 1; }

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.08) 100%);
  color: var(--accent-color);
  border-radius: 100px;
  font-size: 13px;
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
}

.hero-subtitle { color: var(--text-secondary); font-size: 16px; }

.back-btn {
  margin-top: 18px;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.25);
  background: var(--bg-glass);
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
}

.back-btn:hover {
  border-color: rgba(59, 130, 246, 0.45);
}

.list-layout { padding: 40px 24px 100px; }

.error-state {
  text-align: center;
  padding: 80px 0;
  color: var(--text-secondary);
}

.error-icon {
  font-size: 42px;
  margin-bottom: 14px;
}

.btn {
  margin-top: 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}

.category-card {
  text-align: left;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  border-radius: 18px;
  padding: 18px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-color);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
}

.cat-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.cat-count {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 700;
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
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-gradient-soft);
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
    0 8px 24px rgba(59, 130, 246, 0.1);
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
  .category-grid { grid-template-columns: 1fr; }
}
</style>
