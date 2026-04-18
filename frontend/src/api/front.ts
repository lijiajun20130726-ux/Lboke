import api from './index'

// 获取首页文章列表
export const getArticles = (params?: {
  page?: number
  pageSize?: number
  category_id?: number
  tag?: string
  keyword?: string
  order?: 'asc' | 'desc'
}) => {
  return api.get('/front/articles', { params })
}

// 获取文章详情
export const getArticleDetail = (id: number | string) => {
  return api.get(`/front/articles/${id}`)
}

// 文章点赞
export const likeArticle = (id: number | string, action?: 'like' | 'unlike') => {
  return api.post(`/front/articles/${id}/like`, action ? { action } : undefined)
}

// 搜索文章
export const searchArticles = (params: {
  keyword: string
  page?: number
  pageSize?: number
}) => {
  return api.get('/front/search', { params })
}

// 获取归档列表
export const getArchives = () => {
  return api.get('/front/archives')
}

// 获取归档文章
export const getArchiveArticles = (month: string) => {
  return api.get(`/front/archives/${month}`)
}

// 获取网站配置
export const getSiteInfo = () => {
  return api.get('/front/site-info')
}

// 获取统计数据
export const getStatistics = () => {
  return api.get('/front/statistics')
}

// 获取热门文章
export const getHotArticles = (limit?: number) => {
  return api.get('/front/hot-articles', { params: { limit } })
}

// 获取最新文章
export const getLatestArticles = (limit?: number) => {
  return api.get('/front/latest-articles', { params: { limit } })
}

// 获取分类列表
export const getCategories = (withCount?: boolean) => {
  return api.get('/category', { params: { withCount } })
}

// 获取标签列表
export const getTags = (withCount?: boolean) => {
  return api.get('/tag', { params: { withCount } })
}

// 更新网站配置
export const updateSiteInfo = (data: any) => {
  return api.put('/front/site-info', data)
}

// 获取友链列表（前台）
export const getFriendLinksPublic = () => {
  return api.get('/front/friend-links')
}

export const applyFriendLink = (data: { name: string; url: string; logo?: string; description?: string }) => {
  return api.post('/friendlink/apply', data)
}

export const getMessageBoardPublic = (limit?: number) => {
  return api.get('/message/public', { params: { limit } })
}

export const sendMessageBoard = (data: { nickname: string; content: string; color?: string }) => {
  return api.post('/message/send', data)
}
