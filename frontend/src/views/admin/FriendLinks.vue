<template>
  <div class="friendlinks-admin">
    <div class="page-header">
      <div class="header-left">
        <h2>友链管理</h2>
        <p class="subtitle">管理网站的友情链接</p>
      </div>
      <button @click="openDialog()" class="add-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        添加友链
      </button>
    </div>

    <div class="filter-tabs">
      <button
        type="button"
        :class="['filter-btn', statusFilter === 'all' ? 'active' : '']"
        @click="setStatusFilter('all')"
      >
        全部
      </button>
      <button
        type="button"
        :class="['filter-btn', statusFilter === 0 ? 'active' : '']"
        @click="setStatusFilter(0)"
      >
        待审核
      </button>
      <button
        type="button"
        :class="['filter-btn', statusFilter === 1 ? 'active' : '']"
        @click="setStatusFilter(1)"
      >
        已通过
      </button>
    </div>

    <div class="admin-card">
      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="60">ID</th>
              <th width="80">Logo</th>
              <th>网站名称</th>
              <th>网站地址</th>
              <th width="100">状态</th>
              <th width="100">排序</th>
              <th width="160">创建时间</th>
              <th width="120" class="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in friendLinks" :key="item.id">
              <td class="id-col">{{ item.id }}</td>
              <td>
                <div class="logo-preview">
                  <img v-if="item.logo" :src="item.logo" :alt="item.name" />
                  <div v-else class="logo-placeholder">{{ item.name.charAt(0) }}</div>
                </div>
              </td>
              <td>
                <div class="name-cell">
                  <span class="main-name">{{ item.name }}</span>
                  <span v-if="item.description" class="sub-desc">{{ item.description }}</span>
                </div>
              </td>
              <td>
                <a :href="item.url" target="_blank" class="url-link">{{ item.url }}</a>
              </td>
              <td>
                <button 
                  @click="toggleStatus(item)" 
                  :class="['status-toggle', item.status ? 'active' : 'inactive']"
                >
                  {{ item.status ? '已通过' : '待审核' }}
                </button>
              </td>
              <td>
                <input 
                  type="number" 
                  v-model.number="item.sort_order" 
                  @change="updateSort(item)"
                  class="sort-input"
                />
              </td>
              <td class="date-col">{{ formatDate(item.created_at) }}</td>
              <td class="text-right">
                <div class="actions">
                  <button
                    v-if="item.status === 0"
                    @click="approveLink(item)"
                    class="icon-btn approve"
                    title="通过"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </button>
                  <button @click="openDialog(item)" class="icon-btn edit" title="编辑">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button @click="handleDelete(item.id)" class="icon-btn delete" title="删除">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="friendLinks.length === 0">
              <td colspan="8" class="empty-row">暂无友链数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Dialog -->
    <div v-if="dialogVisible" class="dialog-overlay" @click.self="dialogVisible = false">
      <div class="dialog-card">
        <div class="dialog-header">
          <h3>{{ editingId ? '编辑友链' : '添加友链' }}</h3>
          <button @click="dialogVisible = false" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveFriendLink" class="dialog-form">
          <div class="form-group">
            <label>网站名称 <span class="required">*</span></label>
            <input v-model="form.name" placeholder="输入网站名称" required />
          </div>
          <div class="form-group">
            <label>网站地址 <span class="required">*</span></label>
            <input v-model="form.url" type="url" placeholder="https://example.com" required />
          </div>
          <div class="form-group">
            <label>网站 Logo</label>
            <input v-model="form.logo" placeholder="https://example.com/logo.png" />
          </div>
          <div class="form-group">
            <label>网站描述</label>
            <textarea v-model="form.description" placeholder="简短描述这个网站..." rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>排序权重</label>
            <input type="number" v-model.number="form.sort_order" placeholder="数字越大越靠前" />
          </div>
          <div class="dialog-footer">
            <button type="button" @click="dialogVisible = false" class="cancel-btn">取消</button>
            <button type="submit" class="save-btn" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  getFriendLinks, 
  createFriendLink, 
  updateFriendLink, 
  deleteFriendLink 
} from '@/api/friendlink'

interface FriendLink {
  id: number
  name: string
  url: string
  logo?: string
  description?: string
  status: number
  sort_order: number
  created_at: string
}

const friendLinks = ref<FriendLink[]>([])
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const statusFilter = ref<'all' | 0 | 1>('all')

const form = ref({
  name: '',
  url: '',
  logo: '',
  description: '',
  sort_order: 0
})

const fetchFriendLinks = async () => {
  const params = statusFilter.value === 'all' ? undefined : { status: statusFilter.value }
  const res: any = await getFriendLinks(params)
  if (res.code === 200) {
    friendLinks.value = res.data.list
  }
}

const openDialog = (item?: FriendLink) => {
  if (item) {
    editingId.value = item.id
    form.value = {
      name: item.name,
      url: item.url,
      logo: item.logo || '',
      description: item.description || '',
      sort_order: item.sort_order
    }
  } else {
    editingId.value = null
    form.value = { name: '', url: '', logo: '', description: '', sort_order: 0 }
  }
  dialogVisible.value = true
}

