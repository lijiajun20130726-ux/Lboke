<template>
  <div class="dashboard">
    <h2>仪表盘</h2>
    <div class="stat-cards">
      <div class="card"><div class="num">{{ stats.articles }}</div><div class="label">文章数</div></div>
      <div class="card"><div class="num">{{ stats.categories }}</div><div class="label">分类数</div></div>
      <div class="card"><div class="num">{{ stats.tags }}</div><div class="label">标签数</div></div>
      <div class="card"><div class="num">{{ stats.views }}</div><div class="label">总访问</div></div>
    </div>
    <div class="recent">
      <h3>最新文章</h3>
      <table>
        <thead><tr><th>标题</th><th>状态</th><th>浏览</th><th>创建时间</th></tr></thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td>{{ article.title }}</td>
            <td><span :class="['status', article.status]">{{ article.status === 'published' ? '已发布' : '草稿' }}</span></td>
            <td>{{ article.view_count }}</td>
            <td>{{ formatDate(article.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStatistics, getLatestArticles } from '@/api/front'

const stats = ref({ articles: 0, categories: 0, tags: 0, views: 0 })
const articles = ref<any[]>([])

const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() : ''

onMounted(async () => {
  const [statsRes, artRes]: any[] = await Promise.all([getStatistics(), getLatestArticles(5)])
  if (statsRes.code === 200) stats.value = statsRes.data
  if (artRes.code === 200) articles.value = artRes.data
})
</script>

<style scoped>
h2 { margin-bottom: 20px; }
.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
.card { background: #fff; padding: 24px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.card .num { font-size: 36px; font-weight: bold; color: #1890ff; }
.card .label { color: #999; margin-top: 8px; }
.recent { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.recent h3 { margin-bottom: 16px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
th { background: #fafafa; }
.status { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.status.published { background: #e6f7ff; color: #1890ff; }
.status.draft { background: #fff7e6; color: #fa8c16; }
</style>
