<template>
  <div class="front-layout">
    <Header />
    <AnnouncementBar />
    <main class="main-wrapper">
      <router-view />
    </main>
    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-section">
          <h3>关于帅气的网站</h3>
          <p>{{ siteInfo.blog_intro || '李嘉骏的火车站，一个专注于技术分享和生活记录的个人博客' }}</p>
        </div>
        <div class="footer-section">
          <h3>快速导航,找到你需要的内容</h3>
          <ul>
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/articles">所有文章</router-link></li>
            <li><router-link to="/archive">归档</router-link></li>
            <li><router-link to="/categories">分类</router-link></li>
            <li><router-link to="/subscribe">订阅</router-link></li>
            <li v-if="youtubeLink"><a :href="youtubeLink" target="_blank" rel="noopener">YouTube</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>联系方式</h3>
          <p v-if="siteInfo.contact_email">
            📧 <a :href="`mailto:${siteInfo.contact_email}`">{{ siteInfo.contact_email }}</a>
          </p>
          <p>
            🔗 <a href="https://github.com/lijiajun20130726-ux" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
          <p v-if="youtubeLink">
            📺 <a :href="youtubeLink" target="_blank" rel="noopener">YouTube</a>
          </p>
          <p
            v-if="wechatImageUrl"
            class="wechat-caption"
            role="button"
            tabindex="0"
            @click="toggleWechat()"
            @keydown.enter.prevent="toggleWechat()"
            @keydown.space.prevent="toggleWechat()"
          >
            <span class="wechat-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="18" height="18">
                <circle cx="20" cy="20" r="12" fill="#09bb07"/>
                <circle cx="30" cy="28" r="10" fill="#09bb07"/>
                <circle cx="16" cy="18" r="2.2" fill="#fff"/>
                <circle cx="24" cy="18" r="2.2" fill="#fff"/>
                <circle cx="27" cy="26" r="2" fill="#fff"/>
                <circle cx="33" cy="26" r="2" fill="#fff"/>
              </svg>
            </span>
            微信联系
          </p>
          <div v-if="wechatImageUrl" v-show="wechatOpen" class="wechat-qrcode">
            <img :src="wechatImageUrl" alt="微信联系" class="wechat-img" />
          </div>
          <p
            v-if="wechatOfficialImageUrl"
            class="wechat-caption"
            role="button"
            tabindex="0"
            @click="toggleWechatOfficial()"
            @keydown.enter.prevent="toggleWechatOfficial()"
            @keydown.space.prevent="toggleWechatOfficial()"
          >
            <span class="wechat-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="18" height="18">
                <circle cx="24" cy="24" r="20" fill="#09bb07"/>
                <circle cx="19" cy="22" r="3" fill="#fff"/>
                <circle cx="29" cy="22" r="3" fill="#fff"/>
                <rect x="16" y="30" width="16" height="2.8" rx="1.4" fill="#fff"/>
              </svg>
            </span>
            微信公众号
          </p>
          <div v-if="wechatOfficialImageUrl" v-show="wechatOfficialOpen" class="wechat-qrcode">
            <img :src="wechatOfficialImageUrl" alt="微信公众号" class="wechat-img" />
          </div>
        </div>
      </div>
      <div id="subscribe" class="subscribe-footer">
        <SubscribeBox />
      </div>
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p>© {{ new Date().getFullYear() }} {{ siteInfo.blog_title || '李嘉骏的博客' }}. All rights reserved.</p>
          <div class="footer-bottom-links">
            <router-link to="/privacy-policy">隐私政策</router-link>
            <span class="footer-divider">/</span>
            <router-link to="/terms-of-service">服务条款</router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Header from '@/components/Header.vue'
import AnnouncementBar from '@/components/AnnouncementBar.vue'
import SubscribeBox from '@/components/SubscribeBox.vue'
import { getSiteInfo } from '@/api/front'