const saveFriendLink = async () => {
  saving.value = true
  try {
    const data = {
      ...form.value,
      logo: form.value.logo || undefined,
      description: form.value.description || undefined
    }
    
    if (editingId.value) {
      await updateFriendLink(editingId.value, data)
    } else {
      await createFriendLink(data)
    }
    dialogVisible.value = false
    fetchFriendLinks()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (item: FriendLink) => {
  const newStatus = item.status ? 0 : 1
  await updateFriendLink(item.id, { status: newStatus })
  fetchFriendLinks()
}

const approveLink = async (item: FriendLink) => {
  if (item.status === 1) {
    return
  }
  await updateFriendLink(item.id, { status: 1 })
  fetchFriendLinks()
}

const setStatusFilter = (value: 'all' | 0 | 1) => {
  statusFilter.value = value
  fetchFriendLinks()
}

const updateSort = async (item: FriendLink) => {
  await updateFriendLink(item.id, { sort_order: item.sort_order })
  fetchFriendLinks()
}

const handleDelete = async (id: number) => {
  if (confirm('确定要删除这条友链吗？')) {
    await deleteFriendLink(id)
    fetchFriendLinks()
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(fetchFriendLinks)
</script>

<style scoped>
.friendlinks-admin { padding: 32px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-left h2 { 
  font-size: 28px; 
  font-weight: 800; 
  color: #1d1d1f; 
  margin-bottom: 4px; 
}

.subtitle { color: #86868b; font-size: 14px; }

.add-btn {
  background: #1d1d1f;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover { background: #000; transform: translateY(-1px); }

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-btn {
  background: #f5f5f7;
  color: #1d1d1f;
  border: 1px solid #f0f0f2;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #1d1d1f;
  color: #fff;
  border-color: #1d1d1f;
}

.admin-card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #f0f0f2;
  overflow: hidden;
}

.table-wrapper { width: 100%; overflow-x: auto; }

.modern-table { width: 100%; border-collapse: collapse; text-align: left; }

.modern-table th { 
  background: #f9f9fb; 
  padding: 16px 20px; 
  font-size: 12px; 
  font-weight: 700; 
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f0f0f2;
}

.modern-table td { 
  padding: 16px 20px; 
  border-bottom: 1px solid #f9f9fb; 
  font-size: 14px; 
  color: #1d1d1f; 
}

.id-col { 
  color: #86868b; 
  font-family: 'SF Mono', monospace; 
  font-weight: 600; 
}

.logo-preview {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  background: #f5f5f7;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
}

.name-cell { display: flex; flex-direction: column; gap: 2px; }
.main-name { font-weight: 600; }
.sub-desc { font-size: 12px; color: #86868b; }

.url-link {
  color: #0071e3;
  text-decoration: none;
  font-size: 13px;
  max-width: 200px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.url-link:hover { text-decoration: underline; }

.status-toggle {
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.status-toggle.active { background: rgba(52, 199, 89, 0.1); color: #34c759; }
.status-toggle.inactive { background: #f5f5f7; color: #86868b; }

.sort-input {
  width: 60px;
  padding: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  text-align: center;
  outline: none;
}

.sort-input:focus { border-color: #0071e3; }

.date-col { color: #86868b; font-size: 13px; }

.actions { display: flex; gap: 8px; justify-content: flex-end; }

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #f0f0f2;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #86868b;
}

.icon-btn:hover { border-color: #1d1d1f; color: #1d1d1f; }
.icon-btn.delete:hover { background: #ff3b30; color: #fff; border-color: #ff3b30; }
.icon-btn.approve:hover { background: #34c759; color: #fff; border-color: #34c759; }

/* Dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog-card {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dialog-header h3 { font-size: 20px; font-weight: 700; }

.close-btn { 
  background: none; 
  border: none; 
  font-size: 28px; 
  cursor: pointer; 
  color: #86868b;
  line-height: 1;
}

.dialog-form { display: flex; flex-direction: column; gap: 20px; }

.form-group { display: flex; flex-direction: column; gap: 8px; }

.form-group label { 
  font-size: 13px; 
  font-weight: 600; 
  color: #1d1d1f; 
}

.required { color: #ff3b30; }

.form-group input, 
.form-group textarea {
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #0071e3;
}

.dialog-footer { 
  display: flex; 
  gap: 12px; 
  margin-top: 8px; 
}

.dialog-footer button { 
  flex: 1; 
  padding: 14px; 
  border-radius: 12px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: all 0.2s;
  font-size: 14px;
}

.cancel-btn { 
  background: #f5f5f7; 
  border: none; 
  color: #1d1d1f; 
}

.cancel-btn:hover { background: #e8e8ed; }

.save-btn { 
  background: #0071e3; 
  border: none; 
  color: #fff; 
}

.save-btn:hover { background: #0077ed; }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.text-right { text-align: right; }
.empty-row { text-align: center; padding: 48px; color: #b5b5b8; }
</style>
