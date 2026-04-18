<template>
  <div class="all-articles-page">
    <div class="hero">
      <div class="hero-glow"></div>
      <div class="container hero-content">
        <div class="hero-badge">📚 所有文章</div>
        <h1 class="hero-title">全站文章列表</h1>
        <p class="hero-subtitle">支持关键词、分类与发布时间筛选</p>
      </div>
    </div>

    <div class="container content">
      <div class="toolbar">
        <div class="input-group">
          <input v-model="filters.keyword" placeholder="搜索标题、摘要或内容" @keyup.enter="applyFilters()" />
          <button class="btn" @click="applyFilters()">搜索</button>
        </div>
        <div class="select-group">
          <select v-model="filters.categoryId" @change="applyFilters()">
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="String(cat.id)">{{ cat.name }}</option>
          </select>
          <select v-model="filters.order" @change="applyFilters()">
            <option value="desc">最新发布</option>
            <option value="asc">最早发布</option>
          </select>
          <button class="btn ghost" @click="resetFilters">重置</button>
        </div>
      </div>

      <div v-if="errorMessage" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ errorMessage }}</p>
        <button class="btn" @click="loadData">重试</button>
      </div>

      <div v-else class="list">
        <div class="grid" v-if="articles.length">
          <article v-for="article in articles" :key="article.id" class="card" @click="router.push(`/article/${article.id}`)">
            <div class="cover" v-if="article.cover_image">
              <img :src="article.cover_image" :alt="article.title" />
            </div>
            <div class="body">
              <div class="meta">
                <span class="category">{{ article.category_name || '未分类' }}</span>
                <span class="dot"></span>
                <span class="date">{{ formatDate(article.published_at) }}</span>
              </div>
              <h2 class="title">{{ article.title }}</h2>
              <p class="summary">{{ article.summary || '暂无摘要' }}</p>
              <div class="author">
                <img class="author-avatar" :src="article.author_avatar || '/uploads/default-avatar.jpg'" alt="author" />
                <span class="author-name">{{ article.author_name || '作者' }}</span>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📄</div>
          <p>暂无文章</p>
        </div>
      </div>

      <div class="pagination" v-if="pagination.totalPages > 1">
        <button :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">上一页</button>
        <span>{{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticles, getCategories } from '@/api/front'

const route = useRoute()
const router = useRouter()

const articles = ref<any[]>([])
const categories = ref<any[]>([])
const errorMessage = ref('')
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 })

const filters = ref({
  keyword: '',
  categoryId: '',
  order: 'desc'
})

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getBaseUrl = () => `${window.location.origin}`

const upsertMeta = (key: string, content: string, attr: 'name' | 'property' = 'name') => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const setJsonLd = (data: any) => {
  let el = document.getElementById('articles-jsonld') as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = 'articles-jsonld'
    document.head.appendChild(el)
  }
  el.text = JSON.stringify(data)
}