const youtubeFallback = 'https://www.youtube.com/@lijiajun-xtjj/'
const siteInfo = ref<any>({
  blog_title: '李嘉骏的博客',
  blog_intro: '一个专注于技术分享和生活记录的个人博客。',
  contact_email: '',
  contact_github: '',
  contact_youtube: ''
})
const youtubeLink = computed(() => {
  return siteInfo.value?.contact_youtube || youtubeFallback
})

const wechatImageUrl = computed(() => {
  const raw = (siteInfo.value?.wechat_qrcode || siteInfo.value?.contact_wechat || '').toString().trim()
  if (!raw) return ''
  if (raw.startsWith('http') || raw.startsWith('data:') || raw.startsWith('/')) return raw
  return `/uploads/${raw}`
})

const wechatOpen = ref(false)
const toggleWechat = () => {
  wechatOpen.value = !wechatOpen.value
}

const wechatOfficialImageUrl = computed(() => {
  const raw = (siteInfo.value?.wechat_official_qrcode || siteInfo.value?.contact_wechat_official || '').toString().trim()
  if (!raw) return ''
  if (raw.startsWith('http') || raw.startsWith('data:') || raw.startsWith('/')) return raw
  return `/uploads/${raw}`
})

const wechatOfficialOpen = ref(false)
const toggleWechatOfficial = () => {
  wechatOfficialOpen.value = !wechatOfficialOpen.value
}

onMounted(async () => {
  try {
    const res: any = await getSiteInfo()
    if (res.code === 200 && res.data) {
      siteInfo.value = res.data
    }
  } catch (err) {
    console.error('获取网站信息失败', err)
  }
})
</script>

<style scoped>
/* ===== UI/UX Pro Max 前台布局 ===== */

:root {
  --color-primary: var(--accent-color);
  --color-primary-hover: var(--accent-color-hover);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-bg-light: var(--bg-body);
  --color-border-light: var(--border-color);
  --color-shadow-sm: var(--shadow-sm);
  --color-shadow-md: var(--shadow-md);
}

.front-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-body);
}

.main-wrapper {
  flex: 1;
}

/* ===== 页脚区域 ===== */
.footer {
  background: var(--bg-hero-alt);
  border-top: 1px solid var(--border-color);
  margin-top: 80px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 50px;
  padding: 48px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页脚段落 */
.footer-section h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  padding-bottom: 10px;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 30px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.footer-section:hover h3::after {
  width: 60px;
}

.footer-section p {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin: 0 0 12px 0;
  transition: color 0.3s ease;
}

.footer-section:hover p {
  color: var(--color-text-primary);
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: inline-block;
}

.footer-section a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 1px;
}

.footer-section a:hover {
  color: var(--color-primary-hover);
  transform: translateX(2px);
}

.footer-section a:hover::after {
  width: 100%;
}

/* 页脚底部 */
.footer-bottom {
  padding: 24px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-card);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.footer-bottom-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-bottom p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: color 0.3s ease;
}

.footer-bottom:hover p {
  color: var(--color-text-secondary);
}

.footer-bottom-links {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.footer-bottom-links a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.footer-bottom-links a:hover {
  color: var(--color-primary-hover);
}

.footer-divider {
  color: var(--text-secondary);
}

.subscribe-footer {
  max-width: 900px;
  margin: 0 auto 20px;
  padding: 0 20px 20px;
}

.subscribe-footer :deep(.subscribe-box) {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.wechat-qrcode {
  margin-top: 8px;
}

.wechat-img {
  width: 180px;
  height: 180px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
}

.wechat-caption {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.wechat-icon {
  display: inline-flex;
}

.wechat-caption:hover {
  color: var(--color-primary-hover);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 40px 16px;
  }

  .footer {
    margin-top: 60px;
  }

  .footer-section h3 {
    font-size: 14px;
    margin-bottom: 14px;
  }

  .footer-section p {
    font-size: 13px;
  }
  
  .wechat-img {
    width: 140px;
    height: 140px;
  }
}
</style>
