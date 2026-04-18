<template>
  <div class="article-page" v-if="article">
    <div class="article-container">
      <!-- Article Header -->
      <header class="article-hero">
        <div class="hero-content">
          <div class="article-breadcrumb">
            <router-link to="/">首页</router-link>
            <span class="sep">/</span>
            <span v-if="article.category_name">{{ article.category_name }}</span>
          </div>
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <div class="meta-item">
              <img :src="siteInfo.author_avatar || '/uploads/default-avatar.jpg'" class="meta-avatar" />
              <span>{{ siteInfo.author_name || '作者' }}</span>
            </div>
            <span class="meta-dot"></span>
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {{ formatDate(article.published_at) }}
            </div>
            <span class="meta-dot"></span>
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {{ article.view_count }} 次阅读
            </div>
          </div>
        </div>
        
        <div v-if="article.cover_image" class="article-cover">
          <img :src="article.cover_image" :alt="article.title" />
          <div class="cover-glow"></div>
        </div>
      </header>

      <div class="article-layout">
        <!-- Main Content -->
        <main class="article-main">
          <div class="article-body card-modern">
            <MdPreview :modelValue="article.content" />
            
            <div class="article-footer-tags" v-if="article.tags?.length">
              <router-link v-for="tag in article.tags" :key="tag.id" :to="`/tag/${tag.name}`" class="tag-pill">
                # {{ tag.name }}
              </router-link>
            </div>
          </div>

          <!-- Interaction Actions -->
          <div class="article-actions card-modern">
            <button @click="handleLike" class="action-btn like-btn" :class="{ 'is-liked': isLiked }">
              <svg width="24" height="24" viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z" />
              </svg>
              <span>{{ article.like_count }} 点赞</span>
            </button>
            <div class="share-box">
              <span class="share-label">分享文章:</span>
              <div class="share-icons">
                <button class="share-btn">WeChat</button>
                <button class="share-btn">Weibo</button>
                <button class="share-btn" @click="copyLink">Link</button>
              </div>
            </div>
          </div>

          <!-- Article Navigation -->
          <div class="article-nav">
            <router-link v-if="article.prev_article" :to="`/article/${article.prev_article.id}`" class="nav-card prev">
              <div class="nav-content">
                <span class="nav-dir">上一篇</span>
                <span class="nav-title">{{ article.prev_article.title }}</span>
              </div>
            </router-link>
            <div v-else class="nav-empty"></div>

            <router-link v-if="article.next_article" :to="`/article/${article.next_article.id}`" class="nav-card next">
              <div class="nav-content">
                <span class="nav-dir">下一篇</span>
                <span class="nav-title">{{ article.next_article.title }}</span>
              </div>
            </router-link>
            <div v-else class="nav-empty"></div>
          </div>

          <!-- Comments -->
          <section class="comments-section card-modern">
            <h3 class="section-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
              全部评论 ({{ comments.length }})
            </h3>

            <div class="comment-form">
              <div v-if="!userStore.token" class="guest-inputs">
                <input v-model="commentForm.nickname" placeholder="昵称" />
                <input v-model="commentForm.email" placeholder="邮箱 (可选)" />
              </div>
              <div class="textarea-wrapper">
                <textarea v-model="commentForm.content" placeholder="写下你的见解..." rows="3"></textarea>
                <div class="form-footer">
                  <span class="tips">支持 Markdown</span>
                  <button @click="submitComment" :disabled="submitting" class="submit-comment-btn">
                    {{ submitting ? '提交中...' : '发表评论' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="comment-list">
              <div v-for="item in comments" :key="item.id" class="comment-item">
                <img :src="item.avatar || '/uploads/default-avatar.jpg'" class="comment-avatar" />
                <div class="comment-content-box">
                  <div class="comment-header">
                    <span class="comment-user">{{ item.nickname }}</span>
                    <span class="comment-time">{{ formatDate(item.created_at) }}</span>
                  </div>
                  <div class="comment-text">{{ item.content }}</div>
                </div>
              </div>
              <div v-if="comments.length === 0" class="comments-empty">
                <p>暂时还没有评论</p>
              </div>
            </div>
          </section>

          <!-- Subscribe CTA -->
          <div class="article-subscribe">
            <div class="subscribe-cta-card">
              <div class="subscribe-cta-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div class="subscribe-cta-content">
                <h3>喜欢这篇文章？</h3>
                <p>订阅我们，第一时间获取最新文章通知</p>
              </div>
              <div class="subscribe-cta-form">
                <input 
                  v-model="subscribeEmail" 
                  type="email" 
                  placeholder="输入您的邮箱" 
                  @keyup.enter="handleSubscribe"
                />
                <button @click="handleSubscribe" :disabled="subscribeLoading">
                  {{ subscribeLoading ? '订阅中...' : '订阅' }}
                </button>
              </div>
              <p v-if="subscribeMessage" :class="['subscribe-msg', subscribeError ? 'error' : 'success']">
                {{ subscribeMessage }}
              </p>
            </div>
          </div>
        </main>

        <!-- Sidebar / Table of Contents -->
        <aside class="article-sidebar">
          <div class="sidebar-sticky">
            <div class="toc-widget card-modern" v-if="article.related_articles?.length">
              <h3 class="widget-title">推荐文章</h3>
              <div class="related-list">
                <router-link 
                  v-for="item in article.related_articles" 
                  :key="item.id" 
                  :to="`/article/${item.id}`"
                  class="related-item"
                >
                  <span class="related-title">{{ item.title }}</span>
                  <span class="related-date">{{ formatDate(item.published_at) }}</span>
                </router-link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticleDetail, likeArticle, getSiteInfo } from '@/api/front'
import { getArticleComments, postComment } from '@/api/comment'
import { subscribe } from '@/api/subscription'
import { useUserStore } from '@/stores/user'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const article = ref<any>(null)
const siteInfo = ref<any>({})
const comments = ref<any[]>([])
const submitting = ref(false)
const isLiked = ref(false)
const commentForm = ref({ nickname: '', email: '', content: '' })
const subscribeEmail = ref('')
const subscribeLoading = ref(false)
const subscribeMessage = ref('')
const subscribeError = ref(false)

const getArticleId = () => {
  const id = route.params.id
  if (id === undefined || id === null) return ''
  return String(id)
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const loadArticle = async () => {
  const articleId = getArticleId()
  if (!articleId) {
    article.value = null
    return
  }
  const [artRes, siteRes]: any[] = await Promise.all([
    getArticleDetail(articleId),
    getSiteInfo()
  ])
  if (artRes.code === 200) {
    article.value = artRes.data
    isLiked.value = Boolean(artRes.data?.is_liked)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  if (siteRes.code === 200) siteInfo.value = siteRes.data
  loadComments()
}

const loadComments = async () => {
  const articleId = getArticleId()
  if (!articleId) return
  const res: any = await getArticleComments(articleId)
  if (res.code === 200) comments.value = res.data
}

const submitComment = async () => {
  if (!commentForm.value.content.trim()) return
  if (!userStore.token && !commentForm.value.nickname.trim()) return
  
  submitting.value = true
  try {
    const articleId = getArticleId()
    if (!articleId) return
    const res: any = await postComment({
      article_id: articleId,
      ...commentForm.value
    })
    if (res.code === 201) {
      commentForm.value.content = ''
      loadComments()
    }
  } catch (err) {
    console.error(err)
  } finally {
    submitting.value = false
  }
}

const handleLike = async () => {
  if (!userStore.token) {
    alert('请先登录')
    router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  try {
    const articleId = getArticleId()
    if (!articleId) return
    if (isLiked.value) {
      const res: any = await likeArticle(articleId, 'unlike')
      if (res.code === 200) {
        article.value.like_count = Math.max(0, (article.value.like_count || 0) - 1)
        isLiked.value = false
      }
      return
    }
    const res: any = await likeArticle(articleId, 'like')
    if (res.code === 200) {
      article.value.like_count = (article.value.like_count || 0) + 1
      isLiked.value = true
    }
  } catch (err) {
    const message = err?.message || err?.response?.data?.message || err?.message || '点赞失败'
    if (message.includes('已经点过赞')) {
      isLiked.value = true
      return alert('您已经点过赞了')
    }
    if (message.includes('还没有点过赞')) {
      isLiked.value = false
      return alert('您还没有点过赞')
    }
    if (message.includes('未授权') || message.includes('401')) {
      alert('请先登录')
      return router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    }
    alert(message)
  }
}

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href)
  alert('链接已复制到剪贴板')
}

const handleSubscribe = async () => {
  if (!subscribeEmail.value || subscribeLoading.value) return
  subscribeLoading.value = true
  subscribeMessage.value = ''
  subscribeError.value = false
  try {
    const res: any = await subscribe(subscribeEmail.value)
    if (res.code === 200) {
      subscribeMessage.value = res.message || '订阅成功！'
      subscribeEmail.value = ''
    } else {
      subscribeMessage.value = res.message || '订阅失败'
      subscribeError.value = true
    }
  } catch (e: any) {
    subscribeMessage.value = e.response?.data?.message || '订阅失败'
    subscribeError.value = true
  } finally {
    subscribeLoading.value = false
    setTimeout(() => { subscribeMessage.value = '' }, 4000)
  }
}

watch(() => route.params.id, loadArticle)
onMounted(loadArticle)
</script>

<style scoped>
.article-page {
  padding: 40px 0 80px;
  background: var(--bg-body);
}

.article-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero Header */
.article-hero {
  margin-bottom: 48px;
}

.article-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.article-breadcrumb a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.article-breadcrumb a:hover { color: var(--accent-color); }

.article-title {
  font-size: 48px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.15;
  margin-bottom: 24px;
  letter-spacing: -0.04em;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.meta-dot {
  width: 3px;
  height: 3px;
  background: var(--border-color-hover);
  border-radius: 50%;
}

.article-cover {
  margin-top: 40px;
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.article-cover img {
  width: 100%;
  max-height: 540px;
  object-fit: cover;
  display: block;
}

/* Layout */
.article-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 48px;
  align-items: start;
}

.card-modern {
  background: var(--bg-card);
  border-radius: 24px;
  border: 1px solid var(--border-color);
  padding: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-bottom: 32px;
}

/* Markdown Preview */
.article-body {
  padding: 48px 56px;
}

:deep(.md-preview),
:deep(.md-preview-wrapper) {
  background: transparent !important;
  font-family: -apple-system, system-ui, sans-serif;
  color: var(--text-primary);
  line-height: 1.75;
  font-size: 17px;
}

:deep(.md-editor-preview),
:deep(.md-editor-preview-wrapper) {
  background: var(--bg-card) !important;
  --md-theme-bg-color: var(--bg-card);
  --md-theme-bg-color-inset: var(--bg-surface-muted);
  --md-theme-color: var(--text-primary);
  --md-theme-color-reverse: var(--text-secondary);
  --md-theme-border-color: var(--border-color);
  --md-theme-border-color-inset: var(--border-color);
  --md-theme-border-color-reverse: var(--border-color);
  --md-theme-link-color: var(--accent-color);
  --md-theme-link-hover-color: var(--accent-color-hover);
  --md-theme-code-copy-tips-bg-color: var(--bg-card);
}

:deep(.md-preview h1),
:deep(.md-preview h2),
:deep(.md-preview h3),
:deep(.md-preview h4),
:deep(.md-preview h5),
:deep(.md-preview h6) {
  color: var(--text-primary);
}

:deep(.md-preview h2) {
  font-size: 28px;
  font-weight: 700;
  margin: 2em 0 1em;
  padding-bottom: 0.5em;
  border-bottom: 1px solid var(--border-color);
}

:deep(.md-preview p) { margin-bottom: 1.6em; color: var(--text-primary); }

:deep(.md-preview li),
:deep(.md-preview ul),
:deep(.md-preview ol) {
  color: var(--text-primary);
}

:deep(.md-preview blockquote) {
  color: var(--text-secondary);
  background: var(--bg-surface-muted);
  border-left: 4px solid var(--border-color);
}

:deep(.md-preview a) {
  color: var(--accent-color);
}

:deep(.md-preview hr) {
  border-color: var(--border-color);
}

:deep(.md-preview code) {
  color: var(--text-primary);
  background: var(--bg-surface-muted);
  border: 1px solid var(--border-color);
}

:deep(.md-preview pre) {
  background: var(--bg-surface-muted);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

:deep(.md-preview table) {
  border-color: var(--border-color);
}

:deep(.md-preview th),
:deep(.md-preview td) {
  border-color: var(--border-color);
  color: var(--text-primary);
}

.article-footer-tags {
  margin-top: 60px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.tag-pill {
  padding: 8px 16px;
  background: var(--bg-surface-muted);
  color: var(--text-secondary);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.tag-pill:hover { background: rgba(59, 130, 246, 0.12); color: var(--accent-color); }

/* Actions */
.article-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  border-radius: 100px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }
.action-btn.is-liked { background: var(--accent-color); border-color: var(--accent-color); color: var(--text-invert); }

.share-box {
  display: flex;
  align-items: center;
  gap: 16px;
}

.share-label { font-size: 13px; color: var(--text-secondary); font-weight: 500; }

.share-icons { display: flex; gap: 8px; }

.share-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-muted);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}

.share-btn:hover { background: var(--bg-card); color: var(--text-primary); }

/* Navigation */
.article-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 48px;
}

.nav-card {
  background: var(--bg-card);
  padding: 24px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  text-decoration: none;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.nav-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.nav-dir {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 600;
}

.nav-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
}

/* Comments */
.comments-section .section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  margin-bottom: 32px;
}

.comment-form {
  background: var(--bg-surface-muted);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 40px;
}

.guest-inputs {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.guest-inputs input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.textarea-wrapper {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.textarea-wrapper textarea {
  width: 100%;
  padding: 16px;
  border: none;
  outline: none;
  resize: vertical;
  font-family: inherit;
  font-size: 15px;
  color: var(--text-primary);
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-body);
  border-top: 1px solid var(--border-color);
}

.form-footer .tips { font-size: 12px; color: var(--text-secondary); }

.submit-comment-btn {
  padding: 8px 24px;
  background: var(--accent-color);
  color: var(--text-invert);
  border-radius: 100px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-comment-btn:hover { background: var(--accent-color-hover); }
.submit-comment-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.comment-item {
  display: flex;
  gap: 16px;
}

.comment-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-surface-muted);
}

.comment-content-box { flex: 1; }

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.comment-user { font-weight: 700; font-size: 14px; color: var(--text-primary); }
.comment-time { font-size: 12px; color: var(--text-secondary); }
.comment-text { font-size: 15px; color: var(--text-secondary); line-height: 1.6; }

/* Sidebar */
.sidebar-sticky {
  position: sticky;
  top: 100px;
}

.widget-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.related-item {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.related-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  transition: color 0.2s;
}

.related-item:hover .related-title { color: var(--accent-color); }
.related-date { font-size: 12px; color: var(--text-secondary); }

/* Subscribe CTA */
.article-subscribe {
  margin-top: 48px;
}

.subscribe-cta-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 40px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
}

