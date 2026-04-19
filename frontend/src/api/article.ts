import api from './index'

// 获取文章列表（后台）
export const getArticleList = (params?: {
  page?: number
  pageSize?: number
  keyword?: string
  category_id?: number
  status?: string
}) => {
  return api.get('/article/list', { params })
}

// 获取文章详情
export const getArticle = (id: number) => {
  return api.get(`/article/${id}`)
}

// 创建文章
export const createArticle = (data: {
  title: string
  content: string
  summary?: string
  cover_image?: string
  category_id?: number
  tags?: string[]
  status?: string
}) => {
  return api.post('/article', data)
}

// 更新文章
export const updateArticle = (id: number, data: {
  title: string
  content: string
  summary?: string
  cover_image?: string
  category_id?: number
  tags?: string[]
  status?: string
}) => {
  return api.put(`/article/${id}`, data)
}

// 删除文章
export const deleteArticle = (id: number) => {
  return api.delete(`/article/${id}`)
}

// 发布/取消发布文章
export const publishArticle = (id: number, publish: boolean) => {
  return api.put(`/article/${id}/publish`, { publish })
}
