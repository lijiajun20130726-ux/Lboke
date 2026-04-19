<template>
  <div class="articles">
    <div class="header">
      <h2>文章管理</h2>
      <router-link to="/admin/article/create" class="btn-primary">写文章</router-link>
    </div>
    <div class="filters">
      <input v-model="keyword" placeholder="搜索文章..." @keyup.enter="() => loadArticles()" />
      <select v-model="status" @change="() => loadArticles()">
        <option value="">全部状态</option>
        <option value="draft">草稿</option>
        <option value="published">已发布</option>
      </select>
    </div>
    <table>
      <thead><tr><th>标题</th><th>分类</th><th>状态</th><th>浏览</th><th>创建时间</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="article in articles" :key="article.id">
          <td>{{ article.title }}</td>
          <td>{{ article.category_name || '-' }}</td>
          <td><span :class="['status', article.status]">{{ article.status === 'published' ? '已发布' : '草稿' }}</span></td>
          <td>{{ article.view_count }}</td>
          <td>{{ formatDate(article.created_at) }}</td>
          <td class="actions">
            <router-link :to="`/admin/article/edit/${article.id}`">编辑</router-link>
            <button @click="togglePublish(article)">{{ article.status === 'published' ? '下架' : '发布' }}</button>
            <button @click="handleDelete(article.id)" class="danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination" v-if="pagination.totalPages > 1">
      <button :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">上一页</button>
      <span>{{ pagination.page }} / {{ pagination.totalPages }}</span>
      <button :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArticleList, deleteArticle, publishArticle } from '@/api/article'

const articles = ref<any[]>([])
const keyword = ref('')
const status = ref('')
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 })

const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() : ''

const loadArticles = async (page = 1) => {
  const res: any = await getArticleList({ page, pageSize: 10, keyword: keyword.value, status: status.value })
  if (res.code === 200) { articles.value = res.data.list; pagination.value = res.data.pagination }
}

const togglePublish = async (article: any) => {
  await publishArticle(article.id, article.status !== 'published')
  loadArticles(pagination.value.page)
}

const handleDelete = async (id: number) => {
  if (confirm('确定删除此文章？')) { await deleteArticle(id); loadArticles(pagination.value.page) }
}

const changePage = (page: number) => loadArticles(page)

onMounted(() => loadArticles())
</script>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-primary { background: #1890ff; color: #fff; padding: 8px 16px; border-radius: 4px; text-decoration: none; }
.filters { display: flex; gap: 12px; margin-bottom: 20px; }
.filters input, .filters select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
table { width: 100%; background: #fff; border-collapse: collapse; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #eee; }
th { background: #fafafa; }
.status { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.status.published { background: #e6f7ff; color: #1890ff; }
.status.draft { background: #fff7e6; color: #fa8c16; }
.actions { display: flex; gap: 8px; }
.actions a, .actions button { padding: 4px 8px; font-size: 12px; border: none; background: #f0f0f0; border-radius: 4px; cursor: pointer; text-decoration: none; color: #333; }
.actions button.danger { color: #ff4d4f; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; }
.pagination button { padding: 8px 16px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; }
.pagination button:disabled { opacity: 0.5; }
</style>