.subscribe-cta-icon {
  width: 64px;
  height: 64px;
  background: rgba(0, 113, 227, 0.08);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
}

.subscribe-cta-content {
  flex: 1;
  min-width: 200px;
}

.subscribe-cta-content h3 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
}

.subscribe-cta-content p {
  font-size: 15px;
  color: var(--text-secondary);
  letter-spacing: -0.01em;
  line-height: 1.5;
}

.subscribe-cta-form {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.subscribe-cta-form input {
  padding: 14px 20px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  min-width: 240px;
  transition: all 0.2s;
}

.subscribe-cta-form input::placeholder { color: var(--text-secondary); }
.subscribe-cta-form input:focus { border-color: var(--accent-color); background: var(--bg-card); }

.subscribe-cta-form button {
  padding: 14px 32px;
  background: var(--accent-color);
  border: none;
  border-radius: 12px;
  color: var(--text-invert);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.subscribe-cta-form button:hover:not(:disabled) { background: var(--accent-color-hover); }
.subscribe-cta-form button:disabled { opacity: 0.6; cursor: not-allowed; }

.subscribe-msg {
  width: 100%;
  text-align: center;
  font-size: 13px;
  margin-top: 8px;
  padding: 8px 16px;
  border-radius: 8px;
}

.subscribe-msg.success { color: var(--success-color); background: var(--success-bg); }
.subscribe-msg.error { color: var(--error-color); background: var(--error-bg); }

@media (max-width: 1024px) {
  .article-layout { grid-template-columns: 1fr; }
  .article-sidebar { display: none; }
}

@media (max-width: 768px) {
  .article-page { padding-top: 20px; }
  .article-title { font-size: 32px; }
  .article-body { padding: 32px 24px; }
  .article-actions { flex-direction: column; gap: 20px; align-items: flex-start; }
  .article-nav { grid-template-columns: 1fr; }
  .guest-inputs { flex-direction: column; }
  .subscribe-cta-card { flex-direction: column; text-align: center; }
  .subscribe-cta-form { flex-direction: column; width: 100%; }
  .subscribe-cta-form input { min-width: 0; width: 100%; }
}
</style>

