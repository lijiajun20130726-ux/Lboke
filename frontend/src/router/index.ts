import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 前台路由
    {
      path: '/',
      component: () => import('@/views/front/Layout.vue'),
      children: [
        { path: '', name: 'Home', component: () => import('@/views/front/Home.vue') },
        { path: 'article/:id', name: 'Article', component: () => import('@/views/front/Article.vue') },
        { path: 'category/:id', name: 'Category', component: () => import('@/views/front/Category.vue') },
        { path: 'tag/:name', name: 'Tag', component: () => import('@/views/front/Tag.vue') },
        { path: 'archives', name: 'Archives', component: () => import('@/views/front/Archives.vue') },
        { path: 'about', name: 'About', component: () => import('@/views/front/About.vue') },
        { path: 'search', name: 'Search', component: () => import('@/views/front/Search.vue') },
        { path: 'login', name: 'UserLogin', component: () => import('@/views/front/Login.vue') },
        { path: 'register', name: 'UserRegister', component: () => import('@/views/front/Register.vue') }
      ]
    },
    // 后台路由
    {
      path: '/admin/login',
      name: 'Login',
      component: () => import('@/views/admin/Login.vue')
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/admin/Dashboard.vue') },
        { path: 'articles', name: 'Articles', component: () => import('@/views/admin/Articles.vue') },
        { path: 'article/create', name: 'CreateArticle', component: () => import('@/views/admin/ArticleEdit.vue') },
        { path: 'article/edit/:id', name: 'EditArticle', component: () => import('@/views/admin/ArticleEdit.vue') },
        { path: 'categories', name: 'Categories', component: () => import('@/views/admin/Categories.vue') },
        { path: 'tags', name: 'Tags', component: () => import('@/views/admin/Tags.vue') },
        { path: 'users', name: 'Users', component: () => import('@/views/admin/Users.vue') },
        { path: 'settings', name: 'Settings', component: () => import('@/views/admin/Settings.vue') }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/admin/login')
  } else {
    next()
  }
})

export default router
