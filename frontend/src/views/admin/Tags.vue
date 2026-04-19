<template>
  <div class="tags">
    <div class="header"><h2>标签管理</h2><button class="btn-primary" @click="showModal = true">添加标签</button></div>
    <div class="tag-list">
      <div v-for="tag in tags" :key="tag.id" class="tag-item">
        <span class="name">{{ tag.name }}</span>
        <span class="count">{{ tag.article_count || 0 }} 篇文章</span>
        <div class="actions">
          <button @click="editTag(tag)">编辑</button>
          <button @click="handleDelete(tag.id)" class="danger">删除</button>
        </div>
      </div>
    </div>
    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <h3>{{ editId ? '编辑标签' : '添加标签' }}</h3>
        <div class="form-item"><label>名称</label><input v-model="form.name" /></div>
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
import { getTags } from '@/api/front'
import { createTag, updateTag, deleteTag } from '@/api/tag'

const tags = ref<any[]>([])
const showModal = ref(false)
const editId = ref<number | null>(null)
const form = ref({ name: '' })

const loadTags = async () => {
  const res: any = await getTags(true)
  if (res.code === 200) tags.value = res.data
}

const editTag = (tag: any) => { editId.value = tag.id; form.value = { name: tag.name }; showModal.value = true }

const closeModal = () => { showModal.value = false; editId.value = null; form.value = { name: '' } }

const handleSubmit = async () => {
  if (editId.value) { await updateTag(editId.value, form.value) }
  else { await createTag(form.value) }
  closeModal(); loadTags()
}

const handleDelete = async (id: number) => { if (confirm('确定删除？')) { await deleteTag(id); loadTags() } }

onMounted(loadTags)
</script>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-primary { background: #1890ff; color: #fff; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
.tag-list { display: flex; flex-wrap: wrap; gap: 12px; }
.tag-item { background: #fff; padding: 12px 16px; border-radius: 8px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.tag-item .name { font-weight: 500; }
.tag-item .count { color: #999; font-size: 12px; }
.tag-item .actions button { padding: 4px 8px; font-size: 12px; border: none; background: #f0f0f0; border-radius: 4px; cursor: pointer; margin-left: 4px; }
.tag-item .actions button.danger { color: #ff4d4f; }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; padding: 24px; border-radius: 8px; width: 360px; }
.modal-content h3 { margin-bottom: 20px; }
.form-item { margin-bottom: 16px; }
.form-item label { display: block; margin-bottom: 8px; }
.form-item input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
.modal-actions button { padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.modal-actions button.primary { background: #1890ff; color: #fff; border: none; }
.modal-actions button:not(.primary) { background: #fff; border: 1px solid #ddd; }
</style>
