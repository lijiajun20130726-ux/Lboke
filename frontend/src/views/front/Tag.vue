<template>
  <div class="tag-page">
    <h2>标签：{{ $route.params.name }}</h2>
    <div class="article-list">
      <article v-for="article in articles" :key="article.id" class="article-card">
        <router-link :to="`/article/${article.id}`" class="title">{{ article.title }}</router-link>
        <p class="summary">{{ article.summary }}</p>
        <div class="meta">
          <span>{{ formatDate(article.published_at) }}</span>
          <span>{{ article.view_count }} 阅读</span>
        </div>
      </article>
      <div v-if="articles.length === 0" class="empty">该标签下暂无文章</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getArticles } from '@/api/front'

const route = useRoute()
const articles = ref<any[]>([])

const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() : ''

const loadData = async () => {
  const res: any = await getArticles({ tag: route.params.name as string })
  if (res.code === 200) articles.value = res.data.list
}

watch(() => route.params.name, loadData)
onMounted(loadData)
</script>

<style scoped>
.tag-page h2 { margin-bottom: 20px; }
.article-card { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.title { font-size: 18px; font-weight: bold; color: #333; text-decoration: none; }
.title:hover { color: #1890ff; }
.summary { color: #666; margin: 12px 0; }
.meta { color: #999; font-size: 12px; display: flex; gap: 16px; }
.empty { text-align: center; padding: 40px; color: #999; }
</style>
