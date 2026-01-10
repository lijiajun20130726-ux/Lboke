<template>
  <div class="settings">
    <h2>网站设置</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-item"><label>网站名称</label><input v-model="form.site_name" /></div>
      <div class="form-item"><label>网站描述</label><input v-model="form.site_description" /></div>
      <div class="form-item"><label>作者名称</label><input v-model="form.author_name" /></div>
      <div class="form-item"><label>个人简介</label><textarea v-model="form.author_intro" rows="3"></textarea></div>
      <div class="form-item"><label>作者头像URL</label><input v-model="form.author_avatar" /></div>
      <div class="form-item"><label>联系邮箱</label><input v-model="form.contact_email" /></div>
      <div class="form-item"><label>GitHub地址</label><input v-model="form.contact_github" /></div>
      <div class="form-item"><label>微信号</label><input v-model="form.contact_wechat" /></div>
      <div class="form-item"><label>ICP备案号</label><input v-model="form.icp_number" /></div>
      <button type="submit" class="btn-primary">保存设置</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSiteInfo, updateSiteInfo } from '@/api/front'

const form = ref<any>({})

onMounted(async () => {
  const res: any = await getSiteInfo()
  if (res.code === 200) form.value = res.data
})

const handleSubmit = async () => {
  await updateSiteInfo(form.value)
  alert('保存成功')
}
</script>

<style scoped>
h2 { margin-bottom: 20px; }
form { background: #fff; padding: 24px; border-radius: 8px; max-width: 600px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.form-item { margin-bottom: 16px; }
.form-item label { display: block; margin-bottom: 8px; font-weight: 500; }
.form-item input, .form-item textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.btn-primary { background: #1890ff; color: #fff; padding: 10px 24px; border: none; border-radius: 4px; cursor: pointer; }
</style>
