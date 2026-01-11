<template>
  <div class="home-container">
    <!-- Hero Module for Latest Article -->
    <div v-if="latestArticle" class="hero-section" :style="heroStyle">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-category" v-if="latestArticle.category_name">{{ latestArticle.category_name }}</div>
        <h1 class="hero-title">{{ latestArticle.title }}</h1>
        <p class="hero-summary">{{ latestArticle.summary }}</p>
        <div class="hero-meta">
          <span>{{ formatDate(latestArticle.published_at) }}</span>
          <span>{{ latestArticle.view_count }} 阅读</span>
        </div>
        <router-link :to="`/article/${latestArticle.id}`" class="hero-btn">阅读全文</router-link>
      </div>
    </div>

    <div class="home">
      <div class="content">
        <div class="article-list">
          <article v-for="article in otherArticles" :key="article.id" class="article-card">
            <router-link :to="`/article/${article.id}`" class="article-cover" v-if="article.cover_image">
              <img :src="article.cover_image" :alt="article.title" />
            </router-link>
            <div class="article-info">
              <router-link :to="`/article/${article.id}`" class="article-title">{{ article.title }}</router-link>
              <p class="article-summary">{{ article.summary }}</p>
              <div class="article-meta">
                <span>{{ formatDate(article.published_at) }}</span>
                <span v-if="article.category_name">
                  <router-link :to="`/category/${article.category_id}`">{{ article.category_name }}</router-link>
                </span>
                <span>{{ article.view_count }} 阅读</span>
              </div>
              <div class="article-tags" v-if="article.tags?.length">
                <router-link v-for="tag in article.tags" :key="tag.id" :to="`/tag/${tag.name}`" class="tag">
                  {{ tag.name }}
                </router-link>
              </div>
            </div>
          </article>
          <div v-if="articles.length === 0" class="empty">暂无文章</div>
        </div>
        <div class="pagination" v-if="pagination.totalPages > 1">
          <button :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">上一页</button>
          <span>{{ pagination.page }} / {{ pagination.totalPages }}</span>
          <button :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)">下一页</button>
        </div>
      </div>
      <aside class="sidebar">
        <!-- Author Info Widget -->
        <div v-if="siteInfo.author_name" class="widget author-widget">
          <div class="author-header">
            <img :src="siteInfo.author_avatar || '/uploads/default-avatar.jpg'" :alt="siteInfo.author_name" class="author-avatar" />
            <h3 class="author-name">{{ siteInfo.author_name }}</h3>
            <p class="author-intro">{{ siteInfo.author_intro }}</p>
          </div>
          <div class="author-stats">
            <div class="stat-item">
              <span class="stat-value">{{ statistics.articles || 0 }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ statistics.categories || 0 }}</span>
              <span class="stat-label">分类</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ statistics.tags || 0 }}</span>
              <span class="stat-label">标签</span>
            </div>
          </div>
          <div class="author-social">
            <a v-if="siteInfo.contact_github" :href="siteInfo.contact_github" target="_blank" title="GitHub" class="social-link">GH</a>
            <a v-if="siteInfo.contact_email" :href="`mailto:${siteInfo.contact_email}`" title="Email" class="social-link">EM</a>
          </div>
        </div>

        <div class="widget">
          <h3>分类</h3>
          <ul>
            <li v-for="cat in categories" :key="cat.id">
              <router-link :to="`/category/${cat.id}`">{{ cat.name }} ({{ cat.article_count || 0 }})</router-link>
            </li>
          </ul>
        </div>
        <div class="widget">
          <h3>标签</h3>
          <div class="tag-cloud">
            <router-link v-for="tag in tags" :key="tag.id" :to="`/tag/${tag.name}`" class="tag">
              {{ tag.name }}
            </router-link>
          </div>
        </div>
        <div class="widget">
          <h3>热门文章</h3>
          <ul>
            <li v-for="article in hotArticles" :key="article.id">
              <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getArticles, getCategories, getTags, getHotArticles, getSiteInfo, getStatistics } from '@/api/front'

const articles = ref<any[]>([])
const categories = ref<any[]>([])
const tags = ref<any[]>([])
const hotArticles = ref<any[]>([])
const siteInfo = ref<any>({})
const statistics = ref<any>({})
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 })

const latestArticle = computed(() => articles.value[0] || null)
const otherArticles = computed(() => articles.value.slice(1))

