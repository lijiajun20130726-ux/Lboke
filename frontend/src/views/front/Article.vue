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
    <!-- 评论区域 -->
    <div class="comments-section">
      <h3>评论 ({{ comments.length }})</h3>
      
      <!-- 评论表单 -->
      <div class="comment-form">
        <div v-if="!userStore.token" class="form-row">
          <input v-model="commentForm.nickname" placeholder="昵称" class="form-input" />
          <input v-model="commentForm.email" placeholder="邮箱 (可选)" class="form-input" />
        </div>
        <textarea v-model="commentForm.content" placeholder="写下你的评论..." rows="4" class="form-textarea"></textarea>
        <div class="form-actions">
          <button @click="submitComment" :disabled="submitting" class="submit-btn">
            {{ submitting ? '提交中...' : '提交评论' }}
          </button>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list">
        <div v-for="item in comments" :key="item.id" class="comment-item">
          <div class="comment-avatar">
            <img :src="item.avatar || '/uploads/default-avatar.jpg'" :alt="item.nickname" />
          </div>
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-nickname">{{ item.nickname }}</span>
              <span class="comment-date">{{ formatDate(item.created_at) }}</span>
            </div>
            <div class="comment-content">{{ item.content }}</div>
          </div>
        </div>
        <div v-if="comments.length === 0" class="no-comments">暂无评论，快来抢沙发吧！</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleDetail, likeArticle } from '@/api/front'
import { getArticleComments, postComment } from '@/api/comment'
import { useUserStore } from '@/stores/user'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const route = useRoute()
const userStore = useUserStore()
const article = ref<any>(null)
const comments = ref<any[]>([])
const submitting = ref(false)
const commentForm = ref({
  nickname: '',
  email: '',
  content: ''
})

const formatDate = (date: string) => date ? new Date(date).toLocaleString() : ''

const loadArticle = async () => {
  const res: any = await getArticleDetail(Number(route.params.id))
  if (res.code === 200) article.value = res.data
  loadComments()
}

const loadComments = async () => {
  const res: any = await getArticleComments(Number(route.params.id))
  if (res.code === 200) comments.value = res.data
}

const submitComment = async () => {
  if (!commentForm.value.content.trim()) return alert('评论内容不能为空')
  if (!userStore.token && !commentForm.value.nickname.trim()) return alert('请输入昵称')

  submitting.value = true
  try {
    const res: any = await postComment({
      article_id: Number(route.params.id),
      ...commentForm.value
    })
    if (res.code === 201) {
      commentForm.value.content = ''
      loadComments()
    }
  } catch (err) {
    alert('提交失败')
  } finally {
    submitting.value = false
  }
}

const handleLike = async () => {
  if (!userStore.token) {
    alert('请先登录后再点赞')
    return
  }
  try {
    const res: any = await likeArticle(Number(route.params.id))
    if (res.code === 200) {
      article.value.like_count++
    } else {
      alert(res.message || '点赞失败')
    }
  } catch (err: any) {
    alert(err.message || '点赞失败')
  }
}

watch(() => route.params.id, loadArticle)
onMounted(loadArticle)
</script>

<style scoped>
.article-detail { 
  max-width: 900px; 
  margin: 0 auto; 
  background: #fff; 
  padding: 60px; 
  border-radius: 24px; 
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05); 
  border: 1px solid #f1f5f9;
}