const updateSeo = () => {
  const categoryName = categories.value.find((c: any) => String(c.id) === filters.value.categoryId)?.name
  const titleSuffix = categoryName ? ` - ${categoryName}` : ''
  const title = `所有文章${titleSuffix} | 李嘉骏的博客`
  const desc = categoryName
    ? `浏览 ${categoryName} 分类下的所有已发布文章，支持关键词与发布时间筛选。`
    : '浏览全站所有已发布文章，支持关键词、分类与发布时间筛选。'
  document.title = title
  upsertMeta('description', desc)
  upsertMeta('keywords', `博客,文章,${categoryName || '分类'},归档,技术`)
  upsertMeta('og:title', title, 'property')
  upsertMeta('og:description', desc, 'property')
  upsertMeta('og:type', 'website', 'property')
  upsertMeta('og:url', `${getBaseUrl()}${route.fullPath}`, 'property')
  upsertLink('canonical', `${getBaseUrl()}${route.fullPath}`)

  const itemList = articles.value.map((article, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${getBaseUrl()}/article/${article.id}`,
    name: article.title,
    datePublished: article.published_at,
    author: {
      '@type': 'Person',
      name: article.author_name || '作者'
    }
  }))

  setJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '所有文章',
    itemListElement: itemList
  })
}

const syncFromRoute = () => {
  filters.value.keyword = String(route.query.keyword || '')
  filters.value.categoryId = String(route.query.category || '')
  filters.value.order = String(route.query.order || 'desc') === 'asc' ? 'asc' : 'desc'
  pagination.value.page = Number(route.query.page || 1)
}

const buildQuery = (override: Partial<{ keyword: string; category: string; order: string; page: number }> = {}) => {
  const query: Record<string, string> = {}
  const keyword = override.keyword ?? filters.value.keyword
  const category = override.category ?? filters.value.categoryId
  const order = override.order ?? filters.value.order
  const page = override.page ?? pagination.value.page
  if (keyword) query.keyword = keyword
  if (category) query.category = category
  if (order && order !== 'desc') query.order = order
  if (page && page !== 1) query.page = String(page)
  return query
}

const applyFilters = () => {
  router.push({ path: '/articles', query: buildQuery({ page: 1 }) })
}

const resetFilters = () => {
  filters.value.keyword = ''
  filters.value.categoryId = ''
  filters.value.order = 'desc'
  router.push({ path: '/articles' })
}

const ensureCategories = async () => {
  if (categories.value.length) return
  const res: any = await getCategories(true)
  if (res.code === 200) categories.value = res.data || []
}

const loadData = async () => {
  errorMessage.value = ''
  await ensureCategories()
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      order: filters.value.order
    }
    if (filters.value.keyword) params.keyword = filters.value.keyword
    if (filters.value.categoryId) params.category_id = Number(filters.value.categoryId)

    const res: any = await getArticles(params)
    if (res.code === 200) {
      articles.value = res.data.list || []
      pagination.value = res.data.pagination
    } else {
      articles.value = []
      errorMessage.value = res.message || '加载失败'
    }
  } catch (err: any) {
    articles.value = []
    errorMessage.value = err?.message || '加载失败'
  } finally {
    updateSeo()
  }
}

const changePage = (page: number) => {
  router.push({ path: '/articles', query: buildQuery({ page }) })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(() => route.query, () => {
  syncFromRoute()
  loadData()
})

onMounted(async () => {
  syncFromRoute()
  await ensureCategories()
  loadData()
})
</script>

<style scoped>
.all-articles-page {
  min-height: 100vh;
  background: var(--bg-body);
}

.container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero {
  padding: 90px 0 70px;
  background: var(--bg-hero);
  position: relative;
  overflow: hidden;
  text-align: center;
}

.hero-glow {
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 680px;
  height: 680px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(147, 197, 253, 0.06) 50%, transparent 70%);
  z-index: 0;
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
  background: rgba(59, 130, 246, 0.12);
  color: var(--accent-color);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 18px;
}

.hero-title {
  font-size: 44px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 12px;
}

.hero-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0;
}

.content {
  padding: 40px 24px 110px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  margin-bottom: 28px;
}

.input-group {
  display: flex;
  flex: 1 1 320px;
  gap: 10px;
}

.input-group input {
  flex: 1;
  height: 42px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 0 14px;
}

.select-group {
  display: flex;
  flex: 1 1 320px;
  gap: 10px;
  justify-content: flex-end;
}

.select-group select {
  height: 42px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 0 12px;
  background: var(--bg-input);
}

.btn {
  height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid var(--accent-color);
  background: var(--accent-color);
  color: var(--text-invert);
  cursor: pointer;
  font-weight: 700;
}

.btn.ghost {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.list {
  min-height: 200px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.card {
  background: var(--bg-card);
  border-radius: 20px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
}

.cover {
  height: 180px;
  overflow: hidden;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.meta .dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: var(--border-color-hover);
}

.title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.summary {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.author {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.author-avatar {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  object-fit: cover;
}

.pagination {
  margin-top: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.pagination button {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  cursor: pointer;
  font-weight: 700;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state,
.error-state {
  text-align: center;
  padding: 90px 0;
  color: var(--text-secondary);
}

.empty-icon,
.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

@media (max-width: 860px) {
  .hero-title {
    font-size: 30px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .select-group {
    justify-content: stretch;
    flex-wrap: wrap;
  }

  .btn,
  .select-group select,
  .input-group input {
    width: 100%;
  }
}
</style>
