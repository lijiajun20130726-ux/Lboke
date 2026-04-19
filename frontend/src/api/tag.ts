import api from './index'

// 获取标签列表
export const getTags = (params?: { withCount?: boolean }) => {
  return api.get('/tag', { params }).then(res => res.data)
}

// 获取标签详情
export const getTag = (id: number) => {
  return api.get(`/tag/${id}`).then(res => res.data)
}

// 创建标签
export const createTag = (data: { name: string }) => {
  return api.post('/tag', data).then(res => res.data)
}

// 更新标签
export const updateTag = (id: number, data: { name: string }) => {
  return api.put(`/tag/${id}`, data).then(res => res.data)
}

// 删除标签
export const deleteTag = (id: number) => {
  return api.delete(`/tag/${id}`).then(res => res.data)
}
