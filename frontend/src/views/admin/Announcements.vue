<template>
  <div class="announcements-admin">
    <div class="page-header">
      <div class="header-left">
        <h2>公告管理</h2>
        <p class="subtitle">管理全站顶部的通知公告</p>
      </div>
      <button @click="openDialog()" class="add-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新建公告
      </button>
    </div>

    <div class="admin-card">
      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="60">ID</th>
              <th>标题</th>
              <th width="100">类型</th>
              <th width="100">状态</th>
              <th width="120">排序</th>
              <th width="180">创建时间</th>
              <th width="120" class="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in announcements" :key="item.id">
              <td class="id-col">{{ item.id }}</td>
              <td>
                <div class="title-cell">
                  <span class="main-title">{{ item.title }}</span>
                  <span v-if="item.content" class="sub-content">{{ item.content }}</span>
                </div>
              </td>
              <td>
                <span :class="['type-tag', `is-${item.type}`]">{{ item.type }}</span>
              </td>
              <td>
                <button 
                  @click="toggleStatus(item)" 
                  :class="['status-toggle', item.status ? 'active' : 'inactive']"
                >
                  {{ item.status ? '展示中' : '已下线' }}
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
                  <button @click="openDialog(item)" class="icon-btn edit" title="编辑">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button @click="handleDelete(item.id)" class="icon-btn delete" title="删除">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="announcements.length === 0">
              <td colspan="7" class="empty-row">暂无公告数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Dialog -->
    <div v-if="dialogVisible" class="dialog-overlay">
      <div class="dialog-card">
        <div class="dialog-header">
          <h3>{{ editingId ? '编辑公告' : '新建公告' }}</h3>
          <button @click="dialogVisible = false" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveAnnouncement" class="dialog-form">
          <div class="form-group">
            <label>公告标题</label>
            <input v-model="form.title" placeholder="输入引人注目的标题" required />
          </div>
          <div class="form-group">
            <label>详细内容 (可选)</label>
            <textarea v-model="form.content" placeholder="公告的详细描述..." rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>类型</label>
              <select v-model="form.type">
                <option value="info">信息 (蓝色)</option>
                <option value="warning">警告 (橙色)</option>
                <option value="success">成功 (绿色)</option>
                <option value="error">错误 (红色)</option>
              </select>
            </div>
            <div class="form-group">
              <label>排序</label>
              <input type="number" v-model.number="form.sort_order" />
            </div>
          </div>
          <div class="form-group">
            <label>跳转链接 (可选)</label>
            <input v-model="form.link" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label>按钮文本</label>
            <input v-model="form.link_text" placeholder="了解更多" />
          </div>
          <div class="dialog-footer">
            <button type="button" @click="dialogVisible = false" class="cancel-btn">取消</button>
            <button type="submit" class="save-btn" :disabled="saving">
              {{ saving ? '保存中...' : '保存修改' }}
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
  getAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} from '@/api/announcement'

const announcements = ref<any[]>([])
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const form = ref({
  title: '',
  content: '',
  type: 'info' as const,
  link: '',
  link_text: '了解更多',
  sort_order: 0
})

const fetchAnnouncements = async () => {
  const res: any = await getAnnouncements()
  if (res.code === 200) announcements.value = res.data.list
}

const openDialog = (item?: any) => {
  if (item) {
    editingId.value = item.id
    form.value = {
      title: item.title ?? '',
      content: item.content ?? '',
      type: item.type ?? 'info',
      link: item.link ?? '',
      link_text: item.link_text ?? '了解更多',
      sort_order: item.sort_order ?? 0
    }
  } else {
    editingId.value = null
    form.value = { title: '', content: '', type: 'info', link: '', link_text: '了解更多', sort_order: 0 }
  }
  dialogVisible.value = true
}

const saveAnnouncement = async () => {
  saving.value = true
  try {
    const payload = {
      title: form.value.title,
      content: form.value.content?.trim() ? form.value.content : null,
      type: form.value.type,
      link: form.value.link?.trim() ? form.value.link.trim() : null,
      link_text: form.value.link_text?.trim() ? form.value.link_text.trim() : null,
      sort_order: form.value.sort_order ?? 0
    }
    if (editingId.value) {
      await updateAnnouncement(editingId.value, payload)
    } else {
      await createAnnouncement(payload)
    }
    dialogVisible.value = false
    fetchAnnouncements()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (item: any) => {
  const newStatus = item.status ? 0 : 1
  await updateAnnouncement(item.id, { status: newStatus })
  fetchAnnouncements()
}

const updateSort = async (item: any) => {
  await updateAnnouncement(item.id, { sort_order: item.sort_order })
  fetchAnnouncements()
}

const handleDelete = async (id: number) => {
  if (confirm('确定要删除这条公告吗？')) {
    await deleteAnnouncement(id)
    fetchAnnouncements()
  }
}

const formatDate = (date: string) => new Date(date).toLocaleString()

onMounted(fetchAnnouncements)
</script>

<style scoped>
.announcements-admin { padding: 32px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-left h2 { font-size: 28px; font-weight: 800; color: #1d1d1f; margin-bottom: 4px; }
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
  padding: 16px 24px; 
  font-size: 13px; 
  font-weight: 700; 
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f0f0f2;
}

.modern-table td { padding: 20px 24px; border-bottom: 1px solid #f9f9fb; font-size: 14px; color: #1d1d1f; }

.id-col { color: #86868b; font-family: 'SF Mono', monospace; font-weight: 600; }

.title-cell { display: flex; flex-direction: column; gap: 4px; }
.main-title { font-weight: 700; }
.sub-content { font-size: 12px; color: #86868b; }

.type-tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.type-tag.is-info { background: #e1f0ff; color: #0071e3; }
.type-tag.is-warning { background: #fff4e5; color: #f5a623; }
.type-tag.is-success { background: #e6f9ef; color: #34c759; }
.type-tag.is-error { background: #fff1f0; color: #ff3b30; }

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
  max-width: 500px;
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

.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #86868b; }

.dialog-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 13px; font-weight: 700; color: #1d1d1f; }
.form-group input, .form-group textarea, .form-group select {
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 14px;
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.dialog-footer { display: flex; gap: 12px; margin-top: 12px; }
.dialog-footer button { flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.cancel-btn { background: #f5f5f7; border: none; color: #1d1d1f; }
.save-btn { background: #0071e3; border: none; color: #fff; }
.save-btn:disabled { opacity: 0.5; }

.text-right { text-align: right; }
.empty-row { text-align: center; padding: 48px; color: #b5b5b8; }
</style>
