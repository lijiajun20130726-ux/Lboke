<template>
  <div class="subscriptions-admin">
    <div class="page-header">
      <div class="header-left">
        <h2>订阅管理</h2>
        <p class="subtitle">管理邮件订阅用户</p>
      </div>
      <div class="header-actions">
        <button @click="exportList" class="export-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          导出列表
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon total">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">总订阅数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.active }}</span>
          <span class="stat-label">活跃订阅</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon unsub">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.unsubscribed }}</span>
          <span class="stat-label">已退订</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon today">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.today }}</span>
          <span class="stat-label">今日新增</span>
        </div>
      </div>
    </div>

    <!-- Filter & Search -->
    <div class="filter-bar">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="searchKeyword" placeholder="搜索邮箱..." @input="handleSearch" />
      </div>
      <select v-model="filterStatus" @change="fetchSubscriptions" class="status-filter">
        <option value="">全部状态</option>
        <option value="1">订阅中</option>
        <option value="0">已退订</option>
      </select>
    </div>

    <!-- Table -->
    <div class="admin-card">
      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="50">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
              </th>
              <th>邮箱地址</th>
              <th width="100">状态</th>
              <th width="140">IP地址</th>
              <th width="180">订阅时间</th>
              <th width="100" class="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in subscriptions" :key="item.id">
              <td>
                <input type="checkbox" v-model="selectedIds" :value="item.id" />
              </td>
              <td class="email-col">{{ item.email }}</td>
              <td>
                <span :class="['status-badge', item.status ? 'active' : 'inactive']">
                  {{ item.status ? '订阅中' : '已退订' }}
                </span>
              </td>
              <td class="ip-col">{{ item.ip || '-' }}</td>
              <td class="date-col">{{ formatDate(item.created_at) }}</td>
              <td class="text-right">
                <button @click="handleDelete(item.id)" class="icon-btn delete" title="删除">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="subscriptions.length === 0">
              <td colspan="6" class="empty-row">暂无订阅数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Batch Actions & Pagination -->
      <div class="table-footer">
        <div class="batch-actions" v-if="selectedIds.length > 0">
          <span class="selected-count">已选 {{ selectedIds.length }} 项</span>
          <button @click="batchDelete" class="batch-delete-btn">批量删除</button>
        </div>
        <div class="pagination" v-if="total > pageSize">
          <button @click="changePage(page - 1)" :disabled="page === 1">上一页</button>
          <span class="page-info">{{ page }} / {{ Math.ceil(total / pageSize) }}</span>
          <button @click="changePage(page + 1)" :disabled="page >= Math.ceil(total / pageSize)">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  getSubscriptions, 
  getSubscriptionStats, 
  deleteSubscription, 
  batchDeleteSubscriptions,
  exportSubscriptions 
} from '@/api/subscription'

interface Subscription {
  id: number
  email: string
  status: number
  ip: string
  created_at: string
}

const subscriptions = ref<Subscription[]>([])
const stats = ref({ total: 0, active: 0, unsubscribed: 0, today: 0 })
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchKeyword = ref('')
const filterStatus = ref('')
const selectedIds = ref<number[]>([])

const selectAll = computed({
  get: () => selectedIds.value.length === subscriptions.value.length && subscriptions.value.length > 0,
  set: () => {}
})

const fetchSubscriptions = async () => {
  const res: any = await getSubscriptions({
    page: page.value,
    limit: pageSize.value,
    status: filterStatus.value || undefined,
    keyword: searchKeyword.value || undefined
  })
  if (res.code === 200) {
    subscriptions.value = res.data.list
    total.value = res.data.total
  }
}

const fetchStats = async () => {
  const res: any = await getSubscriptionStats()
  if (res.code === 200) {
    stats.value = res.data
  }
}

const handleSearch = () => {
  page.value = 1
  fetchSubscriptions()
}

const changePage = (newPage: number) => {
  page.value = newPage
  fetchSubscriptions()
}

const toggleSelectAll = () => {
  if (selectedIds.value.length === subscriptions.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = subscriptions.value.map(s => s.id)
  }
}

const handleDelete = async (id: number) => {
  if (confirm('确定要删除这条订阅记录吗？')) {
    await deleteSubscription(id)
    fetchSubscriptions()
    fetchStats()
  }
}

const batchDelete = async () => {
  if (confirm(`确定要删除选中的 ${selectedIds.value.length} 条记录吗？`)) {
    await batchDeleteSubscriptions(selectedIds.value)
    selectedIds.value = []
    fetchSubscriptions()
    fetchStats()
  }
}

const exportList = async () => {
  const res: any = await exportSubscriptions(filterStatus.value ? parseInt(filterStatus.value) : undefined)
  if (res.code === 200) {
    const emails = res.data.map((s: any) => s.email).join('\n')
    const blob = new Blob([emails], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscriptions_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchSubscriptions()
  fetchStats()
})
</script>

<style scoped>
.subscriptions-admin { padding: 32px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-left h2 { font-size: 28px; font-weight: 800; color: #1d1d1f; margin-bottom: 4px; }
.subtitle { color: #86868b; font-size: 14px; }

.export-btn {
  background: #fff;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #1d1d1f;
}

.export-btn:hover { border-color: #1d1d1f; }

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #f0f0f2;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total { background: rgba(0, 113, 227, 0.1); color: #0071e3; }
.stat-icon.active { background: rgba(52, 199, 89, 0.1); color: #34c759; }
.stat-icon.unsub { background: rgba(255, 59, 48, 0.1); color: #ff3b30; }
.stat-icon.today { background: rgba(255, 149, 0, 0.1); color: #ff9500; }

.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 28px; font-weight: 800; color: #1d1d1f; }
.stat-label { font-size: 13px; color: #86868b; font-weight: 500; }

/* Filter */
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 16px;
  flex: 1;
  max-width: 400px;
}

.search-box svg { color: #86868b; }

.search-box input {
  border: none;
  outline: none;
  padding: 12px 0;
  font-size: 14px;
  width: 100%;
}

.status-filter {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #fff;
  cursor: pointer;
}

/* Table */
.admin-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #f0f0f2;
  overflow: hidden;
}

.table-wrapper { overflow-x: auto; }

.modern-table { width: 100%; border-collapse: collapse; }

.modern-table th {
  background: #f9f9fb;
  padding: 14px 20px;
  font-size: 12px;
  font-weight: 700;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  border-bottom: 1px solid #f0f0f2;
}

.modern-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f9f9fb;
  font-size: 14px;
  color: #1d1d1f;
}

.email-col { font-weight: 600; }
.ip-col { font-family: 'SF Mono', monospace; font-size: 13px; color: #86868b; }
.date-col { color: #86868b; font-size: 13px; }

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.active { background: rgba(52, 199, 89, 0.1); color: #34c759; }
.status-badge.inactive { background: #f5f5f7; color: #86868b; }

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

.icon-btn.delete:hover { background: #ff3b30; color: #fff; border-color: #ff3b30; }

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f2;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selected-count { font-size: 14px; color: #86868b; }

.batch-delete-btn {
  background: #ff3b30;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { font-size: 13px; color: #86868b; }

.text-right { text-align: right; }
.empty-row { text-align: center; padding: 48px; color: #b5b5b8; }

@media (max-width: 992px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .stats-row { grid-template-columns: 1fr; }
  .filter-bar { flex-direction: column; }
  .search-box { max-width: none; }
}
</style>
