 <template>
  <div class="article-edit">
    <h2>{{ isEdit ? '编辑文章' : '写文章' }}</h2>
    <form @submit.prevent="() => handleSubmit()">
      <div class="form-item">
        <label>标题</label>
        <input v-model="form.title" placeholder="文章标题" required />
      </div>
      <div class="form-row">
        <div class="form-item">
          <label>分类</label>
          <select v-model="form.category_id">
            <option value="">选择分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="form-item">
          <label>标签</label>
          <input v-model="tagsInput" placeholder="多个标签用逗号分隔" />
        </div>
      </div>
      <div class="form-item">
        <label>封面图片</label>
        <div class="cover-upload">
          <input v-model="form.cover_image" placeholder="封面图片URL" />
          <button type="button" @click="triggerCoverUpload" class="upload-btn">上传图片</button>
          <input type="file" ref="coverFileRef" @change="handleCoverUpload" style="display: none" accept="image/*" />
        </div>
        <div v-if="form.cover_image" class="cover-preview">
          <img :src="form.cover_image" alt="封面预览" />
          <button type="button" @click="form.cover_image = ''" class="remove-btn">移除</button>
        </div>
      </div>
      <div class="form-item">
        <label>摘要</label>
        <textarea v-model="form.summary" placeholder="文章摘要（可选）" rows="2"></textarea>
      </div>
      <div class="form-item">
        <label>内容</label>
        <MdEditor v-model="form.content" @onUploadImg="onUploadImg" placeholder="输入文章内容..." />
      </div>
      <div class="form-actions">
        <button type="button" @click="handleSubmit('draft')">保存草稿</button>
        <button type="submit" class="primary">{{ isEdit ? '更新' : '发布' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticle, createArticle, updateArticle } from '@/api/article'
import { getCategories } from '@/api/front'
import { uploadImage } from '@/api/upload'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const categories = ref<any[]>([])
const tagsInput = ref('')
const coverFileRef = ref<HTMLInputElement | null>(null)
const form = ref<any>({ title: '', content: '', summary: '', cover_image: '', category_id: null })

const triggerCoverUpload = () => {
  coverFileRef.value?.click()
}

const handleCoverUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    try {
      const res: any = await uploadImage(input.files[0])
      if (res.code === 200) {
        form.value.cover_image = res.data.url
      }
    } catch (err) {
      console.error('封面上传失败:', err)
      alert('图片上传失败')
    }
  }
}

const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
  const res = await Promise.all(
    files.map((file) => {
      return uploadImage(file)
    })
  )

  callback(res.map((item: any) => item.data.url))
}

const handleSubmit = async (status = 'published') => {
  const data = { ...form.value, status, tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean) }
  let res: any
  if (isEdit.value) {
    res = await updateArticle(Number(route.params.id), data)
  } else {
    res = await createArticle(data)
  }
  if (res.code === 200 || res.code === 201) router.push('/admin/articles')
}

onMounted(async () => {
  const catRes: any = await getCategories()
  if (catRes.code === 200) categories.value = catRes.data
  if (isEdit.value) {
    const res: any = await getArticle(Number(route.params.id))
    if (res.code === 200) {
      form.value = res.data
      tagsInput.value = res.data.tags?.map((t: any) => t.name).join(', ') || ''
    }
  }
})
</script>

<style scoped>
h2 { margin-bottom: 20px; }
form { background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.form-item { margin-bottom: 16px; }
.form-item label { display: block; margin-bottom: 8px; font-weight: 500; }
.form-item input, .form-item select, .form-item textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.form-row { display: flex; gap: 16px; }
.form-row .form-item { flex: 1; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
.form-actions button { padding: 10px 24px; border-radius: 4px; cursor: pointer; }
.form-actions button.primary { background: #1890ff; color: #fff; border: none; }
.form-actions button:not(.primary) { background: #fff; border: 1px solid #ddd; }

.cover-upload { display: flex; gap: 10px; margin-bottom: 10px; }
.upload-btn { background: #52c41a; color: #fff; border: none; padding: 0 15px; border-radius: 4px; cursor: pointer; white-space: nowrap; }
.cover-preview { position: relative; width: 200px; border-radius: 4px; overflow: hidden; border: 1px solid #eee; }
.cover-preview img { width: 100%; display: block; }
.cover-preview .remove-btn { position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); color: #fff; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; }
.cover-preview .remove-btn:hover { background: rgba(255,0,0,0.7); }
</style>