h1 { 
  font-size: 42px; 
  font-weight: 800; 
  color: #0f172a; 
  margin-bottom: 24px; 
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.meta { 
  color: #64748b; 
  font-size: 15px; 
  margin-bottom: 32px; 
  display: flex; 
  gap: 24px; 
  align-items: center;
  font-weight: 500;
}

.tags { margin-bottom: 40px; display: flex; gap: 10px; }
.tag { 
  background: #f1f5f9; 
  color: #64748b; 
  padding: 6px 16px; 
  border-radius: 100px; 
  text-decoration: none; 
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}
.tag:hover { background: #3b82f6; color: #fff; }

.content { 
  line-height: 1.8; 
  font-size: 18px; 
  color: #334155;
}

.content :deep(img) { max-width: 100%; border-radius: 12px; margin: 32px 0; }
.content :deep(pre) { 
  background: #1e293b; 
  color: #f8fafc;
  padding: 24px; 
  border-radius: 12px; 
  overflow-x: auto; 
  margin: 32px 0;
  font-family: 'Fira Code', monospace;
}

.actions { 
  margin-top: 60px; 
  padding-top: 40px; 
  border-top: 1px solid #f1f5f9; 
  text-align: center;
}

.like-btn { 
  padding: 12px 32px; 
  background: #3b82f6; 
  color: #fff; 
  border: none; 
  border-radius: 100px; 
  cursor: pointer; 
  font-size: 16px; 
  font-weight: 600;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.like-btn:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3); }

.nav-links { 
  margin-top: 60px; 
  display: flex; 
  justify-content: space-between; 
  gap: 20px;
}
.nav-links a { 
  flex: 1;
  padding: 20px;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  color: #0f172a; 
  text-decoration: none; 
  transition: all 0.2s;
  font-weight: 600;
}
.nav-links a:hover { border-color: #3b82f6; color: #3b82f6; background: #f8fafc; }
.nav-links .next { text-align: right; }

.related { 
  margin-top: 60px; 
  padding: 40px; 
  background: #f8fafc; 
  border-radius: 24px;
}
.related h3 { margin-bottom: 20px; font-size: 20px; color: #0f172a; }
.related ul { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.related li { }
.related a { 
  color: #475569; 
  text-decoration: none; 
  font-weight: 500;
  display: block;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s;
}
.related a:hover { color: #3b82f6; background: #fff; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); }

/* 评论样式 */
.comments-section { margin-top: 80px; }
.comments-section h3 { margin-bottom: 32px; font-size: 24px; font-weight: 800; color: #0f172a; }

.comment-form { 
  margin-bottom: 60px; 
  background: #fff; 
  padding: 32px; 
  border-radius: 24px; 
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
}
.form-row { display: flex; gap: 20px; margin-bottom: 20px; }
.form-input { 
  flex: 1; 
  padding: 12px 16px; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  font-size: 15px;
  transition: border-color 0.2s;
}
.form-input:focus { outline: none; border-color: #3b82f6; }

.form-textarea { 
  width: 100%; 
  padding: 16px; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  margin-bottom: 20px; 
  box-sizing: border-box; 
  resize: vertical; 
  min-height: 120px;
  font-size: 15px;
  transition: border-color 0.2s;
}
.form-textarea:focus { outline: none; border-color: #3b82f6; }

.submit-btn { 
  padding: 12px 32px; 
  background: #0f172a; 
  color: #fff; 
  border: none; 
  border-radius: 100px; 
  cursor: pointer; 
  font-weight: 600;
  transition: all 0.2s; 
}
.submit-btn:hover { background: #334155; transform: translateY(-1px); }
.submit-btn:disabled { background: #94a3b8; cursor: not-allowed; }

.comment-list { display: flex; flex-direction: column; gap: 40px; }
.comment-item { display: flex; gap: 20px; }
.comment-avatar { width: 48px; height: 48px; flex-shrink: 0; }
.comment-avatar img { width: 100%; height: 100%; border-radius: 100%; object-fit: cover; border: 2px solid #f1f5f9; }

.comment-body { flex: 1; }
.comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.comment-nickname { font-weight: 700; color: #0f172a; font-size: 16px; }
.comment-date { font-size: 13px; color: #94a3b8; }
.comment-content { line-height: 1.6; color: #475569; font-size: 15px; word-break: break-all; }

.no-comments { text-align: center; color: #94a3b8; padding: 40px; font-size: 16px; }

@media (max-width: 768px) {
  .article-detail { padding: 30px 20px; border-radius: 0; }
  h1 { font-size: 32px; }
  .form-row { flex-direction: column; }
  .nav-links { flex-direction: column; }
}
</style>
