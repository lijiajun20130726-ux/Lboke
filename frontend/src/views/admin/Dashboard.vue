<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h2 class="page-title">仪表盘</h2>
        <p class="page-subtitle">{{ greeting }}，管理员李嘉骏！欢迎回来查看您的博客数据概览</p>
      </div>
    </div>

    <div class="stat-cards">
      <div class="stat-card articles">
        <div class="stat-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.articles }}</div>
          <div class="stat-label">文章总数</div>
        </div>
      </div>

      <div class="stat-card categories">
        <div class="stat-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.categories }}</div>
          <div class="stat-label">分类数量</div>
        </div>
      </div>

      <div class="stat-card tags">
        <div class="stat-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.tags }}</div>
          <div class="stat-label">标签数量</div>
        </div>
      </div>

      <div class="stat-card views">
        <div class="stat-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.views }}</div>
          <div class="stat-label">总访问量</div>
        </div>
      </div>
    </div>

    <div class="recent-section">
      <div class="section-header">
        <h3 class="section-title">最新文章</h3>
        <router-link to="/admin/articles" class="view-all">查看全部 →</router-link>
      </div>
      <div class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>状态</th>
              <th>浏览量</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in articles" :key="article.id">
              <td class="title-cell">{{ article.title }}</td>
              <td>
                <span :class="['status-badge', article.status]">
                  {{ article.status === 'published' ? '已发布' : '草稿' }}
                </span>
              </td>
              <td class="number-cell">{{ article.view_count }}</td>
              <td class="date-cell">{{ formatDate(article.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getStatistics, getLatestArticles } from '@/api/front'

const stats = ref({ articles: 0, categories: 0, tags: 0, views: 0 })
const articles = ref<any[]>([])

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return '早上好'
  if (hour >= 12 && hour < 14) return '中午好'
  if (hour >= 14 && hour < 18) return '下午好'
  return '晚上好'
})

const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() : ''

onMounted(async () => {
  const [statsRes, artRes]: any[] = await Promise.all([getStatistics(), getLatestArticles(5)])
  if (statsRes.code === 200) stats.value = statsRes.data
  if (artRes.code === 200) articles.value = artRes.data
})
</script>

<style scoped>
.dashboard {
  padding: 32px;
}

.dashboard-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 15px;
  color: #64748b;
  font-weight: 400;
}

/* Stat Cards with Glassmorphism */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.3s;
}

.stat-card.articles::before { background: linear-gradient(90deg, #3b82f6, #2563eb); }
.stat-card.categories::before { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }
.stat-card.tags::before { background: linear-gradient(90deg, #ec4899, #db2777); }
.stat-card.views::before { background: linear-gradient(90deg, #10b981, #059669); }

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}

.stat-card.articles .stat-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
  color: #3b82f6;
}

.stat-card.categories .stat-icon {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05));
  color: #8b5cf6;
}

.stat-card.tags .stat-icon {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.05));
  color: #ec4899;
}

.stat-card.views .stat-icon {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  color: #10b981;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 8px;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Recent Section */
.recent-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.view-all {
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
  text-decoration: none;
  transition: all 0.2s;
}

.view-all:hover {
  color: #2563eb;
  transform: translateX(2px);
}

/* Modern Table */
.table-container {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.modern-table thead tr {
  background: rgba(248, 250, 252, 0.8);
}

.modern-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
}

.modern-table tbody tr {
  transition: all 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.modern-table tbody tr:hover {
  background: rgba(59, 130, 246, 0.02);
}

.modern-table td {
  padding: 16px;
  font-size: 14px;
  color: #334155;
}

.title-cell {
  font-weight: 600;
  color: #0f172a;
}

.number-cell {
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  font-weight: 600;
  color: #64748b;
}

.date-cell {
  color: #94a3b8;
  font-size: 13px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.status-badge.published {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-badge.draft {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(249, 115, 22, 0.05));
  color: #ea580c;
  border: 1px solid rgba(251, 146, 60, 0.2);
}

@media (max-width: 768px) {
  .dashboard {
    padding: 20px;
  }
  
  .stat-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>
