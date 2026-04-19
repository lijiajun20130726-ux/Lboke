<template>
  <div class="profile-page">
    <div class="container">
      <header class="page-hero">
        <div class="hero-content">
          <div class="hero-badge">个人中心</div>
          <h1 class="hero-title">管理你的个人资料</h1>
          <p class="hero-subtitle">修改头像、昵称、邮箱，以及更新密码</p>
        </div>
      </header>

      <div class="content-grid">
        <section class="card">
          <div class="card-header">
            <h2 class="card-title">个人资料</h2>
            <button class="btn primary" :disabled="savingProfile" @click="handleSaveProfile">
              {{ savingProfile ? '保存中...' : '保存资料' }}
            </button>
          </div>

          <div class="profile-row">
            <div class="avatar-block">
              <div class="avatar-wrap">
                <img :src="avatarPreview" class="avatar" alt="avatar" />
              </div>
              <div class="avatar-actions">
                <button class="btn" :disabled="uploadingAvatar" @click="triggerAvatarUpload">
                  {{ uploadingAvatar ? '上传中...' : '上传头像' }}
                </button>
                <input
                  ref="avatarFileRef"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleAvatarFileChange"
                />
              </div>
            </div>

            <div class="fields">
              <div class="field">
                <label>用户名</label>
                <input :value="userStore.user?.username || ''" disabled />
              </div>
              <div class="field">
                <label>昵称</label>
                <input v-model="profileForm.nickname" placeholder="请输入昵称" />
              </div>
              <div class="field">
                <label>邮箱</label>
                <input v-model="profileForm.email" placeholder="请输入邮箱" />
              </div>
              <div class="field">
                <label>头像地址</label>
                <input v-model="profileForm.avatar" placeholder="/uploads/xxx.png" />
              </div>
            </div>
          </div>

          <div class="meta-row">
            <div class="meta-item">
              <div class="meta-label">角色</div>
              <div class="meta-value">{{ roleLabel }}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">状态</div>
              <div class="meta-value" :class="statusClass">{{ statusLabel }}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">注册时间</div>
              <div class="meta-value">{{ createdAtLabel }}</div>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card-header">
            <h2 class="card-title">修改密码</h2>
            <button class="btn primary" :disabled="savingPassword" @click="handleChangePassword">
              {{ savingPassword ? '提交中...' : '更新密码' }}
            </button>
          </div>

          <div class="fields two-col">
            <div class="field">
              <label>旧密码</label>
              <input v-model="pwdForm.oldPassword" type="password" autocomplete="current-password" />
            </div>
            <div class="field">
              <label>新密码</label>
              <input v-model="pwdForm.newPassword" type="password" autocomplete="new-password" />
            </div>
            <div class="field">
              <label>确认新密码</label>
              <input v-model="pwdForm.confirmPassword" type="password" autocomplete="new-password" />
            </div>
          </div>

          <div class="tips">
            <div class="tip">建议使用至少 8 位、包含字母与数字的密码</div>
          </div>
        </section>

        <section class="card">
          <div class="card-header">
            <h2 class="card-title">我点赞的文章</h2>
          </div>
          <div class="liked-articles">
            <div v-if="likedArticles.length === 0" class="empty-state">
              暂无点赞文章
            </div>
            <div v-else class="article-list">
              <router-link 
                v-for="article in likedArticles" 
                :key="article.id" 
                :to="`/article/${article.id}`"
                class="article-item"
              >
                <div class="article-cover" v-if="article.cover_image">
                  <img :src="article.cover_image" alt="cover" loading="lazy" />
                </div>
                <div class="article-info">
                  <h3 class="article-title">{{ article.title }}</h3>
                  <div class="article-meta">
                    <span class="meta-date">{{ new Date(article.liked_at).toLocaleDateString() }} 点赞</span>
                    <span class="meta-author" v-if="article.author_name">@{{ article.author_name }}</span>
                  </div>
                </div>
              </router-link>
            </div>
            <div v-if="hasMoreLikes" class="load-more">
              <button class="btn" @click="loadLikedArticles(currentPage + 1)" :disabled="loadingLikes">
                {{ loadingLikes ? '加载中...' : '加载更多' }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { updateProfile, changePassword, getUserLikedArticles } from '@/api/user'
import { uploadImage } from '@/api/upload'

const router = useRouter()
const userStore = useUserStore()

const savingProfile = ref(false)
const uploadingAvatar = ref(false)
const savingPassword = ref(false)
const loadingLikes = ref(false)
const likedArticles = ref<any[]>([])
const currentPage = ref(1)
const hasMoreLikes = ref(false)

const avatarFileRef = ref<HTMLInputElement | null>(null)

const profileForm = ref({
  nickname: '',
  email: '',
  avatar: ''
})

const pwdForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const roleLabel = computed(() => (userStore.user?.role === 'admin' ? '管理员' : '普通用户'))
const statusLabel = computed(() => (userStore.user?.status === 1 ? '启用' : '禁用'))
const statusClass = computed(() => (userStore.user?.status === 1 ? 'ok' : 'bad'))
const createdAtLabel = computed(() => {
  const v: any = (userStore.user as any)?.created_at
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleString('zh-CN')
})

const avatarPreview = computed(() => profileForm.value.avatar || userStore.user?.avatar || '/uploads/default-avatar.jpg')

const syncFormFromStore = () => {
  profileForm.value.nickname = userStore.user?.nickname || ''
  profileForm.value.email = userStore.user?.email || ''
  profileForm.value.avatar = userStore.user?.avatar || ''
}

const ensureLogin = () => {
  if (!userStore.token) {
    router.push('/login')
    return false
  }
  return true
}

const triggerAvatarUpload = () => {
  avatarFileRef.value?.click()
}

const handleAvatarFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!ensureLogin()) return

  uploadingAvatar.value = true
  try {
    const res: any = await uploadImage(file)
    if (res.code === 200) {
      profileForm.value.avatar = res.data.url
    } else {
      alert(res.message || '上传失败')
    }
  } catch (err: any) {
    alert(err?.message || '上传失败')
  } finally {
    uploadingAvatar.value = false
    input.value = ''
  }
}

