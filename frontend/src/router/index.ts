import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('../views/front/Layout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/front/Home.vue')
      },
      {
        path: '/subscribe',
        name: 'Subscribe',
        component: () => import('../views/front/Subscribe.vue')
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('../views/front/About.vue')
      },
      {
        path: '/archive',
        name: 'Archive',
        component: () => import('../views/front/Archives.vue')
      },
      {
        path: '/articles',
        name: 'AllArticles',
        component: () => import('../views/front/AllArticles.vue')
      },
      {
        path: '/article/:id',
        name: 'Article',
        component: () => import('../views/front/Article.vue')
      },
      {
        path: '/categories',
        name: 'Categories',
        component: () => import('../views/front/Category.vue')
      },
      {
        path: '/category/:id',
        name: 'CategoryArticles',
        component: () => import('../views/front/Category.vue')
      },
      {
        path: '/tag/:id',
        name: 'TagArticles',
        component: () => import('../views/front/Tag.vue')
      },
      {
        path: '/friendlinks',
        name: 'Friendlinks',
        component: () => import('../views/front/FriendLinks.vue')
      },
      {
        path: '/message-board',
        name: 'MessageBoard',
        component: () => import('../views/front/MessageBoard.vue')
      },
      {
        path: '/privacy-policy',
        name: 'PrivacyPolicy',
        component: () => import('../views/front/PrivacyPolicy.vue')
      },
      {
        path: '/terms-of-service',
        name: 'TermsOfService',
        component: () => import('../views/front/TermsOfService.vue')
      },
      {
        path: '/login',
        name: 'Login',
        component: () => import('../views/front/Login.vue')
      },
      {
        path: '/register',
        name: 'Register',
        component: () => import('../views/front/Register.vue')
      },
      {
        path: '/search',
        name: 'Search',
        component: () => import('../views/front/Search.vue')
      },
      {
        path: '/user/profile',
        name: 'UserProfile',
        meta: { requiresUserAuth: true },
        component: () => import('../views/front/UserProfile.vue')
      },
      {
        path: ':pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/front/NotFound.vue')
      }
    ]
  },
  // Admin routes
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/Login.vue')
  },
  {
    path: '/admin',
    component: () => import('../views/admin/Layout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'articles',
        name: 'AdminArticles',
        component: () => import('../views/admin/Articles.vue')
      },
      {
        path: 'article/create',
        alias: 'article/new',
        name: 'AdminArticleCreate',
        component: () => import('../views/admin/ArticleEdit.vue')
      },
      {
        path: 'article/edit/:id',
        name: 'AdminArticleEdit',
        component: () => import('../views/admin/ArticleEdit.vue')
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('../views/admin/Categories.vue')
      },
      {
        path: 'tags',
        name: 'AdminTags',
        component: () => import('../views/admin/Tags.vue')
      },
      {
        path: 'friendlinks',
        name: 'AdminFriendlinks',
        component: () => import('../views/admin/FriendLinks.vue')
      },
      {
        path: 'announcements',
        name: 'AdminAnnouncements',
        component: () => import('../views/admin/Announcements.vue')
      },
      {
        path: 'subscriptions',
        name: 'AdminSubscriptions',
        component: () => import('../views/admin/Subscriptions.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/Users.vue')
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/Settings.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    const nav = (performance as any)?.getEntriesByType?.('navigation')?.[0] as any
    const isReload = nav?.type === 'reload' || (performance as any)?.navigation?.type === 1
    if (isReload) {
      return { top: 0 }
    }
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, top: 80, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.meta.requiresAuth && !token) {
    next('/admin/login')
  } else if (to.meta.requiresUserAuth && !token) {
    next('/login')
  } else if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next('/')
  } else {
    next()
  }
})

export default router
