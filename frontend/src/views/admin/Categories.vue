<template>
  <div class="categories">
    <div class="header"><h2>分类管理</h2><button class="btn-primary" @click="showModal = true">添加分类</button></div>
    <table>
      <thead><tr><th>名称</th><th>描述</th><th>文章数</th><th>排序</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="cat in categories" :key="cat.id">
          <td>{{ cat.name }}</td>
          <td>{{ cat.description || '-' }}</td>
          <td>{{ cat.article_count || 0 }}</td>
          <td>{{ cat.sort_order }}</td>
          <td class="actions">
            <button @click="editCategory(cat)">编辑</button>
            <button @click="handleDelete(cat.id)" class="danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <h3>{{ editId ? '编辑分类' : '添加分类' }}</h3>
        <div class="form-item"><label>名称</label><input v-model="form.name" /></div>
        <div class="form-item"><label>描述</label><input v-model="form.description" /></div>
        <div class="form-item"><label>排序</label><input v-model.number="form.sort_order" type="number" /></div>
        <div class="modal-actions">
          <button @click="closeModal">取消</button>
          <button @click="handleSubmit" class="primary">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCategories } from '@/api/front'
import { getCategory, createCategory, updateCategory, deleteCategory } from '@/api/category'

const categories = ref<any[]>([])
const showModal = ref(false)
const editId = ref<number | null>(null)
const form = ref({ name: '', description: '', sort_order: 0 })

const loadCategories = async () => {
  const res: any = await getCategories(true)
  if (res.code === 200) categories.value = res.data
}

const editCategory = (cat: any) => {
  editId.value = cat.id
  form.value = { name: cat.name, description: cat.description || '', sort_order: cat.sort_order }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editId.value = null
  form.value = { name: '', description: '', sort_order: 0 }
}

const handleSubmit = async () => {
  if (editId.value) {
    await updateCategory(editId.value, form.value)
  } else {
    await createCategory(form.value)
  }
  closeModal()
  loadCategories()
}

const handleDelete = async (id: number) => {
  if (confirm('确定删除此分类？')) { await deleteCategory(id); loadCategories() }
}

onMounted(loadCategories)
</script>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-primary { background: #1890ff; color: #fff; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
table { width: 100%; background: #fff; border-collapse: collapse; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #eee; }
th { background: #fafafa; }
.actions button { padding: 4px 8px; margin-right: 8px; font-size: 12px; border: none; background: #f0f0f0; border-radius: 4px; cursor: pointer; }
.actions button.danger { color: #ff4d4f; }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; padding: 24px; border-radius: 8px; width: 400px; }
.modal-content h3 { margin-bottom: 20px; }
.form-item { margin-bottom: 16px; }
.form-item label { display: block; margin-bottom: 8px; }
.form-item input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
.modal-actions button { padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.modal-actions button.primary { background: #1890ff; color: #fff; border: none; }
.modal-actions button:not(.primary) { background: #fff; border: 1px solid #ddd; }
</style>
