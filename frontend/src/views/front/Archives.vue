<template>
  <div class="archives">
    <h2>文章归档</h2>
    <div v-for="archive in archives" :key="archive.month" class="archive-group">
      <h3>{{ archive.month }} ({{ archive.count }}篇)</h3>
      <ul v-if="archive.articles">
        <li v-for="article in archive.articles" :key="article.id">
          <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
          <span class="date">{{ formatDate(article.published_at) }}</span>
        </li>
      </ul>
      <button v-else @click="loadArchiveArticles(archive.month)" class="load-btn">展开</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArchives, getArchiveArticles } from '@/api/front'

const archives = ref<any[]>([])

const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() : ''

const loadArchiveArticles = async (month: string) => {
  const res: any = await getArchiveArticles(month)
  if (res.code === 200) {
    const archive = archives.value.find(a => a.month === month)
    if (archive) archive.articles = res.data
  }
}

onMounted(async () => {
  const res: any = await getArchives()
  if (res.code === 200) archives.value = res.data
})
</script>

<style scoped>
.archives h2 { margin-bottom: 20px; }
.archive-group { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.archive-group h3 { margin-bottom: 12px; color: #1890ff; }
ul { list-style: none; padding: 0; }
li { padding: 8px 0; display: flex; justify-content: space-between; border-bottom: 1px solid #eee; }
li:last-child { border-bottom: none; }
li a { color: #333; text-decoration: none; }
li a:hover { color: #1890ff; }
.date { color: #999; font-size: 12px; }
.load-btn { background: #f5f5f5; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
</style>
