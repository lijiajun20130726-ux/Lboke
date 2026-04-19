<template>
  <div class="subscribe-page">
    <div class="subscribe-hero">
      <div class="hero-content">
        <h1>订阅更新</h1>
        <p>第一时间获取最新文章通知</p>
      </div>
    </div>
    <div class="container subscribe-content">
      <div class="subscribe-card">
        <SubscribeBox />
      </div>
      <div class="subscribe-tips">
        <div class="tip-item">
          <span class="tip-title">内容通知</span>
          <span class="tip-text">新文章发布后将通过邮箱第一时间通知</span>
        </div>
        <div class="tip-item">
          <span class="tip-title">随时退订</span>
          <span class="tip-text">如不再需要，可在邮件中一键退订</span>
        </div>
        <div class="tip-item">
          <span class="tip-title">保护隐私</span>
          <span class="tip-text">仅用于订阅通知，不会对外公开</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import SubscribeBox from '@/components/SubscribeBox.vue'

onMounted(() => {
  document.title = '订阅更新 | 李嘉骏的博客'
})
</script>

<style scoped>
.subscribe-page {
  min-height: 100vh;
  background: var(--bg-body);
  color: var(--text-primary);
}

.subscribe-hero {
  padding: 80px 24px 40px;
  text-align: center;
  background: transparent;
}

.hero-content h1 {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.hero-content p {
  font-size: 16px;
  color: var(--text-secondary);
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.subscribe-content {
  display: grid;
  gap: 32px;
}

.subscribe-card {
  background: var(--bg-card);
  border-radius: 24px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  padding: 0;
  overflow: hidden;
}

.subscribe-card :deep(.subscribe-box) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 40px;
  border-radius: 0;
}

.subscribe-tips {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.tip-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s;
}

.tip-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--accent-color);
}

.tip-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.tip-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .subscribe-hero {
    padding: 60px 20px 40px;
  }

  .hero-content h1 {
    font-size: 28px;
  }

  .subscribe-card :deep(.subscribe-box) {
    padding: 24px;
  }
}
</style>