const heroStyle = computed(() => {
  if (!latestArticle.value || !latestArticle.value.cover_image) {
    return { background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)' }
  }
  return {
    backgroundImage: `url(${latestArticle.value.cover_image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() : ''

const loadArticles = async (page = 1) => {
  const res: any = await getArticles({ page, pageSize: 10 })
  if (res.code === 200) {
    articles.value = res.data.list
    pagination.value = res.data.pagination
  }
}

const changePage = (page: number) => {
  loadArticles(page)
  window.scrollTo(0, 0)
}

onMounted(async () => {
  loadArticles()
  const [catRes, tagRes, hotRes, siteRes, statRes]: any[] = await Promise.all([
    getCategories(true), 
    getTags(true), 
    getHotArticles(5),
    getSiteInfo(),
    getStatistics()
  ])
  if (catRes.code === 200) categories.value = catRes.data
  if (tagRes.code === 200) tags.value = tagRes.data
  if (hotRes.code === 200) hotArticles.value = hotRes.data
  if (siteRes.code === 200) siteInfo.value = siteRes.data
  if (statRes.code === 200) statistics.value = statRes.data
})
</script>

<style scoped>
.home-container { width: 100%; background-color: #f8fafc; min-height: 100vh; }

.hero-section {
  position: relative;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  margin-bottom: 60px;
  border-radius: 0 0 24px 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.7));
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 24px;
}

.hero-category {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(59, 130, 246, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  margin-bottom: 24px;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero-summary {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  line-height: 1.6;
  font-weight: 400;
}

.hero-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 40px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.hero-btn {
  display: inline-block;
  padding: 14px 40px;
  background: #fff;
  color: #0f172a;
  text-decoration: none;
  border-radius: 100px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.hero-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background: #f8fafc;
}

.home { display: flex; gap: 40px; max-width: 1200px; margin: 0 auto; padding: 0 20px 60px; }
.content { flex: 1; }
.sidebar { width: 320px; flex-shrink: 0; }

.article-list { display: flex; flex-direction: column; gap: 32px; }

.article-card { 
  background: #fff; 
  border-radius: 16px; 
  overflow: hidden; 
  display: flex;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  border-color: #3b82f6;
}

.article-cover { flex: 0 0 280px; overflow: hidden; }
.article-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.article-card:hover .article-cover img { transform: scale(1.05); }

.article-info { padding: 24px; flex: 1; display: flex; flex-direction: column; }

.article-title { 
  font-size: 24px; 
  font-weight: 700; 
  color: #0f172a; 
  text-decoration: none; 
  display: block; 
  margin-bottom: 12px;
  line-height: 1.3;
  transition: color 0.2s;
}

.article-card:hover .article-title { color: #3b82f6; }

.article-summary { 
  color: #475569; 
  font-size: 15px; 
  line-height: 1.6; 
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta { 
  color: #94a3b8; 
  font-size: 13px; 
  display: flex; 
  gap: 20px; 
  align-items: center;
  margin-top: auto;
}

.article-meta a { color: #3b82f6; text-decoration: none; font-weight: 500; }
.article-meta a:hover { text-decoration: underline; }

.article-tags { margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; }
.tag { 
  background: #f1f5f9; 
  color: #64748b; 
  padding: 4px 12px; 
  border-radius: 6px; 
  font-size: 12px; 
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}
.tag:hover { background: #3b82f6; color: #fff; }

.widget { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid #e2e8f0; }

.author-widget { text-align: center; }
.author-header { margin-bottom: 20px; }
.author-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 3px solid #f1f5f9; }
.author-name { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.author-intro { font-size: 14px; color: #64748b; line-height: 1.5; }
.author-stats { display: flex; justify-content: space-around; padding: 16px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; margin-bottom: 16px; }
.stat-item { display: flex; flex-direction: column; gap: 4px; }
.stat-value { font-size: 16px; font-weight: 700; color: #0f172a; }
.stat-label { font-size: 12px; color: #94a3b8; }
.author-social { display: flex; justify-content: center; gap: 12px; }
.social-link { width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; color: #475569; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 12px; font-weight: 700; transition: all 0.2s; }
.social-link:hover { background: #0f172a; color: #fff; transform: translateY(-2px); }

.widget h3 { 
  font-size: 18px; 
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 20px; 
  padding-bottom: 12px; 
  border-bottom: 2px solid #f1f5f9; 
}

.widget ul { list-style: none; padding: 0; margin: 0; }
.widget li { padding: 10px 0; border-bottom: 1px solid #f8fafc; }
.widget li:last-child { border-bottom: none; }
.widget a { color: #475569; text-decoration: none; transition: all 0.2s; font-size: 15px; }
.widget a:hover { color: #3b82f6; padding-left: 4px; }

.tag-cloud { display: flex; flex-wrap: wrap; gap: 10px; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 40px; }
.pagination button { 
  padding: 10px 20px; 
  border: 1px solid #e2e8f0; 
  background: #fff; 
  border-radius: 8px; 
  cursor: pointer;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s;
}
.pagination button:hover:not(:disabled) { border-color: #3b82f6; color: #3b82f6; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

.empty { text-align: center; padding: 80px 0; color: #94a3b8; font-size: 18px; }

@media (max-width: 1024px) {
  .sidebar { width: 280px; }
}

@media (max-width: 768px) { 
  .home { flex-direction: column; } 
  .sidebar { width: 100%; } 
  .article-card { flex-direction: column; }
  .article-cover { flex: 0 0 200px; }
  .hero-title { font-size: 36px; }
}
</style>
