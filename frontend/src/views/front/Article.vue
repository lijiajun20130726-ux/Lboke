<template>
  <div class="article-detail" v-if="article">
    <h1>{{ article.title }}</h1>
    <div class="meta">
      <span>{{ formatDate(article.published_at) }}</span>
      <span v-if="article.category_name">分类：{{ article.category_name }}</span>
      <span>{{ article.view_count }} 阅读</span>
      <span>{{ article.like_count }} 点赞</span>
    </div>
    <div class="tags" v-if="article.tags?.length">
      <router-link v-for="tag in article.tags" :key="tag.id" :to="`/tag/${tag.name}`" class="tag">
        {{ tag.name }}
      </router-link>
    </div>
    <MdPreview :modelValue="article.content" />
    <div class="actions">
      <button @click="handleLike" class="like-btn">👍 点赞 ({{ article.like_count }})</button>
    </div>
    <div class="nav-links">
      <router-link v-if="article.prev_article" :to="`/article/${article.prev_article.id}`" class="prev">
        ← {{ article.prev_article.title }}
      </router-link>
      <router-link v-if="article.next_article" :to="`/article/${article.next_article.id}`" class="next">
        {{ article.next_article.title }} →
      </router-link>
    </div>
    <div class="related" v-if="article.related_articles?.length">
      <h3>相关文章</h3>
      <ul>
        <li v-for="item in article.related_articles" :key="item.id">
          <router-link :to="`/article/${item.id}`">{{ item.title }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleDetail, likeArticle } from '@/api/front'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const route = useRoute()
const article = ref<any>(null)

const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() : ''

const loadArticle = async () => {
  const res: any = await getArticleDetail(Number(route.params.id))
  if (res.code === 200) article.value = res.data
}

const handleLike = async () => {
  await likeArticle(Number(route.params.id))
  article.value.like_count++
}

watch(() => route.params.id, loadArticle)
onMounted(loadArticle)
</script>

<style scoped>
.article-detail { background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
h1 { font-size: 28px; margin-bottom: 16px; }
.meta { color: #999; font-size: 14px; margin-bottom: 16px; display: flex; gap: 20px; }
.tags { margin-bottom: 20px; display: flex; gap: 8px; }
.tag { background: #f0f0f0; color: #666; padding: 4px 12px; border-radius: 4px; text-decoration: none; }
.content { line-height: 1.8; font-size: 16px; }
.content :deep(img) { max-width: 100%; }
.content :deep(pre) { background: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; }
.actions { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
.like-btn { padding: 10px 24px; background: #1890ff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
.nav-links { margin-top: 30px; display: flex; justify-content: space-between; }
.nav-links a { color: #1890ff; text-decoration: none; }
.related { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
.related h3 { margin-bottom: 12px; }
.related ul { list-style: none; padding: 0; }
.related li { padding: 8px 0; }
.related a { color: #666; text-decoration: none; }
.related a:hover { color: #1890ff; }
</style>