const handleSaveProfile = async () => {
  if (!ensureLogin()) return
  savingProfile.value = true
  try {
    const payload: any = {
      nickname: profileForm.value.nickname?.trim() || undefined,
      email: profileForm.value.email?.trim() || undefined,
      avatar: profileForm.value.avatar?.trim() || undefined
    }
    const res: any = await updateProfile(payload)
    if (res.code === 200) {
      await userStore.fetchProfile()
      syncFormFromStore()
      alert('资料已更新')
    } else {
      alert(res.message || '更新失败')
    }
  } catch (err: any) {
    alert(err?.message || '更新失败')
  } finally {
    savingProfile.value = false
  }
}

const handleChangePassword = async () => {
  if (!ensureLogin()) return

  const oldPassword = pwdForm.value.oldPassword
  const newPassword = pwdForm.value.newPassword
  const confirmPassword = pwdForm.value.confirmPassword

  if (!oldPassword || !newPassword) {
    alert('请输入旧密码和新密码')
    return
  }
  if (newPassword.length < 6) {
    alert('新密码长度至少 6 位')
    return
  }
  if (newPassword !== confirmPassword) {
    alert('两次输入的新密码不一致')
    return
  }

  savingPassword.value = true
  try {
    const res: any = await changePassword({ oldPassword, newPassword })
    if (res.code === 200) {
      pwdForm.value.oldPassword = ''
      pwdForm.value.newPassword = ''
      pwdForm.value.confirmPassword = ''
      alert('密码已更新')
    } else {
      alert(res.message || '更新失败')
    }
  } catch (err: any) {
    alert(err?.message || '更新失败')
  } finally {
    savingPassword.value = false
  }
}

const loadLikedArticles = async (page = 1) => {
  if (!ensureLogin()) return
  loadingLikes.value = true
  try {
    const res: any = await getUserLikedArticles({ page, pageSize: 10 })
    if (res.code === 200) {
      if (page === 1) {
        likedArticles.value = res.data.list
      } else {
        likedArticles.value = [...likedArticles.value, ...res.data.list]
      }
      currentPage.value = page
      hasMoreLikes.value = res.data.pagination.page < res.data.pagination.totalPages
    }
  } catch (err) {
    console.error('Failed to load liked articles', err)
  } finally {
    loadingLikes.value = false
  }
}

onMounted(async () => {
  if (!ensureLogin()) return
  await userStore.fetchProfile()
  syncFormFromStore()
  loadLikedArticles()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 60px 0 100px;
  background: var(--bg-hero);
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-hero {
  text-align: center;
  margin-bottom: 36px;
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid var(--border-color);
  background: var(--bg-glass-strong);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.hero-content {
  padding: 48px 24px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  color: var(--accent-color);
  background: rgba(0, 113, 227, 0.08);
  border: 1px solid rgba(0, 113, 227, 0.18);
  font-weight: 700;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 34px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin: 0 0 10px;
}

.hero-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 16px;
}

.content-grid {
  display: grid;
  gap: 20px;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 18px 12px;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
}

.btn {
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
  transform: none;
  box-shadow: none;
}

.btn.primary {
  background: var(--accent-gradient);
  border: 1px solid rgba(0, 113, 227, 0.25);
  color: var(--text-invert);
}

.profile-row {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 18px;
  padding: 18px;
}

.avatar-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.avatar-wrap {
  width: 132px;
  height: 132px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  background: var(--bg-card);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  width: 100%;
  display: flex;
  justify-content: center;
}

.fields {
  display: grid;
  gap: 12px;
}

.fields.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-secondary);
}

.field input {
  height: 42px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 0 12px;
  background: var(--bg-input);
  color: var(--text-primary);
  outline: none;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.field input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.12);
}

.field input:disabled {
  background: var(--bg-surface-muted);
  color: var(--text-secondary);
}

.meta-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 0 18px 18px;
}

.meta-item {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-surface-muted);
  padding: 12px;
}

.meta-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 700;
  margin-bottom: 6px;
}

.meta-value {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
}

.meta-value.ok {
  color: var(--success-color);
}

.meta-value.bad {
  color: var(--error-color);
}

.tips {
  padding: 0 18px 18px;
}

.tip {
  font-size: 13px;
  color: var(--text-secondary);
}

.liked-articles {
  padding: 18px;
}

.article-list {
  display: grid;
  gap: 16px;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  text-decoration: none;
  transition: all 0.2s;
}

.article-item:hover {
  background: var(--bg-surface-muted);
  border-color: var(--accent-color);
}

.article-cover {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-info {
  flex: 1;
  min-width: 0;
}

.article-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 14px;
}

.load-more {
  margin-top: 16px;
  text-align: center;
}

@media (max-width: 860px) {
  .profile-row {
    grid-template-columns: 1fr;
  }

  .fields.two-col {
    grid-template-columns: 1fr;
  }

  .meta-row {
    grid-template-columns: 1fr;
  }
}
</style>
