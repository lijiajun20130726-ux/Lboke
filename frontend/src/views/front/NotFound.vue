<template>
  <div class="notfound-page">
    <div class="container">
      <div class="card">
        <div class="code">404</div>
        <h1 class="title">页面不存在</h1>
        <p class="subtitle">抱歉，您访问的页面可能被删除或地址输入有误,如有问题，可以联系站长</p>
        <router-link to="/" class="back-btn">
          返回首页继续观看精彩内容
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </router-link>
      </div>
    </div>
  </div>
  </template>
  
  <script setup lang="ts"></script>
  
  <style scoped>
  .notfound-page {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-body);
    padding: 40px 16px;
  }
  
  .container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }
  
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 48px 32px;
    text-align: center;
    box-shadow: var(--shadow-md);
  }
  
  .code {
    font-size: 72px;
    font-weight: 900;
    letter-spacing: -0.04em;
    background: linear-gradient(90deg, var(--accent-color), #22c55e);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 8px;
  }
  
  .title {
    font-size: 24px;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  .subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 24px;
  }
  
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 12px;
    text-decoration: none;
    color: var(--text-invert);
    background: var(--accent-gradient);
    box-shadow: 0 6px 20px rgba(0, 113, 227, 0.25);
    transition: all 0.2s;
  }
  
  .back-btn:hover {
    transform: translateY(-2px);
    background: var(--accent-gradient-strong);
  }
  </style>
