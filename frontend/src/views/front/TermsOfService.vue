<template>
  <div class="policy-page">
    <div class="container">
      <header class="page-hero">
        <h1 class="page-title">服务条款</h1>
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
    title: '服务范围',
    items: [
      '本网站提供内容浏览、评论互动、友链申请与订阅等服务。',
      '我们有权根据实际运营需要调整或新增服务内容。'
    ]
  },
  {
    title: '账号与安全',
    items: [
      '你应妥善保管账号与密码，并对账号下的活动负责。',
      '如发现账号异常，请及时与我们联系。'
    ]
  },
  {
    title: '内容规范',
    items: [
      '你不得发布违法、侵权、虚假、骚扰或不当内容。',
      '我们有权移除违反规范的内容并采取相应措施。'
    ]
  },
  {
    title: '知识产权',
    items: [
      '网站内容受法律保护，未经授权不得复制、转载或用于商业用途。',
      '用户发布内容的版权归原作者所有，但你授权我们在站内展示。'
    ]
  },
  {
    title: '免责声明',
    items: [
      '网站内容仅供参考，不构成专业建议。',
      '因不可抗力或第三方原因导致的服务中断，我们不承担责任。'
    ]
  },
  {
    title: '服务变更与终止',
    items: [
      '我们可在必要时暂停或终止部分或全部服务。',
      '如需停止使用服务，你可申请注销账号。'
    ]
  },
  {
    title: '适用法律',
    items: [
      '本条款的解释与争议处理适用中华人民共和国法律。'
    ]
  },
  {
    title: '联系方式',
    items: [
      '如对条款有疑问，请通过站内联系方式与我们沟通。'
    ]
  }
]

onMounted(() => {
  document.title = '服务条款'
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
