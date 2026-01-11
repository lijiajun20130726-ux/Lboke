<template>
  <div class="users-container">
    <div class="header">
      <h2>用户管理</h2>
      <div class="search-bar">
        <input v-model="queryParams.keyword" placeholder="搜索用户名/昵称/邮箱" @keyup.enter="handleSearch" />
        <button @click="handleSearch">搜索</button>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>昵称</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>注册时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>
              <img :src="user.avatar || '/uploads/default-avatar.jpg'" class="table-avatar" />
              {{ user.username }}
            </td>
            <td>{{ user.nickname }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['role-tag', user.role]">{{ user.role === 'admin' ? '管理员' : '普通用户' }}</span>
            </td>
            <td>
              <span :class="['status-tag', user.status === 1 ? 'active' : 'disabled']">
                {{ user.status === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button :disabled="queryParams.page === 1" @click="changePage(queryParams.page - 1)">上一页</button>
      <span>第 {{ queryParams.page }} 页 / 共 {{ Math.ceil(total / queryParams.pageSize) }} 页</span>
      <button :disabled="queryParams.page * queryParams.pageSize >= total" @click="changePage(queryParams.page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserList } from '@/api/user'

const users = ref<any[]>([])
const total = ref(0)
const queryParams = ref({
  page: 1,
  pageSize: 10,
  keyword: ''
})

const loadUsers = async () => {
  try {
    const res: any = await getUserList(queryParams.value)
    if (res.code === 200) {
      users.value = res.data.list
      total.value = res.data.total
    }
  } catch (err) {
    console.error('加载用户列表失败', err)
  }
}

const handleSearch = () => {
  queryParams.value.page = 1
  loadUsers()
}

const changePage = (page: number) => {
  queryParams.value.page = page
  loadUsers()
}

const formatDate = (date: string) => new Date(date).toLocaleString()

onMounted(loadUsers)
</script>

<style scoped>
.users-container { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.search-bar { display: flex; gap: 10px; }
.search-bar input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; width: 250px; }
.search-bar button { padding: 8px 16px; background: #1890ff; color: #fff; border: none; border-radius: 4px; cursor: pointer; }

.table-container { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
.table-avatar { width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 8px; object-fit: cover; }
th { background: #fafafa; font-weight: 600; color: #333; }

.role-tag, .status-tag { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.role-tag.admin { background: #fff7e6; color: #fa8c16; border: 1px solid #ffd591; }
.role-tag.user { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }

.status-tag.active { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.status-tag.disabled { background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }

.pagination { margin-top: 20px; display: flex; justify-content: center; align-items: center; gap: 20px; }
.pagination button { padding: 6px 12px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px; }
.pagination button:disabled { cursor: not-allowed; color: #ccc; }
</style>
