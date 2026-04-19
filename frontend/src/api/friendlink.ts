import api from './index'

export interface FriendLink {
  id?: number
  name: string
  url: string
  logo?: string
  description?: string
  status?: number
  sort_order?: number
  created_at?: string
  updated_at?: string
}

// 获取友链列表（后台）
export const getFriendLinks = (params?: any) => {
  return api.get('/friendlink', { params })
}

// 获取单个友链
export const getFriendLinkDetail = (id: number) => {
  return api.get(`/friendlink/${id}`)
}

// 创建友链
export const createFriendLink = (data: FriendLink) => {
  return api.post('/friendlink', data)
}

// 更新友链
export const updateFriendLink = (id: number, data: Partial<FriendLink>) => {
  return api.put(`/friendlink/${id}`, data)
}

// 删除友链
export const deleteFriendLink = (id: number) => {
  return api.delete(`/friendlink/${id}`)
}

// 批量更新状态
export const batchUpdateFriendLinkStatus = (ids: number[], status: number) => {
  return api.put('/friendlink/batch/status', { ids, status })
}
