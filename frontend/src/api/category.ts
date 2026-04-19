import api from './index'

// 获取分类列表
export const getCategories = (params?: { withCount?: boolean }) => {
  return api.get('/category', { params })
}

// 获取分类详情
export const getCategory = (id: number) => {
  return api.get(`/category/${id}`)
}

// 创建分类
export const createCategory = (data: { name: string; description?: string; sort_order?: number }) => {
  return api.post('/category', data)
}

// 更新分类
export const updateCategory = (id: number, data: { name: string; description?: string; sort_order?: number }) => {
  return api.put(`/category/${id}`, data)
}

// 删除分类
export const deleteCategory = (id: number) => {
  return api.delete(`/category/${id}`)
}
