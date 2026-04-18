<template>
  <div class="policy-page">
    <div class="container">
      <header class="page-hero">
        <h1 class="page-title">隐私政策</h1>
        <p class="page-subtitle">最后更新：{{ updatedAt }}</p>
      </header>

      <div class="policy-card">
        <section v-for="section in sections" :key="section.title" class="policy-section">
          <h2 class="section-title">{{ section.title }}</h2>
          <ul class="section-list">
            <li v-for="item in section.items" :key="item">{{ item }}</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const updatedAt = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

const sections = [
  {
    title: '信息收集',
    items: [
      '访问李嘉骏火车站网站时，我们可能记录必要的日志信息，如访问时间、浏览器类型与页面路径。',
      '当你注册或提交内容时，我们可能收集你主动提供的账号信息与联系方式。',
      '如你上传头像或图片，我们会存储你上传的文件以提供服务。'
    ]
  },
  {
    title: '信息使用',
    items: [
      '用于提供与优化网站功能、内容展示与个性化体验。',
      '用于账户验证、安全防护与违规行为监测。',
      '用于与你沟通服务相关的通知与更新。'
    ]
  },
  {
    title: '信息共享',
    items: [
      '我们不会出售你的个人信息。',
      '除非法律法规要求或为履行服务所需，我们不会向第三方披露。'
    ]
  },
  {
    title: 'Cookie 与本地存储',
    items: [
      '我们可能使用 Cookie 或本地存储以维持登录状态与偏好设置。',
      '你可以通过浏览器设置清除或禁用 Cookie，但可能影响部分功能。'
    ]
  },
  {
    title: '信息安全',
    items: [
      '我们采取合理的技术与管理措施保护你的信息安全。',
      '尽管如此，互联网环境无法保证绝对安全，请妥善保管账号信息。'
    ]
  },
  {
    title: '你的权利',
    items: [
      '你可访问、更正或删除你的个人信息。',
      '如需注销账户或导出数据，请通过站内联系方式与我们联系。'
    ]
  },
  {
    title: '政策变更',
    items: [
      '我们可能会不定期更新本政策，并在本页面进行展示。',
      '继续使用网站服务即视为你接受更新后的政策内容。'
    ]
  },
  {
    title: '联系方式',
    items: [
      '如有隐私相关问题，请通过站内联系方式与我们沟通。'
    ]
  }
]

onMounted(() => {
  document.title = '隐私政策'
})
</script>

<style scoped>
.policy-page {
  min-height: 100vh;
  background: var(--bg-body);
  padding: 80px 0;
}

.container {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-hero {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.policy-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 36px 40px;
  box-shadow: var(--shadow-sm);
}

.policy-section + .policy-section {
  margin-top: 28px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.section-list {
  margin: 0;
  padding-left: 18px;
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 14px;
}

@media (max-width: 768px) {
  .policy-page {
    padding: 60px 0;
  }

  .page-title {
    font-size: 28px;
  }

  .policy-card {
    padding: 28px 24px;
  }
}
</style>
