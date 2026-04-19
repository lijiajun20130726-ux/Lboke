<template>
  <div class="settings-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">网站设置</h2>
        <p class="page-subtitle">自定义您的博客信息和个人资料</p>
      </div>
      <button class="save-btn" @click="handleSubmit" :disabled="saving">
        <span v-if="!saving">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          保存更改
        </span>
        <span v-else class="loading-state">
          <div class="spinner"></div>
          保存中...
        </span>
      </button>
    </div>

    <div class="settings-grid">
      <!-- 基本信息卡片 -->
      <div class="settings-card">
        <div class="card-header">
          <h3>基本信息</h3>
          <p>设置网站的标题、描述和备案信息</p>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>网站名称</label>
            <input v-model="form.site_name" type="text" placeholder="例如：我的技术博客" />
          </div>
          <div class="form-group">
            <label>网站描述</label>
            <textarea v-model="form.site_description" rows="3" placeholder="简短介绍您的网站..."></textarea>
          </div>
          <div class="form-group">
            <label>ICP备案号</label>
            <input v-model="form.icp_number" type="text" placeholder="例如：京ICP备..." />
          </div>
        </div>
      </div>

      <!-- 个人资料卡片 -->
      <div class="settings-card">
        <div class="card-header">
          <h3>个人资料</h3>
          <p>展示在首页侧边栏的个人信息</p>
        </div>
        <div class="card-body">
          <div class="avatar-upload">
            <div class="avatar-preview">
              <img :src="form.author_avatar || '/uploads/default-avatar.jpg'" alt="头像预览" />
            </div>
            <div class="avatar-input">
              <label>头像链接</label>
              <input v-model="form.author_avatar" type="text" placeholder="https://..." />
              <p class="input-hint">输入图片地址或上传图片</p>
            </div>
          </div>
          <div class="form-group">
            <label>作者名称</label>
            <input v-model="form.author_name" type="text" placeholder="您的昵称" />
          </div>
          <div class="form-group">
            <label>个人简介</label>
            <textarea v-model="form.author_intro" rows="3" placeholder="一句话介绍自己..."></textarea>
          </div>
        </div>
      </div>

      <!-- 联系方式卡片 -->
      <div class="settings-card">
        <div class="card-header">
          <h3>联系方式</h3>
          <p>让访客能够联系到您</p>
        </div>
        <div class="card-body">
          <div class="form-group icon-input">
            <label>电子邮箱</label>
            <div class="input-wrapper">
              <span class="input-icon">📧</span>
              <input v-model="form.contact_email" type="email" placeholder="email@example.com" />
            </div>
          </div>
          <div class="form-group icon-input">
            <label>微信号</label>
            <div class="input-wrapper">
              <span class="input-icon">💬</span>
              <input v-model="form.contact_wechat" type="text" placeholder="WeChat ID" />
            </div>
          </div>
          <div class="form-group">
            <label>微信二维码</label>
            <div class="qr-upload-wrapper">
              <div class="qr-preview" @click="triggerQrUpload">
                <img v-if="form.wechat_qrcode" :src="form.wechat_qrcode" alt="二维码预览" />
                <div v-else class="qr-placeholder">
                  <span>📸</span>
                  <span class="text">点击上传</span>
                </div>
                <div class="upload-overlay">
                  <span>更换图片</span>
                </div>
              </div>
              <input 
                type="file" 
                ref="qrCodeInput" 
                accept="image/*" 
                class="hidden-input" 
                @change="handleQrUpload"
              />
              <div class="qr-url-input">
                 <input v-model="form.wechat_qrcode" type="text" placeholder="或输入图片 URL" />
              </div>
            </div>
            <p class="input-hint">点击图片上传，或直接输入 URL。前台将优先展示此二维码。</p>
          </div>
          <div class="form-group">
            <label>微信公众号</label>
            <div class="qr-upload-wrapper">
              <div class="qr-preview" @click="triggerOfficialQrUpload">
                <img v-if="form.wechat_official_qrcode" :src="form.wechat_official_qrcode" alt="公众号二维码预览" />
                <div v-else class="qr-placeholder">
                  <span>📸</span>
                  <span class="text">点击上传</span>
                </div>
                <div class="upload-overlay">
                  <span>更换图片</span>
                </div>
              </div>
              <input 
                type="file" 
                ref="qrOfficialInput" 
                accept="image/*" 
                class="hidden-input" 
                @change="handleOfficialQrUpload"
              />
              <div class="qr-url-input">
                 <input v-model="form.wechat_official_qrcode" type="text" placeholder="或输入公众号二维码 URL" />
              </div>
            </div>
            <p class="input-hint">前台页脚“微信公众号”将显示此图片。</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <Transition name="fade-up">
    <div v-if="toast.show" class="toast-notification" :class="toast.type">
      <div class="toast-content">
        <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSiteInfo, updateSiteInfo } from '@/api/front'
