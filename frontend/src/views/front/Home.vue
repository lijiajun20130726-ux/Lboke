<template>
  <div class="home">
    <div class="content">
      <div class="article-list">
        <article v-for="article in articles" :key="article.id" class="article-card">
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArticles, getCategories, getTags, getHotArticles } from '@/api/front'

const articles = ref<any[]>([])
const categories = ref<any[]>([])
const tags = ref<any[]>([])
const hotArticles = ref<any[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 })

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
  const [catRes, tagRes, hotRes]: any[] = await Promise.all([
    getCategories(true), getTags(true), getHotArticles(5)
  ])
  if (catRes.code === 200) categories.value = catRes.data
  if (tagRes.code === 200) tags.value = tagRes.data
  if (hotRes.code === 200) hotArticles.value = hotRes.data
})
</script>

<style scoped>
.home { display: flex; gap: 30px; }
.content { flex: 1; }
.sidebar { width: 280px; flex-shrink: 0; }
.article-card { background: #fff; border-radius: 8px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.article-cover img { width: 100%; height: 200px; object-fit: cover; }
.article-info { padding: 16px; }
.article-title { font-size: 20px; font-weight: bold; color: #333; text-decoration: none; display: block; margin-bottom: 8px; }
.article-title:hover { color: #1890ff; }
.article-summary { color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 12px; }
.article-meta { color: #999; font-size: 12px; display: flex; gap: 16px; }
.article-meta a { color: #1890ff; text-decoration: none; }
.article-tags { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
.tag { background: #f0f0f0; color: #666; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-decoration: none; }
.tag:hover { background: #1890ff; color: #fff; }
.widget { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.widget h3 { font-size: 16px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
.widget ul { list-style: none; padding: 0; margin: 0; }
.widget li { padding: 8px 0; }
.widget a { color: #666; text-decoration: none; }
.widget a:hover { color: #1890ff; }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; }
.pagination button { padding: 8px 16px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
.empty { text-align: center; padding: 40px; color: #805757; }
@media (max-width: 768px) { .home { flex-direction: column; } .sidebar { width: 100%; } }
</style>
