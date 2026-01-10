<template>
  <div class="about">
    <div class="profile">
      <img v-if="siteInfo.author_avatar" :src="siteInfo.author_avatar" class="avatar" />
      <div class="avatar-placeholder" v-else>{{ siteInfo.author_name?.charAt(0) || 'A' }}</div>
      <h2>{{ siteInfo.author_name }}</h2>
      <p class="intro">{{ siteInfo.author_intro }}</p>
    </div>
    <div class="contact">
      <h3>联系方式</h3>
      <ul>
        <li v-if="siteInfo.contact_email"><span>Email:</span> {{ siteInfo.contact_email }}</li>
        <li v-if="siteInfo.contact_github"><span>GitHub:</span> <a :href="siteInfo.contact_github" target="_blank">{{ siteInfo.contact_github }}</a></li>
        <li v-if="siteInfo.contact_wechat"><span>微信:</span> {{ siteInfo.contact_wechat }}</li>
      </ul>
    </div>
    <div class="stats">
      <h3>博客统计</h3>
      <div class="stat-items">
        <div class="stat-item"><span class="num">{{ stats.articles }}</span><span class="label">文章</span></div>
        <div class="stat-item"><span class="num">{{ stats.categories }}</span><span class="label">分类</span></div>
        <div class="stat-item"><span class="num">{{ stats.tags }}</span><span class="label">标签</span></div>
        <div class="stat-item"><span class="num">{{ stats.views }}</span><span class="label">访问</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSiteInfo, getStatistics } from '@/api/front'

const siteInfo = ref<any>({})
const stats = ref({ articles: 0, categories: 0, tags: 0, views: 0 })

onMounted(async () => {
  const [siteRes, statsRes]: any[] = await Promise.all([getSiteInfo(), getStatistics()])
  if (siteRes.code === 200) siteInfo.value = siteRes.data
  if (statsRes.code === 200) stats.value = statsRes.data
})
</script>

<style scoped>
.about { max-width: 600px; margin: 0 auto; }
.profile, .contact, .stats { background: #fff; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
.avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; }
.avatar-placeholder { width: 120px; height: 120px; border-radius: 50%; background: #1890ff; color: #fff; font-size: 48px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.profile h2 { margin: 16px 0 8px; }
.intro { color: #666; }
.contact h3, .stats h3 { margin-bottom: 16px; }
.contact ul { list-style: none; padding: 0; text-align: left; }
.contact li { padding: 8px 0; }
.contact span { color: #999; margin-right: 8px; }
.contact a { color: #1890ff; }
.stat-items { display: flex; justify-content: space-around; }
.stat-item { text-align: center; }
.stat-item .num { font-size: 32px; font-weight: bold; color: #1890ff; display: block; }
.stat-item .label { color: #999; font-size: 14px; }
</style>