import { uploadImage } from '@/api/upload'

const form = ref<any>({})
const saving = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })
const qrCodeInput = ref<HTMLInputElement | null>(null)
const qrOfficialInput = ref<HTMLInputElement | null>(null)

const showToast = (message: string, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => toast.value.show = false, 3000)
}

const triggerQrUpload = () => {
  qrCodeInput.value?.click()
}

const handleQrUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    try {
      const res: any = await uploadImage(file)
      if (res.code === 200) {
        form.value.wechat_qrcode = res.data.url
        showToast('二维码上传成功')
      } else {
        showToast(res.message || '上传失败', 'error')
      }
    } catch (error) {
      showToast('上传出错', 'error')
    } finally {
      input.value = '' // Reset input
    }
  }
}

const triggerOfficialQrUpload = () => {
  qrOfficialInput.value?.click()
}

const handleOfficialQrUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    try {
      const res: any = await uploadImage(file)
      if (res.code === 200) {
        form.value.wechat_official_qrcode = res.data.url
        showToast('公众号二维码上传成功')
      } else {
        showToast(res.message || '上传失败', 'error')
      }
    } catch (error) {
      showToast('上传出错', 'error')
    } finally {
      input.value = ''
    }
  }
}

onMounted(async () => {
  try {
    const res: any = await getSiteInfo()
    if (res.code === 200) form.value = res.data
  } catch (err) {
    console.error(err)
  }
})

const handleSubmit = async () => {
  saving.value = true
  try {
    const res: any = await updateSiteInfo(form.value)
    if (res.code === 200) {
      showToast('设置已保存')
    } else {
      showToast(res.message || '保存失败', 'error')
    }
  } catch (err) {
    showToast('网络错误，请重试', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.settings-container {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #64748b;
  font-size: 15px;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.save-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 24px;
  align-items: start;
}

.settings-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.settings-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.card-header p {
  font-size: 13px;
  color: #64748b;
}

.card-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

input, textarea {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #0f172a;
  transition: all 0.2s;
  background: #fff;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea {
  resize: vertical;
  min-height: 80px;
}

/* Avatar Upload Style */
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qr-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qr-preview {
  width: 120px;
  height: 120px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
}

.qr-preview:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.qr-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #64748b;
}

.qr-placeholder span:first-child {
  font-size: 24px;
}

.qr-placeholder .text {
  font-size: 12px;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.qr-preview:hover .upload-overlay {
  opacity: 1;
}

.hidden-input {
  display: none;
}

.qr-url-input input {
  width: 100%;
}

.avatar-input {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-hint {
  font-size: 12px;
  color: #94a3b8;
}

/* Icon Input */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 18px;
}

.input-wrapper input {
  padding-left: 44px;
  width: 100%;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
}

.toast-content {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.toast-notification.error .toast-content {
  background: rgba(239, 68, 68, 0.9);
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .settings-container { padding: 20px; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 20px; }
  .save-btn { width: 100%; justify-content: center; }
  .settings-grid { grid-template-columns: 1fr; }
}
</style>
